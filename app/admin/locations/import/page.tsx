import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import ImportClient from "./ImportClient";

type ImportRow = {
  name?: string;
  street?: string;
  postal_code?: string;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
  capacity?: string | number;
  venue_type?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_name_2?: string;
  contact_email_2?: string;
  contact_phone_2?: string;
  booking_email?: string;
  relationship_status?: string;
  internal_notes?: string;
  special_notes?: string;
  season_notes?: string;
  program_focus?: string | string[];
  instagram_url?: string;
  facebook_url?: string;
  logo_url?: string;
};

type PreviewRow = ImportRow & {
  rowIndex: number;
  importStatus: "new" | "existing" | "possible_duplicate" | "invalid";
  matchText?: string;
};

export default function LocationImportPage() {
  async function previewImport(rows: ImportRow[]): Promise<PreviewRow[]> {
    "use server";

    const { data: venues, error } = await supabaseAdmin
      .from("venues")
      .select("id, name, city");

    if (error) throw new Error(error.message);

    return rows.map((row, index) => classifyRow(row, index, venues || []));
  }

  async function importVenues(rows: ImportRow[]) {
    "use server";

    const { data: venues, error: loadError } = await supabaseAdmin
      .from("venues")
      .select("id, name, city");

    if (loadError) {
      return { success: false, message: loadError.message, imported: 0, skipped: 0 };
    }

    // Beim echten Import noch einmal prüfen, damit zwischen Vorschau und Klick
    // keine Dublette entstehen kann.
    const classified = rows.map((row, index) =>
      classifyRow(row, index, venues || [])
    );

    const newRows = classified.filter((row) => row.importStatus === "new");
    const skipped = classified.length - newRows.length;

    if (newRows.length === 0) {
      return {
        success: false,
        message: "Keine neuen Locations zum Importieren gefunden.",
        imported: 0,
        skipped,
      };
    }

    const payload = newRows.map((row) => ({
      name: valueOrNull(row.name),
      street: valueOrNull(row.street),
      postal_code: valueOrNull(row.postal_code),
      city: valueOrNull(row.city),
      state: valueOrNull(row.state),
      country: valueOrNull(row.country) || "DE",
      website: valueOrNull(row.website),
      capacity: toNumberOrNull(row.capacity),
      venue_type: valueOrNull(row.venue_type),

      contact_name: valueOrNull(row.contact_name),
      contact_email: valueOrNull(row.contact_email),
      contact_phone: valueOrNull(row.contact_phone),
      contact_name_2: valueOrNull(row.contact_name_2),
      contact_email_2: valueOrNull(row.contact_email_2),
      contact_phone_2: valueOrNull(row.contact_phone_2),
      booking_email: valueOrNull(row.booking_email),

      // Absichtlich immer "Zu prüfen" – genau unsere Importregel.
      relationship_status: "⚪ Zu prüfen",
      played_before: false,

      internal_notes: valueOrNull(row.internal_notes),
      special_notes: valueOrNull(row.special_notes),
      season_notes: valueOrNull(row.season_notes),
      program_focus: toProgramFocus(row.program_focus),

      instagram_url: valueOrNull(row.instagram_url),
      facebook_url: valueOrNull(row.facebook_url),
      logo_url: valueOrNull(row.logo_url),
    }));

    const { error: insertError } = await supabaseAdmin
      .from("venues")
      .insert(payload);

    if (insertError) {
      return {
        success: false,
        message: insertError.message,
        imported: 0,
        skipped,
      };
    }

    revalidatePath("/admin/locations");

    return {
      success: true,
      message: `${payload.length} Locations importiert.`,
      imported: payload.length,
      skipped,
    };
  }

  return (
    <ImportClient
      previewImport={previewImport}
      importVenues={importVenues}
    />
  );
}

function classifyRow(
  row: ImportRow,
  index: number,
  venues: { id: string; name: string | null; city: string | null }[]
): PreviewRow {
  const name = String(row.name || "").trim();
  const city = String(row.city || "").trim();

  if (!name) {
    return {
      ...row,
      rowIndex: index,
      importStatus: "invalid",
      matchText: "Location-Name fehlt",
    };
  }

  const normalizedName = normalize(name);
  const normalizedCity = normalize(city);

  const exact = venues.find(
    (venue) =>
      normalize(venue.name) === normalizedName &&
      normalize(venue.city) === normalizedCity
  );

  if (exact) {
    return {
      ...row,
      rowIndex: index,
      importStatus: "existing",
      matchText: `${exact.name}${exact.city ? ` · ${exact.city}` : ""}`,
    };
  }

  const sameName = venues.find(
    (venue) => normalize(venue.name) === normalizedName
  );

  if (sameName) {
    return {
      ...row,
      rowIndex: index,
      importStatus: "possible_duplicate",
      matchText: `${sameName.name}${sameName.city ? ` · ${sameName.city}` : ""}`,
    };
  }

  return {
    ...row,
    rowIndex: index,
    importStatus: "new",
  };
}

function normalize(value: unknown) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "und")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function valueOrNull(value: unknown) {
  const text = String(value ?? "").trim();
  return text === "" ? null : text;
}

function toNumberOrNull(value: unknown) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const number = Number(text.replace(",", "."));
  return Number.isFinite(number) ? number : null;
}

function toProgramFocus(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  return String(value ?? "")
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
