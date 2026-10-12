import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireBookingMailAdmin } from "@/app/lib/requireBookingMailAdmin";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { sendStratoMail } from "@/app/lib/stratoMail";

export const runtime = "nodejs";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SONJA = "kontakt@sonja-gruendemann.de";

export async function POST(request: NextRequest) {
  let userId: string;
  try { ({ userId } = await requireBookingMailAdmin()); }
  catch { return NextResponse.json({ error: "Nicht berechtigt." }, { status: 403 }); }
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json({ error: "Ungültiger Anfrageursprung." }, { status: 403 });

  let body: { emailId?: unknown; message?: unknown };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 }); }
  if (typeof body.emailId !== "string" || !UUID_RE.test(body.emailId) ||
      typeof body.message !== "string" || !body.message.trim() || body.message.length > 5000)
    return NextResponse.json({ error: "Bitte Nachricht prüfen." }, { status: 400 });

  const { data: source, error: sourceError } = await supabaseAdmin.from("crm_emails")
    .select("id,direction,inbox_state,acquisition_id,show_id,venue_id,organizer_id,from_email,to_emails,subject,body_text,received_at,created_at")
    .eq("id", body.emailId).maybeSingle();
  if (sourceError) return NextResponse.json({ error: "Originalmail konnte nicht geladen werden." }, { status: 500 });
  if (!source || source.direction !== "incoming" || source.inbox_state === "deleted")
    return NextResponse.json({ error: "Diese Mail kann nicht weitergeleitet werden." }, { status: 409 });

  const subject = `WG: ${String(source.subject || "(ohne Betreff)").replace(/^(WG|FW|FWD):\s*/i, "").slice(0, 470)}`;
  const received = new Date(source.received_at || source.created_at).toLocaleString("de-DE", {
    timeZone: "Europe/Berlin", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
  const original = String(source.body_text || "(Kein Textinhalt vorhanden)");
  const text = `${body.message.trim()}\n\n---------- Weitergeleitete Nachricht ----------\nVon: ${source.from_email}\nDatum: ${received}\nAn: ${(source.to_emails || []).join(", ")}\nBetreff: ${source.subject || "(ohne Betreff)"}\n\n${original}`;
  const id = randomUUID();
  const from = process.env.STRATO_EMAIL;
  if (!from) return NextResponse.json({ error: "STRATO_EMAIL fehlt." }, { status: 500 });

  // CRM-Eintrag vor dem SMTP-Versand anlegen, damit ein unklarer Versand nicht versehentlich wiederholt wird.
  const { error: insertError } = await supabaseAdmin.from("crm_emails").insert({
    id, direction: "outgoing", status: "sending", from_email: from,
    to_emails: [SONJA], cc_emails: [], subject, body_text: text, created_by: userId,
    acquisition_id: source.acquisition_id, show_id: source.show_id,
    venue_id: source.venue_id, organizer_id: source.organizer_id,
  });
  if (insertError) {
    console.error("Forward CRM insert failed", insertError);
    return NextResponse.json({ error: "Weiterleitung konnte nicht im CRM vorbereitet werden. Nichts versendet." }, { status: 500 });
  }

  let result: Awaited<ReturnType<typeof sendStratoMail>>;
  try { result = await sendStratoMail({ to: [SONJA], subject, text }); }
  catch (error) {
    console.error("Forward SMTP outcome uncertain", { id, error });
    return NextResponse.json({ error: "Versand nicht bestätigt. Bitte STRATO prüfen und nicht sofort erneut senden." }, { status: 502 });
  }
  const now = new Date().toISOString();
  const { error: updateError } = await supabaseAdmin.from("crm_emails").update({
    status: "sent", message_id: result.messageId, sent_at: now,
    imap_folder: result.savedToSent ? result.sentFolder : null, updated_at: now,
  }).eq("id", id);
  const warning = updateError
    ? "An Sonja versendet, aber CRM-Status konnte nicht aktualisiert werden. Bitte prüfen; nicht erneut senden."
    : !result.savedToSent ? "An Sonja versendet; Kopie im Gesendet-Ordner nicht bestätigt." : null;
  if (updateError) console.error("Forward CRM status update failed", { id, updateError });
  return NextResponse.json({ sent: true, id, warning });
}
