import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import AcquisitionClient from "./AcquisitionClient";

export default async function AcquisitionPage() {
  // ------------------------------------------------------------
  // AKQUISE LADEN
  // ------------------------------------------------------------

  const { data: acquisitionRaw, error } =
    await supabaseAdmin
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

  // ------------------------------------------------------------
  // ZUGEHÖRIGE LOCATIONS LADEN
  // ------------------------------------------------------------

  const venueIds = Array.from(
    new Set(
      (acquisitionRaw || [])
        .map((item) => item.venue_id)
        .filter(Boolean)
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

  // ------------------------------------------------------------
  // LOCATIONS AN AKQUISE HÄNGEN
  //
  // AcquisitionClient erwartet aktuell:
  // venue: Venue[]
  // ------------------------------------------------------------

  const venueMap = new Map(
    (venues || []).map((venue) => [
      venue.id,
      venue,
    ])
  );

  const acquisition = (
    acquisitionRaw || []
  ).map((item) => {
    const venue =
      venueMap.get(item.venue_id) || null;

    return {
      ...item,
      venue: venue ? [venue] : [],
    };
  });

  // ------------------------------------------------------------
  // ARCHIVIEREN
  // ------------------------------------------------------------

  async function archiveAcquisition(
    formData: FormData
  ) {
    "use server";

    const id = String(
      formData.get("id") || ""
    );

    if (!id) return;

    const { error } =
      await supabaseAdmin
        .from("acquisition")
        .update({
          archived_at:
            new Date().toISOString(),
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", id);

    if (error) {
      throw new Error(
        error.message
      );
    }

    revalidatePath(
      "/admin/acquisition"
    );
  }

  // ------------------------------------------------------------
  // REAKTIVIEREN
  // ------------------------------------------------------------

  async function restoreAcquisition(
    formData: FormData
  ) {
    "use server";

    const id = String(
      formData.get("id") || ""
    );

    if (!id) return;

    const { error } =
      await supabaseAdmin
        .from("acquisition")
        .update({
          archived_at: null,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", id);

    if (error) {
      throw new Error(
        error.message
      );
    }

    revalidatePath(
      "/admin/acquisition"
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
      formData.get(
        "acquisition_id"
      ) || ""
    );

    if (!acquisitionId) {
      throw new Error(
        "Akquise-Vorgang fehlt."
      );
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
        program,
        show_date
      `)
      .eq("id", acquisitionId)
      .single();

    if (
      acquisitionError ||
      !acquisitionItem
    ) {
      throw new Error(
        acquisitionError?.message ||
          "Akquise konnte nicht geladen werden."
      );
    }

    // ----------------------------------------------------------
    // LOCATION LADEN
    // ----------------------------------------------------------

    const {
      data: venue,
      error: venueError,
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
      venueError ||
      !venue
    ) {
      throw new Error(
        venueError?.message ||
          "Location konnte nicht geladen werden."
      );
    }

    // ----------------------------------------------------------
    // SHOWDATEN
    // ----------------------------------------------------------

    const showDate =
      acquisitionItem.show_date ||
      null;

    const token =
      createToken(
        showDate || "",
        venue.name || ""
      );

    const venueAddress = [
      venue.street,
      [
        venue.postal_code,
        venue.city,
      ]
        .filter(Boolean)
        .join(" "),
    ]
      .filter(Boolean)
      .join(", ");

    // ----------------------------------------------------------
    // SHOW ANLEGEN
    // ----------------------------------------------------------

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
          venue.id,

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
          venue.name,

        city:
          venue.city,

        venue_address:
          venueAddress || null,

        contact_name:
          venue.contact_name,

        contact_email:
          venue.contact_email ||
          venue.booking_email,

        contact_phone:
          venue.contact_phone,

        capacity:
          venue.capacity,

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

    // ----------------------------------------------------------
    // AKQUISE AUF GEBUCHT
    // ----------------------------------------------------------

    const {
      error: updateError,
    } = await supabaseAdmin
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

    // ----------------------------------------------------------
    // REFRESH + SHOW ÖFFNEN
    // ----------------------------------------------------------

    revalidatePath(
      "/admin/acquisition"
    );

    revalidatePath(
      "/admin/shows"
    );

    revalidatePath(
      "/admin"
    );

    revalidatePath(
      "/admin/markus"
    );

    redirect(
      `/admin/shows/${show.id}`
    );
  }

  return (
    <AcquisitionClient
      acquisition={
        acquisition
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
// TOKEN
// ============================================================

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


// ============================================================
// WOCHENTAG
// ============================================================

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