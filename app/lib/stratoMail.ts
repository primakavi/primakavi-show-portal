import "server-only";
import nodemailer from "nodemailer";
import MailComposer from "nodemailer/lib/mail-composer";
import { ImapFlow } from "imapflow";

const SENT_FOLDER = "Sent Items";
export type BookingAttachment = {
  filename: string;
  content: Buffer;
  contentType?: string;
  cid?: string;
};
type SendStratoMailInput = {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text: string;
  html?: string;
  inReplyTo?: string;
  references?: string[];
  attachments?: BookingAttachment[];
};
type SendStratoMailResult = {
  messageId: string;
  sent: true;
  savedToSent: boolean;
  sentFolder: string;
  sentCopyError?: string;
};

/** Send MIME via SMTP, then append the identical MIME to IMAP Sent Items. */
export async function sendStratoMail(input: SendStratoMailInput): Promise<SendStratoMailResult> {
  const from = process.env.STRATO_EMAIL;
  const password = process.env.STRATO_PASSWORD;
  if (!from || !password) throw new Error("STRATO_EMAIL oder STRATO_PASSWORD fehlt.");
  const recipients = [...input.to, ...(input.cc ?? []), ...(input.bcc ?? [])]
    .map(email => email.trim()).filter(Boolean);
  if (!recipients.length) throw new Error("Mindestens ein Empfänger fehlt.");
  if (!input.subject.trim()) throw new Error("Betreff fehlt.");
  if (!input.text.trim() && !input.html?.trim()) throw new Error("Nachrichtentext fehlt.");

  const composer = new MailComposer({
    from: { name: "primakavi | Artist Booking", address: from },
    to: input.to,
    cc: input.cc,
    bcc: input.bcc,
    subject: input.subject,
    text: input.text,
    html: input.html,
    inReplyTo: input.inReplyTo,
    references: input.references?.join(" "),
    attachments: input.attachments?.map(file => ({
      filename: file.filename,
      content: file.content,
      contentType: file.contentType,
      ...(file.cid ? { cid: file.cid, contentDisposition: "inline" as const } : {}),
    })),
    date: new Date(),
  });
  const mime = await composer.compile().build();
  const messageIdMatch = mime.toString("utf8").match(/^Message-ID:\s*(.+)$/im);
  const messageId = messageIdMatch?.[1]?.trim();
  if (!messageId) throw new Error("Keine Message-ID im erstellten MIME-Text.");

  const smtp = nodemailer.createTransport({
    host: process.env.STRATO_SMTP_HOST || "smtp.strato.de",
    port: Number(process.env.STRATO_SMTP_PORT || 465),
    secure: true,
    auth: { user: from, pass: password },
  });
  try {
    await smtp.sendMail({ envelope: { from, to: recipients }, raw: mime });
  } finally {
    smtp.close();
  }

  // SMTP succeeded. Do not retry the whole send if IMAP append fails.
  const imap = new ImapFlow({
    host: process.env.STRATO_IMAP_HOST || "imap.strato.de",
    port: Number(process.env.STRATO_IMAP_PORT || 993),
    secure: true,
    auth: { user: from, pass: password },
    logger: false,
  });
  let savedToSent = false;
  let sentCopyError: string | undefined;
  try {
    await imap.connect();
    const appended = await imap.append(SENT_FOLDER, mime, ["\\Seen"]);
    if (!appended) throw new Error("IMAP APPEND wurde nicht bestätigt.");
    savedToSent = true;
  } catch (error) {
    sentCopyError = error instanceof Error ? error.message : String(error);
  } finally {
    try { await imap.logout(); } catch { /* SMTP has already succeeded. */ }
  }
  return { messageId, sent: true, savedToSent, sentFolder: SENT_FOLDER, sentCopyError };
}
