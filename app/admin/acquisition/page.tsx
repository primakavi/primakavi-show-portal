import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import AcquisitionClient from "./AcquisitionClient";

export default async function AcquisitionPage({
  searchParams,
}: {
  searchParams: Promise<{ round?: string }>;
}) {
  const params = await searchParams;
  const initialRoundId = params.round || "";
  // ============================================================
  // AKQUISE
  // ============================================================

  const { data: acquisitionRaw, error } = await supabaseAdmin
    .from("acquisition")
    .select(`
      id,
      venue_id,
      organizer_id,
      round_id,
      program,
      status,
      priority,
      last_contact_at,
      next_follow_up_at,
      contact_channel,
      contact_note,
      response,
      next_step,
      rejection_reason,
      interest,
      notes,
      action_type,
      context,
      converted_to_show,
      show_date,
      archived_at,
      created_at,
      updated_at
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return (
      <div className="rounded-[2rem] bg-white p-8 font-bold text-red-600 shadow-xl">
        Fehler beim Laden der Akquise: {error.message}
      </div>
    );
  }

  // ============================================================
  // LOCATIONS
  // ============================================================

  const venueIds = Array.from(
    new Set(
      (acquisitionRaw || [])
        .map((item) => item.venue_id)
        .filter((id): id is string => Boolean(id))
    )
  );

  const { data: venues, error: venuesError } =
    venueIds.length > 0
      ? await supabaseAdmin
          .from("venues")
          .select(`
            id,
            legacy_id,
            name,
            street,
            postal_code,
            city,
            state,
            capacity,
            contact_name,
            contact_email,
            contact_phone,
            booking_email,
            relationship_status
          `)
          .in("id", venueIds)
      : { data: [], error: null };

  if (venuesError) {
    return (
      <div className="rounded-[2rem] bg-white p-8 font-bold text-red-600 shadow-xl">
        Fehler beim Laden der Locations: {venuesError.message}
      </div>
    );
  }

  // ============================================================
  // VERANSTALTER
  // ============================================================

  const organizerIds = Array.from(
    new Set(
      (acquisitionRaw || [])
        .map((item) => item.organizer_id)
        .filter((id): id is string => Boolean(id))
    )
  );

  const { data: organizers, error: organizersError } =
    organizerIds.length > 0
      ? await supabaseAdmin
          .from("organizers")
          .select(`
            id,
            name,
            organizer_type,
            website,
            email,
            phone,
            city,
            country,
            relationship_status
          `)
          .in("id", organizerIds)
      : { data: [], error: null };

  if (organizersError) {
    return (
      <div className="rounded-[2rem] bg-white p-8 font-bold text-red-600 shadow-xl">
        Fehler beim Laden der Veranstalter: {organizersError.message}
      </div>
    );
  }

  // ============================================================
  // SPIELORTE DER VERANSTALTER
  // ============================================================

  const { data: organizerVenueLinks, error: linksError } =
    organizerIds.length > 0
      ? await supabaseAdmin
          .from("organizer_venues")
          .select(`
            organizer_id,
            venue_id,
            is_primary
          `)
          .in("organizer_id", organizerIds)
      : { data: [], error: null };

  if (linksError) {
    return (
      <div className="rounded-[2rem] bg-white p-8 font-bold text-red-600 shadow-xl">
        Fehler beim Laden der Veranstalter-Spielorte: {linksError.message}
      </div>
    );
  }

  const organizerVenueIds = Array.from(
    new Set(
      (organizerVenueLinks || [])
        .map((link) => link.venue_id)
        .filter((id): id is string => Boolean(id))
    )
  );

  const additionalVenueIds = organizerVenueIds.filter(
    (id) => !venueIds.includes(id)
  );

  const { data: additionalVenues, error: additionalVenuesError } =
    additionalVenueIds.length > 0
      ? await supabaseAdmin
          .from("venues")
          .select(`
            id,
            legacy_id,
            name,
            street,
            postal_code,
            city,
            state,
            capacity,
            contact_name,
            contact_email,
            contact_phone,
            booking_email,
            relationship_status
          `)
          .in("id", additionalVenueIds)
      : { data: [], error: null };

  if (additionalVenuesError) {
    return (
      <div className="rounded-[2rem] bg-white p-8 font-bold text-red-600 shadow-xl">
        Fehler beim Laden der Spielorte: {additionalVenuesError.message}
      </div>
    );
  }

  // ============================================================
  // MAPS
  // ============================================================

  const allVenues = [...(venues || []), ...(additionalVenues || [])];

  const venueMap = new Map(
    allVenues.map((venue) => [venue.id, venue])
  );

  const organizerMap = new Map(
    (organizers || []).map((organizer) => [
      organizer.id,
      organizer,
    ])
  );

  const organizerVenueMap = new Map<
    string,
    Array<(typeof allVenues)[number] & { is_primary: boolean }>
  >();

  for (const link of organizerVenueLinks || []) {
    const venue = venueMap.get(link.venue_id);

    if (!venue) continue;

    const existing =
      organizerVenueMap.get(link.organizer_id) || [];

    existing.push({
      ...venue,
      is_primary: Boolean(link.is_primary),
    });

    organizerVenueMap.set(link.organizer_id, existing);
  }

  // ============================================================
  // AKQUISE-RUNDEN
  // ============================================================

  const { data: rounds, error: roundsError } = await supabaseAdmin
    .from("acquisition_rounds")
    .select(`
      id,
      name,
      type,
      active,
      created_at,
      archived_at
    `)
    .order("active", { ascending: false })
    .order("created_at", { ascending: false });

  if (roundsError) {
    return (
      <div className="rounded-[2rem] bg-white p-8 font-bold text-red-600 shadow-xl">
        Fehler beim Laden der Akquise-Runden: {roundsError.message}
      </div>
    );
  }


  // ============================================================
  // MAILING / NEWSLETTER
  // ============================================================

  const { data: mailingRecipientsRaw, error: mailingRecipientsError } =
    await supabaseAdmin
      .from("mailing_recipients")
      .select(`
        id,
        round_id,
        venue_id,
        organizer_id,
        email,
        sent_at,
        scheduled_at,
        opened_at,
        clicked_at,
        unsubscribed_at,
        bounced_at,
        last_clicked_url,
        klicktipp_contact_id,
        reaction,
        notes,
        show_id,
        acquisition_id,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false });

  if (mailingRecipientsError) {
    return (
      <div className="rounded-[2rem] bg-white p-8 font-bold text-red-600 shadow-xl">
        Fehler beim Laden der Mailing-Empfänger: {mailingRecipientsError.message}
      </div>
    );
  }


  const { data: newsletterSuppressions, error: newsletterSuppressionsError } =
    await supabaseAdmin
      .from("newsletter_suppressions")
      .select("email, reason, unsubscribed_at");

  if (newsletterSuppressionsError) {
    return (
      <div className="rounded-[2rem] bg-white p-8 font-bold text-red-600 shadow-xl">
        Fehler beim Laden der Newsletter-Sperrliste: {newsletterSuppressionsError.message}
      </div>
    );
  }

  const suppressedEmails = (newsletterSuppressions || []).map((item) =>
    String(item.email || "").trim().toLowerCase()
  );

  const { data: mailingVenues, error: mailingVenuesError } =
    await supabaseAdmin
      .from("venues")
      .select(`
        id,
        name,
        city,
        state,
        contact_name,
        contact_email,
        booking_email,
        capacity,
        played_before,
        relationship_status,
        program_focus,
        acquisition_relevant
      `)
      .neq("acquisition_relevant", false)
      .order("name", { ascending: true });

  if (mailingVenuesError) {
    return (
      <div className="rounded-[2rem] bg-white p-8 font-bold text-red-600 shadow-xl">
        Fehler beim Laden der Mailing-Locations: {mailingVenuesError.message}
      </div>
    );
  }

  const { data: mailingOrganizers, error: mailingOrganizersError } =
    await supabaseAdmin
      .from("organizers")
      .select(`
        id,
        name,
        city,
        email,
        organizer_type
      `)
      .order("name", { ascending: true });

  if (mailingOrganizersError) {
    return (
      <div className="rounded-[2rem] bg-white p-8 font-bold text-red-600 shadow-xl">
        Fehler beim Laden der Mailing-Veranstalter: {mailingOrganizersError.message}
      </div>
    );
  }

  const mailingVenueMap = new Map(
    (mailingVenues || []).map((venue) => [venue.id, venue])
  );

  const mailingOrganizerMap = new Map(
    (mailingOrganizers || []).map((organizer) => [organizer.id, organizer])
  );

  const mailingRecipients = (mailingRecipientsRaw || []).map((recipient) => ({
    ...recipient,
    venue: recipient.venue_id
      ? mailingVenueMap.get(recipient.venue_id) || null
      : null,
    organizer: recipient.organizer_id
      ? mailingOrganizerMap.get(recipient.organizer_id) || null
      : null,
  }));

  async function addMailingRecipient(formData: FormData) {
    "use server";

    const roundId = String(formData.get("round_id") || "").trim();
    const targetType = String(formData.get("target_type") || "").trim();
    const targetId = String(formData.get("target_id") || "").trim();

    if (!roundId || !targetId || !["venue", "organizer"].includes(targetType)) {
      throw new Error("Bitte einen Empfänger auswählen.");
    }

    const { data: round, error: roundError } = await supabaseAdmin
      .from("acquisition_rounds")
      .select("id, type, active, archived_at")
      .eq("id", roundId)
      .single();

    if (
      roundError ||
      !round ||
      round.type !== "mailing" ||
      !round.active ||
      round.archived_at
    ) {
      throw new Error("Diese Mailing-Runde ist nicht aktiv.");
    }

    const { count: alreadySentCount, error: sentCheckError } = await supabaseAdmin
      .from("mailing_recipients")
      .select("id", { count: "exact", head: true })
      .eq("round_id", roundId)
      .not("sent_at", "is", null);

    if (sentCheckError) throw new Error(sentCheckError.message);
    if ((alreadySentCount || 0) > 0) {
      throw new Error("Dieses Mailing wurde bereits versendet. Die Empfängerliste ist eingefroren.");
    }

    let venueId: string | null = null;
    let organizerId: string | null = null;
    let email: string | null = null;

    if (targetType === "venue") {
      const { data: venue, error } = await supabaseAdmin
        .from("venues")
        .select("id, contact_email, booking_email")
        .eq("id", targetId)
        .single();

      if (error || !venue) {
        throw new Error(error?.message || "Location konnte nicht geladen werden.");
      }

      venueId = venue.id;
      email = venue.booking_email || venue.contact_email || null;
    } else {
      const { data: organizer, error } = await supabaseAdmin
        .from("organizers")
        .select("id, email")
        .eq("id", targetId)
        .single();

      if (error || !organizer) {
        throw new Error(
          error?.message || "Veranstalter konnte nicht geladen werden."
        );
      }

      organizerId = organizer.id;

      const { data: primaryContact } = await supabaseAdmin
        .from("organizer_contacts")
        .select("email, is_primary")
        .eq("organizer_id", organizer.id)
        .not("email", "is", null)
        .order("is_primary", { ascending: false })
        .limit(1)
        .maybeSingle();

      email = primaryContact?.email || organizer.email || null;
    }

    if (email) {
      const normalizedEmail = email.trim().toLowerCase();
      const { data: suppression, error: suppressionError } = await supabaseAdmin
        .from("newsletter_suppressions")
        .select("email")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (suppressionError) throw new Error(suppressionError.message);
      if (suppression) {
        throw new Error("Diese E-Mail-Adresse hat sich vom Newsletter abgemeldet und ist gesperrt.");
      }
    }

    const duplicateQuery = supabaseAdmin
      .from("mailing_recipients")
      .select("id")
      .eq("round_id", roundId);

    const { data: existing, error: existingError } =
      targetType === "venue"
        ? await duplicateQuery.eq("venue_id", targetId).maybeSingle()
        : await duplicateQuery.eq("organizer_id", targetId).maybeSingle();

    if (existingError) throw new Error(existingError.message);

    if (existing) {
      throw new Error("Dieser Empfänger ist bereits in der Mailing-Runde.");
    }

    const { error: insertError } = await supabaseAdmin
      .from("mailing_recipients")
      .insert({
        round_id: roundId,
        venue_id: venueId,
        organizer_id: organizerId,
        email,
        updated_at: new Date().toISOString(),
      });

    if (insertError) throw new Error(insertError.message);

    revalidatePath("/admin/acquisition");
  }


  async function addMailingRecipientsBulk(formData: FormData) {
    "use server";

    const roundId = String(formData.get("round_id") || "").trim();
    const rawTargets = String(formData.get("targets") || "").trim();

    if (!roundId || !rawTargets) {
      throw new Error("Bitte mindestens einen Empfänger auswählen.");
    }

    const { count: alreadySentCount, error: sentCheckError } = await supabaseAdmin
      .from("mailing_recipients")
      .select("id", { count: "exact", head: true })
      .eq("round_id", roundId)
      .not("sent_at", "is", null);

    if (sentCheckError) throw new Error(sentCheckError.message);
    if ((alreadySentCount || 0) > 0) {
      throw new Error("Dieses Mailing wurde bereits versendet. Die Empfängerliste ist eingefroren.");
    }

    const { data: round, error: roundError } = await supabaseAdmin
      .from("acquisition_rounds")
      .select("id, type, active, archived_at")
      .eq("id", roundId)
      .single();

    if (
      roundError ||
      !round ||
      round.type !== "mailing" ||
      !round.active ||
      round.archived_at
    ) {
      throw new Error("Diese Mailing-Runde ist nicht aktiv.");
    }

    let targets: Array<{ type: "venue" | "organizer"; id: string }> = [];

    try {
      targets = JSON.parse(rawTargets);
    } catch {
      throw new Error("Die Empfängerauswahl konnte nicht gelesen werden.");
    }

    targets = targets.filter(
      (target) =>
        target &&
        (target.type === "venue" || target.type === "organizer") &&
        Boolean(target.id)
    );

    if (!targets.length) {
      throw new Error("Bitte mindestens einen Empfänger auswählen.");
    }

    const venueIds = targets
      .filter((target) => target.type === "venue")
      .map((target) => target.id);

    const organizerIds = targets
      .filter((target) => target.type === "organizer")
      .map((target) => target.id);

    const [{ data: selectedVenues, error: venueError }, { data: selectedOrganizers, error: organizerError }] =
      await Promise.all([
        venueIds.length
          ? supabaseAdmin
              .from("venues")
              .select("id, contact_email, booking_email")
              .in("id", venueIds)
          : Promise.resolve({ data: [], error: null }),
        organizerIds.length
          ? supabaseAdmin
              .from("organizers")
              .select("id, email")
              .in("id", organizerIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

    if (venueError) throw new Error(venueError.message);
    if (organizerError) throw new Error(organizerError.message);

    const { data: organizerContacts, error: contactsError } = organizerIds.length
      ? await supabaseAdmin
          .from("organizer_contacts")
          .select("organizer_id, email, is_primary")
          .in("organizer_id", organizerIds)
          .not("email", "is", null)
      : { data: [], error: null };

    if (contactsError) throw new Error(contactsError.message);

    const primaryEmailByOrganizer = new Map<string, string>();
    for (const contact of organizerContacts || []) {
      if (!contact.email) continue;
      if (contact.is_primary || !primaryEmailByOrganizer.has(contact.organizer_id)) {
        primaryEmailByOrganizer.set(contact.organizer_id, contact.email);
      }
    }

    const { data: existing, error: existingError } = await supabaseAdmin
      .from("mailing_recipients")
      .select("venue_id, organizer_id")
      .eq("round_id", roundId);

    if (existingError) throw new Error(existingError.message);

    const existingVenueIds = new Set(
      (existing || []).map((item) => item.venue_id).filter(Boolean)
    );
    const existingOrganizerIds = new Set(
      (existing || []).map((item) => item.organizer_id).filter(Boolean)
    );

    const rows = [
      ...(selectedVenues || [])
        .filter((venue) => !existingVenueIds.has(venue.id))
        .map((venue) => ({
          round_id: roundId,
          venue_id: venue.id,
          organizer_id: null,
          email: venue.booking_email || venue.contact_email || null,
          updated_at: new Date().toISOString(),
        })),
      ...(selectedOrganizers || [])
        .filter((organizer) => !existingOrganizerIds.has(organizer.id))
        .map((organizer) => ({
          round_id: roundId,
          venue_id: null,
          organizer_id: organizer.id,
          email:
            primaryEmailByOrganizer.get(organizer.id) ||
            organizer.email ||
            null,
          updated_at: new Date().toISOString(),
        })),
    ];

    const { data: suppressions, error: suppressionsError } = await supabaseAdmin
      .from("newsletter_suppressions")
      .select("email");

    if (suppressionsError) throw new Error(suppressionsError.message);

    const blocked = new Set(
      (suppressions || []).map((item) => String(item.email || "").trim().toLowerCase())
    );

    const allowedRows = rows.filter(
      (row) => !row.email || !blocked.has(String(row.email).trim().toLowerCase())
    );

    if (!allowedRows.length) {
      revalidatePath("/admin/acquisition");
      return;
    }

    const { error: insertError } = await supabaseAdmin
      .from("mailing_recipients")
      .insert(allowedRows);

    if (insertError) throw new Error(insertError.message);

    revalidatePath("/admin/acquisition");
  }

  async function updateMailingRecipient(formData: FormData) {
    "use server";

    const id = String(formData.get("id") || "").trim();
    if (!id) return;

    const reaction = String(formData.get("reaction") || "").trim() || null;
    const notes = String(formData.get("notes") || "").trim() || null;

    const { error } = await supabaseAdmin
      .from("mailing_recipients")
      .update({
        reaction,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/acquisition");
  }

  async function markMailingSent(formData: FormData) {
    "use server";

    const id = String(formData.get("id") || "").trim();
    if (!id) return;

    const { error } = await supabaseAdmin
      .from("mailing_recipients")
      .update({
        sent_at: new Date().toISOString(),
        scheduled_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/acquisition");
  }

  async function markWholeMailingSent(formData: FormData) {
    "use server";

    const roundId = String(formData.get("round_id") || "").trim();
    const sentAtRaw = String(formData.get("sent_at") || "").trim();
    if (!roundId) return;

    const parsed = sentAtRaw ? new Date(sentAtRaw) : new Date();
    if (Number.isNaN(parsed.getTime())) {
      throw new Error("Der Versandzeitpunkt ist ungültig.");
    }

    const sentAt = parsed.toISOString();
    const now = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from("mailing_recipients")
      .update({
        sent_at: sentAt,
        scheduled_at: null,
        updated_at: now,
      })
      .eq("round_id", roundId);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/acquisition");
  }

  async function scheduleWholeMailing(formData: FormData) {
    "use server";

    const roundId = String(formData.get("round_id") || "").trim();
    const scheduledAt = String(formData.get("scheduled_at") || "").trim();

    if (!roundId || !scheduledAt) {
      throw new Error("Bitte Datum und Uhrzeit für den Versand auswählen.");
    }

    const parsed = new Date(scheduledAt);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error("Der geplante Versandzeitpunkt ist ungültig.");
    }

    const now = new Date().toISOString();

    // Wichtig: Planung hebt einen versehentlich gesetzten Versandstatus auf.
    const { error } = await supabaseAdmin
      .from("mailing_recipients")
      .update({
        scheduled_at: parsed.toISOString(),
        sent_at: null,
        updated_at: now,
      })
      .eq("round_id", roundId);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/acquisition");
  }

  async function updateMailingTracking(formData: FormData) {
    "use server";

    const id = String(formData.get("id") || "").trim();
    const field = String(formData.get("field") || "").trim();
    const active = String(formData.get("active") || "") === "true";

    const allowedFields = [
      "opened_at",
      "clicked_at",
      "unsubscribed_at",
      "bounced_at",
    ];

    if (!id || !allowedFields.includes(field)) {
      throw new Error("Ungültiger Tracking-Status.");
    }

    const { data: recipient, error: loadError } = await supabaseAdmin
      .from("mailing_recipients")
      .select("id, email, opened_at")
      .eq("id", id)
      .single();

    if (loadError || !recipient) {
      throw new Error(loadError?.message || "Mailing-Empfänger nicht gefunden.");
    }

    const now = new Date().toISOString();
    const updateData: Record<string, string | null> = {
      [field]: active ? now : null,
      updated_at: now,
    };

    // Ein Klick setzt fachlich auch "geöffnet".
    if (field === "clicked_at" && active && !recipient.opened_at) {
      updateData.opened_at = now;
    }

    const { error: updateError } = await supabaseAdmin
      .from("mailing_recipients")
      .update(updateData)
      .eq("id", id);

    if (updateError) throw new Error(updateError.message);

    // Abmeldung dauerhaft und E-Mail-bezogen speichern.
    if (field === "unsubscribed_at" && recipient.email) {
      const email = recipient.email.trim().toLowerCase();

      if (active) {
        const { error: suppressionError } = await supabaseAdmin
          .from("newsletter_suppressions")
          .upsert(
            {
              email,
              reason: "unsubscribed",
              unsubscribed_at: now,
              updated_at: now,
            },
            { onConflict: "email" }
          );

        if (suppressionError) throw new Error(suppressionError.message);
      } else {
        const { error: suppressionError } = await supabaseAdmin
          .from("newsletter_suppressions")
          .delete()
          .eq("email", email)
          .eq("reason", "unsubscribed");

        if (suppressionError) throw new Error(suppressionError.message);
      }
    }

    revalidatePath("/admin/acquisition");
  }

  async function createAcquisitionFromMailing(formData: FormData) {
    "use server";

    const recipientId = String(formData.get("recipient_id") || "").trim();
    if (!recipientId) return;

    const { data: recipient, error: recipientError } = await supabaseAdmin
      .from("mailing_recipients")
      .select(`
        id,
        round_id,
        venue_id,
        organizer_id,
        email,
        sent_at,
        reaction,
        notes,
        acquisition_id
      `)
      .eq("id", recipientId)
      .single();

    if (recipientError || !recipient) {
      throw new Error(recipientError?.message || "Mailing-Empfänger nicht gefunden.");
    }

    // Idempotent: ein Mailing-Empfänger darf nur einmal umgewandelt werden.
    if (recipient.acquisition_id) {
      revalidatePath("/admin/acquisition");
      return;
    }

    const { data: round } = await supabaseAdmin
      .from("acquisition_rounds")
      .select("name")
      .eq("id", recipient.round_id)
      .maybeSingle();

    const now = new Date().toISOString();
    const reaction = String(recipient.reaction || "").trim();
    const sourceName = round?.name || "Newsletter";
    const response = reaction || "Antwort auf Newsletter";

    const { data: acquisitionItem, error: acquisitionError } = await supabaseAdmin
      .from("acquisition")
      .insert({
        venue_id: recipient.venue_id,
        organizer_id: recipient.organizer_id,
        round_id: recipient.round_id,
        status: reaction === "Absage" ? "Abgesagt" : "Antwort erhalten",
        priority: "normal",
        last_contact_at: recipient.sent_at || now,
        contact_channel: "E-Mail / Newsletter",
        contact_note: `Quelle: ${sourceName}`,
        response,
        notes: recipient.notes || null,
        action_type: "mailing_response",
        context: `Aus Mailing „${sourceName}“ übernommen`,
        converted_to_show: false,
        updated_at: now,
      })
      .select("id")
      .single();

    if (acquisitionError || !acquisitionItem) {
      throw new Error(acquisitionError?.message || "Akquise-Vorgang konnte nicht angelegt werden.");
    }

    const { error: linkError } = await supabaseAdmin
      .from("mailing_recipients")
      .update({
        acquisition_id: acquisitionItem.id,
        updated_at: now,
      })
      .eq("id", recipient.id)
      .is("acquisition_id", null);

    if (linkError) throw new Error(linkError.message);

    revalidatePath("/admin/acquisition");
    revalidatePath("/admin");
  }

  async function addNoteToWholeMailing(formData: FormData) {
    "use server";

    const roundId = String(formData.get("round_id") || "").trim();
    const note = String(formData.get("note") || "").trim();

    if (!roundId || !note) {
      throw new Error("Bitte eine Notiz eingeben.");
    }

    const { data: rows, error: loadError } = await supabaseAdmin
      .from("mailing_recipients")
      .select("id, notes")
      .eq("round_id", roundId);

    if (loadError) throw new Error(loadError.message);
    if (!rows?.length) return;

    const stamp = new Intl.DateTimeFormat("de-DE", {
      dateStyle: "short",
    }).format(new Date());

    const updates = rows.map((row) => {
      const existing = String(row.notes || "").trim();
      const addition = `${stamp}: ${note}`;
      const nextNotes = existing ? `${existing}\n${addition}` : addition;

      return supabaseAdmin
        .from("mailing_recipients")
        .update({
          notes: nextNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id);
    });

    const results = await Promise.all(updates);
    const failed = results.find((result) => result.error);

    if (failed?.error) throw new Error(failed.error.message);

    revalidatePath("/admin/acquisition");
  }

  async function deleteMailingRecipient(formData: FormData) {
    "use server";

    const id = String(formData.get("id") || "").trim();
    if (!id) return;

    const { data: recipient, error: loadError } = await supabaseAdmin
      .from("mailing_recipients")
      .select("id, sent_at")
      .eq("id", id)
      .single();

    if (loadError || !recipient) {
      throw new Error(loadError?.message || "Empfänger nicht gefunden.");
    }

    if (recipient.sent_at) {
      throw new Error("Versendete Mailing-Empfänger können nicht mehr entfernt werden.");
    }

    const { error } = await supabaseAdmin
      .from("mailing_recipients")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/acquisition");
  }

  // ============================================================
  // CLIENT-DATEN
  // ============================================================

  const acquisition = (acquisitionRaw || []).map((item) => {
    const venue = item.venue_id
      ? venueMap.get(item.venue_id) || null
      : null;

    const organizer = item.organizer_id
      ? organizerMap.get(item.organizer_id) || null
      : null;

    const organizerVenues = item.organizer_id
      ? organizerVenueMap.get(item.organizer_id) || []
      : [];

    return {
      ...item,
      venue: venue ? [venue] : [],
      organizer: organizer ? [organizer] : [],
      organizer_venues: organizerVenues,
    };
  });

  // ============================================================
  // ARCHIVIEREN
  // ============================================================

  async function archiveAcquisition(formData: FormData) {
    "use server";

    const id = String(formData.get("id") || "");

    if (!id) return;

    const { error } = await supabaseAdmin
      .from("acquisition")
      .update({
        archived_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/acquisition");
    revalidatePath("/admin");
  }

  // ============================================================
  // REAKTIVIEREN
  // ============================================================

  async function restoreAcquisition(formData: FormData) {
    "use server";

    const id = String(formData.get("id") || "");

    if (!id) return;

    const { error } = await supabaseAdmin
      .from("acquisition")
      .update({
        archived_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/acquisition");
    revalidatePath("/admin");
  }

  // ============================================================
  // AKQUISE-RUNDEN
  // ============================================================

  async function createRound(formData: FormData) {
    "use server";

    const name = String(formData.get("name") || "").trim();
    const type = String(formData.get("type") || "acquisition").trim();

    if (!name) {
      throw new Error("Bitte einen Namen für die Runde eingeben.");
    }

    if (!["acquisition", "mailing"].includes(type)) {
      throw new Error("Ungültiger Rundentyp.");
    }

    const { data: newRound, error } = await supabaseAdmin
      .from("acquisition_rounds")
      .insert({
        name,
        type,
        active: true,
        archived_at: null,
      })
      .select("id")
      .single();

    if (error || !newRound) {
      throw new Error(error?.message || "Runde konnte nicht angelegt werden.");
    }

    revalidatePath("/admin/acquisition");
    redirect(`/admin/acquisition?round=${newRound.id}`);
  }

  async function archiveRound(formData: FormData) {
    "use server";

    const id = String(formData.get("round_id") || "");
    if (!id) return;

    const { error } = await supabaseAdmin
      .from("acquisition_rounds")
      .update({
        active: false,
        archived_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/acquisition");
  }

  async function restoreRound(formData: FormData) {
    "use server";

    const id = String(formData.get("round_id") || "");
    if (!id) return;

    const { error } = await supabaseAdmin
      .from("acquisition_rounds")
      .update({
        active: true,
        archived_at: null,
      })
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/acquisition");
  }

  // ============================================================
  // SHOW AUS AKQUISE
  // ============================================================

  async function createShowFromAcquisition(formData: FormData) {
    "use server";

    const acquisitionId = String(
      formData.get("acquisition_id") || ""
    );

    const selectedVenueId = String(
      formData.get("venue_id") || ""
    );

    if (!acquisitionId) {
      throw new Error("Akquise-Vorgang fehlt.");
    }

    // ----------------------------------------------------------
    // AKQUISE LADEN
    // ----------------------------------------------------------

    const {
      data: acquisitionItem,
      error: acquisitionError,
    } = await supabaseAdmin
      .from("acquisition")
      .select(`
        id,
        venue_id,
        organizer_id,
        program,
        show_date
      `)
      .eq("id", acquisitionId)
      .single();

    if (acquisitionError || !acquisitionItem) {
      throw new Error(
        acquisitionError?.message ||
          "Akquise konnte nicht geladen werden."
      );
    }

    // ----------------------------------------------------------
    // KONKRETE LOCATION BESTIMMEN
    // ----------------------------------------------------------

    let venueId = acquisitionItem.venue_id || selectedVenueId || null;

    if (!venueId && acquisitionItem.organizer_id) {
      const { data: links, error: linksError } = await supabaseAdmin
        .from("organizer_venues")
        .select(`
          venue_id,
          is_primary
        `)
        .eq("organizer_id", acquisitionItem.organizer_id);

      if (linksError) {
        throw new Error(linksError.message);
      }

      if (!links || links.length === 0) {
        throw new Error(
          "Für diesen Veranstalter ist noch kein Spielort hinterlegt."
        );
      }

      if (links.length === 1) {
        venueId = links[0].venue_id;
      } else {
        const primary = links.find(
          (link) => link.is_primary
        );

        if (primary && !selectedVenueId) {
          venueId = primary.venue_id;
        }
      }
    }

    if (!venueId) {
      throw new Error(
        "Bitte zuerst einen konkreten Spielort auswählen."
      );
    }

    // ----------------------------------------------------------
    // SICHERHEIT:
    // Bei Veranstalter-Akquise darf nur ein verknüpfter Spielort
    // verwendet werden.
    // ----------------------------------------------------------

    if (
      acquisitionItem.organizer_id &&
      !acquisitionItem.venue_id
    ) {
      const { data: validLink, error: validLinkError } =
        await supabaseAdmin
          .from("organizer_venues")
          .select("venue_id")
          .eq(
            "organizer_id",
            acquisitionItem.organizer_id
          )
          .eq("venue_id", venueId)
          .maybeSingle();

      if (validLinkError) {
        throw new Error(validLinkError.message);
      }

      if (!validLink) {
        throw new Error(
          "Der gewählte Spielort gehört nicht zu diesem Veranstalter."
        );
      }
    }

    // ----------------------------------------------------------
    // LOCATION
    // ----------------------------------------------------------

    const { data: venue, error: venueError } =
      await supabaseAdmin
        .from("venues")
        .select(`
          id,
          name,
          street,
          postal_code,
          city,
          contact_name,
          contact_email,
          contact_phone,
          booking_email,
          capacity
        `)
        .eq("id", venueId)
        .single();

    if (venueError || !venue) {
      throw new Error(
        venueError?.message ||
          "Location konnte nicht geladen werden."
      );
    }

    // ----------------------------------------------------------
    // VERANSTALTER-KONTAKT
    // ----------------------------------------------------------

    let organizerContact:
      | {
          name: string | null;
          email: string | null;
          phone: string | null;
        }
      | null = null;

    if (acquisitionItem.organizer_id) {
      const { data: organizer } = await supabaseAdmin
        .from("organizers")
        .select(`
          name,
          email,
          phone
        `)
        .eq("id", acquisitionItem.organizer_id)
        .maybeSingle();

      const { data: primaryContact } = await supabaseAdmin
        .from("organizer_contacts")
        .select(`
          name,
          email,
          phone,
          is_primary
        `)
        .eq("organizer_id", acquisitionItem.organizer_id)
        .order("is_primary", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      organizerContact = {
        name:
          primaryContact?.name ||
          organizer?.name ||
          null,

        email:
          primaryContact?.email ||
          organizer?.email ||
          null,

        phone:
          primaryContact?.phone ||
          organizer?.phone ||
          null,
      };
    }

    // ----------------------------------------------------------
    // SHOWDATEN
    // ----------------------------------------------------------

    const showDate = acquisitionItem.show_date || null;

    const token = createToken(
      showDate || "",
      venue.name || ""
    );

    const venueAddress = [
      venue.street,
      [venue.postal_code, venue.city]
        .filter(Boolean)
        .join(" "),
    ]
      .filter(Boolean)
      .join(", ");

    // ----------------------------------------------------------
    // SHOW ANLEGEN
    // ----------------------------------------------------------

    const { data: show, error: showError } =
      await supabaseAdmin
        .schema("booking")
        .from("shows")
        .insert({
          token,

          acquisition_id: acquisitionItem.id,

          venue_id: venue.id,

          artist: "Sonja Gründemann",

          program:
            acquisitionItem.program ||
            "Jetzt mal Tacheles",

          show_date: showDate,

          weekday: getWeekday(showDate),

          venue: venue.name,

          city: venue.city,

          venue_address: venueAddress || null,

          contact_name:
            organizerContact?.name ||
            venue.contact_name,

          contact_email:
            organizerContact?.email ||
            venue.contact_email ||
            venue.booking_email,

          contact_phone:
            organizerContact?.phone ||
            venue.contact_phone,

          capacity: venue.capacity,

          internal_status: "neu",

          billing_status: "offen",

          contract_status: "offen",

          markus_included: false,

          checklist: {},
        })
        .select("id")
        .single();

    if (showError || !show) {
      throw new Error(
        showError?.message ||
          "Show konnte nicht erstellt werden."
      );
    }

    // ----------------------------------------------------------
    // AKQUISE AUF GEBUCHT
    // ----------------------------------------------------------

    const { error: updateError } = await supabaseAdmin
      .from("acquisition")
      .update({
        status: "Gebucht 🎉",
        converted_to_show: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", acquisitionId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // ----------------------------------------------------------
    // REFRESH
    // ----------------------------------------------------------

    revalidatePath("/admin/acquisition");
    revalidatePath("/admin/shows");
    revalidatePath("/admin");
    revalidatePath("/admin/markus");

    if (acquisitionItem.organizer_id) {
      revalidatePath(
        `/admin/organizers/${acquisitionItem.organizer_id}`
      );
    }

    if (acquisitionItem.venue_id) {
      revalidatePath(
        `/admin/locations/${acquisitionItem.venue_id}`
      );
    }

    redirect(`/admin/shows/${show.id}`);
  }

  return (
<AcquisitionClient
  acquisition={acquisition}
  rounds={rounds || []}
  initialRoundId={initialRoundId}

  mailingRecipients={mailingRecipients}
  mailingVenues={mailingVenues || []}
  mailingOrganizers={mailingOrganizers || []}

  addMailingRecipient={addMailingRecipient}
  addMailingRecipientsBulk={addMailingRecipientsBulk}
  updateMailingRecipient={updateMailingRecipient}
  updateMailingTracking={updateMailingTracking}
  createAcquisitionFromMailing={createAcquisitionFromMailing}
  suppressedEmails={suppressedEmails}
  markMailingSent={markMailingSent}
  markWholeMailingSent={markWholeMailingSent}
  scheduleWholeMailing={scheduleWholeMailing}
  addNoteToWholeMailing={addNoteToWholeMailing}
  deleteMailingRecipient={deleteMailingRecipient}

  createRound={createRound}
  archiveRound={archiveRound}
  restoreRound={restoreRound}
  archiveAcquisition={archiveAcquisition}
  restoreAcquisition={restoreAcquisition}
  createShowFromAcquisition={createShowFromAcquisition}
/>
  );
}

// ============================================================
// TOKEN
// ============================================================

function createToken(date: string, venue: string) {
  const cleanVenue =
    venue
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 18) || "show";

  const cleanDate = date
    ? date.replaceAll("-", "")
    : "date";

  const random = crypto.randomUUID().slice(0, 6);

  return `${cleanDate}-${cleanVenue}-${random}`;
}

// ============================================================
// WOCHENTAG
// ============================================================

function getWeekday(date?: string | null) {
  if (!date) return null;

  const [year, month, day] = date
    .split("-")
    .map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const d = new Date(
    year,
    month - 1,
    day
  );

  if (Number.isNaN(d.getTime())) {
    return null;
  }

  return d
    .toLocaleDateString("de-DE", {
      weekday: "long",
    })
    .toUpperCase();
}