import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

type RouteContext = { params: Promise<{ token: string }> };
type PortalBody = Record<string, unknown>;

const PORTAL_FIELDS = [
  "contact_name", "contact_email", "contact_phone", "emergency_phone",
  "arrival_time", "soundcheck_time", "entry_time", "start_time", "schedule_notes",
  "tech_sound_status", "tech_lights_status", "tech_piano_status", "tech_piano_model",
  "epiano_status", "tech_epiano_model", "tech_contact", "tech_phone", "tech_notes",
  "contract_status", "capacity", "ticket_link", "free_tickets",
  "invoice_email", "invoice_address", "po_number", "contract_notes", "promotion",
  "backstage_status", "backstage_mirror_status", "backstage_seating_status", "backstage_table_status",
  "catering_structured_status", "catering_details", "backstage_notes",
  "accommodation_status", "accommodation_hotel_name", "accommodation_address",
  "accommodation_checkin", "accommodation_checkout", "accommodation_booking_ref", "accommodation_notes",
  "parking_available", "loading_zone_available", "no_parking_available", "public_transport_recommended",
  "parking_details", "travel_notes", "general_notes",
] as const;

const SECTION_FIELDS: Record<string, string[]> = {
  contact: ["contact_name", "contact_email", "contact_phone", "emergency_phone"],
  schedule: ["arrival_time", "soundcheck_time", "entry_time", "start_time", "schedule_notes"],
  tech: ["tech_sound_status", "tech_lights_status", "tech_piano_status", "tech_piano_model", "epiano_status", "tech_epiano_model", "tech_contact", "tech_phone", "tech_notes"],
  contract: ["contract_status", "invoice_email", "invoice_address", "po_number", "contract_notes"],
  tickets_promo: ["capacity", "ticket_link", "free_tickets", "promotion"],
  backstage: ["backstage_status", "backstage_mirror_status", "backstage_seating_status", "backstage_table_status", "catering_structured_status", "catering_details", "backstage_notes"],
  accommodation_travel: ["accommodation_status", "accommodation_hotel_name", "accommodation_address", "accommodation_checkin", "accommodation_checkout", "accommodation_booking_ref", "accommodation_notes", "parking_available", "loading_zone_available", "no_parking_available", "public_transport_recommended", "parking_details", "travel_notes"],
  notes: ["general_notes"],
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { token } = await params;
  const { data: show, error } = await supabaseAdmin.schema("booking").from("shows").select("*").eq("token", token).single();
  if (error || !show) return NextResponse.json({ error: error?.message || "Show nicht gefunden." }, { status: 404 });
  return NextResponse.json({ show, form: createPortalForm(show) });
}

// Autosave: Entwurf in der Show-Akte aktualisieren, aber KEINE neue Portal-Übermittlung erzeugen.
export async function PATCH(request: Request, { params }: RouteContext) {
  return savePortal(request, params, false);
}

// Explizites Übermitteln: Show aktualisieren + genau eine prüfbare Submission erzeugen.
export async function POST(request: Request, { params }: RouteContext) {
  return savePortal(request, params, true);
}

async function savePortal(request: Request, paramsPromise: Promise<{ token: string }>, submit: boolean) {
  const { token } = await paramsPromise;
  const body = (await request.json()) as PortalBody;
  const { data: show, error: showError } = await supabaseAdmin.schema("booking").from("shows").select("*").eq("token", token).single();
  if (showError || !show) return NextResponse.json({ error: showError?.message || "Show nicht gefunden." }, { status: 404 });

  const normalizedData = normalizePortalData(body);

  // Autosave darf die Vergleichsbasis für die spätere Übermittlung nicht zerstören.
  // Deshalb vergleichen wir beim expliziten Übermitteln mit dem letzten übermittelten Snapshot,
  // nicht mit booking.shows (das durch Autosave bereits aktuell sein kann).
  let comparisonBase: Record<string, unknown> = {};
  if (submit) {
    const { data: previousSubmission } = await supabaseAdmin
      .schema("booking")
      .from("show_portal_submissions")
      .select("data")
      .eq("show_id", show.id)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const previousData = previousSubmission?.data as any;
    comparisonBase = previousData?.fields || previousData || {};
  } else {
    comparisonBase = show;
  }

  const changedFields = PORTAL_FIELDS.filter(
    (field) => !sameValue(comparisonBase[field], normalizedData[field])
  );
  const changedSections = Object.entries(SECTION_FIELDS)
    .filter(([, fields]) => fields.some((field) => changedFields.includes(field as any)))
    .map(([section]) => section);

  const updatePayload: Record<string, unknown> = { ...normalizedData };
  if (submit) updatePayload.last_portal_update = new Date().toISOString();

  const { data: updatedShow, error: updateError } = await supabaseAdmin.schema("booking").from("shows").update(updatePayload).eq("id", show.id).select("*").single();
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  if (submit) {
    const { error: insertError } = await supabaseAdmin.schema("booking").from("show_portal_submissions").insert({
      show_id: show.id,
      data: {
        fields: normalizedData,
        changed_fields: changedFields,
        changed_sections: changedSections,
        submitted_from: "organizer_portal",
      },
    });
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, submitted: submit, changedFields, changedSections, show: updatedShow, form: createPortalForm(updatedShow) });
}

function createPortalForm(show: any) {
  const form: Record<string, string | boolean | null> = {};
  for (const field of PORTAL_FIELDS) form[field] = show[field] ?? null;
  return form;
}

function normalizePortalData(body: PortalBody) {
  const data: Record<string, string | boolean | null> = {};
  for (const field of PORTAL_FIELDS) {
    const value = body[field];
    if (typeof value === "boolean") data[field] = value;
    else data[field] = str(value) || null;
  }
  return data;
}

function sameValue(a: unknown, b: unknown) {
  const normalize = (v: unknown) => v === undefined || v === null || v === "" ? null : typeof v === "boolean" ? v : String(v).trim();
  return normalize(a) === normalize(b);
}
function str(value: unknown) { return value === null || value === undefined ? "" : String(value).trim(); }
