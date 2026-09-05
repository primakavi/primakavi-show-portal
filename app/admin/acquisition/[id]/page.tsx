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

  // ------------------------------------------------------------
  // AKQUISE LADEN
  // ------------------------------------------------------------

  const {
    data: acquisition,
    error: acquisitionError,
  } = await supabaseAdmin
    .from("acquisition")
    .select(`
      id,
      venue_id,
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

  // ------------------------------------------------------------
  // LOCATION LADEN
  // ------------------------------------------------------------

  const {
    data: venue,
    error: venueError,
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

  if (venueError || !venue) {
    notFound();
  }

  // ------------------------------------------------------------
  // VERKNÜPFTE SHOW SUCHEN
  // ------------------------------------------------------------

  const { data: linkedShow } = await supabaseAdmin
    .schema("booking")
    .from("shows")
    .select("id")
    .eq("acquisition_id", acquisition.id)
    .maybeSingle();

  // ------------------------------------------------------------
  // AKQUISE SPEICHERN
  // ------------------------------------------------------------

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
        program: clean(formData.get("program")),

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

    revalidatePath(
      `/admin/acquisition/${acquisitionId}`
    );

    revalidatePath(
      "/admin/acquisition"
    );

    redirect(
      `/admin/acquisition/${acquisitionId}?saved=1`
    );
  }

  // ------------------------------------------------------------
  // ARCHIVIEREN
  // ------------------------------------------------------------

  async function archiveAcquisition(
    formData: FormData
  ) {
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

    revalidatePath(
      "/admin/acquisition"
    );

    redirect(
      `/admin/acquisition/${acquisitionId}`
    );
  }

  // ------------------------------------------------------------
  // REAKTIVIEREN
  // ------------------------------------------------------------

  async function restoreAcquisition(
    formData: FormData
  ) {
    "use server";

    const acquisitionId = String(
      formData.get("id") || ""
    );

    if (!acquisitionId) return;

    const { error } = await supabaseAdmin
      .from("acquisition")
      .update({
        archived_at: null,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", acquisitionId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(
      "/admin/acquisition"
    );

    redirect(
      `/admin/acquisition/${acquisitionId}`
    );
  }

  // ------------------------------------------------------------
  // SHOW AUS AKQUISE ERZEUGEN
  // ------------------------------------------------------------

  async function createShowFromAcquisition(
    formData: FormData
  ) {
    "use server";

    const acquisitionId = String(
      formData.get("acquisition_id") || ""
    );

    if (!acquisitionId) {
      throw new Error(
        "Akquise-Vorgang fehlt."
      );
    }

    // Schon eine Show vorhanden?
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
      .eq(
        "id",
        acquisitionItem.venue_id
      )
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

        show_date:
          showDate,

        weekday:
          getWeekday(showDate),

        venue:
          venueItem.name,

        city:
          venueItem.city,

        venue_address:
          venueAddress || null,

        contact_name:
          venueItem.contact_name,

        contact_email:
          venueItem.contact_email ||
          venueItem.booking_email,

        contact_phone:
          venueItem.contact_phone,

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

    if (
      showError ||
      !show
    ) {
      throw new Error(
        showError?.message ||
          "Show konnte nicht erstellt werden."
      );
    }

    const { error: updateError } =
      await supabaseAdmin
        .from("acquisition")
        .update({
          status:
            "Gebucht 🎉",

          converted_to_show:
            true,

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          acquisitionId
        );

    if (updateError) {
      throw new Error(
        updateError.message
      );
    }

    revalidatePath(
      "/admin/acquisition"
    );

    revalidatePath(
      "/admin/shows"
    );

    revalidatePath(
      "/admin"
    );

    redirect(
      `/admin/shows/${show.id}`
    );
  }

  return (
    <AcquisitionDetailClient
      acquisition={acquisition}
      venue={venue}
      linkedShowId={
        linkedShow?.id || null
      }
      wasSaved={saved === "1"}
      saveAcquisition={
        saveAcquisition
      }
      archiveAcquisition={
        archiveAcquisition
      }
      restoreAcquisition={
        restoreAcquisition
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
    ? date.replaceAll("-", "")
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
  if (!date) return null;

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