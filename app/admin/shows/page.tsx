import { revalidatePath } from "next/cache";

import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

import AdminClient from "../AdminClient";

export default async function ShowsPage() {

  const { data: shows, error } = await supabaseAdmin

    .schema("booking")

    .from("shows")

    .select(`

      id,

      token,

      artist,

      program,

      show_date,

      weekday,

      venue_id,

      venue,

      city,

      start_time,

      entry_time,

      contact_name,

      contact_email,

      contact_phone,

      venue_address,

    internal_status,

    billing_status,

    contract_status,

    follow_up_date,

    show_follow_up_date,

    markus_included,

    website_visible,

    ticket_link,

    ticket_status,

    free_entry,

    website_badge,

    checklist,

      last_portal_update,

      last_reviewed_at,

      show_files (id, file_name, file_type),

      show_portal_submissions (

        id,

        submitted_at,

        reviewed_at

      )

    `)

    .order("show_date", { ascending: true, nullsFirst: false });

  if (error) {

    return (

      <main className="min-h-screen bg-[#fbf7ef] p-8">

        <div className="rounded-3xl bg-white p-8 font-bold text-red-600 shadow-xl">

          Fehler: {error.message}

        </div>

      </main>

    );

  }

  const venueIds = Array.from(

    new Set(

      (shows || [])

        .map((show: any) => show.venue_id)

        .filter(Boolean)

    )

  );

  let venueMap = new Map<

    string,

    {

      name: string | null;

      city: string | null;

      street: string | null;

      postal_code: string | null;

    }

  >();

  if (venueIds.length > 0) {

    const { data: venues, error: venuesError } = await supabaseAdmin

      .from("venues")

      .select("id,name,city,street,postal_code")

      .in("id", venueIds);

    if (venuesError) {

      throw new Error(venuesError.message);

    }

    venueMap = new Map(

      (venues || []).map((venue: any) => [

        String(venue.id),

        {

          name: venue.name || null,

          city: venue.city || null,

          street: venue.street || null,

          postal_code: venue.postal_code || null,

        },

      ])

    );

  }

  const showsForList = (shows || []).map((show: any) => {

    const linkedVenue = show.venue_id

      ? venueMap.get(String(show.venue_id))

      : null;

    const linkedVenueAddress = [

      linkedVenue?.street,

      [linkedVenue?.postal_code, linkedVenue?.city].filter(Boolean).join(" "),

    ]

      .filter(Boolean)

      .join(", ");



    return {

      ...show,

      linked_venue_name: linkedVenue?.name || null,

      linked_venue_city: linkedVenue?.city || null,

      linked_venue_street: linkedVenue?.street || null,

      linked_venue_postal_code: linkedVenue?.postal_code || null,

      linked_venue_address: linkedVenueAddress || null,

    };

  });

  return (

    <AdminClient

      shows={showsForList}

      createShowAction={createShowAction}

      deleteShowAction={deleteShowAction}

      duplicateShowAction={duplicateShowAction}

    />

  );

}

async function createShowAction() {

  "use server";

  const token = createToken("", "");

  const { data, error } = await supabaseAdmin

    .schema("booking")

    .from("shows")

    .insert({

      token,

      artist: "Sonja Gründemann",

      program: "Jetzt mal Tacheles",

      internal_status: "neu",

      billing_status: "offen",

      contract_status: "offen",

      markus_included: false,

      checklist: {},

    })

    .select("id")

    .single();

  if (error || !data) {

    throw new Error(

      error?.message || "Show konnte nicht erstellt werden."

    );

  }

  revalidateAll();

  return { id: data.id };

}

async function duplicateShowAction(formData: FormData): Promise<{ id: string }> {

  "use server";

  const id = String(formData.get("show_id") || "");

  const showDate = String(formData.get("show_date") || "");

  const takePartner =

    String(formData.get("take_partner")) === "true";

  const takeProduction =

    String(formData.get("take_production")) === "true";

  const takeContract =

    String(formData.get("take_contract")) === "true";

  const takePromo =

    String(formData.get("take_promo")) === "true";

  const takeTravel =

    String(formData.get("take_travel")) === "true";

  if (!id) {

    throw new Error("Keine Ausgangs-Show angegeben.");

  }

  if (!showDate) {

    throw new Error("Bitte ein neues Showdatum angeben.");

  }

  const { data: original, error: originalError } =

    await supabaseAdmin

      .schema("booking")

      .from("shows")

      .select("*")

      .eq("id", id)

      .single();

  if (originalError || !original) {

    throw new Error(

      originalError?.message ||

        "Original-Show konnte nicht geladen werden."

    );

  }

  /*

   * Wir starten bewusst mit der vorhandenen Show.

   * Anschließend entfernen bzw. neutralisieren wir alles,

   * was nicht in die neue Show gehört.

   */

  const copy: Record<string, any> = { ...original };

  // --------------------------------------------------

  // Systemfelder niemals übernehmen

  // --------------------------------------------------

  delete copy.id;

  delete copy.created_at;

  delete copy.token;

  // --------------------------------------------------

  // Neue Show = neues Datum

  // --------------------------------------------------

  copy.show_date = showDate;

  copy.weekday = weekdayFromDate(showDate);

  copy.token = createToken(

    showDate,

    original.venue || original.city || ""

  );

  // --------------------------------------------------

  // Dinge, die IMMER neu beginnen

  // --------------------------------------------------

  copy.internal_status = "neu";

  copy.billing_status = "offen";

  copy.checklist = {};

  copy.follow_up_date = null;

  copy.show_follow_up_date = null;

  copy.last_portal_update = null;

  copy.last_reviewed_at = null;

  copy.rescheduled_from = null;

  copy.copy_source_show_id = original.id;

  copy.copy_setup_pending = false;

  // Ticketverkauf / Ergebnis

  copy.tickets_sold = null;

  copy.invoice_sent = false;

  copy.invoice_date = null;

  copy.invoice_number = null;

  copy.invoice_amount = null;

  copy.invoice_due_date = null;

  copy.economics_reviewed_at = null;

  copy.review_audience = null;

  copy.review_location = null;

  copy.review_organization = null;

  copy.review_effort = null;

  copy.review_tech = null;

  copy.play_again = null;

  copy.show_learnings = null;

  // Settlement / Abrechnung

  copy.settlement_share_amount = null;

  copy.settlement_total_amount = null;

  copy.settlement_confirmed = false;

  // --------------------------------------------------

  // Spielstätte & Veranstalter

  // --------------------------------------------------

  if (!takePartner) {

    copy.venue_id = null;

    copy.organizer_id = null;

    copy.venue = null;

    copy.city = null;

    copy.venue_address = null;

    copy.contact_name = null;

    copy.contact_email = null;

    copy.contact_phone = null;

    copy.emergency_phone = null;

    copy.venue_access_details = null;

    copy.invoice_recipient_source = null;

    copy.invoice_recipient_company = null;

    copy.invoice_recipient_contact = null;

    copy.invoice_recipient_street = null;

    copy.invoice_recipient_postal_code = null;

    copy.invoice_recipient_city = null;

    copy.invoice_recipient_country = null;

  }

  // --------------------------------------------------

  // Technik & Backstage

  // --------------------------------------------------

  if (!takeProduction) {

    copy.soundcheck_time = null;

    copy.entry_time = null;

    copy.start_time = null;

    copy.arrival_time = null;

    copy.setup_time = null;

    copy.schedule = null;

    copy.schedule_notes = null;

    copy.sound_system = null;

    copy.lights = null;

    copy.piano = null;

    copy.epiano = null;

    copy.piano_notes = null;

    copy.tech_contact = null;

    copy.tech_phone = null;

    copy.technik = null;

    copy.tech_notes = null;

    copy.tech_sound_available = false;

    copy.tech_lights_available = false;

    copy.tech_sound_status = "open";

    copy.tech_lights_status = "open";

    copy.tech_piano_status = "open";

    copy.epiano_status = "open";

    copy.piano_type = null;

    copy.tech_piano_model = null;

    copy.tech_epiano_model = null;

    copy.epiano_available = false;

    copy.backstage_room = null;

    copy.backstage_mirror = null;

    copy.backstage_seating = null;

    copy.backstage_table = null;

    copy.backstage_notes = null;

    copy.backstage_room_available = false;

    copy.backstage_mirror_available = false;

    copy.backstage_seating_available = false;

    copy.backstage_table_available = false;

    copy.backstage_no_room = false;

    copy.backstage_status = "open";

    copy.backstage_mirror_status = "open";

    copy.backstage_seating_status = "open";

    copy.backstage_table_status = "open";

    copy.backstage_equipment = null;

    copy.catering_status = null;

    copy.catering_structured_status = "open";

    copy.catering_details = null;

  }

  // --------------------------------------------------

  // Vertrag / Konditionen

  // --------------------------------------------------

  if (!takeContract) {

    copy.contract_status = "offen";

    copy.contract_note = null;

    copy.contract_notes = null;

    copy.contract_link = null;

    copy.contract_created_at = null;

    copy.fee = null;

    copy.fee_model = null;

    copy.fee_base_amount = null;

    copy.fee_artist_share = null;

    copy.fee_organizer_share = null;

    copy.fee_tax_mode = null;

    copy.fee_notes = null;

    copy.fee_combination_mode = null;

    copy.fee_share_threshold = null;

    copy.settlement_method = null;

  } else {

    /*

     * Vertragsgrundlagen dürfen als Vorlage mitkommen,

     * der neue Vertrag selbst gilt aber NICHT automatisch

     * als erledigt.

     */

    copy.contract_status = "offen";

    copy.contract_created_at = null;

  }

  // --------------------------------------------------

  // Promotion

  // --------------------------------------------------

  // Ticketlink und Verkaufsstand gehören immer zur neuen Show.

  copy.ticket_link = null;

  copy.ticket_status = "available";

  copy.tickets_sold = null;

  copy.promo_send_status = null;

  copy.promo_follow_up_date = null;

  copy.promo_sent_at = null;

  copy.homepage_ticket_linked = false;

  if (!takePromo) {

    copy.flyers_needed = null;

    copy.flyer_amount = null;

    copy.posters_needed = null;

    copy.poster_details = null;

    copy.poster_amount = null;

    copy.poster_amount_text = null;

    copy.poster_format = null;

    copy.poster_format_other = null;

    copy.promotion = null;

    copy.promo_poster_sizes = [];

    copy.promo_print_cost = null;

    copy.promo_shipping_cost = null;

  }

  // --------------------------------------------------

  // Anreise & Unterkunft

  // --------------------------------------------------

  if (!takeTravel) {

    copy.travel_options = null;

    copy.anreise = null;

    copy.travel_details = null;

    copy.travel_type = null;

    copy.travel_notes = null;

    copy.travel_planning_status = "open";

    copy.parking_available = false;

    copy.no_parking_available = false;

    copy.public_transport_recommended = false;

    copy.parking_details = null;

    copy.arrival_notes = null;

    copy.loading_zone_available = false;

    copy.accommodation_type = null;

    copy.unterkunft = null;

    copy.accommodation_notes = null;

    copy.accommodation_name = null;

    copy.accommodation_address = null;

    copy.accommodation_hotel_name = null;

    copy.accommodation_status = "open";

    copy.accommodation_checkin = null;

    copy.accommodation_checkout = null;

    copy.accommodation_booking_ref = null;

    copy.accommodation_booked = false;

    copy.accommodation_actual_cost = null;

    copy.accommodation_buyout = null;

  }

  // --------------------------------------------------

  // Neue Show speichern

  // --------------------------------------------------

  const { data: duplicate, error } = await supabaseAdmin

    .schema("booking")

    .from("shows")

    .insert(copy)

    .select("id")

    .single();

  if (error || !duplicate) {

    throw new Error(

      error?.message || "Show konnte nicht kopiert werden."

    );

  }

  // --------------------------------------------------

  // Reise-Etappen optional mitkopieren

  // --------------------------------------------------

  if (takeTravel) {

    const { data: legs, error: legsError } =

      await supabaseAdmin

        .schema("booking")

        .from("show_travel_legs")

        .select("*")

        .eq("show_id", original.id);

    if (legsError) {

      console.error(

        "Reise-Etappen konnten nicht geladen werden:",

        legsError

      );

    }

    if (legs && legs.length > 0) {

      const newLegs = legs.map((leg: any) => {

        const {

          id: _legId,

          created_at: _legCreatedAt,

          show_id: _oldShowId,

          ...legCopy

        } = leg;

        return {

          ...legCopy,

          show_id: duplicate.id,

        };

      });

      const { error: insertLegsError } =

        await supabaseAdmin

          .schema("booking")

          .from("show_travel_legs")

          .insert(newLegs);

      if (insertLegsError) {

        console.error(

          "Reise-Etappen konnten nicht kopiert werden:",

          insertLegsError

        );

      }

    }

  }

  revalidateAll();

  /*

   * WICHTIG:

   * Kein redirect() hier.

   * AdminClient bekommt die neue ID zurück und öffnet

   * anschließend selbst die neue Show.

   */

  return { id: duplicate.id };

}

async function deleteShowAction(formData: FormData) {

  "use server";

  const id = String(formData.get("show_id") || "");

  if (!id) return;

  const { error } = await supabaseAdmin

    .schema("booking")

    .from("shows")

    .delete()

    .eq("id", id);

  if (error) {

    throw new Error(error.message);

  }

  revalidateAll();

}

function revalidateAll() {

  revalidatePath("/admin");

  revalidatePath("/admin/shows");

  revalidatePath("/admin/markus");

}

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

function weekdayFromDate(date: string) {

  const parsed = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsed.getTime())) {

    return null;

  }

  return parsed

    .toLocaleDateString("de-DE", {

      weekday: "long",

    })

    .toUpperCase();

}
