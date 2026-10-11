import { NextRequest, NextResponse } from "next/server";
import { requireBookingMailAdmin } from "@/app/lib/requireBookingMailAdmin";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const runtime = "nodejs";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function POST(request: NextRequest) {
  try { await requireBookingMailAdmin(); }
  catch { return NextResponse.json({ error: "Nicht berechtigt." }, { status: 403 }); }
  const origin = request.headers.get("origin");
  if (!origin || new URL(origin).origin !== request.nextUrl.origin)
    return NextResponse.json({ error: "Ungültiger Anfrageursprung." }, { status: 403 });
  let body: { emailId?: unknown; acquisitionId?: unknown };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 }); }
  if (typeof body.emailId !== "string" || !UUID.test(body.emailId) ||
      typeof body.acquisitionId !== "string" || !UUID.test(body.acquisitionId))
    return NextResponse.json({ error: "Ungültige IDs." }, { status: 400 });
  const { data: acquisition, error: lookupError } = await supabaseAdmin.from("acquisition")
    .select("id").eq("id", body.acquisitionId).maybeSingle();
  if (lookupError || !acquisition) return NextResponse.json({ error: "Akquise nicht gefunden." }, { status: 404 });
  const { data, error } = await supabaseAdmin.from("crm_emails")
    .update({ acquisition_id: body.acquisitionId })
    .eq("id", body.emailId).eq("direction", "incoming")
    .is("acquisition_id", null).select("id").maybeSingle();
  if (error) return NextResponse.json({ error: "Zuordnung fehlgeschlagen." }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Nachricht ist bereits zugeordnet oder nicht vorhanden." }, { status: 409 });
  return NextResponse.json({ assigned: true });
}
