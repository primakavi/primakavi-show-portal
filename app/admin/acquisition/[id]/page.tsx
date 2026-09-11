import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import AcquisitionDetailClient from "./AcquisitionDetailClient";

export default async function AcquisitionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;

  // ============================================================
  // AKQUISE LADEN
  // ============================================================

  const {
    data: acquisition,
    error: acquisitionError,
  } = await supabaseAdmin
    .from("acquisition")
    .select(`
      id,
      venue_id,
      organizer_id,
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
    .eq("id", id)
    .single();

  if (acquisitionError || !acquisition) {
    notFound();
  }

  // ============================================================
  // ZIEL LADEN: LOCATION ODER VERANSTALTER
  // ============================================================

  let venue = null;
  let organizer = null;

  if (acquisition.venue_id) {
    const {
      data,
      error,
    } = await supabaseAdmin
      .from("venues")
      .select(`
        id,
        legacy_id,
        name,
        street,
        postal_code,
        city,
        state,
        country,
        website,
        capacity,
        venue_type,
        contact_name,
        contact_email,
        contact_phone,
        contact_name_2,
        contact_email_2,
        contact_phone_2,
        booking_email,
        relationship_status
      `)
      .eq("id", acquisition.venue_id)
      .single();

    if (error || !data) {
      notFound();
    }

    venue = data;
  }

  if (acquisition.organizer_id) {
    const {
      data,
      error,
    } = await supabaseAdmin
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
        relationship_status,
        notes,
        organizer_contacts (
          id,
          name,
          role,
          email,
          phone,
          notes,
          is_primary
        )
      `)
      .eq("id", acquisition.organizer_id)
      .single();

    if (error || !data) {
      notFound();
    }

    organizer = data;
  }

  if (!venue && !organizer) {
    notFound();
  }

  // ============================================================
  // VERKNÜPFTE SPIELORTE DES VERANSTALTERS
  // ============================================================

  let organizerVenues: Array<{
    id: string;
    name: string;
    street: string | null;
    postal_code: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    capacity: number | null;
    contact_name: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    booking_email: string | null;
    is_primary: boolean;
  }> = [];

  if (organizer) {
    const {
      data: links,
      error: linksError,
    } = await supabaseAdmin
      .from("organizer_venues")
      .select(`
        venue_id,
        is_primary
      `)
      .eq("organizer_id", organizer.id);

    if (linksError) {
      throw new Error(linksError.message);
    }

    const venueIds = (links || [])
      .map((link) => link.venue_id)
      .filter(Boolean);

    if (venueIds.length > 0) {
      const {
        data: linkedVenues,
        error: linkedVenuesError,
      } = await supabaseAdmin
        .from("venues")
        .select(`
          id,
          name,
          street,
          postal_code,
          city,
          state,
          country,
          capacity,
          contact_name,
          contact_email,
          contact_phone,
          booking_email
        `)
        .in("id", venueIds);

      if (linkedVenuesError) {
        throw new Error(linkedVenuesError.message);
      }

      organizerVenues = (linkedVenues || []).map(
        (linkedVenue) => {
          const link = (links || []).find(
            (item) =>
              item.venue_id === linkedVenue.id
          );

          return {
            ...linkedVenue,
            is_primary: Boolean(link?.is_primary),
          };
        }
      );

      organizerVenues.sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;

        return a.name.localeCompare(b.name, "de");
      });
    }
  }

  // ============================================================
  // VERKNÜPFTE SHOW
  // ============================================================

  const { data: linkedShow } = await supabaseAdmin
    .schema("booking")
    .from("shows")
    .select("id")
    .eq("acquisition_id", acquisition.id)
    .maybeSingle();

  // ============================================================
  // KONTAKT-HISTORIE
  // ============================================================

  const {
    data: activities,
    error: activitiesError,
  } = await supabaseAdmin
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
    .eq("acquisition_id", acquisition.id)
    .order("activity_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (activitiesError) {
    console.error(
      "Kontakt-Historie konnte nicht geladen werden:",
      activitiesError
    );
  }

  // ============================================================
  // AKQUISE-ZIEL FÜR REVALIDATE / REDIRECT LADEN
  // ============================================================

  async function getAcquisitionTarget(acquisitionId: string) {
    const { data, error } = await supabaseAdmin
      .from("acquisition")
      .select(`
        venue_id,
        organizer_id
      `)
      .eq("id", acquisitionId)
      .single();

    if (error || !data) {
      throw new Error(
        error?.message ||
          "Akquise-Ziel konnte nicht geladen werden."
      );
    }

    return data;
  }

  function revalidateTarget(
    target: {
      venue_id: string | null;
      organizer_id: string | null;
    }
  ) {
    if (target.venue_id) {
      revalidatePath(
        `/admin/locations/${target.venue_id}`
      );
    }

    if (target.organizer_id) {
      revalidatePath(
        `/admin/organizers/${target.organizer_id}`
      );
    }
  }

  // ============================================================
  // KONTAKT HINZUFÜGEN
  // ============================================================

  async function addActivity(formData: FormData) {
    "use server";

    const acquisitionId = String(
      formData.get("acquisition_id") || ""
    );

    if (!acquisitionId) {
      throw new Error("Akquise-ID fehlt.");
    }

    const {
      data: activityAcquisition,
      error: activityAcquisitionError,
    } = await supabaseAdmin
      .from("acquisition")
      .select(`
        archived_at,
        venue_id,
        organizer_id
      `)
      .eq("id", acquisitionId)
      .single();

    if (
      activityAcquisitionError ||
      !activityAcquisition
    ) {
      throw new Error(
        activityAcquisitionError?.message ||
          "Akquise-Vorgang konnte nicht geladen werden."
      );
    }

    if (activityAcquisition.archived_at) {
      throw new Error(
        "Diese Akquise ist abgeschlossen. Neue Einträge sind nicht mehr möglich."
      );
    }

    const activityDate =
      clean(formData.get("activity_date")) ||
      new Date().toISOString().slice(0, 10);

    const channel = clean(
      formData.get("activity_channel")
    );

    const note = clean(
      formData.get("activity_note")
    );

    const response = clean(
      formData.get("activity_response")
    );

    const nextStep = clean(
      formData.get("activity_next_step")
    );

    const followUpAt = clean(
      formData.get("activity_follow_up_at")
    );

    const activityType =
      clean(formData.get("activity_type")) ||
      "Kontakt";

    if (!note && !response && !nextStep) {
      throw new Error(
        "Bitte eine Notiz oder Rückmeldung eintragen."
      );
    }

    const { error: insertError } =
      await supabaseAdmin
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
        });

    if (insertError) {
      throw new Error(insertError.message);
    }

    const { error: updateError } =
      await supabaseAdmin
        .from("acquisition")
        .update({
          last_contact_at: activityDate,
          ...(channel
            ? { contact_channel: channel }
            : {}),
          ...(note
            ? { contact_note: note }
            : {}),
          ...(response
            ? { response }
            : {}),
          ...(nextStep
            ? { next_step: nextStep }
            : {}),
          ...(followUpAt
            ? { next_follow_up_at: followUpAt }
            : {}),
          updated_at: new Date().toISOString(),
        })
        .eq("id", acquisitionId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    revalidatePath(
      `/admin/acquisition/${acquisitionId}`
    );
    revalidatePath("/admin/acquisition");
    revalidatePath("/admin");

    revalidateTarget(activityAcquisition);

    redirect(
      `/admin/acquisition/${acquisitionId}?saved=activity`
    );
  }

  // ============================================================
  // HISTORIEN-EINTRAG BEARBEITEN
  // ============================================================

  async function updateActivity(formData: FormData) {
    "use server";

    const acquisitionId = String(
      formData.get("acquisition_id") || ""
    );

    const activityId = String(
      formData.get("activity_id") || ""
    );

    if (!acquisitionId || !activityId) {
      throw new Error(
        "Akquise-ID oder Historien-Eintrag fehlt."
      );
    }

    const activityDate =
      clean(formData.get("activity_date")) ||
      new Date().toISOString().slice(0, 10);

    const channel = clean(
      formData.get("activity_channel")
    );

    const note = clean(
      formData.get("activity_note")
    );

    const response = clean(
      formData.get("activity_response")
    );

    const nextStep = clean(
      formData.get("activity_next_step")
    );

    const followUpAt = clean(
      formData.get("activity_follow_up_at")
    );

    if (!note && !response && !nextStep) {
      throw new Error(
        "Bitte eine Notiz, Rückmeldung oder einen nächsten Schritt eintragen."
      );
    }

    const { error: updateActivityError } =
      await supabaseAdmin
        .from("acquisition_activities")
        .update({
          activity_date: activityDate,
          channel,
          note,
          response,
          next_step: nextStep,
          follow_up_at: followUpAt,
        })
        .eq("id", activityId)
        .eq("acquisition_id", acquisitionId);

    if (updateActivityError) {
      throw new Error(
        updateActivityError.message
      );
    }

    const {
      data: latestActivity,
      error: latestActivityError,
    } = await supabaseAdmin
      .from("acquisition_activities")
      .select(`
        activity_date,
        channel,
        note,
        response,
        next_step,
        follow_up_at
      `)
      .eq("acquisition_id", acquisitionId)
      .order("activity_date", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (latestActivityError) {
      throw new Error(
        latestActivityError.message
      );
    }

    const { error: acquisitionUpdateError } =
      await supabaseAdmin
        .from("acquisition")
        .update({
          last_contact_at:
            latestActivity?.activity_date || null,
          contact_channel:
            latestActivity?.channel || null,
          contact_note:
            latestActivity?.note || null,
          response:
            latestActivity?.response || null,
          next_step:
            latestActivity?.next_step || null,
          next_follow_up_at:
            latestActivity?.follow_up_at || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", acquisitionId);

    if (acquisitionUpdateError) {
      throw new Error(
        acquisitionUpdateError.message
      );
    }

    const target =
      await getAcquisitionTarget(acquisitionId);

    revalidatePath(
      `/admin/acquisition/${acquisitionId}`
    );
    revalidatePath("/admin/acquisition");
    revalidatePath("/admin");

    revalidateTarget(target);

    redirect(
      `/admin/acquisition/${acquisitionId}?saved=activity`
    );
  }

  // ============================================================
  // HISTORIEN-EINTRAG LÖSCHEN
  // ============================================================

  async function deleteActivity(formData: FormData) {
    "use server";

    const acquisitionId = String(
      formData.get("acquisition_id") || ""
    );

    const activityId = String(
      formData.get("activity_id") || ""
    );

    if (!acquisitionId || !activityId) {
      throw new Error(
        "Akquise-ID oder Historien-Eintrag fehlt."
      );
    }

    const { error: deleteError } =
      await supabaseAdmin
        .from("acquisition_activities")
        .delete()
        .eq("id", activityId)
        .eq("acquisition_id", acquisitionId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    const target =
      await getAcquisitionTarget(acquisitionId);

    revalidatePath(
      `/admin/acquisition/${acquisitionId}`
    );
    revalidatePath("/admin/acquisition");
    revalidatePath("/admin");

    revalidateTarget(target);

    redirect(
      `/admin/acquisition/${acquisitionId}?saved=deleted`
    );
  }

  // ============================================================
  // AKQUISE SPEICHERN
  // ============================================================

  async function saveAcquisition(formData: FormData) {
    "use server";

    const acquisitionId = String(
      formData.get("id") || ""
    );

    if (!acquisitionId) {
      throw new Error("Akquise-ID fehlt.");
    }

    const { error } = await supabaseAdmin
      .from("acquisition")
      .update({
        program: clean(
          formData.get("program")
        ),

        status:
          clean(formData.get("status")) ||
          "Neu",

        priority:
          clean(formData.get("priority")) ||
          "Normal",

        last_contact_at: clean(
          formData.get("last_contact_at")
        ),

        next_follow_up_at: clean(
          formData.get("next_follow_up_at")
        ),

        contact_channel: clean(
          formData.get("contact_channel")
        ),

        contact_note: clean(
          formData.get("contact_note")
        ),

        response: clean(
          formData.get("response")
        ),

        next_step: clean(
          formData.get("next_step")
        ),

        interest: clean(
          formData.get("interest")
        ),

        rejection_reason: clean(
          formData.get("rejection_reason")
        ),

        notes: clean(
          formData.get("notes")
        ),

        action_type: clean(
          formData.get("action_type")
        ),

        context: clean(
          formData.get("context")
        ),

        show_date: clean(
          formData.get("show_date")
        ),

        updated_at:
          new Date().toISOString(),
      })
      .eq("id", acquisitionId);

    if (error) {
      throw new Error(error.message);
    }

    const target =
      await getAcquisitionTarget(acquisitionId);

    revalidatePath(
      `/admin/acquisition/${acquisitionId}`
    );
    revalidatePath("/admin/acquisition");
    revalidatePath("/admin");

    revalidateTarget(target);

    redirect(
      `/admin/acquisition/${acquisitionId}?saved=1`
    );
  }

  // ============================================================
  // AKQUISE KOMPLETT LÖSCHEN
  // ============================================================

  async function deleteAcquisition(formData: FormData) {
    "use server";

    const acquisitionId = String(
      formData.get("id") || ""
    );

    if (!acquisitionId) {
      throw new Error("Akquise-ID fehlt.");
    }

    const {
      data: current,
      error: currentError,
    } = await supabaseAdmin
      .from("acquisition")
      .select(`
        id,
        venue_id,
        organizer_id
      `)
      .eq("id", acquisitionId)
      .single();

    if (currentError || !current) {
      throw new Error(
        currentError?.message ||
          "Akquise konnte nicht geladen werden."
      );
    }

    const { data: show } =
      await supabaseAdmin
        .schema("booking")
        .from("shows")
        .select("id")
        .eq(
          "acquisition_id",
          acquisitionId
        )
        .maybeSingle();

    if (show) {
      throw new Error(
        "Zu dieser Akquise existiert bereits eine Show-Akte. Die Akquise kann deshalb nicht gelöscht werden."
      );
    }

    const { error: activitiesDeleteError } =
      await supabaseAdmin
        .from("acquisition_activities")
        .delete()
        .eq(
          "acquisition_id",
          acquisitionId
        );

    if (activitiesDeleteError) {
      throw new Error(
        activitiesDeleteError.message
      );
    }

    const { error: deleteError } =
      await supabaseAdmin
        .from("acquisition")
        .delete()
        .eq("id", acquisitionId);

    if (deleteError) {
      throw new Error(
        deleteError.message
      );
    }

    revalidatePath("/admin/acquisition");
    revalidatePath("/admin");

    if (current.organizer_id) {
      revalidatePath(
        `/admin/organizers/${current.organizer_id}`
      );

      redirect(
        `/admin/organizers/${current.organizer_id}`
      );
    }

    if (current.venue_id) {
      revalidatePath(
        `/admin/locations/${current.venue_id}`
      );

      redirect(
        `/admin/locations/${current.venue_id}`
      );
    }

    redirect("/admin/acquisition");
  }

  // ============================================================
  // AKQUISE ABSCHLIESSEN
  // ============================================================

  async function archiveAcquisition(formData: FormData) {
    "use server";

    const acquisitionId = String(
      formData.get("id") || ""
    );

    if (!acquisitionId) return;

    const { error } = await supabaseAdmin
      .from("acquisition")
      .update({
        archived_at:
          new Date().toISOString(),
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", acquisitionId);

    if (error) {
      throw new Error(error.message);
    }

    const target =
      await getAcquisitionTarget(acquisitionId);

    revalidatePath(
      `/admin/acquisition/${acquisitionId}`
    );
    revalidatePath("/admin/acquisition");
    revalidatePath("/admin");

    revalidateTarget(target);

    redirect(
      `/admin/acquisition/${acquisitionId}`
    );
  }

  // ============================================================
  // SHOW AUS AKQUISE
  // ============================================================

  async function createShowFromAcquisition(
    formData: FormData
  ) {
    "use server";

    const acquisitionId = String(
      formData.get("acquisition_id") || ""
    );

    const selectedVenueId = String(
      formData.get("venue_id") || ""
    );

    if (!acquisitionId) {
      throw new Error(
        "Akquise-Vorgang fehlt."
      );
    }

    // Schon vorhanden?

    const { data: existingShow } =
      await supabaseAdmin
        .schema("booking")
        .from("shows")
        .select("id")
        .eq(
          "acquisition_id",
          acquisitionId
        )
        .maybeSingle();

    if (existingShow) {
      redirect(
        `/admin/shows/${existingShow.id}`
      );
    }

    const {
      data: acquisitionItem,
      error: acquisitionLoadError,
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

    if (
      acquisitionLoadError ||
      !acquisitionItem
    ) {
      throw new Error(
        acquisitionLoadError?.message ||
          "Akquise konnte nicht geladen werden."
      );
    }

    // ----------------------------------------------------------
    // LOCATION BESTIMMEN
    // ----------------------------------------------------------

    let venueId =
      acquisitionItem.venue_id ||
      selectedVenueId ||
      null;

    if (
      acquisitionItem.organizer_id &&
      !acquisitionItem.venue_id
    ) {
      const {
        data: links,
        error: linksError,
      } = await supabaseAdmin
        .from("organizer_venues")
        .select(`
          venue_id,
          is_primary
        `)
        .eq(
          "organizer_id",
          acquisitionItem.organizer_id
        );

      if (linksError) {
        throw new Error(
          linksError.message
        );
      }

      if (!links || links.length === 0) {
        throw new Error(
          "Für diesen Veranstalter ist noch kein Spielort hinterlegt."
        );
      }

      if (selectedVenueId) {
        const valid = links.some(
          (link) =>
            link.venue_id ===
            selectedVenueId
        );

        if (!valid) {
          throw new Error(
            "Der gewählte Spielort gehört nicht zu diesem Veranstalter."
          );
        }

        venueId = selectedVenueId;
      } else if (links.length === 1) {
        venueId = links[0].venue_id;
      } else {
        const primary = links.find(
          (link) =>
            link.is_primary
        );

        if (primary) {
          venueId = primary.venue_id;
        }
      }
    }

    if (!venueId) {
      throw new Error(
        "Bitte einen konkreten Spielort auswählen."
      );
    }

    // ----------------------------------------------------------
    // LOCATION LADEN
    // ----------------------------------------------------------

    const {
      data: venueItem,
      error: venueLoadError,
    } = await supabaseAdmin
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

    if (
      venueLoadError ||
      !venueItem
    ) {
      throw new Error(
        venueLoadError?.message ||
          "Location konnte nicht geladen werden."
      );
    }

    // ----------------------------------------------------------
    // KONTAKT
    // ----------------------------------------------------------

    let contactName =
      venueItem.contact_name;

    let contactEmail =
      venueItem.contact_email ||
      venueItem.booking_email;

    let contactPhone =
      venueItem.contact_phone;

    if (acquisitionItem.organizer_id) {
      const {
        data: organizerItem,
      } = await supabaseAdmin
        .from("organizers")
        .select(`
          name,
          email,
          phone
        `)
        .eq(
          "id",
          acquisitionItem.organizer_id
        )
        .maybeSingle();

      const {
        data: organizerContact,
      } = await supabaseAdmin
        .from("organizer_contacts")
        .select(`
          name,
          email,
          phone,
          is_primary
        `)
        .eq(
          "organizer_id",
          acquisitionItem.organizer_id
        )
        .order("is_primary", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      contactName =
        organizerContact?.name ||
        organizerItem?.name ||
        contactName;

      contactEmail =
        organizerContact?.email ||
        organizerItem?.email ||
        contactEmail;

      contactPhone =
        organizerContact?.phone ||
        organizerItem?.phone ||
        contactPhone;
    }

    // ----------------------------------------------------------
    // SHOW ANLEGEN
    // ----------------------------------------------------------

    const showDate =
      acquisitionItem.show_date ||
      null;

    const venueAddress = [
      venueItem.street,
      [
        venueItem.postal_code,
        venueItem.city,
      ]
        .filter(Boolean)
        .join(" "),
    ]
      .filter(Boolean)
      .join(", ");

    const token = createToken(
      showDate || "",
      venueItem.name
    );

    const {
      data: show,
      error: showError,
    } = await supabaseAdmin
      .schema("booking")
      .from("shows")
      .insert({
        token,

        acquisition_id:
          acquisitionItem.id,

        venue_id:
          venueItem.id,

        artist:
          "Sonja Gründemann",

        program:
          acquisitionItem.program ||
          "Jetzt mal Tacheles",

        show_date: showDate,

        weekday:
          getWeekday(showDate),

        venue:
          venueItem.name,

        city:
          venueItem.city,

        venue_address:
          venueAddress || null,

        contact_name:
          contactName,

        contact_email:
          contactEmail,

        contact_phone:
          contactPhone,

        capacity:
          venueItem.capacity,

        internal_status:
          "neu",

        billing_status:
          "offen",

        contract_status:
          "offen",

        markus_included:
          false,

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

    const { error: updateError } =
      await supabaseAdmin
        .from("acquisition")
        .update({
          status: "Gebucht 🎉",
          converted_to_show: true,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", acquisitionId);

    if (updateError) {
      throw new Error(
        updateError.message
      );
    }

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

    redirect(
      `/admin/shows/${show.id}`
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <AcquisitionDetailClient
      acquisition={acquisition}
      venue={venue}
      organizer={organizer}
      organizerVenues={organizerVenues}
      linkedShowId={
        linkedShow?.id || null
      }
      wasSaved={saved === "1"}
      activityWasSaved={
        saved === "activity"
      }
      activities={
        activities || []
      }
      addActivity={
        addActivity
      }
      updateActivity={
        updateActivity
      }
      deleteActivity={
        deleteActivity
      }
      deleteAcquisition={
        deleteAcquisition
      }
      saveAcquisition={
        saveAcquisition
      }
      archiveAcquisition={
        archiveAcquisition
      }
      createShowFromAcquisition={
        createShowFromAcquisition
      }
    />
  );
}

// ============================================================
// HELPERS
// ============================================================

function clean(
  value:
    | FormDataEntryValue
    | null
) {
  const stringValue = String(
    value || ""
  ).trim();

  return stringValue || null;
}

function createToken(
  date: string,
  venue: string
) {
  const cleanVenue =
    venue
      .toLowerCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      )
      .slice(0, 18) ||
    "show";

  const cleanDate = date
    ? date.replaceAll(
        "-",
        ""
      )
    : "date";

  const random =
    crypto
      .randomUUID()
      .slice(0, 6);

  return `${cleanDate}-${cleanVenue}-${random}`;
}

function getWeekday(
  date?: string | null
) {
  if (!date) {
    return null;
  }

  const [
    year,
    month,
    day,
  ] = date
    .split("-")
    .map(Number);

  if (
    !year ||
    !month ||
    !day
  ) {
    return null;
  }

  const d =
    new Date(
      year,
      month - 1,
      day
    );

  if (
    Number.isNaN(
      d.getTime()
    )
  ) {
    return null;
  }

  return d
    .toLocaleDateString(
      "de-DE",
      {
        weekday: "long",
      }
    )
    .toUpperCase();
}