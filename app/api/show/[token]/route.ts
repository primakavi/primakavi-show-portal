import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

type RouteContext = {
  params: Promise<{ token: string }>;
};

type PortalBody = Record<string, unknown>;

export async function GET(_request: Request, { params }: RouteContext) {
  const { token } = await params;

  const { data: show, error } = await supabaseAdmin
    .schema("booking")
    .from("shows")
    .select("*")
    .eq("token", token)
    .single();

  if (error || !show) {
    return NextResponse.json(
      { error: error?.message || "Show nicht gefunden." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    show,
    form: createPortalForm(show),
  });
}

export async function POST(request: Request, { params }: RouteContext) {
  const { token } = await params;
  const body = (await request.json()) as PortalBody;

  const { data: show, error: showError } = await supabaseAdmin
    .schema("booking")
    .from("shows")
    .select("id, token")
    .eq("token", token)
    .single();

  if (showError || !show) {
    return NextResponse.json(
      { error: showError?.message || "Show nicht gefunden." },
      { status: 404 }
    );
  }

  const normalizedData = normalizePortalData(body);

  const { error: insertError } = await supabaseAdmin
    .schema("booking")
    .from("show_portal_submissions")
    .insert({
      show_id: show.id,
      data: normalizedData,
    });

  if (insertError) {
    console.error("Submission speichern fehlgeschlagen:", insertError);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

const { data: updatedShow, error: updateError } = await supabaseAdmin
  .schema("booking")
  .from("shows")
  .update({
    ...normalizedData,
    last_portal_update: new Date().toISOString(),
  })
  .eq("id", show.id)
  .select("*")
  .single();
  
  if (updateError) {
    console.error("Portal Update-Marker fehlgeschlagen:", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    show: updatedShow,
    form: normalizePortalData(body),
  });
}

function createPortalForm(show: any) {
  return normalizePortalData({
    artist: show.artist,
    program: show.program,
    show_date: show.show_date,
    weekday: show.weekday,
    venue: show.venue,
    city: show.city,
    venue_address: show.venue_address,

    contact_name: show.contact_name,
    contact_email: show.contact_email,
    contact_phone: show.contact_phone,
    emergency_phone: show.emergency_phone,

    soundcheck_time: show.soundcheck_time,
    entry_time: show.entry_time,
    start_time: show.start_time,
    arrival_time: show.arrival_time,
    schedule: show.schedule,

    sound_system: show.sound_system,
    lights: show.lights,
    piano: show.piano,
    epiano: show.epiano,
    piano_notes: show.piano_notes,
    tech_contact: show.tech_contact,
    technik: show.technik,

    contract_status: show.contract_status,
    fee: show.fee,
    ticket_prices: show.ticket_prices,
    capacity: show.capacity,
    ticket_link: show.ticket_link,
    free_tickets: show.free_tickets,
    invoice_email: show.invoice_email,
    invoice_address: show.invoice_address,
    po_number: show.po_number,
    contract_notes: show.contract_notes,

    flyers_needed: show.flyers_needed,
    flyer_amount: show.flyer_amount,
    posters_needed: show.posters_needed,
    poster_details: show.poster_details,
    promotion: show.promotion,

    catering_status: show.catering_status,
    catering_details: show.catering_details,

    backstage_room: show.backstage_room,
    backstage_mirror: show.backstage_mirror,
    backstage_seating: show.backstage_seating,
    backstage_table: show.backstage_table,
    backstage_notes: show.backstage_notes,

    accommodation_type: show.accommodation_type,
    accommodation_name: show.accommodation_name,
    accommodation_address: show.accommodation_address,
    accommodation_notes: show.accommodation_notes,

    travel_type: show.travel_type,
    parking_available: show.parking_available,
    parking_details: show.parking_details,
    arrival_notes: show.arrival_notes,

    general_notes: show.general_notes,
  });
}

function normalizePortalData(body: PortalBody) {
  const data: Record<string, string | boolean | null> = {};

  Object.entries(body).forEach(([key, value]) => {
    if (typeof value === "boolean") {
      data[key] = value;
      return;
    }

    const clean = str(value);
    data[key] = clean || null;
  });

  return data;
}

function str(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}