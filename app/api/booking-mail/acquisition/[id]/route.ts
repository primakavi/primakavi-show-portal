import { NextResponse } from "next/server";
import { requireBookingMailAdmin } from "@/app/lib/requireBookingMailAdmin";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireBookingMailAdmin();
  } catch {
    return NextResponse.json({ error: "Nicht berechtigt." }, { status: 403 });
  }
  const { id } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(id)) {
    return NextResponse.json({ error: "Ungültige Akquise-ID." }, { status: 400 });
  }
  const { data, error } = await supabaseAdmin
    .from("crm_emails")
    .select("id, direction, status, from_email, to_emails, cc_emails, subject, body_text, sent_at, received_at, created_at, message_id, in_reply_to, email_references, follow_up_at, follow_up_status_override")
    .eq("acquisition_id", id)
    .eq("direction", "outgoing")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) {
    console.error("CRM email history fetch failed", error);
    return NextResponse.json({ error: "E-Mails konnten nicht geladen werden." }, { status: 500 });
  }
  return NextResponse.json({ emails: data ?? [] }, { headers: { "Cache-Control": "no-store" } });
}
