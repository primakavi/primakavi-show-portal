import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

type RouteContext = {
  params: Promise<{ token: string }>;
};

type PortalBody = Record<string, unknown>;

const TEXT_FIELDS = [
  "artist",
  "program",
  "show_date",
  "weekday",
  "venue",
  "city",
  "venue_address",

  "contact_name",
  "contact_email",
  "contact_phone",
  "emergency_phone",

  "soundcheck_time",
  "entry_time",
  "start_time",
  "arrival_time",
  "schedule_notes",

  "piano_type",
  "epiano_available",
  "piano_notes",
  "tech_contact",
  "tech_notes",

  "contract_status",
  "fee",
  "ticket_prices",
  "capacity",
  "ticket_link",
  "free_tickets",
  "invoice_email",
  "invoice_address",
  "po_number",
  "contract_notes",

  "flyers_needed",
  "flyer_amount",
  "posters_needed",
  "poster_details",
  "promotion",

  "catering_status",
  "catering_details",

  "backstage_notes",

  "accommodation_type",
  "accommodation_hotel_name",
  "accommodation_address",
  "accommodation_buyout",
  "accommodation_notes",

  "parking_details",
  "travel_notes",

  "general_notes",
] as const;

const BOOLEAN_FIELDS = [
  "tech_sound_available",
  "tech_lights_available",

  "backstage_room_available",
  "backstage_mirror_available",
  "backstage_seating_available",
  "backstage_table_available",
  "backstage_no_room",

  "parking_available",
  "loading_zone_available",
  "no_parking_available",
  "public_transport_recommended",
] as const;

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
    .select("id")
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
    console.error("Show speichern fehlgeschlagen:", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    show: updatedShow,
    form: createPortalForm(updatedShow),
  });
}

function createPortalForm(show: Record<string, unknown>) {
  const data: Record<string, string | boolean> = {};

  TEXT_FIELDS.forEach((field) => {
    data[field] = str(show[field]);
  });

  BOOLEAN_FIELDS.forEach((field) => {
    data[field] = bool(show[field]);
  });

  return data;
}

function normalizePortalData(body: PortalBody) {
  const data: Record<string, string | boolean | null> = {};

  TEXT_FIELDS.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      const clean = str(body[field]);
      data[field] = clean || null;
    }
  });

  BOOLEAN_FIELDS.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      data[field] = bool(body[field]);
    }
  });

  return data;
}

function str(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function bool(value: unknown) {
  return value === true || value === "true" || value === "1";
}