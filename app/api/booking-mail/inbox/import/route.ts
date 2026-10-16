import { NextRequest, NextResponse } from "next/server";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { requireBookingMailAdmin } from "@/app/lib/requireBookingMailAdmin";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FOLDER = "INBOX";
const MAX_MESSAGES = 500;
const LOOKBACK_DAYS = 7;

// Nur als Fallback, falls mailparser aus einer HTML-Mail keinen Text extrahiert.
// Keine Bilder, Skripte oder Anhänge in den Nachrichtentext übernehmen.
function htmlToPlainText(html: string): string {
  const entities: Record<string, string> = {
    amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
    auml: "ä", ouml: "ö", uuml: "ü", Auml: "Ä", Ouml: "Ö",
    Uuml: "Ü", szlig: "ß", ndash: "–", mdash: "—", hellip: "…",
  };
  const decode = (s: string) => s.replace(/&(#(?:x[0-9a-f]+|[0-9]+)|[a-z]+);/gi, (full, entity: string) => {
    if (entity.startsWith("#")) {
      const hex = entity[1]?.toLowerCase() === "x";
      const number = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
      return Number.isFinite(number) && number > 0 && number <= 0x10ffff &&
        !(number >= 0xd800 && number <= 0xdfff) ? String.fromCodePoint(number) : full;
    }
    return entities[entity] ?? entities[entity.toLowerCase()] ?? full;
  });

  return decode(
    html
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<(script|style|head|svg)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
      .replace(/<\s*br\b[^>]*\/?>/gi, "\n")
      .replace(/<\/\s*(p|div|li|tr|h[1-6]|blockquote)\s*>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getBodyText(parsed: Awaited<ReturnType<typeof simpleParser>>): string {
  const plain = parsed.text?.trim();
  if (plain) return plain;
  return typeof parsed.html === "string" ? htmlToPlainText(parsed.html) : "";
}

export async function POST(request: NextRequest) {
  try { await requireBookingMailAdmin(); }
  catch { return NextResponse.json({ error: "Nicht berechtigt." }, { status: 403 }); }

  const origin = request.headers.get("origin");
  if (!origin || new URL(origin).origin !== request.nextUrl.origin)
    return NextResponse.json({ error: "Ungültiger Anfrageursprung." }, { status: 403 });

  const email = process.env.STRATO_EMAIL?.trim();
  const password = process.env.STRATO_PASSWORD;
  if (!email || !password)
    return NextResponse.json({ error: "STRATO-Zugangsdaten fehlen." }, { status: 500 });

  const since = new Date(Date.now() - LOOKBACK_DAYS * 86400000);
  const imap = new ImapFlow({
    host: process.env.STRATO_IMAP_HOST || "imap.strato.de",
    port: Number(process.env.STRATO_IMAP_PORT || 993),
    secure: true,
    auth: { user: email, pass: password },
    logger: false,
  });

  let imported = 0, repaired = 0, skipped = 0, failed = 0, emptyBodies = 0;
  const errors: string[] = [];

  try {
    await imap.connect();
    const lock = await imap.getMailboxLock(FOLDER);
    try {
      const validity = imap.mailbox && typeof imap.mailbox === "object"
        ? String(imap.mailbox.uidValidity ?? "") : "";
      if (!validity) throw new Error("UIDVALIDITY fehlt; Import abgebrochen.");

      const matches = await imap.search({ since }, { uid: true });
      const allUids = [...(matches || [])].sort((a, b) => b - a);
      const truncated = allUids.length > MAX_MESSAGES;
      const uids = allUids.slice(0, MAX_MESSAGES);

      for (const uid of uids) {
        try {
          const { data: existingByUid, error: lookupError } = await supabaseAdmin
            .from("crm_emails")
            .select("id, body_text")
            .eq("imap_folder", FOLDER)
            .eq("imap_uidvalidity", validity)
            .eq("imap_uid", uid)
            .maybeSingle();
          if (lookupError) throw lookupError;

          // Bereits vollständig importierte Nachrichten nicht erneut herunterladen.
          if (existingByUid?.body_text?.trim()) { skipped++; continue; }

          // UID-Adressierung, ohne die Mail als gelesen zu markieren.
          const downloaded = await imap.download(String(uid), undefined, { uid: true });
          if (!downloaded?.content)
            throw new Error(`Nachricht mit UID ${uid} konnte nicht geladen werden.`);

          const parsed = await simpleParser(downloaded.content);
          const bodyText = getBodyText(parsed);
          const messageId = parsed.messageId?.trim() || null;

          let existing = existingByUid;
          if (!existing && messageId) {
            const { data: sameMessage, error: idError } = await supabaseAdmin
              .from("crm_emails")
              .select("id, body_text")
              .eq("message_id", messageId)
              .maybeSingle();
            if (idError) throw idError;
            existing = sameMessage;
          }

          if (existing) {
            // Reparatur ausschließlich des leeren Mailtexts.
            // Akquise, Venue, Status, Wiedervorlage und sonstige Felder bleiben erhalten.
            if (!existing.body_text?.trim() && bodyText) {
              const { error: updateError } = await supabaseAdmin
                .from("crm_emails")
                .update({ body_text: bodyText })
                .eq("id", existing.id);
              if (updateError) throw updateError;
              repaired++;
            } else {
              if (!bodyText) emptyBodies++;
              skipped++;
            }
            continue;
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
            body_text: bodyText, body_html: null,
            message_id: messageId, in_reply_to: parsed.inReplyTo || null,
            email_references: parsed.references
              ? Array.isArray(parsed.references) ? parsed.references : [parsed.references]
              : [],
            received_at: receivedAt,
            imap_folder: FOLDER, imap_uid: uid, imap_uidvalidity: validity,
          });
          if (insertError) {
            if (insertError.code === "23505") { skipped++; continue; }
            throw insertError;
          }
          if (!bodyText) emptyBodies++;
          imported++;
        } catch (error) {
          failed++;
          const msg = error instanceof Error ? error.message : String(error);
          console.error("Inbox import item failed", { uid, error });
          errors.push(`UID ${uid}: ${msg.slice(0, 160)}`);
        }
      }

      return NextResponse.json({
        imported, repaired, skipped, failed, emptyBodies, errors, truncated,
        limit: MAX_MESSAGES, since: since.toISOString(),
      });
    } finally { lock.release(); }
  } catch (error) {
    console.error("Inbox import failed", error);
    return NextResponse.json(
      { error: "IMAP-Import fehlgeschlagen. Vercel-Logs prüfen." },
      { status: 502 }
    );
  } finally {
    try { await imap.logout(); } catch { /* disconnected */ }
  }
}
