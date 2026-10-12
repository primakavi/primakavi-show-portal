import { NextRequest, NextResponse } from "next/server";
import { requireBookingMailAdmin } from "@/app/lib/requireBookingMailAdmin";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type Action = "assign" | "done" | "delete";
type Target = "acquisition" | "show" | "venue" | "organizer";
type RequestBody = { emailId?: unknown; action?: unknown; targetType?: unknown; targetId?: unknown };

export async function POST(request: NextRequest) {
  try { await requireBookingMailAdmin(); }
  catch { return NextResponse.json({ error: "Nicht berechtigt." }, { status: 403 }); }

  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin)
    return NextResponse.json({ error: "Ungültiger Anfrageursprung." }, { status: 403 });

  let body: RequestBody;
  try { body = await request.json() as RequestBody; }
  catch { return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 }); }

  const { emailId, action, targetType, targetId } = body;
  if (typeof emailId !== "string" || !UUID_RE.test(emailId) || !["assign", "done", "delete"].includes(String(action)))
    return NextResponse.json({ error: "Ungültige Nachricht oder Aktion." }, { status: 400 });

  const { data: mail, error: mailError } = await supabaseAdmin.from("crm_emails")
    .select("id,direction,inbox_state").eq("id", emailId).maybeSingle();
  if (mailError) return NextResponse.json({ error: "Nachricht konnte nicht geprüft werden." }, { status: 500 });
  if (!mail) return NextResponse.json({ error: "Nachricht nicht gefunden." }, { status: 404 });
  if (mail.direction !== "incoming" || mail.inbox_state === "deleted")
    return NextResponse.json({ error: "Diese Nachricht kann nicht bearbeitet werden." }, { status: 409 });

  const now = new Date().toISOString();
  let changes: Record<string, unknown> = { updated_at: now };

  if (action === "assign") {
    if (typeof targetId !== "string" || !UUID_RE.test(targetId) ||
        !["acquisition", "show", "venue", "organizer"].includes(String(targetType)))
      return NextResponse.json({ error: "Bitte ein gültiges Zuordnungsziel wählen." }, { status: 400 });

    const target = targetType as Target;
    if (target === "acquisition") {
      const { data, error } = await supabaseAdmin.from("acquisition")
        .select("id,venue_id,organizer_id").eq("id", targetId).maybeSingle();
      if (error || !data) return NextResponse.json({ error: "Akquise nicht gefunden." }, { status: 404 });
      changes = { ...changes, acquisition_id: data.id, show_id: null,
        venue_id: data.venue_id ?? null, organizer_id: data.organizer_id ?? null, inbox_state: "done" };
    } else if (target === "show") {
      const { data, error } = await supabaseAdmin.schema("booking").from("shows")
        .select("id,venue_id").eq("id", targetId).maybeSingle();
      if (error || !data) return NextResponse.json({ error: "Show nicht gefunden." }, { status: 404 });
      let organizerId: string | null = null;
      if (data.venue_id) {
        const venue = await supabaseAdmin.from("venues").select("organizer_id").eq("id", data.venue_id).maybeSingle();
        if (venue.error) return NextResponse.json({ error: "Location konnte nicht geprüft werden." }, { status: 500 });
        organizerId = venue.data?.organizer_id ?? null;
      }
      changes = { ...changes, acquisition_id: null, show_id: data.id,
        venue_id: data.venue_id ?? null, organizer_id: organizerId, inbox_state: "done" };
    } else if (target === "venue") {
      const { data, error } = await supabaseAdmin.from("venues")
        .select("id,organizer_id").eq("id", targetId).maybeSingle();
      if (error || !data) return NextResponse.json({ error: "Location nicht gefunden." }, { status: 404 });
      changes = { ...changes, acquisition_id: null, show_id: null, venue_id: data.id,
        organizer_id: data.organizer_id ?? null, inbox_state: "done" };
    } else {
      const { data, error } = await supabaseAdmin.from("organizers")
        .select("id").eq("id", targetId).maybeSingle();
      if (error || !data) return NextResponse.json({ error: "Veranstalter nicht gefunden." }, { status: 404 });
      changes = { ...changes, acquisition_id: null, show_id: null,
        venue_id: null, organizer_id: data.id, inbox_state: "done" };
    }
  } else if (action === "done") {
    changes.inbox_state = "done";
  } else {
    // Keep IMAP identifiers and Message-ID to prevent a future reimport.
    // Do not delete or modify anything on the STRATO server.
    changes = { ...changes, inbox_state: "deleted", acquisition_id: null,
      show_id: null, venue_id: null, organizer_id: null,
      subject: null, body_text: null, body_html: null,
      from_email: "(gelöscht)", to_emails: [], cc_emails: [] };
  }

  const { error } = await supabaseAdmin.from("crm_emails").update(changes)
    .eq("id", emailId).eq("direction", "incoming").neq("inbox_state", "deleted");
  if (error) {
    console.error("Mail center action failed", { action, code: error.code, message: error.message });
    return NextResponse.json({ error: "Änderung konnte nicht gespeichert werden." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, action });
}
