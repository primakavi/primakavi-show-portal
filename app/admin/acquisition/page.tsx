import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import AcquisitionClient from "./AcquisitionClient";

export default async function AcquisitionPage() {
  // ============================================================
  // AKQUISE
  // ============================================================

  const { data: acquisitionRaw, error } = await supabaseAdmin
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