import { NextRequest, NextResponse } from "next/server";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { requireBookingMailAdmin } from "@/app/lib/requireBookingMailAdmin";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const FOLDER = "INBOX";
const MAX_MESSAGES = 100;

export async function POST(request: NextRequest) {
  try { await requireBookingMailAdmin(); }
  catch { return NextResponse.json({ error: "Nicht berechtigt." }, { status: 403 }); }
  const origin = request.headers.get("origin");
  if (!origin || new URL(origin).origin !== request.nextUrl.origin)
    return NextResponse.json({ error: "Ungültiger Anfrageursprung." }, { status: 403 });

  const email = process.env.STRATO_EMAIL?.trim();
  const password = process.env.STRATO_PASSWORD;
  if (!email || !password) return NextResponse.json({ error: "STRATO-Zugangsdaten fehlen." }, { status: 500 });
  const since = new Date(Date.now() - 7 * 86400000);
  const imap = new ImapFlow({
    host: process.env.STRATO_IMAP_HOST || "imap.strato.de",
    port: Number(process.env.STRATO_IMAP_PORT || 993),
    secure: true, auth: { user: email, pass: password }, logger: false,
  });
  let imported = 0, skipped = 0, failed = 0;
  const errors: string[] = [];
  try {
    await imap.connect();
    const lock = await imap.getMailboxLock(FOLDER);
    try {
      const validity = imap.mailbox && typeof imap.mailbox === "object"
        ? String(imap.mailbox.uidValidity ?? "") : "";
      if (!validity) throw new Error("UIDVALIDITY fehlt; Import abgebrochen.");
      const matches = await imap.search({ since }, { uid: true });
      const uids = [...(matches || [])].sort((a, b) => b - a).slice(0, MAX_MESSAGES);
      for (const uid of uids) {
        try {
          const { data: exists, error: lookupError } = await supabaseAdmin.from("crm_emails")
            .select("id").eq("imap_folder", FOLDER).eq("imap_uidvalidity", validity)
            .eq("imap_uid", uid).maybeSingle();
          if (lookupError) throw lookupError;
          if (exists) { skipped++; continue; }
          // UID addressing; read-only fetch does not set \\Seen.
          const downloaded = await imap.download(String(uid), undefined, { uid: true });

if (!downloaded?.content) {
  throw new Error(`Nachricht mit UID ${uid} konnte nicht geladen werden.`);
}

const parsed = await simpleParser(downloaded.content);
          const messageId = parsed.messageId?.trim() || null;
          if (messageId) {
            const { data: sameMessage, error: idError } = await supabaseAdmin.from("crm_emails")
              .select("id").eq("message_id", messageId).maybeSingle();
            if (idError) throw idError;
            if (sameMessage) { skipped++; continue; }
          }
          const from = parsed.from?.value[0]?.address?.trim() || "(unbekannt)";
          const to = (parsed.to ? (Array.isArray(parsed.to) ? parsed.to : [parsed.to]) : [])
            .flatMap(item => item.value.map(a => a.address).filter((a): a is string => Boolean(a)));
          const cc = (parsed.cc ? (Array.isArray(parsed.cc) ? parsed.cc : [parsed.cc]) : [])
            .flatMap(item => item.value.map(a => a.address).filter((a): a is string => Boolean(a)));
          const receivedAt = parsed.date?.toISOString() || new Date().toISOString();
          const { error: insertError } = await supabaseAdmin.from("crm_emails").insert({
            acquisition_id: null, direction: "incoming", status: "received",
            from_email: from, to_emails: to, cc_emails: cc,
            subject: parsed.subject || "(ohne Betreff)",
            body_text: parsed.text || "", body_html: null,
            message_id: messageId, in_reply_to: parsed.inReplyTo || null,
            email_references: parsed.references || [], received_at: receivedAt,
            imap_folder: FOLDER, imap_uid: uid, imap_uidvalidity: validity,
          });
          if (insertError) {
            if (insertError.code === "23505") { skipped++; continue; }
            throw insertError;
          }
          imported++;
        } catch (error) {
          failed++;
          const msg = error instanceof Error ? error.message : String(error);
          console.error("Inbox import item failed", { uid, error });
          errors.push(`UID ${uid}: ${msg.slice(0, 160)}`);
        }
      }
      return NextResponse.json({ imported, skipped, failed, errors, limit: MAX_MESSAGES, since: since.toISOString() });
    } finally { lock.release(); }
  } catch (error) {
    console.error("Inbox import failed", error);
    return NextResponse.json({ error: "IMAP-Import fehlgeschlagen. Vercel-Logs prüfen." }, { status: 502 });
  } finally { try { await imap.logout(); } catch { /* disconnected */ } }
}
