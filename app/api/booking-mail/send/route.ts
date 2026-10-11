import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { requireBookingMailAdmin } from "@/app/lib/requireBookingMailAdmin";
import { sendStratoMail, type BookingAttachment } from "@/app/lib/stratoMail";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { buildPrimakaviMailHtml, PRIMAKAVI_LOGO_CID, PRIMAKAVI_SIGNATURE_TEXT } from "@/app/lib/primakaviMailSignature";
export const runtime = "nodejs";
type RequestBody = { acquisitionId?: unknown; to?: unknown; cc?: unknown; subject?: unknown; text?: unknown; quote?: unknown; inReplyTo?: unknown; references?: unknown; nextStep?: unknown; followUpDate?: unknown; attachmentIds?: unknown };
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const MAX_TOTAL_ATTACHMENTS = 20 * 1024 * 1024;
function emailList(value: unknown): string[] | null {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 20) return null;
  if (!value.every(v => typeof v === "string" && v.length <= 254 && EMAIL_RE.test(v.trim()))) return null;
  return value.map((v: string) => v.trim());
}
export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireBookingMailAdmin();
    const origin = request.headers.get("origin");
    if (!origin || new URL(origin).origin !== request.nextUrl.origin)
      return NextResponse.json({ error: "Ungültiger Anfrageursprung." }, { status: 403 });
    const body = (await request.json()) as RequestBody;
    const acquisitionId = body.acquisitionId, to = emailList(body.to), cc = emailList(body.cc);
    const subject = body.subject, messageText = body.text;
    if (typeof acquisitionId !== "string" || !UUID_RE.test(acquisitionId) || !to?.length || !cc ||
      typeof subject !== "string" || !subject.trim() || subject.length > 500 ||
      typeof messageText !== "string" || !messageText.trim() || messageText.length > 200_000)
      return NextResponse.json({ error: "Bitte Empfänger, Betreff und Nachricht prüfen." }, { status: 400 });
    const ids = body.attachmentIds === undefined ? [] : body.attachmentIds;
    if (!Array.isArray(ids) || ids.length > 5 || !ids.every(x => typeof x === "string" && UUID_RE.test(x)) || new Set(ids).size !== ids.length)
      return NextResponse.json({ error: "Ungültige Anhang-Auswahl (maximal 5 Dateien)." }, { status: 400 });
    const { data: acquisition, error: acquisitionError } = await supabaseAdmin.from("acquisition")
      .select("id").eq("id", acquisitionId).maybeSingle();
    if (acquisitionError || !acquisition)
      return NextResponse.json({ error: "Akquise nicht gefunden." }, { status: 404 });

    // Validate PDF attachments and inline logo before writing a CRM record or sending SMTP.
    const attachments: BookingAttachment[] = [];
    if (ids.length) {
      const { data: rows, error } = await supabaseAdmin.schema("booking").from("artist_files")
        .select("id,storage_path,file_name,file_size,mime_type")
        .eq("artist_key", "sonja").eq("is_active", true).eq("available_for_email", true).in("id", ids);
      if (error || !rows || rows.length !== ids.length)
        return NextResponse.json({ error: "Mindestens ein Anhang ist nicht mehr verfügbar." }, { status: 400 });
      if (rows.reduce((n, row) => n + Number(row.file_size), 0) > MAX_TOTAL_ATTACHMENTS)
        return NextResponse.json({ error: "Anhänge dürfen zusammen maximal 20 MB groß sein." }, { status: 400 });
      for (const row of rows) {
        const { data, error: downloadError } = await supabaseAdmin.storage.from("booking-artist-files").download(row.storage_path);
        if (downloadError || !data) return NextResponse.json({ error: `Anhang ${row.file_name} konnte nicht geladen werden.` }, { status: 400 });
        const content = Buffer.from(await data.arrayBuffer());
        if (content.length !== Number(row.file_size) || content.length > 15 * 1024 * 1024)
          return NextResponse.json({ error: `Dateigröße von ${row.file_name} stimmt nicht überein.` }, { status: 400 });
        attachments.push({ filename: row.file_name, content, contentType: row.mime_type });
      }
    }
    let logoContent: Buffer;
    try {
      logoContent = await readFile(path.join(process.cwd(), "public", "logo_hell.png"));
      if (!logoContent.length) throw new Error("Logo-Datei ist leer.");
    } catch (error) {
      console.error("Booking signature logo missing:", error);
      return NextResponse.json({ error: "Signatur-Logo fehlt: public/logo_hell.png. Nichts versendet." }, { status: 500 });
    }
    attachments.push({ filename: "primakavi-logo.png", content: logoContent, contentType: "image/png", cid: PRIMAKAVI_LOGO_CID });

    const inReplyTo = typeof body.inReplyTo === "string" && body.inReplyTo.length < 1000 ? body.inReplyTo : undefined;
    const references = Array.isArray(body.references) && body.references.length <= 30 &&
      body.references.every(r => typeof r === "string" && r.length < 1000) ? body.references as string[] : [];
    const quote = typeof body.quote === "string" && messageText.endsWith(body.quote) ? body.quote : "";
    const message = quote ? messageText.slice(0, -quote.length).trimEnd() : messageText;
    const fullText = `${message.trimEnd()}\n\n${PRIMAKAVI_SIGNATURE_TEXT}${quote ? `\n\n${quote.trimStart()}` : ""}`;
    const html = buildPrimakaviMailHtml(message.trim(), quote.trim());
    const nextStep = typeof body.nextStep === "string" ? body.nextStep.trim().slice(0, 500) : "";
    const followUpDate = typeof body.followUpDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.followUpDate) && !Number.isNaN(Date.parse(body.followUpDate)) ? body.followUpDate : null;
    const id = randomUUID();
    const { error: insertError } = await supabaseAdmin.from("crm_emails").insert({
      id, acquisition_id: acquisitionId, direction: "outgoing", status: "sending",
      from_email: process.env.STRATO_EMAIL!, to_emails: to, cc_emails: cc,
      subject: subject.trim(), body_text: fullText, created_by: userId,
      in_reply_to: inReplyTo ?? null, email_references: references,
    });
    if (insertError) {
  console.error("CRM mail insert failed:", {
    code: insertError.code,
    message: insertError.message,
    details: insertError.details,
    hint: insertError.hint,
  });

  return NextResponse.json(
    {
      error: "E-Mail konnte nicht im CRM vorbereitet werden. Nichts versendet.",
      diagnosticCode: insertError.code,
    },
    { status: 500 }
  );
}
    let result: Awaited<ReturnType<typeof sendStratoMail>>;
    try {
      result = await sendStratoMail({ to, cc, subject: subject.trim(), text: fullText, html, inReplyTo, references, attachments });
    } catch (error) {
      console.error("Mail send uncertain, manual inspection required:", { id, error });
      return NextResponse.json({ id, error: "Versand nicht bestätigt. Bitte STRATO/Outlook prüfen und nicht sofort erneut senden." }, { status: 502 });
    }
    const warnings: string[] = [];
    try {
      const now = new Date().toISOString();
      const { error: updateError } = await supabaseAdmin.from("crm_emails").update({
        status: "sent", message_id: result.messageId, sent_at: now,
        imap_folder: result.savedToSent ? result.sentFolder : null, updated_at: now,
      }).eq("id", id);
      if (updateError) { console.error("Mail sent but CRM update failed:", { id, updateError }); warnings.push("E-Mail versendet, aber CRM-Speicherung muss geprüft werden. Nicht erneut senden."); }
      const { error: wvlSaveError } = await supabaseAdmin.from("crm_emails")
        .update({ follow_up_at: followUpDate, follow_up_status_override: null }).eq("id", id);
      if (wvlSaveError) warnings.push("Kontakt-WVL konnte nicht an der E-Mail gespeichert werden.");
      if (followUpDate || nextStep) {
        const changes: { next_follow_up_at?: string | null; next_step?: string } = {};
        changes.next_follow_up_at = followUpDate || null;
        if (nextStep) changes.next_step = nextStep;
        const { error: summaryError } = await supabaseAdmin.from("acquisition").update(changes).eq("id", acquisitionId);
        if (summaryError) warnings.push("Akquise-Wiedervorlage bzw. nächster Schritt konnten nicht aktualisiert werden.");
      } else {
        const { error: clearError } = await supabaseAdmin.from("acquisition")
          .update({ next_follow_up_at: null }).eq("id", acquisitionId);
        if (clearError) warnings.push("Alte Wiedervorlage konnte nicht aus der Kurzansicht entfernt werden.");
      }
    } catch (error) { console.error("Post-send CRM processing failed; email was sent:", { id, error }); warnings.push("E-Mail versendet, aber CRM-Nachbearbeitung unvollständig. Nicht erneut senden."); }
    if (!result.savedToSent) warnings.push("E-Mail versendet, aber Kopie im Gesendet-Ordner nicht bestätigt.");
    return NextResponse.json({ id, sent: true, savedToSent: result.savedToSent, warning: warnings.join(" ") || null });
  } catch (error) { console.error("Booking mail authorization/request error:", error); return NextResponse.json({ error: "Nicht berechtigt oder ungültige Anfrage." }, { status: 403 }); }
}
