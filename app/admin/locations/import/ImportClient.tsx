"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

type ImportRow = Record<string, string | number | string[] | undefined>;

type PreviewRow = ImportRow & {
  rowIndex: number;
  importStatus: "new" | "existing" | "possible_duplicate" | "invalid";
  matchText?: string;
};

type ImportResult = {
  success: boolean;
  message: string;
  imported: number;
  skipped: number;
};

const ALLOWED_HEADERS = [
  "name",
  "street",
  "postal_code",
  "city",
  "state",
  "country",
  "website",
  "capacity",
  "venue_type",
  "contact_name",
  "contact_email",
  "contact_phone",
  "contact_name_2",
  "contact_email_2",
  "contact_phone_2",
  "booking_email",
  "relationship_status",
  "internal_notes",
  "special_notes",
  "season_notes",
  "program_focus",
  "instagram_url",
  "facebook_url",
  "logo_url",
];

export default function ImportClient({
  previewImport,
  importVenues,
}: {
  previewImport: (rows: ImportRow[]) => Promise<PreviewRow[]>;
  importVenues: (rows: ImportRow[]) => Promise<ImportResult>;
}) {
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const newCount = preview.filter((row) => row.importStatus === "new").length;
  const existingCount = preview.filter((row) => row.importStatus === "existing").length;
  const duplicateCount = preview.filter(
    (row) => row.importStatus === "possible_duplicate"
  ).length;
  const invalidCount = preview.filter((row) => row.importStatus === "invalid").length;

  async function handleFile(file: File | undefined) {
    setMessage(null);
    setResult(null);
    setRows([]);
    setPreview([]);

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setMessage("Bitte eine CSV-Datei auswählen.");
      return;
    }

    const text = await file.text();
    const parsed = parseCsv(text);

    if (parsed.length < 2) {
      setMessage("Die CSV enthält keine Datensätze.");
      return;
    }

    const headers = parsed[0].map((header) => header.trim());

    if (!headers.includes("name")) {
      setMessage('Die CSV braucht mindestens die Spalte "name".');
      return;
    }

    const unknownHeaders = headers.filter(
      (header) => header && !ALLOWED_HEADERS.includes(header)
    );

    const parsedRows = parsed
      .slice(1)
      .filter((cells) => cells.some((cell) => cell.trim() !== ""))
      .map((cells) => {
        const row: ImportRow = {};
        headers.forEach((header, index) => {
          if (header && ALLOWED_HEADERS.includes(header)) {
            row[header] = cells[index]?.trim() ?? "";
          }
        });
        return row;
      });

    setFileName(file.name);
    setRows(parsedRows);

    startTransition(async () => {
      try {
        const checked = await previewImport(parsedRows);
        setPreview(checked);

        if (unknownHeaders.length > 0) {
          setMessage(
            `Hinweis: Unbekannte Spalten wurden ignoriert: ${unknownHeaders.join(", ")}`
          );
        }
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Vorschau konnte nicht erstellt werden."
        );
      }
    });
  }

  function runImport() {
    if (newCount === 0) return;

    startTransition(async () => {
      setMessage(null);
      const importResult = await importVenues(rows);
      setResult(importResult);

      if (importResult.success) {
        const checked = await previewImport(rows);
        setPreview(checked);
      }
    });
  }

  return (
    <main className="min-h-screen bg-[#fbf7ef] px-8 py-8 text-zinc-950">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/admin/locations"
              className="text-sm font-bold text-zinc-400 transition hover:text-zinc-950"
            >
              ← Locations
            </Link>
            <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
              primakavi · booking crm
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">
              Locations importieren
            </h1>
            <p className="mt-2 text-zinc-500">
              CSV prüfen, Dubletten erkennen und neue Locations gesammelt anlegen.
            </p>
          </div>
        </header>

        <section className="rounded-[1.7rem] bg-white p-6 shadow-lg shadow-black/[0.03] ring-1 ring-black/5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-black/10 bg-[#fbf7ef] px-6 text-center transition hover:border-black/20 hover:bg-white">
              <span className="text-3xl">📥</span>
              <span className="mt-3 font-black">CSV auswählen</span>
              <span className="mt-1 text-sm font-semibold text-zinc-400">
                {fileName || "Unsere feste Location-Importvorlage"}
              </span>
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
            </label>

            <div className="rounded-2xl bg-zinc-950 p-5 text-white">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/40">
                Importregel
              </p>
              <p className="mt-3 text-sm font-bold leading-6">
                Bereits vorhanden → überspringen.
                <br />
                Neu → mit <span className="text-lime-300">⚪ Zu prüfen</span> anlegen.
              </p>
              <p className="mt-3 text-xs font-semibold leading-5 text-white/45">
                Dublettencheck: normalisierter Location-Name + Ort. Gleicher Name in
                einem anderen Ort wird zur Prüfung markiert.
              </p>
            </div>
          </div>

          {message && (
            <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
              {message}
            </div>
          )}

          {result && (
            <div
              className={`mt-4 rounded-xl px-4 py-3 text-sm font-bold ${
                result.success
                  ? "bg-lime-100 text-lime-900"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {result.success ? "✓ " : "⚠️ "}
              {result.message}
              {result.skipped > 0 ? ` · ${result.skipped} übersprungen` : ""}
            </div>
          )}
        </section>

        {preview.length > 0 && (
          <>
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Stat label="Neu" value={newCount} className="bg-lime-100" />
              <Stat label="Vorhanden" value={existingCount} className="bg-zinc-100" />
              <Stat label="Mögliche Dublette" value={duplicateCount} className="bg-amber-100" />
              <Stat label="Fehler" value={invalidCount} className="bg-red-100" />
            </section>

            <section className="overflow-hidden rounded-[1.7rem] bg-white shadow-lg shadow-black/[0.03] ring-1 ring-black/5">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-zinc-950 text-white">
                    <tr>
                      <Th>Status</Th>
                      <Th>Location</Th>
                      <Th>Ort</Th>
                      <Th>Plätze</Th>
                      <Th>Kontakt</Th>
                      <Th>Booking-Mail</Th>
                      <Th>Treffer</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {preview.map((row) => (
                      <tr key={row.rowIndex} className="bg-white align-top">
                        <Td>
                          <StatusBadge status={row.importStatus} />
                        </Td>
                        <Td strong>{String(row.name || "—")}</Td>
                        <Td>{String(row.city || "—")}</Td>
                        <Td>{String(row.capacity || "—")}</Td>
                        <Td>{String(row.contact_name || "—")}</Td>
                        <Td>{String(row.booking_email || row.contact_email || "—")}</Td>
                        <Td>{row.matchText || "—"}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="sticky bottom-5 z-20 flex flex-col gap-3 rounded-[1.5rem] bg-zinc-950 px-5 py-4 text-white shadow-2xl sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black">
                  {newCount} {newCount === 1 ? "Location" : "Locations"} bereit
                </p>
                <p className="mt-1 text-xs font-semibold text-white/45">
                  Vorhandene, mögliche Dubletten und fehlerhafte Zeilen werden nicht importiert.
                </p>
              </div>

              <button
                type="button"
                onClick={runImport}
                disabled={isPending || newCount === 0}
                className="rounded-full bg-lime-300 px-6 py-3 text-sm font-black text-zinc-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isPending
                  ? "Prüft …"
                  : `${newCount} ${newCount === 1 ? "Location" : "Locations"} importieren`}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <div className={`rounded-2xl px-5 py-4 ${className}`}>
      <p className="text-2xl font-black">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-wider text-zinc-500">{label}</p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-xs font-black uppercase tracking-wider">{children}</th>;
}

function Td({ children, strong = false }: { children: React.ReactNode; strong?: boolean }) {
  return <td className={`px-4 py-4 ${strong ? "font-black" : "font-semibold text-zinc-600"}`}>{children}</td>;
}

function StatusBadge({ status }: { status: PreviewRow["importStatus"] }) {
  const map = {
    new: ["Neu", "bg-lime-100 text-lime-800"],
    existing: ["Vorhanden", "bg-zinc-100 text-zinc-600"],
    possible_duplicate: ["Prüfen", "bg-amber-100 text-amber-800"],
    invalid: ["Fehler", "bg-red-100 text-red-700"],
  } as const;

  const [label, classes] = map[status];
  return <span className={`rounded-full px-2.5 py-1 text-xs font-black ${classes}`}>{label}</span>;
}

function parseCsv(text: string) {
  const cleanText = text.replace(/^\uFEFF/, "");
  const delimiter = detectDelimiter(cleanText);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < cleanText.length; i += 1) {
    const char = cleanText[i];
    const next = cleanText[i + 1];

    if (char === '"') {
      if (quoted && next === '"') {
        field += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (char === delimiter && !quoted) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function detectDelimiter(text: string) {
  const firstLine = text.split(/\r?\n/, 1)[0] || "";
  const semicolons = (firstLine.match(/;/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;
  return semicolons > commas ? ";" : ",";
}
