"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

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
  relationship_status: string | null;
};

type AcquisitionActivity = {
  id: string;
  acquisition_id: string;
  activity_date: string;
  activity_type: string | null;
  channel: string | null;
  note: string | null;
  response: string | null;
  next_step: string | null;
  follow_up_at: string | null;
  status_after: string | null;
  interest_after: string | null;
  created_at: string | null;
};

type Acquisition = {
  id: string;
  venue_id: string;
  program: string | null;
  status: string | null;
  priority: string | null;
  last_contact_at: string | null;
  next_follow_up_at: string | null;
  contact_channel: string | null;
  contact_note: string | null;
  response: string | null;
  next_step: string | null;
  rejection_reason: string | null;
  interest: string | null;
  notes: string | null;
  action_type: string | null;
  context: string | null;
  converted_to_show: boolean;
  show_date: string | null;
  archived_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

const STATUS_OPTIONS = [
  "Neu", "Vorqualifiziert", "Insta", "Kontaktiert", "Follow-up 1",
  "Follow-up 2", "Interesse", "Verhandlung", "Gebucht 🎉", "Abgesagt",
];

const PRIORITY_OPTIONS = ["Niedrig", "Normal", "Hoch"];

const PROGRAM_OPTIONS = [
  "Jetzt mal Tacheles",
  "Süßer die Glocken nie hingen",
  "TYPisch FRAU?!",
];

const INTEREST_OPTIONS = [
  "", "Kein Interesse", "Offen", "Grundsätzliches Interesse",
  "Konkretes Interesse", "Sehr interessiert",
];

export default function AcquisitionDetailClient({
  acquisition,
  venue,
  linkedShowId,
  wasSaved,
  activityWasSaved,
  activities = [],
  addActivity,
  updateActivity,
  deleteActivity,
  deleteAcquisition,
  saveAcquisition,
  archiveAcquisition,
  createShowFromAcquisition,
}: {
  acquisition: Acquisition;
  venue: Venue;
  linkedShowId: string | null;
  wasSaved: boolean;
  activityWasSaved: boolean;
  activities: AcquisitionActivity[];
  addActivity: (formData: FormData) => Promise<void>;
  updateActivity: (formData: FormData) => Promise<void>;
  deleteActivity: (formData: FormData) => Promise<void>;
  deleteAcquisition: (formData: FormData) => Promise<void>;
  saveAcquisition: (formData: FormData) => Promise<void>;
  archiveAcquisition: (formData: FormData) => Promise<void>;
  createShowFromAcquisition: (formData: FormData) => Promise<void>;
}) {
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);

  const isArchived = Boolean(acquisition.archived_at);
  const locationLine = [venue.city, venue.state].filter(Boolean).join(", ");
  const address = [
    venue.street,
    [venue.postal_code, venue.city].filter(Boolean).join(" "),
    venue.country,
  ].filter(Boolean);

  return (
    <main className="min-h-screen bg-[#fbf7ef] px-5 py-6 pb-20 text-zinc-950 md:px-8">
      <div className="mx-auto max-w-[1500px]">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-zinc-500">
          primakavi · booking crm
        </p>

        <div className="mt-5">
          <Link
            href="/admin/acquisition"
            className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-black shadow-sm transition hover:bg-zinc-50"
          >
            ← Zur Akquise
          </Link>
        </div>

        <header className="mt-4 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight md:text-5xl">
              {venue.name}
            </h1>

            <div className="mt-3 flex flex-wrap gap-2">
              <Badge>⌖ {locationLine || "Ort offen"}</Badge>
              <Badge>◉ Akquise</Badge>
              <Badge>
                Letztes Update: {formatDateTime(acquisition.updated_at || acquisition.created_at)}
              </Badge>
              {isArchived && <Badge>📦 Akquise abgeschlossen</Badge>}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {linkedShowId ? (
              <Link
                href={`/admin/shows/${linkedShowId}`}
                className="rounded-xl bg-lime-300 px-6 py-3 text-sm font-black shadow-sm transition hover:-translate-y-0.5"
              >
                🎉 Show-Akte öffnen
              </Link>
            ) : (
              <form action={createShowFromAcquisition}>
                <input type="hidden" name="acquisition_id" value={acquisition.id} />
                <button
                  type="submit"
                  className="rounded-xl bg-lime-300 px-6 py-3 text-sm font-black shadow-sm transition hover:-translate-y-0.5"
                >
                  🎉 Show-Akte anlegen
                </button>
              </form>
            )}

            <Link
              href={`/admin/locations/${venue.id}`}
              title="Location öffnen"
              className="grid h-12 w-12 place-items-center rounded-xl border border-black/10 bg-white text-lg font-black shadow-sm"
            >
              …
            </Link>
          </div>
        </header>

        {(wasSaved || activityWasSaved) && (
          <div className="mt-5 rounded-xl bg-lime-100 px-5 py-3 text-sm font-black text-lime-800 ring-1 ring-lime-200">
            ✓ {activityWasSaved ? "Akquise-Eintrag gespeichert" : "Änderungen gespeichert"}
          </div>
        )}

        <form action={saveAcquisition} className="mt-5 space-y-5">
          <input type="hidden" name="id" value={acquisition.id} />

          <div className="grid gap-5 xl:grid-cols-[1fr_1.05fr]">
            <Card>
              <div className="grid gap-6 md:grid-cols-2 md:divide-x md:divide-black/10">
                <div className="md:pr-6">
                  <CardTitle icon="▦">Location</CardTitle>
                  <p className="mt-4 text-lg font-black">{venue.name}</p>
                  <div className="mt-1 text-sm font-semibold leading-6 text-zinc-600">
                    {address.length ? address.map((line) => <div key={line}>{line}</div>) : "Adresse nicht hinterlegt"}
                  </div>
                  {venue.website && (
                    <a
                      href={normalizeUrl(venue.website)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-block text-sm font-bold text-blue-700 underline underline-offset-4"
                    >
                      🔗 {venue.website}
                    </a>
                  )}
                </div>

                <div className="md:pl-6">
                  <CardTitle icon="♙">Ansprechpartner</CardTitle>
                  <p className="mt-4 text-lg font-black">{venue.contact_name || "Noch offen"}</p>
                  {venue.contact_email || venue.booking_email ? (
                    <a
                      href={`mailto:${venue.contact_email || venue.booking_email}`}
                      className="mt-4 block text-sm font-bold text-blue-700"
                    >
                      ✉ {venue.contact_email || venue.booking_email}
                    </a>
                  ) : null}
                  {venue.contact_phone && (
                    <a href={`tel:${venue.contact_phone}`} className="mt-2 block text-sm font-bold">
                      ☎ {venue.contact_phone}
                    </a>
                  )}
                  {venue.contact_name_2 && (
                    <p className="mt-4 text-sm font-bold text-zinc-500">
                      Weitere Kontakte (1): {venue.contact_name_2}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            <Card>
              <CardTitle icon="◎">Akquise-Status</CardTitle>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <Field label="Akquise-Runde">
                  <select name="program" defaultValue={acquisition.program || ""} className={inputClass}>
                    <option value="">Runde auswählen</option>
                    {!PROGRAM_OPTIONS.includes(acquisition.program || "") && acquisition.program && (
                      <option value={acquisition.program}>{acquisition.program}</option>
                    )}
                    {PROGRAM_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </Field>

                <Field label="Status">
                  <select name="status" defaultValue={acquisition.status || "Neu"} className={statusClass}>
                    {STATUS_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </Field>

                <Field label="Priorität">
                  <select name="priority" defaultValue={acquisition.priority || "Normal"} className={priorityClass}>
                    {PRIORITY_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </Field>

                <Field label="Nächstes Follow-up">
                  <input type="date" name="next_follow_up_at" defaultValue={acquisition.next_follow_up_at || ""} className={inputClass} />
                </Field>

                <Field label="Interesse">
                  <select name="interest" defaultValue={acquisition.interest || ""} className={interestClass}>
                    {!INTEREST_OPTIONS.includes(acquisition.interest || "") && acquisition.interest && (
                      <option value={acquisition.interest}>{acquisition.interest}</option>
                    )}
                    {INTEREST_OPTIONS.map((option) => (
                      <option key={option || "empty"} value={option}>
                        {option || "Interesse offen"}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Show-Datum">
                  <input type="date" name="show_date" defaultValue={acquisition.show_date || ""} className={inputClass} />
                </Field>
              </div>

              {/* Hidden legacy/current summary fields kept so saving this compact form
                  does not accidentally wipe fields that are not shown in the top card. */}
              <input type="hidden" name="last_contact_at" value={acquisition.last_contact_at || ""} />
              <input type="hidden" name="contact_channel" value={acquisition.contact_channel || ""} />
              <input type="hidden" name="contact_note" value={acquisition.contact_note || ""} />
              <input type="hidden" name="response" value={acquisition.response || ""} />
              <input type="hidden" name="next_step" value={acquisition.next_step || ""} />
              <input type="hidden" name="rejection_reason" value={acquisition.rejection_reason || ""} />
              <input type="hidden" name="action_type" value={acquisition.action_type || ""} />
            </Card>
          </div>

          <Card>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle icon="◌">Akquise-Verlauf</CardTitle>
                <p className="mt-1 text-sm font-semibold text-zinc-500">
                  Alle Kontakte, Gespräche und wichtigen Schritte auf einen Blick.
                </p>
              </div>
              {!isArchived && (
                <button
                  type="button"
                  onClick={() => setShowActivityForm((open) => !open)}
                  className="rounded-xl bg-lime-300 px-5 py-3 text-sm font-black shadow-sm transition hover:-translate-y-0.5"
                >
                  {showActivityForm ? "× Eingabe schließen" : "＋ Eintrag hinzufügen"}
                </button>
              )}
            </div>

            <div className="relative mt-6 space-y-3 md:pl-10">
              {activities.length > 0 && (
                <div className="absolute bottom-6 left-[13px] top-6 hidden border-l border-dashed border-zinc-300 md:block" />
              )}

              {activities.length === 0 ? (
                <div className="rounded-xl bg-[#fbf7ef] px-5 py-5 text-sm font-semibold text-zinc-400">
                  Noch keine Kontakte in der Historie.
                </div>
              ) : (
                activities.map((activity, index) => {
                  const isEditing = editingActivityId === activity.id;

                  return (
                    <div key={activity.id} className="relative">
                      <div className={`absolute -left-[39px] top-5 hidden h-4 w-4 rounded-full ring-4 ring-white md:block ${dotClass(index)}`} />

                      {isEditing ? (
                        <div className="rounded-xl border border-lime-200 bg-[#fffdf8] p-4 shadow-sm">
                          <input type="hidden" name="acquisition_id" value={acquisition.id} />
                          <input type="hidden" name="activity_id" value={activity.id} />

                          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[130px_160px_1.15fr_1fr_1fr]">
                            <Field label="Datum">
                              <input type="date" name="activity_date" defaultValue={activity.activity_date || ""} className={inputClass} />
                            </Field>
                            <Field label="Kontaktweg">
                              <select name="activity_channel" defaultValue={activity.channel || ""} className={inputClass}>
                                <option value="">Bitte wählen …</option>
                                <option>E-Mail</option>
                                <option>Telefon</option>
                                <option>Schriftlich</option>
                                <option>Instagram</option>
                                <option>Persönlich</option>
                                <option>Notiz</option>
                              </select>
                            </Field>
                            <Field label="Was ist passiert?">
                              <textarea name="activity_note" rows={3} defaultValue={activity.note || ""} className={textareaClass} />
                            </Field>
                            <Field label="Rückmeldung">
                              <textarea name="activity_response" rows={3} defaultValue={activity.response || ""} className={textareaClass} />
                            </Field>
                            <Field label="Nächster Schritt">
                              <textarea name="activity_next_step" rows={3} defaultValue={activity.next_step || ""} className={textareaClass} />
                            </Field>
                          </div>

                          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                            <Field label="Wiedervorlage">
                              <input type="date" name="activity_follow_up_at" defaultValue={activity.follow_up_at || ""} className={inputClass} />
                            </Field>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingActivityId(null)}
                                className="rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-black text-zinc-500 transition hover:bg-zinc-50"
                              >
                                Abbrechen
                              </button>
                              <button
                                type="submit"
                                formAction={updateActivity}
                                className="rounded-xl bg-lime-300 px-6 py-3 text-sm font-black shadow-sm transition hover:-translate-y-0.5"
                              >
                                ✓ Änderungen speichern
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid gap-3 rounded-xl border border-black/[0.06] bg-white px-4 py-3 shadow-sm lg:grid-cols-[130px_125px_minmax(280px,1fr)_230px_82px] lg:items-center">
                          <div>
                            <p className="text-sm font-black">{formatDate(activity.activity_date)}</p>
                            <p className="mt-1 text-xs font-semibold text-zinc-400">
                              {formatCreatedTime(activity.created_at)}
                            </p>
                          </div>

                          <div className="text-sm font-black">
                            {channelIcon(activity.channel)} {activity.channel || activity.activity_type || "Notiz"}
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-semibold leading-6 text-zinc-800">
                              {activity.note || "—"}
                            </p>
                            {activity.response && (
                              <p className="mt-1 text-sm leading-6 text-zinc-500">{activity.response}</p>
                            )}
                          </div>

                          <div>
                            {(activity.next_step || activity.follow_up_at) && (
                              <div className="rounded-lg bg-[#fff7df] px-3 py-2 text-xs font-bold leading-5 text-zinc-700">
                                {activity.next_step || "Follow-up"}
                                {activity.follow_up_at ? ` · ${formatDate(activity.follow_up_at)}` : ""}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              title="Eintrag bearbeiten"
                              onClick={() => setEditingActivityId(activity.id)}
                              className="grid h-9 w-9 place-items-center rounded-lg text-zinc-500 transition hover:bg-[#fbf7ef] hover:text-zinc-950"
                            >
                              ✏️
                            </button>

                            <button
                              type="button"
                              title="Eintrag löschen"
                              onClick={async () => {
                                const confirmed = window.confirm(
                                  "Diesen Akquise-Eintrag wirklich löschen?"
                                );
                                if (!confirmed) return;

                                const formData = new FormData();
                                formData.set("acquisition_id", acquisition.id);
                                formData.set("activity_id", activity.id);

                                await deleteActivity(formData);
                              }}
                              className="grid h-9 w-9 place-items-center rounded-lg text-red-500 transition hover:bg-red-50"
                            >
                              🗑
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {!isArchived && showActivityForm ? (
              <div id="neuer-eintrag" className="mt-6 rounded-xl border border-black/[0.06] bg-[#fffdf8] p-5 shadow-inner shadow-black/[0.015]">
                <h3 className="text-lg font-black">Neuen Akquise-Eintrag hinzufügen</h3>
                <div className="mt-4">
                  {/* Fields use formAction so this section can live inside the main save form
                      without invalid nested forms. */}
                  <input type="hidden" name="acquisition_id" value={acquisition.id} />
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[130px_160px_1.15fr_1fr_1fr]">
                    <Field label="Datum">
                      <input type="date" name="activity_date" defaultValue={today()} className={inputClass} />
                    </Field>
                    <Field label="Kontaktweg">
                      <select name="activity_channel" defaultValue="" className={inputClass}>
                        <option value="">Bitte wählen …</option>
                        <option>E-Mail</option>
                        <option>Telefon</option>
                        <option>Schriftlich</option>
                        <option>Instagram</option>
                        <option>Persönlich</option>
                        <option>Notiz</option>
                      </select>
                    </Field>
                    <Field label="Was ist passiert?">
                      <textarea name="activity_note" rows={3} placeholder="z. B. Programm vorgestellt, Rückruf erhalten …" className={textareaClass} />
                    </Field>
                    <Field label="Rückmeldung">
                      <textarea name="activity_response" rows={3} placeholder="z. B. grundsätzliches Interesse, noch offen …" className={textareaClass} />
                    </Field>
                    <Field label="Nächster Schritt">
                      <textarea name="activity_next_step" rows={3} placeholder="z. B. in 2 Wochen nachfassen …" className={textareaClass} />
                    </Field>
                  </div>
                  <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                    <Field label="Wiedervorlage">
                      <input type="date" name="activity_follow_up_at" className={inputClass} />
                    </Field>
                    <button
                      type="submit"
                      formAction={addActivity}
                      className="rounded-xl bg-lime-300 px-6 py-3 text-sm font-black shadow-sm transition hover:-translate-y-0.5"
                    >
                      ＋ Eintrag speichern
                    </button>
                  </div>
                </div>
              </div>
            ) : isArchived ? (
              <div className="mt-6 rounded-xl bg-zinc-100 px-5 py-4 text-sm font-bold text-zinc-500">
                📦 Diese Akquise ist abgeschlossen. Neue Einträge sind nicht mehr möglich.
              </div>
            ) : null}
          </Card>

          <div className="grid gap-5 xl:grid-cols-[1.7fr_0.9fr]">
            <Card>
              <CardTitle icon="▤">Interne Notizen / Kontext</CardTitle>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="Interne Notizen">
                  <textarea
                    name="notes"
                    rows={5}
                    defaultValue={acquisition.notes || ""}
                    placeholder="Besonderheiten, interne Absprachen, Hintergrundinfos …"
                    className={textareaClass}
                  />
                </Field>
                <Field label="Kontext">
                  <textarea
                    name="context"
                    rows={5}
                    defaultValue={acquisition.context || ""}
                    placeholder="Weitere Einordnung zur Akquise …"
                    className={textareaClass}
                  />
                </Field>
              </div>
            </Card>

            <Card>
              <CardTitle icon="⚙">Optionen</CardTitle>
              <div className="mt-5 space-y-3">
                {!isArchived ? (
                  <>
                    <input
                      type="hidden"
                      name="id"
                      value={acquisition.id}
                    />
                    <button
                      type="submit"
                      formAction={archiveAcquisition}
                      className="w-full rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-black text-red-700 transition hover:bg-red-100"
                    >
                      ✓ Akquise abschließen
                    </button>
                  </>
                ) : (
                  <div className="rounded-xl bg-zinc-100 px-5 py-3 text-center text-sm font-black text-zinc-500">
                    📦 Akquise abgeschlossen
                  </div>
                )}

                {!linkedShowId && (
                  <button
                    type="submit"
                    formAction={deleteAcquisition}
                    onClick={(event) => {
                      if (!window.confirm("Diese Akquise inklusive aller Kontakteinträge wirklich löschen?")) {
                        event.preventDefault();
                      }
                    }}
                    className="w-full rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-black text-zinc-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                  >
                    🗑 Akquise löschen
                  </button>
                )}

                <button
                  type="submit"
                  className="w-full rounded-xl bg-zinc-950 px-5 py-3 text-sm font-black text-white"
                >
                  Änderungen speichern
                </button>
              </div>
            </Card>
          </div>
        </form>

        <footer className="mt-5 flex flex-wrap justify-between gap-3 text-xs font-semibold text-zinc-400">
          <span>
            Erstellt am {formatDate(acquisition.created_at?.slice(0, 10))} · Zuletzt aktualisiert am{" "}
            {formatDate(acquisition.updated_at?.slice(0, 10))}
          </span>
          <span className="font-medium italic text-zinc-600">Mehr Kultur auf die Bühne. ♡</span>
        </footer>
      </div>
    </main>
  );
}

const inputClass =
  "h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm font-semibold outline-none transition focus:border-zinc-400";
const statusClass =
  "h-11 w-full rounded-lg border border-amber-200 bg-amber-50 px-3 text-sm font-semibold outline-none";
const priorityClass =
  "h-11 w-full rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-semibold outline-none";
const interestClass =
  "h-11 w-full rounded-lg border border-green-200 bg-green-50 px-3 text-sm font-semibold outline-none";
const textareaClass =
  "w-full resize-y rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm font-semibold leading-5 outline-none transition focus:border-zinc-400";

function Card({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm md:p-6">
      {children}
    </section>
  );
}

function CardTitle({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-3 text-xl font-black">
      <span className="text-2xl">{icon}</span>
      {children}
    </h2>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-black text-zinc-700">{label}</span>
      {children}
    </label>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-black/5 bg-white/70 px-3 py-1.5 text-xs font-black text-zinc-600">
      {children}
    </span>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}.${month}.${year}`;
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatCreatedTime(value?: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function normalizeUrl(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function channelIcon(channel?: string | null) {
  const value = (channel || "").toLowerCase();
  if (value.includes("telefon")) return "📞";
  if (value.includes("mail")) return "✉️";
  if (value.includes("insta")) return "📸";
  if (value.includes("persön")) return "🤝";
  if (value.includes("schrift")) return "📬";

  return "▣";
}

function dotClass(index: number) {
  const classes = ["bg-lime-400", "bg-blue-700", "bg-red-500", "bg-zinc-400"];
  return classes[index % classes.length];
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
