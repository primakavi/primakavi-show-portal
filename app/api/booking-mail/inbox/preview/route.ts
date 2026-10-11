import { NextResponse } from "next/server";
import { ImapFlow } from "imapflow";
import { requireBookingMailAdmin } from "@/app/lib/requireBookingMailAdmin";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAYS = 7;
const MAX_PREVIEW = 100;
const MAILBOX = "INBOX";

function addresses(items: Array<{ name?: string; address?: string }> | undefined): string[] {
  return (items ?? []).map((item) => item.address?.trim() ?? "").filter(Boolean);
}

export async function GET() {
  try {
    await requireBookingMailAdmin();
  } catch {
    return NextResponse.json({ error: "Nicht berechtigt." }, { status: 403 });
  }

  const email = process.env.STRATO_EMAIL?.trim();
  const password = process.env.STRATO_PASSWORD;
  if (!email || !password) {
    return NextResponse.json({ error: "STRATO_EMAIL oder STRATO_PASSWORD fehlt." }, { status: 500 });
  }

  const since = new Date();
  since.setDate(since.getDate() - DAYS);

  const imap = new ImapFlow({
    host: process.env.STRATO_IMAP_HOST || "imap.strato.de",
    port: Number(process.env.STRATO_IMAP_PORT || 993),
    secure: true,
    auth: { user: email, pass: password },
    logger: false,
  });

  try {
    await imap.connect();
    const lock = await imap.getMailboxLock(MAILBOX);
    let messages: Array<{
      uid: number;
      date: string | null;
      from: string[];
      to: string[];
      subject: string;
      messageId: string | null;
      inReplyTo: string | null;
      possibleAcquisitionIds: string[];
    }> = [];
    let totalMatches = 0;
    let uidValidity: string | null = null;

    try {
      uidValidity = imap.mailbox && typeof imap.mailbox === "object"
        ? String(imap.mailbox.uidValidity ?? "") || null
        : null;

      const uids = await imap.search({ since }, { uid: true });
      if (!uids || !uids.length) {
        return NextResponse.json({
          mailbox: email, folder: MAILBOX, since: since.toISOString(),
          totalMatches: 0, shown: 0, truncated: false, messages: [],
          previewOnly: true,
        }, { headers: { "Cache-Control": "no-store" } });
      }
      totalMatches = uids.length;
      const latestUids = [...uids].sort((a, b) => b - a).slice(0, MAX_PREVIEW);
      const fetched = [];
      for await (const message of imap.fetch(latestUids.join(","),
        { uid: true, envelope: true, internalDate: true }, { uid: true })) {
        const envelope = message.envelope;
        fetched.push({
          uid: message.uid,
date: message.internalDate
  ? new Date(message.internalDate).toISOString()
  : envelope?.date
    ? new Date(envelope.date).toISOString()
    : null,          from: addresses(envelope?.from),
          to: addresses(envelope?.to),
          subject: envelope?.subject ?? "(ohne Betreff)",
          messageId: envelope?.messageId ?? null,
          inReplyTo: envelope?.inReplyTo ?? null,
          possibleAcquisitionIds: [] as string[],
        });
      }
      messages = fetched.sort((a, b) => b.uid - a.uid);
    } finally {
      lock.release();
    }

    // Preview only: match replies against existing outgoing CRM message IDs.
    const replyIds = [...new Set(messages.map((m) => m.inReplyTo).filter((id): id is string => Boolean(id)))];
    if (replyIds.length) {
      const { data, error } = await supabaseAdmin
        .from("crm_emails")
        .select("message_id, acquisition_id")
        .in("message_id", replyIds)
        .not("acquisition_id", "is", null);
      if (error) {
        console.error("Mail preview CRM lookup failed:", error.code, error.message);
        return NextResponse.json({ error: "CRM-Abgleich fehlgeschlagen. Keine Daten verändert." }, { status: 500 });
      }
      const lookup = new Map<string, Set<string>>();
      for (const row of data ?? []) {
        if (!row.message_id || !row.acquisition_id) continue;
        if (!lookup.has(row.message_id)) lookup.set(row.message_id, new Set());
        lookup.get(row.message_id)!.add(row.acquisition_id);
      }
      messages = messages.map((m) => ({
        ...m,
        possibleAcquisitionIds: m.inReplyTo ? [...(lookup.get(m.inReplyTo) ?? [])] : [],
      }));
    }

    return NextResponse.json({
      mailbox: email,
      folder: MAILBOX,
      since: since.toISOString(),
      uidValidity,
      totalMatches,
      shown: messages.length,
      truncated: totalMatches > MAX_PREVIEW,
      previewOnly: true,
      messages,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("STRATO inbox preview failed:", error);
    return NextResponse.json({ error: "Posteingang konnte nicht gelesen werden. Bitte Vercel-Logs prüfen." }, { status: 502 });
  } finally {
    try { await imap.logout(); } catch { /* Connection may already be closed. */ }
  }
}
