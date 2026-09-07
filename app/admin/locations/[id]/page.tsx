import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import LocationClient from "./LocationClient";

export default async function LocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // ------------------------------------------------------------
  // LOCATION
  // ------------------------------------------------------------

  const { data: venue, error: venueError } = await supabaseAdmin
    .from("venues")
    .select("*")
    .eq("id", id)
    .single();

  if (venueError || !venue) {
    notFound();
  }

  // ------------------------------------------------------------
  // SHOWS DIESER LOCATION
  // ------------------------------------------------------------

  const { data: shows, error: showsError } = await supabaseAdmin
    .schema("booking")
    .from("shows")
    .select(`
      id,
      show_date,
      program,
      internal_status,
      start_time,
      venue_submitted
    `)
    .eq("venue_id", id)
    .order("show_date", { ascending: true });

  if (showsError) {
    console.error("Shows konnten nicht geladen werden:", showsError);
  }

  // ------------------------------------------------------------
  // AKQUISE-RUNDEN
  // ------------------------------------------------------------

  const { data: acquisitionRounds, error: acquisitionRoundsError } =
    await supabaseAdmin
      .from("acquisition_rounds")
      .select("id, name, active, created_at")
      .eq("active", true)
      .order("name", { ascending: true });

  if (acquisitionRoundsError) {
    console.error(
      "Akquise-Runden konnten nicht geladen werden:",
      acquisitionRoundsError
    );
  }

  // ------------------------------------------------------------
  // AKQUISE-HISTORIE
  // aktiv + archiviert
  // inkl. aller Verlaufseinträge
  // ------------------------------------------------------------

  const { data: acquisition, error: acquisitionError } =
    await supabaseAdmin
      .from("acquisition")
      .select(`
        id,
        program,
        status,
        priority,
        last_contact_at,
        next_follow_up_at,
        contact_channel,
        contact_note,
        response,
        next_step,
        notes,
        archived_at,
        created_at
      `)
      .eq("venue_id", id)
      .order("last_contact_at", {
        ascending: false,
        nullsFirst: false,
      });

  if (acquisitionError) {
    console.error(
      "Akquise-Historie konnte nicht geladen werden:",
      acquisitionError
    );
  }

  const acquisitionIds = acquisition?.map((item) => item.id) || [];

  let acquisitionActivities: any[] = [];

  if (acquisitionIds.length > 0) {
    const { data: activities, error: activitiesError } =
      await supabaseAdmin
        .from("acquisition_activities")
        .select(`
          id,
          acquisition_id,
          activity_date,
          activity_type,
          channel,
          note,
          response,
          next_step,
          follow_up_at,
          status_after,
          interest_after,
          created_at
        `)
        .in("acquisition_id", acquisitionIds)
        .order("activity_date", { ascending: false })
        .order("created_at", { ascending: false });

    if (activitiesError) {
      console.error(
        "Akquise-Verlauf konnte nicht geladen werden:",
        activitiesError
      );
    } else {
      acquisitionActivities = activities || [];
    }
  }

  // ------------------------------------------------------------
  // NEUE AKQUISE-RUNDE ZUR AUSWAHL HINZUFÜGEN
  // ------------------------------------------------------------

  async function createAcquisitionRound(formData: FormData) {
    "use server";

    const name = valueOrNull(formData.get("name"));

    if (!name) {
      return {
        success: false,
        message: "Bitte einen Namen für die Akquise-Runde eingeben.",
      };
    }

    const { data: existing } = await supabaseAdmin
      .from("acquisition_rounds")
      .select("id, name")
      .ilike("name", name)
      .maybeSingle();

    if (existing) {
      return {
        success: true,
        message: "Diese Akquise-Runde gibt es bereits.",
        roundName: existing.name,
      };
    }

    const { data: created, error } = await supabaseAdmin
      .from("acquisition_rounds")
      .insert({ name })
      .select("id, name")
      .single();

    if (error || !created) {
      return {
        success: false,
        message: error?.message || "Akquise-Runde konnte nicht angelegt werden.",
      };
    }

    revalidatePath(`/admin/locations/${id}`);
    revalidatePath("/admin/acquisition");

    return {
      success: true,
      message: "Akquise-Runde hinzugefügt.",
      roundName: created.name,
    };
  }

  // ------------------------------------------------------------
  // NEUEN AKQUISE-VORGANG FÜR DIESE LOCATION STARTEN
  // ------------------------------------------------------------

  async function createAcquisition(formData: FormData) {
    "use server";

    const roundName = valueOrNull(formData.get("round_name"));

    if (!roundName) {
      return {
        success: false,
        message: "Bitte eine Akquise-Runde auswählen.",
      };
    }

    const { data: activeExisting } = await supabaseAdmin
      .from("acquisition")
      .select("id")
      .eq("venue_id", id)
      .is("archived_at", null)
      .not("status", "ilike", "%gebucht%")
      .not("status", "ilike", "%abgesagt%")
      .limit(1);

    if (activeExisting && activeExisting.length > 0) {
      return {
        success: false,
        message:
          "Für diese Location gibt es bereits einen offenen Akquise-Vorgang.",
      };
    }

    const { error } = await supabaseAdmin
      .from("acquisition")
      .insert({
        venue_id: id,
        program: roundName,
        status: "Neu",
        priority: "Normal",
      });

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    revalidatePath(`/admin/locations/${id}`);
    revalidatePath("/admin/acquisition");

    return {
      success: true,
      message: "Neue Akquise gestartet.",
    };
  }

  // ------------------------------------------------------------
  // AKQUISE-EINTRAG DIREKT AUS DER LOCATION
  // ------------------------------------------------------------

  async function addActivity(formData: FormData) {
    "use server";

    const acquisitionId = valueOrNull(
      formData.get("acquisition_id")
    );

    if (!acquisitionId) {
      return {
        success: false,
        message: "Kein aktiver Akquise-Vorgang gefunden.",
      };
    }

    // Sicherheitscheck:
    // Der Vorgang muss zu genau dieser Location gehören und aktiv sein.
    const { data: currentAcquisition, error: currentError } =
      await supabaseAdmin
        .from("acquisition")
        .select("id, status, archived_at")
        .eq("id", acquisitionId)
        .eq("venue_id", id)
        .single();

    if (
      currentError ||
      !currentAcquisition ||
      currentAcquisition.archived_at
    ) {
      return {
        success: false,
        message:
          "Der Akquise-Vorgang ist nicht aktiv oder gehört nicht zu dieser Location.",
      };
    }

    const activityType =
      valueOrNull(formData.get("activity_type")) || "Kontakt";

    const activityDate =
      valueOrNull(formData.get("activity_date")) ||
      new Date().toISOString().slice(0, 10);

    const channel = valueOrNull(formData.get("channel"));
    const note = valueOrNull(formData.get("note"));
    const response = valueOrNull(formData.get("response"));
    const nextStep = valueOrNull(formData.get("next_step"));
    const followUpAt = valueOrNull(formData.get("follow_up_at"));
    const interestAfter = valueOrNull(
      formData.get("interest_after")
    );

    let statusAfter = valueOrNull(formData.get("status_after"));

    if (activityType === "Absage") {
      statusAfter = "Abgesagt";
    }

    if (activityType === "Buchung") {
      statusAfter = "Gebucht 🎉";
    }

    if (
      !statusAfter &&
      activityType === "Kontakt" &&
      ["Neu", "Vorqualifiziert", "Insta"].includes(
        currentAcquisition.status || ""
      )
    ) {
      statusAfter = "Kontaktiert";
    }

    const { error: insertError } = await supabaseAdmin
      .from("acquisition_activities")
      .insert({
        acquisition_id: acquisitionId,
        activity_date: activityDate,
        activity_type: activityType,
        channel,
        note,
        response,
        next_step: nextStep,
        follow_up_at: followUpAt,
        status_after: statusAfter,
        interest_after: interestAfter,
      });

    if (insertError) {
      return {
        success: false,
        message: insertError.message,
      };
    }

    const acquisitionUpdate: Record<string, string | null> = {};

    if (
      ["Kontakt", "Rückmeldung", "Absage", "Buchung"].includes(
        activityType
      )
    ) {
      acquisitionUpdate.last_contact_at = activityDate;

      if (channel) {
        acquisitionUpdate.contact_channel = channel;
      }
    }

    if (note) {
      acquisitionUpdate.contact_note = note;
    }

    if (response) {
      acquisitionUpdate.response = response;
    }

    if (nextStep !== null) {
      acquisitionUpdate.next_step = nextStep;
    }

    if (followUpAt !== null) {
      acquisitionUpdate.next_follow_up_at = followUpAt;
    }

    if (statusAfter) {
      acquisitionUpdate.status = statusAfter;
    }

    if (interestAfter) {
      acquisitionUpdate.interest = interestAfter;
    }

    if (Object.keys(acquisitionUpdate).length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from("acquisition")
        .update(acquisitionUpdate)
        .eq("id", acquisitionId)
        .eq("venue_id", id);

      if (updateError) {
        return {
          success: false,
          message:
            "Eintrag gespeichert, aber der aktuelle Akquise-Stand konnte nicht vollständig aktualisiert werden: " +
            updateError.message,
        };
      }
    }

    revalidatePath(`/admin/locations/${id}`);
    revalidatePath("/admin/acquisition");
    revalidatePath(`/admin/acquisition/${acquisitionId}`);

    return {
      success: true,
      message: "Akquise-Eintrag gespeichert.",
    };
  }

  // ------------------------------------------------------------
  // AKQUISE-EINTRAG LÖSCHEN
  // ------------------------------------------------------------

  async function deleteActivity(formData: FormData) {
    "use server";

    const acquisitionId = valueOrNull(formData.get("acquisition_id"));
    const activityId = valueOrNull(formData.get("activity_id"));

    if (!acquisitionId || !activityId) {
      return {
        success: false,
        message: "Kontakteintrag konnte nicht eindeutig gefunden werden.",
      };
    }

    // Sicherheitscheck: Vorgang muss zu dieser Location gehören.
    const { data: currentAcquisition, error: acquisitionCheckError } =
      await supabaseAdmin
        .from("acquisition")
        .select("id")
        .eq("id", acquisitionId)
        .eq("venue_id", id)
        .single();

    if (acquisitionCheckError || !currentAcquisition) {
      return {
        success: false,
        message: "Der Akquise-Vorgang gehört nicht zu dieser Location.",
      };
    }

    const { error: deleteError } = await supabaseAdmin
      .from("acquisition_activities")
      .delete()
      .eq("id", activityId)
      .eq("acquisition_id", acquisitionId);

    if (deleteError) {
      return {
        success: false,
        message: deleteError.message,
      };
    }

    // Nach dem Löschen den aktuellen Stand aus den verbliebenen
    // Verlaufseinträgen neu ableiten, damit ein versehentlich falscher
    // Kontakteintrag nicht weiter als "letzter Kontakt" stehen bleibt.
    const { data: remainingActivities, error: remainingError } =
      await supabaseAdmin
        .from("acquisition_activities")
        .select(`
          activity_date,
          activity_type,
          channel,
          note,
          response,
          next_step,
          follow_up_at,
          status_after
        `)
        .eq("acquisition_id", acquisitionId)
        .order("activity_date", { ascending: false })
        .order("created_at", { ascending: false });

    if (remainingError) {
      return {
        success: false,
        message:
          "Eintrag gelöscht, aber der aktuelle Akquise-Stand konnte nicht neu berechnet werden: " +
          remainingError.message,
      };
    }

    const remaining = remainingActivities || [];

    const latestContact = remaining.find((activity) =>
      ["Kontakt", "Rückmeldung", "Absage", "Buchung"].includes(
        activity.activity_type || ""
      )
    );

    const latestWithNote = remaining.find((activity) => activity.note);
    const latestWithResponse = remaining.find((activity) => activity.response);
    const latestWithNextStep = remaining.find((activity) => activity.next_step);
    const latestWithFollowUp = remaining.find((activity) => activity.follow_up_at);
    const latestWithStatus = remaining.find((activity) => activity.status_after);

    const { error: updateError } = await supabaseAdmin
      .from("acquisition")
      .update({
        last_contact_at: latestContact?.activity_date || null,
        contact_channel: latestContact?.channel || null,
        contact_note: latestWithNote?.note || null,
        response: latestWithResponse?.response || null,
        next_step: latestWithNextStep?.next_step || null,
        next_follow_up_at: latestWithFollowUp?.follow_up_at || null,
        status: latestWithStatus?.status_after || "Neu",
      })
      .eq("id", acquisitionId)
      .eq("venue_id", id);

    if (updateError) {
      return {
        success: false,
        message:
          "Eintrag gelöscht, aber der aktuelle Akquise-Stand konnte nicht vollständig aktualisiert werden: " +
          updateError.message,
      };
    }

    revalidatePath(`/admin/locations/${id}`);
    revalidatePath("/admin/acquisition");
    revalidatePath(`/admin/acquisition/${acquisitionId}`);

    return {
      success: true,
      message: "Kontakteintrag gelöscht.",
    };
  }

  // ------------------------------------------------------------
  // KOMPLETTEN AKQUISE-VORGANG LÖSCHEN
  // inklusive aller zugehörigen Verlaufseinträge
  // ------------------------------------------------------------

  async function deleteAcquisition(formData: FormData) {
    "use server";

    const acquisitionId = valueOrNull(formData.get("acquisition_id"));

    if (!acquisitionId) {
      return {
        success: false,
        message: "Akquise konnte nicht eindeutig gefunden werden.",
      };
    }

    const { data: currentAcquisition, error: acquisitionCheckError } =
      await supabaseAdmin
        .from("acquisition")
        .select("id")
        .eq("id", acquisitionId)
        .eq("venue_id", id)
        .single();

    if (acquisitionCheckError || !currentAcquisition) {
      return {
        success: false,
        message: "Die Akquise gehört nicht zu dieser Location.",
      };
    }

    const { error: activitiesDeleteError } = await supabaseAdmin
      .from("acquisition_activities")
      .delete()
      .eq("acquisition_id", acquisitionId);

    if (activitiesDeleteError) {
      return {
        success: false,
        message:
          "Die Kontakteinträge konnten nicht gelöscht werden: " +
          activitiesDeleteError.message,
      };
    }

    const { error: acquisitionDeleteError } = await supabaseAdmin
      .from("acquisition")
      .delete()
      .eq("id", acquisitionId)
      .eq("venue_id", id);

    if (acquisitionDeleteError) {
      return {
        success: false,
        message: acquisitionDeleteError.message,
      };
    }

    revalidatePath(`/admin/locations/${id}`);
    revalidatePath("/admin/acquisition");
    revalidatePath(`/admin/acquisition/${acquisitionId}`);

    return {
      success: true,
      message: "Akquise inklusive aller Kontakteinträge gelöscht.",
    };
  }

  // ------------------------------------------------------------
  // AKQUISE-RUNDE ENTFERNEN
  // unbenutzt = löschen
  // bereits verwendet = deaktivieren
  // ------------------------------------------------------------

  async function removeAcquisitionRound(formData: FormData) {
    "use server";

    const roundName = valueOrNull(formData.get("round_name"));

    if (!roundName) {
      return {
        success: false,
        message: "Akquise-Runde konnte nicht gefunden werden.",
      };
    }

    const { data: round, error: roundError } = await supabaseAdmin
      .from("acquisition_rounds")
      .select("id, name")
      .ilike("name", roundName)
      .maybeSingle();

    if (roundError) {
      return {
        success: false,
        message: roundError.message,
      };
    }

    if (!round) {
      return {
        success: false,
        message: "Akquise-Runde wurde nicht gefunden.",
      };
    }

    const { data: usage, error: usageError } = await supabaseAdmin
      .from("acquisition")
      .select("id")
      .ilike("program", round.name)
      .limit(1);

    if (usageError) {
      return {
        success: false,
        message: usageError.message,
      };
    }

    if (usage && usage.length > 0) {
      const { error: deactivateError } = await supabaseAdmin
        .from("acquisition_rounds")
        .update({ active: false })
        .eq("id", round.id);

      if (deactivateError) {
        return {
          success: false,
          message: deactivateError.message,
        };
      }

      revalidatePath(`/admin/locations/${id}`);
      revalidatePath("/admin/acquisition");

      return {
        success: true,
        message:
          "Akquise-Runde deaktiviert. Alte Akquise-Vorgänge bleiben erhalten.",
      };
    }

    const { error: deleteRoundError } = await supabaseAdmin
      .from("acquisition_rounds")
      .delete()
      .eq("id", round.id);

    if (deleteRoundError) {
      return {
        success: false,
        message: deleteRoundError.message,
      };
    }

    revalidatePath(`/admin/locations/${id}`);
    revalidatePath("/admin/acquisition");

    return {
      success: true,
      message: "Akquise-Runde gelöscht.",
    };
  }

  // ------------------------------------------------------------
  // LOCATION SPEICHERN
  // ------------------------------------------------------------

  async function saveLocation(formData: FormData) {
    "use server";

    const payload = {
      name: valueOrNull(formData.get("name")),

      street: valueOrNull(formData.get("street")),
      postal_code: valueOrNull(formData.get("postal_code")),
      city: valueOrNull(formData.get("city")),
      state: valueOrNull(formData.get("state")),
      country: valueOrNull(formData.get("country")),
      website: valueOrNull(formData.get("website")),

      capacity: formData.get("capacity")
        ? Number(formData.get("capacity"))
        : null,

      venue_type: valueOrNull(formData.get("venue_type")),
      audience_notes: valueOrNull(formData.get("audience_notes")),

      contact_name: valueOrNull(formData.get("contact_name")),
      contact_role: valueOrNull(formData.get("contact_role")),
      contact_email: valueOrNull(formData.get("contact_email")),
      contact_phone: valueOrNull(formData.get("contact_phone")),

      contact_name_2: valueOrNull(formData.get("contact_name_2")),
      contact_role_2: valueOrNull(formData.get("contact_role_2")),
      contact_email_2: valueOrNull(formData.get("contact_email_2")),
      contact_phone_2: valueOrNull(formData.get("contact_phone_2")),

      booking_email: valueOrNull(formData.get("booking_email")),

      relationship_status: valueOrNull(
        formData.get("relationship_status")
      ),

      internal_notes: valueOrNull(formData.get("internal_notes")),
      special_notes: valueOrNull(formData.get("special_notes")),

      lat: valueOrNull(formData.get("lat")),
      lng: valueOrNull(formData.get("lng")),

      played_before: formData.get("played_before") === "on",

      season_notes: valueOrNull(formData.get("season_notes")),

      program_focus: valueOrNull(formData.get("program_focus"))
        ? String(formData.get("program_focus"))
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],

      instagram_url: valueOrNull(formData.get("instagram_url")),
      facebook_url: valueOrNull(formData.get("facebook_url")),
      logo_url: valueOrNull(formData.get("logo_url")),
    };

    const { error } = await supabaseAdmin
      .from("venues")
      .update(payload)
      .eq("id", id);

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    revalidatePath("/admin/locations");
    revalidatePath(`/admin/locations/${id}`);

    return {
      success: true,
      message: "Location gespeichert.",
    };
  }

  return (
    <LocationClient
      venue={venue}
      shows={shows || []}
      acquisition={acquisition || []}
      acquisitionActivities={acquisitionActivities}
      acquisitionRounds={acquisitionRounds || []}
      addActivity={addActivity}
      createAcquisition={createAcquisition}
      createAcquisitionRound={createAcquisitionRound}
      deleteActivity={deleteActivity}
      deleteAcquisition={deleteAcquisition}
      removeAcquisitionRound={removeAcquisitionRound}
      saveLocation={saveLocation}
    />
  );
}

function valueOrNull(value: FormDataEntryValue | null) {
  if (value === null) return null;

  const stringValue = String(value).trim();

  return stringValue === "" ? null : stringValue;
}
