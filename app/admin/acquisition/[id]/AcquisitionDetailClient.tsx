"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type Venue = {
  id: string;
  legacy_id: string | null;
  name: string;

  street: string | null;
  postal_code: string | null;
  city: string | null;
  state: string | null;
  country: string | null;

  website: string | null;

  capacity: number | null;
  venue_type: string | null;

  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;

  contact_name_2: string | null;
  contact_email_2: string | null;
  contact_phone_2: string | null;

  booking_email: string | null;

  relationship_status:
    | string
    | null;
};

type Acquisition = {
  id: string;
  venue_id: string;

  program: string | null;
  status: string | null;
  priority: string | null;

  last_contact_at:
    | string
    | null;

  next_follow_up_at:
    | string
    | null;

  contact_channel:
    | string
    | null;

  contact_note:
    | string
    | null;

  response:
    | string
    | null;

  next_step:
    | string
    | null;

  rejection_reason:
    | string
    | null;

  interest:
    | string
    | null;

  notes:
    | string
    | null;

  action_type:
    | string
    | null;

  context:
    | string
    | null;

  converted_to_show:
    boolean;

  show_date:
    | string
    | null;

  archived_at:
    | string
    | null;

  created_at:
    | string
    | null;

  updated_at:
    | string
    | null;
};

const STATUS_OPTIONS = [
  "Neu",
  "Vorqualifiziert",
  "Insta",
  "Kontaktiert",
  "Follow-up 1",
  "Follow-up 2",
  "Interesse",
  "Verhandlung",
  "Gebucht 🎉",
  "Abgesagt",
];

const PRIORITY_OPTIONS = [
  "Niedrig",
  "Normal",
  "Hoch",
];

const PROGRAM_OPTIONS = [
  "Jetzt mal Tacheles",
  "Süßer die Glocken nie hingen",
  "TYPisch FRAU?!",
];

export default function AcquisitionDetailClient({
  acquisition,
  venue,
  linkedShowId,
  wasSaved,
  saveAcquisition,
  archiveAcquisition,
  restoreAcquisition,
  createShowFromAcquisition,
}: {
  acquisition: Acquisition;
  venue: Venue;
  linkedShowId: string | null;
  wasSaved: boolean;

  saveAcquisition: (
    formData: FormData
  ) => Promise<void>;

  archiveAcquisition: (
    formData: FormData
  ) => Promise<void>;

  restoreAcquisition: (
    formData: FormData
  ) => Promise<void>;

  createShowFromAcquisition: (
    formData: FormData
  ) => Promise<void>;
}) {
  const address = [
    venue.street,
    [
      venue.postal_code,
      venue.city,
    ]
      .filter(Boolean)
      .join(" "),
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="min-h-screen bg-[#fbf7ef] px-8 py-8 pb-28 text-zinc-950">
      <div className="mx-auto max-w-7xl space-y-5">

        {/* HEADER */}

        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
              primakavi · booking crm
            </p>

            <h1 className="mt-2 text-5xl font-black tracking-tight">
              {venue.name}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-zinc-500">
              <span>
                🎯 Akquise
              </span>

              <span>·</span>

              <span>
                {acquisition.program ||
                  "Programm offen"}
              </span>

              {acquisition.archived_at && (
                <>
                  <span>·</span>

                  <span className="font-bold text-zinc-400">
                    📦 Archiv
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/acquisition"
              className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-black text-zinc-700 shadow-sm transition hover:bg-[#f8f3e9]"
            >
              ← Akquise
            </Link>

            {linkedShowId ? (
              <Link
                href={`/admin/shows/${linkedShowId}`}
                className="inline-flex items-center justify-center rounded-full bg-lime-300 px-5 py-3 text-sm font-black text-zinc-950 shadow-sm transition hover:-translate-y-0.5"
              >
                🎉 Show-Akte öffnen
              </Link>
            ) : (
              <form
                action={
                  createShowFromAcquisition
                }
              >
                <input
                  type="hidden"
                  name="acquisition_id"
                  value={acquisition.id}
                />

                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-lime-300 px-5 py-3 text-sm font-black text-zinc-950 shadow-sm transition hover:-translate-y-0.5"
                >
                  🎉 Show-Akte anlegen
                </button>
              </form>
            )}
          </div>
        </header>

        {/* STATUS */}

        {wasSaved && (
          <div className="rounded-[1.3rem] bg-lime-100 px-5 py-4 text-sm font-black text-lime-800 ring-1 ring-lime-200">
            ✓ Änderungen gespeichert
          </div>
        )}

        {/* LOCATION */}

        <section className="rounded-[1.7rem] bg-white p-6 shadow-lg shadow-black/[0.03] ring-1 ring-black/5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
                Location
              </p>

              <h2 className="mt-1 text-xl font-black">
                {venue.name}
              </h2>

              <p className="mt-2 text-sm font-semibold text-zinc-500">
                {address || "Adresse nicht hinterlegt"}
              </p>
            </div>

            <Link
              href={`/admin/locations/${venue.id}`}
              className="text-sm font-black text-zinc-500 transition hover:text-zinc-950"
            >
              Location öffnen →
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

            <Info
              label="Ansprechpartner"
              value={
                venue.contact_name ||
                "—"
              }
            />

            <Info
              label="E-Mail"
              value={
                venue.contact_email ||
                venue.booking_email ||
                "—"
              }
            />

            <Info
              label="Telefon"
              value={
                venue.contact_phone ||
                "—"
              }
            />

            <Info
              label="Beziehung"
              value={
                venue.relationship_status ||
                "—"
              }
            />
          </div>
        </section>

        {/* EDIT FORM */}

        <form
          action={saveAcquisition}
          className="space-y-5"
        >
          <input
            type="hidden"
            name="id"
            value={acquisition.id}
          />

          {/* STEUERUNG */}

          <section className="rounded-[1.7rem] bg-white p-6 shadow-lg shadow-black/[0.03] ring-1 ring-black/5">
            <SectionTitle
              eyebrow="Vorgang"
              title="Akquise steuern"
            />

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

              <Field label="Programm">
                <select
                  name="program"
                  defaultValue={
                    acquisition.program || ""
                  }
                  className={inputClass}
                >
                  <option value="">
                    Programm auswählen
                  </option>

                  {!PROGRAM_OPTIONS.includes(
                    acquisition.program || ""
                  ) &&
                    acquisition.program && (
                      <option
                        value={
                          acquisition.program
                        }
                      >
                        {
                          acquisition.program
                        }
                      </option>
                    )}

                  {PROGRAM_OPTIONS.map(
                    (option) => (
                      <option
                        key={option}
                        value={option}
                      >
                        {option}
                      </option>
                    )
                  )}
                </select>
              </Field>

              <Field label="Status">
                <select
                  name="status"
                  defaultValue={
                    acquisition.status ||
                    "Neu"
                  }
                  className={inputClass}
                >
                  {STATUS_OPTIONS.map(
                    (option) => (
                      <option
                        key={option}
                        value={option}
                      >
                        {option}
                      </option>
                    )
                  )}
                </select>
              </Field>

              <Field label="Priorität">
                <select
                  name="priority"
                  defaultValue={
                    acquisition.priority ||
                    "Normal"
                  }
                  className={inputClass}
                >
                  {PRIORITY_OPTIONS.map(
                    (option) => (
                      <option
                        key={option}
                        value={option}
                      >
                        {option}
                      </option>
                    )
                  )}
                </select>
              </Field>

              <Field label="Interesse">
                <input
                  name="interest"
                  defaultValue={
                    acquisition.interest ||
                    ""
                  }
                  placeholder="z. B. hoch, grundsätzlich …"
                  className={inputClass}
                />
              </Field>
            </div>
          </section>

          {/* KONTAKT */}

          <section className="rounded-[1.7rem] bg-white p-6 shadow-lg shadow-black/[0.03] ring-1 ring-black/5">
            <SectionTitle
              eyebrow="Kontakt"
              title="Verlauf & Wiedervorlage"
            />

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

              <Field label="Letzter Kontakt">
                <input
                  type="date"
                  name="last_contact_at"
                  defaultValue={
                    acquisition.last_contact_at ||
                    ""
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Nächstes Follow-up">
                <input
                  type="date"
                  name="next_follow_up_at"
                  defaultValue={
                    acquisition.next_follow_up_at ||
                    ""
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Kontaktweg">
                <input
                  name="contact_channel"
                  defaultValue={
                    acquisition.contact_channel ||
                    ""
                  }
                  placeholder="Mail, Telefon, Insta …"
                  className={inputClass}
                />
              </Field>

              <Field label="Aktion">
                <input
                  name="action_type"
                  defaultValue={
                    acquisition.action_type ||
                    ""
                  }
                  placeholder="z. B. Nachfassen"
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">

              <Field label="Kontakt-Notiz">
                <textarea
                  name="contact_note"
                  rows={4}
                  defaultValue={
                    acquisition.contact_note ||
                    ""
                  }
                  className={textareaClass}
                />
              </Field>

              <Field label="Antwort">
                <textarea
                  name="response"
                  rows={4}
                  defaultValue={
                    acquisition.response ||
                    ""
                  }
                  className={textareaClass}
                />
              </Field>
            </div>
          </section>

          {/* NÄCHSTE SCHRITTE */}

          <section className="rounded-[1.7rem] bg-white p-6 shadow-lg shadow-black/[0.03] ring-1 ring-black/5">
            <SectionTitle
              eyebrow="Planung"
              title="Wie geht es weiter?"
            />

            <div className="mt-5 grid gap-4 md:grid-cols-2">

              <Field label="Nächster Schritt">
                <textarea
                  name="next_step"
                  rows={4}
                  defaultValue={
                    acquisition.next_step ||
                    ""
                  }
                  placeholder="Was ist als Nächstes zu tun?"
                  className={textareaClass}
                />
              </Field>

              <Field label="Kontext">
                <textarea
                  name="context"
                  rows={4}
                  defaultValue={
                    acquisition.context ||
                    ""
                  }
                  className={textareaClass}
                />
              </Field>

              <Field label="Notizen">
                <textarea
                  name="notes"
                  rows={5}
                  defaultValue={
                    acquisition.notes ||
                    ""
                  }
                  className={textareaClass}
                />
              </Field>

              <Field label="Absagegrund">
                <textarea
                  name="rejection_reason"
                  rows={5}
                  defaultValue={
                    acquisition.rejection_reason ||
                    ""
                  }
                  className={textareaClass}
                />
              </Field>
            </div>
          </section>

          {/* SHOW */}

          <section className="rounded-[1.7rem] bg-white p-6 shadow-lg shadow-black/[0.03] ring-1 ring-black/5">
            <SectionTitle
              eyebrow="Buchung"
              title="Termin"
            />

            <div className="mt-5 max-w-sm">
              <Field label="Show-Datum">
                <input
                  type="date"
                  name="show_date"
                  defaultValue={
                    acquisition.show_date ||
                    ""
                  }
                  className={inputClass}
                />
              </Field>
            </div>

            <p className="mt-3 text-xs leading-5 text-zinc-400">
              Wenn du anschließend eine Show-Akte erzeugst, wird dieser Termin direkt übernommen.
            </p>
          </section>

          {/* SAVE */}

          <div className="sticky bottom-5 z-20 flex justify-end">
            <button
              type="submit"
              className="rounded-full bg-zinc-950 px-7 py-3.5 text-sm font-black text-white shadow-xl transition hover:-translate-y-0.5"
            >
              Änderungen speichern
            </button>
          </div>
        </form>

        {/* ARCHIVE */}

        <section className="flex justify-end border-t border-black/5 pt-5">
          {acquisition.archived_at ? (
            <form
              action={
                restoreAcquisition
              }
            >
              <input
                type="hidden"
                name="id"
                value={acquisition.id}
              />

              <button
                type="submit"
                className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-black text-zinc-600 transition hover:bg-[#f8f3e9]"
              >
                ↩️ Vorgang reaktivieren
              </button>
            </form>
          ) : (
            <form
              action={
                archiveAcquisition
              }
            >
              <input
                type="hidden"
                name="id"
                value={acquisition.id}
              />

              <button
                type="submit"
                className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-black text-zinc-500 transition hover:bg-zinc-100"
              >
                📦 Vorgang archivieren
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}


// ============================================================
// COMPONENTS
// ============================================================

const inputClass =
  "h-12 w-full rounded-xl bg-[#fbf7ef] px-4 text-sm font-semibold outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-black/10";

const textareaClass =
  "w-full resize-y rounded-xl bg-[#fbf7ef] px-4 py-3 text-sm font-semibold leading-6 outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-black/10";

function SectionTitle({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
        {eyebrow}
      </p>

      <h2 className="mt-1 text-xl font-black">
        {title}
      </h2>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-zinc-400">
        {label}
      </span>

      {children}
    </label>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#fbf7ef] px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-bold text-zinc-800">
        {value}
      </p>
    </div>
  );
}