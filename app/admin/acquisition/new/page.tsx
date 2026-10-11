import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import NewAcquisitionClient from "./NewAcquisitionClient";
export default async function NewAcquisitionPage({
  searchParams,
}: {
  searchParams: Promise<{
    venue?: string;
    organizer?: string;
    round?: string;
    mailingRecipient?: string;
  }>;
}) {
  const params = await searchParams;
  let initialVenueId = params.venue || "";
  let initialOrganizerId = params.organizer || "";
  const initialRoundId = params.round || "";
  const mailingRecipientId = params.mailingRecipient || "";
  let mailingSource: {
    id: string;
    roundName: string | null;
    sentAt: string | null;
    notes: string | null;
    reaction: string | null;
    email: string | null;
    openedAt: string | null;
    clickedAt: string | null;
  } | null = null;
  if (mailingRecipientId) {
    const { data: recipient, error: recipientError } = await supabaseAdmin
      .from("mailing_recipients")
      .select(`
        id,
        venue_id,
        organizer_id,
        sent_at,
        notes,
        reaction,
        acquisition_id,
        round_id,
        email,
        opened_at,
        clicked_at
      `)
      .eq("id", mailingRecipientId)
      .single();
    if (recipientError || !recipient) {
      throw new Error(recipientError?.message || "Mailing-Empfänger konnte nicht geladen werden.");
    }
    if (recipient.acquisition_id) {
      redirect(`/admin/acquisition/${recipient.acquisition_id}`);
    }
    // Ziel immer aus dem Mailing-Empfänger übernehmen.
    // Veranstalter vor Location bevorzugen; eine Mailing-Location darf die
    // erkannte Veranstalter-Zuordnung nicht überschreiben.
    if (recipient.organizer_id) {
      initialOrganizerId = recipient.organizer_id;
      initialVenueId = "";
    } else if (recipient.email) {
      const { data: contacts, error: contactError } = await supabaseAdmin
        .from("organizer_contacts")
        .select("organizer_id")
        .ilike("email", recipient.email.trim());
      if (contactError) throw new Error(contactError.message);
      const organizerIds = [...new Set((contacts || []).map((c) => c.organizer_id).filter(Boolean))];
      if (organizerIds.length === 1) {
        initialOrganizerId = organizerIds[0];
        initialVenueId = "";
      } else if (recipient.venue_id) {
        initialVenueId = recipient.venue_id;
        initialOrganizerId = "";
      }
    } else if (recipient.venue_id) {
      initialVenueId = recipient.venue_id;
      initialOrganizerId = "";
    }
    let mailingRoundName: string | null = null;
    if (recipient.round_id) {
      const { data: mailingRound } = await supabaseAdmin
        .from("acquisition_rounds")
        .select("name")
        .eq("id", recipient.round_id)
        .maybeSingle();
      mailingRoundName = mailingRound?.name || null;
    }
    mailingSource = {
      id: recipient.id,
      roundName: mailingRoundName,
      sentAt: recipient.sent_at || null,
      notes: recipient.notes || null,
      reaction: recipient.reaction || null,
      email: recipient.email || null,
      openedAt: recipient.opened_at || null,
      clickedAt: recipient.clicked_at || null,
    };
  }
  // ============================================================
  // LOCATIONS
  // ============================================================
  const {
    data: venues,
    error: venuesError,
  } = await supabaseAdmin
    .from("venues")
    .select(`
      id,
      name,
      city,
      state,
      contact_name,
      contact_email,
      booking_email,
      relationship_status,
      acquisition_relevant
    `)
    .order("name", {
      ascending: true,
    });
  if (venuesError) {
    return (
      <main className="min-h-screen bg-[#fbf7ef] px-8 py-8 text-zinc-950">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[1.7rem] bg-white p-8 font-bold text-red-600 shadow-xl ring-1 ring-black/5">
            Fehler beim Laden der Locations: {venuesError.message}
          </div>
        </div>
      </main>
    );
  }
  // ============================================================
  // VERANSTALTER
  // ============================================================
  const {
    data: organizers,
    error: organizersError,
  } = await supabaseAdmin
    .from("organizers")
    .select(`
      id,
      name,
      organizer_type,
      city,
      email,
      phone,
      relationship_status,
      organizer_contacts (
        id,
        name,
        role,
        email,
        phone,
        is_primary
      )
    `)
    .order("name", {
      ascending: true,
    });
  if (organizersError) {
    return (
      <main className="min-h-screen bg-[#fbf7ef] px-8 py-8 text-zinc-950">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[1.7rem] bg-white p-8 font-bold text-red-600 shadow-xl ring-1 ring-black/5">
            Fehler beim Laden der Veranstalter: {organizersError.message}
          </div>
        </div>
      </main>
    );
  }
  // ============================================================
  // AKTIVE AKQUISE-RUNDEN
  // Mailing gehört hier NICHT rein:
  // Ein einzelner Akquise-Vorgang wird nur einer echten
  // Akquise-Runde zugeordnet.
  // ============================================================
  const {
  data: rounds,
  error: roundsError,
} = await supabaseAdmin
  .from("acquisition_rounds")
    .select(`
      id,
      name,
      type,
      active
    `)
    .eq("active", true)
    .eq("type", "acquisition")
    .is("archived_at", null)
    .order("created_at", {
      ascending: false,
    });
  if (roundsError) {
    return (
      <main className="min-h-screen bg-[#fbf7ef] px-8 py-8 text-zinc-950">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[1.7rem] bg-white p-8 font-bold text-red-600 shadow-xl ring-1 ring-black/5">
            Fehler beim Laden der Akquise-Runden: {roundsError.message}
          </div>
        </div>
      </main>
    );
  }
  // Bestehende Akquise für dasselbe Ziel vor der Neuanlage sichtbar machen.
  const duplicateTarget = initialOrganizerId
    ? { field: "organizer_id", id: initialOrganizerId }
    : initialVenueId
      ? { field: "venue_id", id: initialVenueId }
      : null;
  const { data: existingAcquisitions, error: existingAcquisitionsError } = duplicateTarget && mailingSource
    ? await supabaseAdmin.from("acquisition")
        .select("id, status, program, created_at")
        .eq(duplicateTarget.field, duplicateTarget.id)
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(10)
    : { data: [], error: null };
  if (existingAcquisitionsError) throw new Error(existingAcquisitionsError.message);


  async function linkExistingAcquisition(formData: FormData) {
    "use server";
    const recipientId = String(formData.get("mailing_recipient_id") || "").trim();
    const acquisitionId = String(formData.get("existing_acquisition_id") || "").trim();
    if (!recipientId || !acquisitionId) throw new Error("Newsletter oder Akquise fehlt.");
    const { data: recipient, error: recipientError } = await supabaseAdmin
      .from("mailing_recipients")
      .select("id, organizer_id, venue_id, email, acquisition_id")
      .eq("id", recipientId).single();
    if (recipientError || !recipient) throw new Error("Newsletter-Empfänger nicht gefunden.");
    if (recipient.acquisition_id) redirect(`/admin/acquisition/${recipient.acquisition_id}`);
    const { data: existing, error: existingError } = await supabaseAdmin
      .from("acquisition").select("id, organizer_id, venue_id")
      .eq("id", acquisitionId).single();
    if (existingError || !existing) throw new Error("Akquise nicht gefunden.");
    let recognizedOrganizerId = recipient.organizer_id;
    if (!recognizedOrganizerId && recipient.email) {
      const { data: contacts, error: contactsError } = await supabaseAdmin
        .from("organizer_contacts").select("organizer_id").ilike("email", recipient.email.trim());
      if (contactsError) throw new Error(contactsError.message);
      const ids = [...new Set((contacts || []).map((c) => c.organizer_id).filter(Boolean))];
      if (ids.length === 1) recognizedOrganizerId = ids[0];
    }
    const matches = recognizedOrganizerId
      ? existing.organizer_id === recognizedOrganizerId
      : Boolean(recipient.venue_id && existing.venue_id === recipient.venue_id);
    if (!matches) throw new Error("Akquise und Newsletter-Empfänger gehören nicht zum selben Ziel.");
    const { data: linked, error: linkError } = await supabaseAdmin
      .from("mailing_recipients")
      .update({ acquisition_id: acquisitionId, updated_at: new Date().toISOString() })
      .eq("id", recipientId).is("acquisition_id", null).select("id");
    if (linkError || !linked?.length) throw new Error("Newsletter konnte nicht verknüpft werden.");
    revalidatePath("/admin/acquisition");
    redirect(`/admin/acquisition/${acquisitionId}`);
  }


  // ============================================================
  // AKQUISE ANLEGEN
  // ============================================================
  async function createAcquisition(
    formData: FormData
  ) {
    "use server";
    const mailingRecipientIdFromForm =
      String(formData.get("mailing_recipient_id") || "").trim() || null;
    const venueId =
      String(
        formData.get("venue_id") || ""
      ).trim() || null;
    const organizerId =
      String(
        formData.get("organizer_id") || ""
      ).trim() || null;
    const roundId =
      String(
        formData.get("round_id") || ""
      ).trim() || null;
    const program =
      String(
        formData.get("program") || ""
      ).trim() || null;
    const status =
      String(
        formData.get("status") || ""
      ).trim() || "Neu";
    const priority =
      String(
        formData.get("priority") || ""
      ).trim() || "Normal";
    const nextFollowUpAt =
      String(
        formData.get("next_follow_up_at") || ""
      ).trim() || null;
    const nextStep =
      String(
        formData.get("next_step") || ""
      ).trim() || null;
    const notes =
      String(
        formData.get("notes") || ""
      ).trim() || null;
    // Erste Aktivität: wird gemeinsam mit dem Vorgang angelegt.
    const activityDate =
      String(formData.get("activity_date") || "").trim() ||
      new Date().toISOString().slice(0, 10);
    const activityChannel =
      String(formData.get("activity_channel") || "").trim() || null;
    const activitySubject =
      String(formData.get("activity_subject") || "").trim() || null;
    const activityNote =
      String(formData.get("activity_note") || "").trim() || null;
    const activityResponse =
      String(formData.get("activity_response") || "").trim() || null;
    const recordInitialActivity = formData.get("record_initial_activity") === "yes";
  const hasInitialActivity = recordInitialActivity && Boolean(activitySubject || activityNote || activityResponse);
  if (recordInitialActivity && !hasInitialActivity) {
    throw new Error("Bitte für die manuelle Aktivität einen Betreff, eine Notiz oder eine Rückmeldung eintragen.");
  }
    if (mailingRecipientIdFromForm) {
      const { data: source, error: sourceError } = await supabaseAdmin
        .from("mailing_recipients")
        .select("id, organizer_id, venue_id, acquisition_id")
        .eq("id", mailingRecipientIdFromForm).single();
      if (sourceError || !source) throw new Error("Newsletter-Empfänger nicht gefunden.");
      if (source.acquisition_id) redirect(`/admin/acquisition/${source.acquisition_id}`);
      // Beim Newsletter-Transfer keine beliebige fremde Akquise-Zuordnung zulassen.
      if (source.organizer_id && organizerId !== source.organizer_id) {
        throw new Error("Der Veranstalter stimmt nicht mit dem Newsletter-Empfänger überein.");
      }
    }
    // ==========================================================
    // VALIDIERUNG
    // ==========================================================
    if (!venueId && !organizerId) {
      throw new Error(
        "Bitte eine Location oder einen Veranstalter auswählen."
      );
    }
    if (venueId && organizerId) {
      throw new Error(
        "Eine Akquise kann nur einer Location oder einem Veranstalter zugeordnet werden."
      );
    }
    // Einzelakquise ohne Runde ist erlaubt. Eine explizit gewählte Runde
  // muss weiterhin eine aktive Akquise-Runde sein.
  if (roundId) {
    const { data: selectedRound, error: roundError } = await supabaseAdmin
      .from("acquisition_rounds")
      .select("id, type, active, archived_at")
      .eq("id", roundId)
      .single();


    if (roundError || !selectedRound || selectedRound.type !== "acquisition" ||
        !selectedRound.active || selectedRound.archived_at) {
      throw new Error("Die ausgewählte Akquise-Runde ist nicht mehr aktiv.");
    }
  }


  const {
      data: newAcquisition,
      error: insertError,
    } = await supabaseAdmin
      .from("acquisition")
      .insert({
        venue_id: venueId,
        organizer_id: organizerId,
        round_id: roundId,
        program,
        status,
        priority,
        next_follow_up_at:
          nextFollowUpAt,
        next_step: nextStep,
        // Aktueller Stand wird direkt aus der ersten Aktivität gespiegelt.
        last_contact_at: hasInitialActivity ? activityDate : null,
        contact_channel: hasInitialActivity ? activityChannel : null,
        contact_note: hasInitialActivity ? activityNote : null,
        response: hasInitialActivity ? activityResponse : null,
        notes,
        archived_at: null,
        updated_at:
          new Date().toISOString(),
      })
      .select("id")
      .single();
    if (
      insertError ||
      !newAcquisition
    ) {
      throw new Error(
        insertError?.message ||
          "Akquise konnte nicht angelegt werden."
      );
    }
    if (hasInitialActivity) {
  const { error: activityInsertError } = await supabaseAdmin
      .from("acquisition_activities")
      .insert({
        acquisition_id: newAcquisition.id,
        activity_date: activityDate,
        activity_type: "Kontakt",
        channel: activityChannel,
        subject: activitySubject,
        note: activityNote,
        response: activityResponse,
        next_step: nextStep,
        follow_up_at: nextFollowUpAt,
        status_after: status,
      });
    if (activityInsertError) {
      // Kein halbfertiger Vorgang: wenn der erste Verlaufseintrag scheitert,
      // wird der eben angelegte Vorgang wieder entfernt.
      await supabaseAdmin
        .from("acquisition")
        .delete()
        .eq("id", newAcquisition.id);
      throw new Error(
        "Akquise konnte nicht vollständig angelegt werden: " +
          activityInsertError.message
      );
    }
    }


  if (mailingRecipientIdFromForm) {
    const { data: recipient, error: recipientError } = await supabaseAdmin
      .from("mailing_recipients")
      .select("id, acquisition_id")
      .eq("id", mailingRecipientIdFromForm)
      .single();
    if (recipientError || !recipient) {
      await supabaseAdmin.from("acquisition_activities").delete().eq("acquisition_id", newAcquisition.id);
      await supabaseAdmin.from("acquisition").delete().eq("id", newAcquisition.id);
      throw new Error(recipientError?.message || "Mailing-Empfänger konnte nicht verknüpft werden.");
    }
    if (recipient.acquisition_id) {
      await supabaseAdmin.from("acquisition_activities").delete().eq("acquisition_id", newAcquisition.id);
      await supabaseAdmin.from("acquisition").delete().eq("id", newAcquisition.id);
      redirect(`/admin/acquisition/${recipient.acquisition_id}`);
    }
    const { data: linkedRecipient, error: linkError } = await supabaseAdmin
      .from("mailing_recipients")
      .update({ acquisition_id: newAcquisition.id, updated_at: new Date().toISOString() })
      .eq("id", mailingRecipientIdFromForm)
      .is("acquisition_id", null)
      .select("id");
    if (linkError || !linkedRecipient?.length) {
      await supabaseAdmin.from("acquisition_activities").delete().eq("acquisition_id", newAcquisition.id);
      await supabaseAdmin.from("acquisition").delete().eq("id", newAcquisition.id);
      throw new Error("Akquise wurde nicht mit dem Newsletter-Empfänger verknüpft: " + (linkError?.message || "Bereits anderweitig verknüpft"));
    }
  }
  revalidatePath("/admin");
    revalidatePath("/admin/acquisition");
    if (venueId) revalidatePath(`/admin/locations/${venueId}`);
    redirect(`/admin/acquisition/${newAcquisition.id}`);
  }
  // ============================================================
  // RENDER
  // ============================================================
  return (
    <NewAcquisitionClient
      venues={venues || []}
      organizers={organizers || []}
      rounds={(rounds || []).map(
        (round) => ({
          id: round.id,
          name: round.name,
          type: round.type as
            | "acquisition"
            | "mailing",
          active: round.active,
        })
      )}
      initialVenueId={initialVenueId}
      initialOrganizerId={
        initialOrganizerId
      }
      initialRoundId={initialRoundId}
    mailingSource={mailingSource}
    existingAcquisitions={existingAcquisitions || []}
    linkExistingAcquisition={linkExistingAcquisition}
      createAcquisition={
        createAcquisition
      }
    />
  );
}