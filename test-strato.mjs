import nodemailer from "nodemailer";
import { ImapFlow } from "imapflow";

const email = process.env.STRATO_EMAIL;
const password = process.env.STRATO_PASSWORD;

if (!email || !password) {
  console.error("STRATO-Zugangsdaten fehlen in .env.local");
  process.exit(1);
}

const smtp = nodemailer.createTransport({
  host: process.env.STRATO_SMTP_HOST || "smtp.strato.de",
  port: Number(process.env.STRATO_SMTP_PORT || 465),
  secure: true,
  auth: {
    user: email,
    pass: password,
  },
});

try {
  await smtp.verify();
  console.log("✓ SMTP-Verbindung erfolgreich");
} catch (error) {
  console.error("✗ SMTP-Fehler:", error.message);
} finally {
  smtp.close();
}

const imap = new ImapFlow({
  host: process.env.STRATO_IMAP_HOST || "imap.strato.de",
  port: Number(process.env.STRATO_IMAP_PORT || 993),
  secure: true,
  auth: {
    user: email,
    pass: password,
  },
  logger: false,
});

try {
  await imap.connect();
  console.log("✓ IMAP-Verbindung erfolgreich");

  const folders = await imap.list();
  const sentFolders = folders.filter(
    (folder) => folder.specialUse === "\\Sent"
  );

  if (sentFolders.length) {
    console.log(
      "Gesendet-Ordner:",
      sentFolders.map((folder) => folder.path).join(", ")
    );
  } else {
    console.log("Gesendet-Ordner nicht automatisch erkannt.");
    console.log(
      "Vorhandene Ordner:",
      folders.map((folder) => folder.path).join(", ")
    );
  }
} catch (error) {
  console.error("✗ IMAP-Fehler:", error.message);
} finally {
  if (imap.usable) {
    await imap.logout();
  }
}