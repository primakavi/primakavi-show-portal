import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const filePath = path.join(
  process.cwd(),
  "import",
  "Auftrittsübersicht - Formular_RAW.tsv"
);

const raw = fs.readFileSync(filePath, "utf-8");
const rows = raw
  .split(/\r?\n/)
  .map((row) => row.split("\t"))
  .filter((row) => row.some((cell) => clean(cell)));

const [, ...dataRows] = rows;

function clean(v?: string | null) {
  if (!v) return null;

  const val = String(v).trim();

  if (
    val === "" ||
    val.toLowerCase() === "tbd" ||
    val.toLowerCase() === "noch offen" ||
    val.toLowerCase() === "nicht bekannt" ||
    val === "???"
  ) {
    return null;
  }

  return val;
}

function normalizeDate(v?: string | null) {
  const val = clean(v);
  if (!val) return null;

  const match = val.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);

  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;

  return null;
}

function createToken(date?: string | null, venue?: string | null) {
  const cleanVenue =
    (venue || "show")
      .toLowerCase()
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 18) || "show";

  const cleanDate = date ? date.replaceAll("-", "") : "date";
  const random = crypto.randomUUID().slice(0, 6);

  return `${cleanDate}-${cleanVenue}-${random}`;
}

function getWeekday(date?: string | null) {
  if (!date) return null;

  const d = new Date(`${date}T00:00:00`);

  if (Number.isNaN(d.getTime())) return null;

  return d.toLocaleDateString("de-DE", { weekday: "long" }).toUpperCase();
}

function joinLines(lines: Array<string | null>) {
  return lines.filter(Boolean).join("\n") || null;
}

function buildSchedule(row: string[]) {
  return joinLines([
    clean(row[8]) && `Aufbau/Soundcheck: ${clean(row[8])}`,
    clean(row[9]) && `Einlass: ${clean(row[9])}`,
    clean(row[10]) && `Beginn: ${clean(row[10])}`,
    clean(row[11]),
  ]);
}

function buildTechnik(row: string[]) {
  return joinLines([
    clean(row[13]) && `Technik: ${clean(row[13])}`,
    clean(row[14]) && `Klavier/Flügel: ${clean(row[14])}`,
    clean(row[15]) && `E-Piano: ${clean(row[15])}`,
    clean(row[16]) && `Modell: ${clean(row[16])}`,
    clean(row[17]) && `Technik-Kontakt: ${clean(row[17])}`,
  ]);
}

function buildPromotion(row: string[]) {
  return joinLines([
    clean(row[25]) && `Flyer: ${clean(row[25])}`,
    clean(row[26]) && `Flyeranzahl: ${clean(row[26])}`,
    clean(row[27]) && `Plakate: ${clean(row[27])}`,
    clean(row[28]) && `Plakatdetails: ${clean(row[28])}`,
    clean(row[29]) && `Hinweise: ${clean(row[29])}`,
  ]);
}

function buildUnterkunft(row: string[]) {
  return joinLines([
    clean(row[39]) && `Unterkunft: ${clean(row[39])}`,
    clean(row[40]),
  ]);
}

function buildAnreise(row: string[]) {
  return joinLines([clean(row[41]), clean(row[42])]);
}

function buildChecklist(show: Record<string, any>) {
  const formularVollstaendig =
    !!show.show_date &&
    !!show.venue &&
    !!show.city &&
    !!show.start_time &&
    !!show.contact_name &&
    !!show.contact_email &&
    !!show.venue_address &&
    !!show.technik &&
    !!show.fee &&
    !!show.contract_status &&
    !!show.ticket_prices &&
    !!show.capacity &&
    !!show.anreise &&
    !!show.unterkunft;

  const contractStatus = String(show.contract_status || "").toLowerCase();

  const vertragGeklaert =
    contractStatus.includes("vertrag liegt vor") ||
    contractStatus.includes("unterschrieben") ||
    contractStatus.includes("vorhanden");

  return {
    "Formular vollständig": formularVollstaendig,
    "Vertrag geklärt": vertragGeklaert,
    "Technik geprüft": !!show.technik,
    "Ablauf geprüft": !!show.schedule,
    "Promo verschickt": false,
    "Hotel/Anreise geklärt": !!show.unterkunft || !!show.anreise,
    "Backstage / Catering geklärt":
      !!show.catering_details || !!show.backstage_equipment,
    "Ankunft / Zugang geklärt": !!show.schedule,
    "Markus informiert": false,
    "Rechnung vorbereitet": !!show.invoice_email || !!show.invoice_address,
    "Rechnung geschickt": false,
    "Zahlung geprüft": false,
    "GEMA erledigt": false,
    "Show gespielt": false,
    "Feedback notiert": false,
    "Akte abgeschlossen": false,
  };
}

async function run() {
  console.log(`🚀 Starte Import: ${dataRows.length} Zeilen`);

  let imported = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of dataRows) {
    const showDate = normalizeDate(row[1]);
    const venue = clean(row[2]);

    if (!showDate || !venue) {
      skipped++;
      console.log("⏭️ Übersprungen:", clean(row[0]) || "ohne Programm", clean(row[1]), venue);
      continue;
    }

    const city = clean(row[3]) || clean(row[2]);
    const schedule = buildSchedule(row);
    const technik = buildTechnik(row);
    const promotion = buildPromotion(row);
    const unterkunft = buildUnterkunft(row);
    const anreise = buildAnreise(row);

    const show: Record<string, any> = {
      token: createToken(showDate, venue),

      artist: "Sonja Gründemann",
      program: clean(row[0]),
      show_date: showDate,
      weekday: getWeekday(showDate),

      venue,
      venue_address: clean(row[3]),
      city,

      contact_name: clean(row[5]),
      contact_email: clean(row[6]),
      contact_phone: clean(row[7]),

      schedule,
      entry_time: clean(row[9]),
      start_time: clean(row[10]),

      technik,

      contract_status: clean(row[18]),
      contract_link: clean(row[19]),
      fee: clean(row[20]),
      ticket_prices: clean(row[21]),
      capacity: clean(row[22]),
      ticket_link: clean(row[23]),

      free_tickets: clean(row[24]),

      promotion,

      catering_status: clean(row[30]),
      catering_details: clean(row[31]),
      backstage_equipment: clean(row[32]),

      anreise,
      unterkunft,
      accommodation_type: clean(row[39]),
      accommodation_notes: clean(row[40]),
      travel_details: clean(row[42]),

      general_notes: clean(row[43]),

      internal_status: "offen",
      billing_status: "offen",
      markus_included: false,

      portal_data: {
        legacy_import: true,
        legacy_program: clean(row[0]),
        legacy_date: clean(row[1]),
        legacy_akte_id: clean(row[36]),
        legacy_akte_link: clean(row[38]),
        raw: row,
      },
    };

    show.checklist = buildChecklist(show);

    const { data: existing } = await supabase
      .from("shows")
      .select("id")
      .eq("show_date", show.show_date)
      .eq("venue", show.venue)
      .maybeSingle();

    if (existing?.id) {
      skipped++;
      console.log("↩️ Schon vorhanden:", show.show_date, show.venue);
      continue;
    }

    const { error } = await supabase.from("shows").insert(show);

    if (error) {
      failed++;
      console.error("❌ Fehler:", show.show_date, show.venue, error.message);
    } else {
      imported++;
      console.log("✅ Importiert:", show.show_date, show.venue);
    }
  }

  console.log("🎉 Import fertig");
  console.log(`✅ Importiert: ${imported}`);
  console.log(`↩️ Übersprungen: ${skipped}`);
  console.log(`❌ Fehler: ${failed}`);
}

run();