"use client";

import Link from "next/link";
import {
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";

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
  audience_notes: string | null;

  contact_name: string | null;
  contact_role: string | null;
  contact_email: string | null;
  contact_phone: string | null;

  contact_name_2: string | null;
  contact_role_2: string | null;
  contact_email_2: string | null;
  contact_phone_2: string | null;

  booking_email: string | null;

  relationship_status: string | null;

  lat: number | string | null;
  lng: number | string | null;

  internal_notes: string | null;
  special_notes: string | null;

  played_before: boolean | null;

  season_notes: string | null;
  program_focus: string[] | null;

  instagram_url: string | null;
  facebook_url: string | null;
  logo_url: string | null;
};

type LocationShow = {
  id: string;
  show_date: string | null;
  program: string | null;
  internal_status: string | null;
  start_time: string | null;
  venue_submitted: string | null;
};

type AcquisitionRecord = {
  id: string;
  program: string | null;
  status: string | null;
  priority: string | null;
  last_contact_at: string | null;
  next_follow_up_at: string | null;
  contact_channel: string | null;
  contact_note: string | null;
  response: string | null;
  next_step: string | null;
  notes: string | null;
  archived_at: string | null;
  created_at: string | null;
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

type AcquisitionRound = {
  id: string;
  name: string;
  active: boolean;
  created_at: string | null;
};

type ActionResult = {
  success: boolean;
  message: string;
  roundName?: string;
};

type SaveResult = {
  success: boolean;
  message: string;
};

const RELATIONSHIP_OPTIONS = [
  "",
  "⚪ Neu",
  "🟠 Kontakt",
  "🟢 Bestandskunde",
  "🔴 Nicht relevant",
];

const STATES = [
  "",
  "Baden-Württemberg",
  "Bayern",
  "Berlin",
  "Brandenburg",
  "Bremen",
  "Hamburg",
  "Hessen",
  "Mecklenburg-Vorpommern",
  "Niedersachsen",
  "Nordrhein-Westfalen",
  "Rheinland-Pfalz",
  "Saarland",
  "Sachsen",
  "Sachsen-Anhalt",
  "Schleswig-Holstein",
  "Thüringen",
];

export default function LocationClient({
  venue,
  shows,
  acquisition = [],
  acquisitionActivities = [],
  acquisitionRounds = [],
  addActivity,
  createAcquisition,
  createAcquisitionRound,
  deleteActivity,
  deleteAcquisition,
  removeAcquisitionRound,
  saveLocation,
  isNew = false,
  importedFromDiscover = false,
}: {
  venue: Venue;
  shows: LocationShow[];
  acquisition?: AcquisitionRecord[];
  acquisitionActivities?: AcquisitionActivity[];
  acquisitionRounds?: AcquisitionRound[];
  addActivity?: (formData: FormData) => Promise<ActionResult>;
  createAcquisition?: (formData: FormData) => Promise<ActionResult>;
  createAcquisitionRound?: (formData: FormData) => Promise<ActionResult>;
  deleteActivity?: (formData: FormData) => Promise<ActionResult>;
  deleteAcquisition?: (formData: FormData) => Promise<ActionResult>;
  removeAcquisitionRound?: (formData: FormData) => Promise<ActionResult>;
  saveLocation: (formData: FormData) => Promise<SaveResult>;
  isNew?: boolean;
  importedFromDiscover?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [openAcquisitionId, setOpenAcquisitionId] = useState<string | null>(
    null
  );
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showNewAcquisitionForm, setShowNewAcquisitionForm] = useState(false);
  const [showNewRoundForm, setShowNewRoundForm] = useState(false);
  const [showManageRounds, setShowManageRounds] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [rounds, setRounds] = useState<AcquisitionRound[]>(acquisitionRounds);
  const [selectedRoundName, setSelectedRoundName] = useState("");
  const [showImportSuccess, setShowImportSuccess] = useState(
    importedFromDiscover
  );

  function startAcquisitionFromImport() {
    setShowNewAcquisitionForm(true);
    setShowActivityForm(false);
    setShowNewRoundForm(false);
    setShowManageRounds(false);
    setSelectedRoundName("");
    setActionMessage(null);
    setShowImportSuccess(false);

    window.setTimeout(() => {
      document
        .getElementById("location-acquisition")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const formData = new FormData(
      event.currentTarget
    );

    setMessage(null);

    startTransition(async () => {
      const result =
        await saveLocation(formData);

      setSuccess(result.success);
      setMessage(result.message);
    });
  }

  const locationSubtitle = [
    venue.postal_code,
    venue.city,
  ]
    .filter(Boolean)
    .join(" ");

  const locationStatus = getLocationStatus(
    shows,
    acquisition
  );

  const activeAcquisition = acquisition.find((item) => {
    if (item.archived_at) return false;

    const status = String(item.status || "").toLowerCase();

    return (
      !status.includes("gebucht") &&
      !status.includes("abgesagt")
    );
  });

  return (
    <main className="min-h-screen bg-[#fbf7ef] px-8 py-8 text-zinc-950">
      <div className="mx-auto max-w-7xl space-y-5">

        {/* HEADER */}

        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/admin/locations"
              className="text-sm font-bold text-zinc-400 transition hover:text-zinc-950"
            >
              ← Locations
            </Link>

            <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
              primakavi · location-akte
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight">
              {isNew
                ? "Neue Location"
                : venue.name}
            </h1>

            <p className="mt-2 text-zinc-500">
              {isNew
                ? "Neue Spielstätte anlegen."
                : locationSubtitle}
            </p>
          </div>

          {!isNew && (
            <div className="flex flex-wrap gap-2">
              {venue.website && (
                <a
                  href={venue.website}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-black transition hover:bg-zinc-50"
                >
                  Website ↗
                </a>
              )}

              {venue.lat &&
                venue.lng && (
                  <a
                    href={`https://www.google.com/maps?q=${venue.lat},${venue.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-black transition hover:bg-zinc-50"
                  >
                    📍 Karte
                  </a>
                )}
            </div>
          )}
        </header>

        {showImportSuccess && !isNew && (
          <section className="flex flex-col gap-4 rounded-[1.7rem] bg-lime-100 px-5 py-4 ring-1 ring-lime-200 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-zinc-950">
                ✓ Location wurde ins CRM übernommen
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-600">
                Du kannst jetzt direkt eine Akquise für diese Location starten.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={startAcquisitionFromImport}
                className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-black text-white transition hover:-translate-y-0.5"
              >
                🎯 Akquise starten
              </button>

              <button
                type="button"
                onClick={() => setShowImportSuccess(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-black text-zinc-500 ring-1 ring-black/5 transition hover:text-zinc-950"
                aria-label="Hinweis schließen"
                title="Hinweis schließen"
              >
                ×
              </button>
            </div>
          </section>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* BASIS */}

<Card
  title="Stammdaten"
  icon="🏛️"
  description="Grunddaten der Spielstätte."
>
  <div className="grid gap-4 md:grid-cols-12">

    <Field
      label="Location"
      name="name"
      defaultValue={venue.name}
      className="md:col-span-8"
    />

    <SelectField
      label="Beziehungsstatus"
      name="relationship_status"
      defaultValue={
        venue.relationship_status ||
        (isNew ? "⚪ Neu" : "")
      }
      options={RELATIONSHIP_OPTIONS}
      className="md:col-span-4"
    />

    <Field
      label="Straße"
      name="street"
      defaultValue={venue.street}
      className="md:col-span-6"
    />

    <Field
      label="PLZ"
      name="postal_code"
      defaultValue={venue.postal_code}
      className="md:col-span-2"
    />

    <Field
      label="Ort"
      name="city"
      defaultValue={venue.city}
      className="md:col-span-4"
    />

    <SelectField
      label="Bundesland"
      name="state"
      defaultValue={venue.state || ""}
      options={STATES}
      className="md:col-span-4"
    />

    <Field
      label="Land"
      name="country"
      defaultValue={venue.country || "DE"}
      className="md:col-span-2"
    />

    <Field
      label="Website"
      name="website"
      defaultValue={venue.website}
      className="md:col-span-6"
    />

  </div>
</Card>

          {/* KONTAKTE */}

          <div className="grid gap-5 xl:grid-cols-2">

            <Card
              title="Ansprechpartner 1"
              icon="👤"
            >
              <div className="grid gap-4 md:grid-cols-2">

                <Field
                  label="Name"
                  name="contact_name"
                  defaultValue={
                    venue.contact_name
                  }
                  className="md:col-span-2"
                />

                <Field
                  label="Funktion"
                  name="contact_role"
                  defaultValue={
                    venue.contact_role
                  }
                  className="md:col-span-2"
                />

                <Field
                  label="E-Mail"
                  name="contact_email"
                  type="email"
                  defaultValue={
                    venue.contact_email
                  }
                />

                <Field
                  label="Telefon"
                  name="contact_phone"
                  defaultValue={
                    venue.contact_phone
                  }
                />
              </div>
            </Card>

            <Card
              title="Ansprechpartner 2"
              icon="👥"
            >
              <div className="grid gap-4 md:grid-cols-2">

                <Field
                  label="Name"
                  name="contact_name_2"
                  defaultValue={
                    venue.contact_name_2
                  }
                  className="md:col-span-2"
                />

                <Field
                  label="Funktion"
                  name="contact_role_2"
                  defaultValue={
                    venue.contact_role_2
                  }
                  className="md:col-span-2"
                />

                <Field
                  label="E-Mail"
                  name="contact_email_2"
                  type="email"
                  defaultValue={
                    venue.contact_email_2
                  }
                />

                <Field
                  label="Telefon"
                  name="contact_phone_2"
                  defaultValue={
                    venue.contact_phone_2
                  }
                />
              </div>
            </Card>

          </div>

          {/* BOOKING */}

<Card
  title="Booking & Bühne"
  icon="🎭"
>
  <div className="grid gap-4 md:grid-cols-12">

    <Field
      label="Booking-E-Mail"
      name="booking_email"
      type="email"
      defaultValue={venue.booking_email}
      className="md:col-span-6"
    />

    <Field
      label="Kapazität"
      name="capacity"
      type="number"
      defaultValue={venue.capacity}
      className="md:col-span-3"
    />

    <Field
      label="Location-Typ"
      name="venue_type"
      defaultValue={venue.venue_type}
      className="md:col-span-3"
    />

    <Field
      label="Programmfokus"
      name="program_focus"
      defaultValue={venue.program_focus?.join(", ") || ""}
      placeholder="Comedy, Kabarett, Musik"
      className="md:col-span-6"
    />

    <Field
      label="Spielzeit / Saison"
      name="season_notes"
      defaultValue={venue.season_notes}
      className="md:col-span-6"
    />

    <Textarea
      label="Publikum / Zielgruppe"
      name="audience_notes"
      defaultValue={venue.audience_notes}
      className="md:col-span-6"
    />

    <div className="md:col-span-6 flex flex-col">
      <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-400">
        Status
      </span>

      {venue.played_before === true && (
        <input type="hidden" name="played_before" value="on" />
      )}

      <div className="flex flex-1 items-center rounded-xl bg-[#fbf7ef] px-5">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-sm font-bold">
              {locationStatus.label}
            </span>

            {locationStatus.detail && (
              <p className="mt-1 text-xs font-semibold text-zinc-400">
                {locationStatus.detail}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>

  </div>
</Card>

          {/* AKQUISE */}

          {!isNew && (
            <div id="location-acquisition" className="scroll-mt-5">
            <Card
              title="Akquise"
              icon="🎯"
              description="Aktueller Stand und bisherige Akquise-Vorgänge dieser Location."
              action={
                activeAcquisition ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowActivityForm((value) => !value);
                      setShowNewAcquisitionForm(false);
                      setActionMessage(null);
                    }}
                    className="inline-flex items-center justify-center rounded-full bg-lime-300 px-4 py-2.5 text-sm font-black text-zinc-950 transition hover:-translate-y-0.5"
                  >
                    {showActivityForm ? "Schließen" : "+ Eintrag"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewAcquisitionForm((value) => {
                        const nextValue = !value;

                        if (nextValue) {
                          setSelectedRoundName("");
                          setShowNewRoundForm(false);
                        }

                        return nextValue;
                      });
                      setShowActivityForm(false);
                      setActionMessage(null);
                    }}
                    className="inline-flex items-center justify-center rounded-full bg-lime-300 px-4 py-2.5 text-sm font-black text-zinc-950 transition hover:-translate-y-0.5"
                  >
                    {showNewAcquisitionForm ? "Schließen" : "+ Neue Akquise"}
                  </button>
                )
              }
            >
              {acquisition.length === 0 && !showNewAcquisitionForm ? (
                <div className="rounded-2xl border border-dashed border-black/10 bg-[#fbf7ef] px-5 py-8 text-center">
                  <p className="text-sm font-black text-zinc-700">
                    Noch keine Akquise für diese Location.
                  </p>
                  <p className="mt-1 text-sm font-semibold text-zinc-400">
                    Starte den ersten Vorgang über „+ Neue Akquise“.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {actionMessage && (
                    <div className="rounded-xl bg-zinc-950 px-4 py-3 text-sm font-bold text-white">
                      {actionMessage}
                    </div>
                  )}

                  {activeAcquisition && showActivityForm && addActivity && (
                    <div
                      id="activity-entry-fields"
                      className="rounded-2xl bg-[#fbf7ef] p-5 ring-1 ring-black/5"
                    >
                      <input
                        type="hidden"
                        name="acquisition_id"
                        value={activeAcquisition.id}
                      />

                      <div className="mb-4">
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
                          Neuer Eintrag
                        </p>
                        <p className="mt-1 font-black text-zinc-950">
                          {activeAcquisition.program || "Aktuelle Akquise"}
                        </p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <SelectField
                          label="Typ"
                          name="activity_type"
                          defaultValue="Kontakt"
                          options={[
                            "Kontakt",
                            "Rückmeldung",
                            "WVL",
                            "Absage",
                            "Buchung",
                            "Notiz",
                          ]}
                        />

                        <Field
                          label="Datum"
                          name="activity_date"
                          type="date"
                          defaultValue={todayDate()}
                        />

                        <SelectField
                          label="Kanal"
                          name="channel"
                          defaultValue=""
                          options={[
                            "",
                            "E-Mail",
                            "Telefon",
                            "Instagram",
                            "LinkedIn",
                            "Persönlich",
                          ]}
                        />

                        <Field
                          label="Wiedervorlage"
                          name="follow_up_at"
                          type="date"
                        />

                        <Textarea
                          label="Was ist passiert?"
                          name="note"
                          className="md:col-span-2"
                        />

                        <Textarea
                          label="Rückmeldung / Ergebnis"
                          name="response"
                          className="md:col-span-2"
                        />

                        <Field
                          label="Nächster Schritt"
                          name="next_step"
                          className="md:col-span-2"
                        />

                        <SelectField
                          label="Status danach"
                          name="status_after"
                          defaultValue=""
                          options={[
                            "",
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
                          ]}
                          className="md:col-span-2"
                        />
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={async () => {
                            const container = document.getElementById("activity-entry-fields");
                            if (!container) return;

                            const formData = new FormData();
                            container
                              .querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
                                "input[name], select[name], textarea[name]"
                              )
                              .forEach((field) => {
                                formData.set(field.name, field.value);
                              });

                            const result = await addActivity(formData);
                            setActionMessage(result.message);
                            if (result.success) {
                              setShowActivityForm(false);
                            }
                          }}
                          className="rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-black text-white transition hover:-translate-y-0.5"
                        >
                          Eintrag speichern
                        </button>
                      </div>
                    </div>
                  )}

                  {!activeAcquisition &&
                    showNewAcquisitionForm &&
                    createAcquisition && (
                      <div className="rounded-2xl bg-[#fbf7ef] p-5 ring-1 ring-black/5">
                        <div id="new-acquisition-fields">
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
                            Neue Akquise
                          </p>

                          <div className="mt-4">
                            <label className="block">
                              <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-400">
                                Akquise-Runde
                              </span>

                              <select
                                name="round_name"
                                value={
                                  showNewRoundForm
                                    ? "__new_round__"
                                    : showManageRounds
                                      ? "__manage_rounds__"
                                      : selectedRoundName
                                }
                                onChange={(event) => {
                                  const value = event.target.value;

                                  if (value === "__new_round__") {
                                    setShowNewRoundForm(true);
                                    setShowManageRounds(false);
                                    setSelectedRoundName("");
                                    setActionMessage(null);
                                    return;
                                  }

                                  if (value === "__manage_rounds__") {
                                    setShowManageRounds(true);
                                    setShowNewRoundForm(false);
                                    setSelectedRoundName("");
                                    setActionMessage(null);
                                    return;
                                  }

                                  setShowNewRoundForm(false);
                                  setShowManageRounds(false);
                                  setSelectedRoundName(value);
                                  setActionMessage(null);
                                }}
                                className="h-12 w-full rounded-xl bg-white px-4 text-sm font-bold outline-none ring-1 ring-black/5 transition focus:ring-black/10"
                              >
                                <option value="">
                                  Akquise-Runde auswählen
                                </option>

                                {rounds
                                  .filter((round) => round.active !== false)
                                  .map((round) => (
                                    <option
                                      key={round.id}
                                      value={round.name}
                                    >
                                      {round.name}
                                    </option>
                                  ))}

                                <option disabled>
                                  ─────────────────────
                                </option>

                                <option value="__new_round__">
                                  ＋ Neue Akquise-Runde hinzufügen
                                </option>

                                <option value="__manage_rounds__">
                                  ⚙️ Akquise-Runden verwalten
                                </option>
                              </select>
                            </label>
                          </div>

                          {showNewRoundForm && createAcquisitionRound && (
                            <div
                              id="new-round-fields"
                              className="mt-4 rounded-xl border border-dashed border-black/10 bg-white p-4"
                            >
                              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                                <Field
                                  label="Name der neuen Akquise-Runde"
                                  name="name"
                                  placeholder="z. B. Nordsee-Tour Frühjahr 2028"
                                />

                                <button
                                  type="button"
                                  onClick={async () => {
                                    const container =
                                      document.getElementById("new-round-fields");

                                    if (!container) return;

                                    const formData = new FormData();

                                    container
                                      .querySelectorAll<
                                        | HTMLInputElement
                                        | HTMLSelectElement
                                        | HTMLTextAreaElement
                                      >(
                                        "input[name], select[name], textarea[name]"
                                      )
                                      .forEach((field) => {
                                        formData.set(field.name, field.value);
                                      });

                                    const result =
                                      await createAcquisitionRound(formData);

                                    setActionMessage(result.message);

                                    if (
                                      result.success &&
                                      result.roundName
                                    ) {
                                      const newRoundName =
                                        result.roundName;

                                      setRounds((current) => {
                                        const alreadyExists =
                                          current.some(
                                            (round) =>
                                              round.name.toLowerCase() ===
                                              newRoundName.toLowerCase()
                                          );

                                        if (alreadyExists) {
                                          return current;
                                        }

                                        return [
                                          ...current,
                                          {
                                            id: newRoundName,
                                            name: newRoundName,
                                            active: true,
                                            created_at: null,
                                          },
                                        ].sort((a, b) =>
                                          a.name.localeCompare(b.name, "de")
                                        );
                                      });

                                      setSelectedRoundName(newRoundName);
                                      setShowNewRoundForm(false);
                                    }
                                  }}
                                  className="h-12 rounded-xl bg-lime-300 px-5 text-sm font-black text-zinc-950 transition hover:-translate-y-0.5"
                                >
                                  Hinzufügen
                                </button>
                              </div>
                            </div>
                          )}

                          {showManageRounds && (
                            <div className="mt-4 rounded-xl border border-dashed border-black/10 bg-white p-4">
                              <div className="mb-3">
                                <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
                                  Akquise-Runden verwalten
                                </p>
                                <p className="mt-1 text-sm font-semibold text-zinc-500">
                                  Nicht verwendete Runden werden gelöscht. Bereits verwendete Runden werden deaktiviert und bleiben in alten Vorgängen erhalten.
                                </p>
                              </div>

                              <div className="space-y-2">
                                {rounds.filter((round) => round.active !== false).length === 0 ? (
                                  <div className="rounded-xl bg-[#fbf7ef] px-4 py-4 text-sm font-semibold text-zinc-400">
                                    Noch keine Akquise-Runden vorhanden.
                                  </div>
                                ) : (
                                  rounds
                                    .filter((round) => round.active !== false)
                                    .map((round) => (
                                      <div
                                        key={round.id}
                                        className="flex items-center justify-between gap-3 rounded-xl bg-[#fbf7ef] px-4 py-3"
                                      >
                                        <span className="min-w-0 truncate text-sm font-black text-zinc-800">
                                          {round.name}
                                        </span>

                                        {removeAcquisitionRound ? (
                                          <button
                                            type="button"
                                            onClick={async () => {
                                              const confirmed = window.confirm(
                                                `Akquise-Runde „${round.name}“ wirklich entfernen?`
                                              );

                                              if (!confirmed) return;

                                              const formData = new FormData();
                                              formData.set("round_name", round.name);
                                              formData.set("venue_id", venue.id);

                                              const result =
                                                await removeAcquisitionRound(formData);

                                              setActionMessage(result.message);

                                              if (result.success) {
                                                setRounds((current) =>
                                                  current.filter(
                                                    (item) => item.name !== round.name
                                                  )
                                                );

                                                if (selectedRoundName === round.name) {
                                                  setSelectedRoundName("");
                                                }
                                              }
                                            }}
                                            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm shadow-sm ring-1 ring-black/5 transition hover:bg-red-50"
                                            title="Akquise-Runde entfernen"
                                          >
                                            🗑️
                                          </button>
                                        ) : (
                                          <span className="text-xs font-bold text-zinc-400">
                                            Löschen nicht verfügbar
                                          </span>
                                        )}
                                      </div>
                                    ))
                                )}
                              </div>

                              <div className="mt-4 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowManageRounds(false);
                                    setSelectedRoundName("");
                                  }}
                                  className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-black text-zinc-600 transition hover:bg-zinc-50"
                                >
                                  Fertig
                                </button>
                              </div>
                            </div>
                          )}

                          {!showNewRoundForm && !showManageRounds && (
                            <div className="mt-4 flex justify-end">
                              <button
                                type="button"
                                disabled={!selectedRoundName}
                                onClick={async () => {
                                  if (!selectedRoundName) {
                                    setActionMessage(
                                      "Bitte zuerst eine Akquise-Runde auswählen."
                                    );
                                    return;
                                  }

                                  const formData = new FormData();
                                  formData.set("round_name", selectedRoundName);

                                  const result =
                                    await createAcquisition(formData);

                                  setActionMessage(result.message);

                                  if (result.success) {
                                    setShowNewAcquisitionForm(false);
                                    setSelectedRoundName("");
                                  }
                                }}
                                className="rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-black text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-y-0"
                              >
                                Akquise starten
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  {activeAcquisition && (
                    <div>
                      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
                        Aktuell
                      </p>

                      <div className="rounded-2xl bg-[#fbf7ef] p-5 ring-1 ring-black/5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-lg font-black text-zinc-950">
                                {activeAcquisition.program || "Programm offen"}
                              </span>
                              <AcquisitionStatus status={activeAcquisition.status} />
                            </div>

                            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-zinc-600">
                              <span>
                                📅 WVL{" "}
                                <strong className="font-black">
                                  {formatAcquisitionDate(
                                    activeAcquisition.next_follow_up_at
                                  )}
                                </strong>
                              </span>

                              <span>
                                Letzter Kontakt{" "}
                                <strong className="font-black">
                                  {formatAcquisitionDate(
                                    activeAcquisition.last_contact_at
                                  )}
                                </strong>
                              </span>
                            </div>

                            {activeAcquisition.next_step && (
                              <p className="mt-3 text-sm font-semibold text-zinc-700">
                                → {activeAcquisition.next_step}
                              </p>
                            )}
                          </div>

                          <Link
                            href={`/admin/acquisition/${activeAcquisition.id}`}
                            className="shrink-0 text-sm font-black text-zinc-500 transition hover:text-zinc-950"
                          >
                            Vorgang öffnen →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
                      {activeAcquisition ? "Vorgänge" : "Bisherige Vorgänge"}
                    </p>

                    <div className="space-y-2">
                      {acquisition.map((item) => {
                        const activities = acquisitionActivities.filter(
                          (activity) => activity.acquisition_id === item.id
                        );
                        const isOpen = openAcquisitionId === item.id;
                        const isCurrent = activeAcquisition?.id === item.id;

                        return (
                          <section
                            key={item.id}
                            className="overflow-hidden rounded-2xl border border-black/10 bg-white"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setOpenAcquisitionId(isOpen ? null : item.id)
                              }
                              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-[#fbf7ef]"
                              aria-expanded={isOpen}
                            >
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-black text-zinc-950">
                                    {item.program || "Programm offen"}
                                  </span>

                                  <AcquisitionStatus status={item.status} />

                                  {isCurrent && (
                                    <span className="rounded-full bg-lime-200 px-2.5 py-1 text-xs font-black text-lime-900">
                                      Aktuell
                                    </span>
                                  )}

                                  {item.archived_at && (
                                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-black text-zinc-500">
                                      Archiv
                                    </span>
                                  )}
                                </div>

                                <p className="mt-1 text-xs font-semibold text-zinc-400">
                                  {activities.length}{" "}
                                  {activities.length === 1 ? "Eintrag" : "Einträge"}
                                  {item.created_at
                                    ? ` · gestartet ${formatAcquisitionDate(
                                        item.created_at.slice(0, 10)
                                      )}`
                                    : ""}
                                </p>
                              </div>

                              <span className="shrink-0 text-xl font-black text-zinc-400">
                                {isOpen ? "⌃" : "⌄"}
                              </span>
                            </button>

                            {isOpen && (
                              <div className="border-t border-black/5">
                                {activities.length === 0 ? (
                                  <div className="px-5 py-5 text-sm font-semibold text-zinc-400">
                                    Für diesen Vorgang gibt es noch keine Verlaufseinträge.
                                  </div>
                                ) : (
                                  <div className="divide-y divide-black/5">
                                    {activities.map((activity) => (
                                      <div
                                        key={activity.id}
                                        className="grid gap-3 px-5 py-4 md:grid-cols-[110px_135px_minmax(0,1fr)_190px] md:items-start"
                                      >
                                        <div className="text-sm font-black text-zinc-700">
                                          {formatAcquisitionDate(
                                            activity.activity_date
                                          )}
                                        </div>

                                        <div className="flex items-center gap-2 text-sm font-black text-zinc-700">
                                          <span>
                                            {activityIcon(
                                              activity.activity_type,
                                              activity.channel
                                            )}
                                          </span>
                                          <span>
                                            {activity.activity_type || "Kontakt"}
                                          </span>
                                        </div>

                                        <div className="min-w-0">
                                          <p className="text-sm font-semibold leading-6 text-zinc-700">
                                            {activity.note ||
                                              activity.response ||
                                              "—"}
                                          </p>

                                          {activity.response && activity.note && (
                                            <p className="mt-1 text-sm font-semibold text-zinc-500">
                                              {activity.response}
                                            </p>
                                          )}

                                          {activity.channel && (
                                            <p className="mt-1 text-xs font-bold text-zinc-400">
                                              via {activity.channel}
                                            </p>
                                          )}
                                        </div>

                                        <div className="flex items-start justify-between gap-3">
                                          <div className="space-y-1 text-xs font-black">
                                            {activity.next_step && (
                                              <p className="text-zinc-600">
                                                → {activity.next_step}
                                              </p>
                                            )}

                                            {activity.follow_up_at && (
                                              <p className="text-amber-700">
                                                📅 WVL{" "}
                                                {formatAcquisitionDate(
                                                  activity.follow_up_at
                                                )}
                                              </p>
                                            )}
                                          </div>

                                          {deleteActivity && (
                                            <button
                                              type="button"
                                              title="Kontakteintrag löschen"
                                              onClick={async () => {
                                                const confirmed = window.confirm(
                                                  "Diesen Kontakteintrag wirklich löschen?"
                                                );

                                                if (!confirmed) return;

                                                const formData = new FormData();
                                                formData.set(
                                                  "acquisition_id",
                                                  item.id
                                                );
                                                formData.set(
                                                  "activity_id",
                                                  activity.id
                                                );
                                                formData.set(
                                                  "venue_id",
                                                  venue.id
                                                );

                                                const result =
                                                  await deleteActivity(formData);

                                                setActionMessage(result.message);
                                              }}
                                              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm shadow-sm ring-1 ring-black/5 transition hover:bg-red-50"
                                            >
                                              🗑️
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 bg-[#fbf7ef] px-5 py-3">
                                  <Link
                                    href={`/admin/acquisition/${item.id}`}
                                    className="text-sm font-black text-zinc-500 transition hover:text-zinc-950"
                                  >
                                    Vorgang öffnen →
                                  </Link>

                                  {deleteAcquisition && (
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        const confirmed = window.confirm(
                                          "Diese Akquise inklusive aller Kontakteinträge wirklich löschen?"
                                        );

                                        if (!confirmed) return;

                                        const formData = new FormData();
                                        formData.set("acquisition_id", item.id);

                                        const result =
                                          await deleteAcquisition(formData);

                                        setActionMessage(result.message);

                                        if (result.success) {
                                          setOpenAcquisitionId(null);
                                          setShowActivityForm(false);
                                        }
                                      }}
                                      className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-black text-red-700 transition hover:bg-red-100"
                                    >
                                      🗑 Akquise löschen
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </section>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </Card>
            </div>
          )}

          {/* SHOWS */}

          {!isNew && (
            <Card
              title="Shows an dieser Location"
              icon="🎟️"
              description={
                shows.length === 0
                  ? "Noch keine Show mit dieser Location verknüpft."
                  : `${shows.length} ${
                      shows.length === 1
                        ? "Show"
                        : "Shows"
                    } mit dieser Location verknüpft.`
              }
              action={
                <Link
                  href="/admin/shows"
                  className="inline-flex items-center justify-center rounded-full bg-lime-300 px-4 py-2.5 text-sm font-black text-zinc-950 transition hover:-translate-y-0.5"
                >
                  + Neue Show-Akte
                </Link>
              }
            >
              {shows.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-black/10 bg-[#fbf7ef] px-5 py-8 text-center text-sm font-semibold text-zinc-400">
                  Für diese Location gibt
                  es aktuell keine
                  verknüpfte Show.
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-black/10">
                  <div className="divide-y divide-black/5">

                    {shows.map((show) => {
                      return (
                        <Link
                          key={show.id}
                          href={`/admin/shows/${show.id}`}
                          className="flex flex-col gap-3 bg-white px-5 py-4 transition hover:bg-zinc-50 md:flex-row md:items-center md:justify-between"
                        >
                          <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-black text-zinc-950">
                                {formatShowDate(
                                  show.show_date
                                )}
                              </span>

                              {show.start_time && (
                                <span className="text-sm font-semibold text-zinc-400">
                                  ·{" "}
                                  {formatShowTime(
                                    show.start_time
                                  )}
                                </span>
                              )}

                              <ShowStatus
                                status={
                                  show.internal_status
                                }
                              />
                            </div>

                            {show.program && (
                              <div className="mt-1 text-sm font-semibold text-zinc-600">
                                {show.program}
                              </div>
                            )}
                          </div>

                          <span className="shrink-0 text-sm font-black text-zinc-400 transition group-hover:text-zinc-950">
                            Show öffnen →
                          </span>
                        </Link>
                      );
                    })}

                  </div>
                </div>
              )}
            </Card>
          )}

          {/* KOORDINATEN */}

          {!isNew && (
            <Card
              title="Standort"
              icon="📍"
            >
              <div className="grid gap-4 md:grid-cols-2">

                <Field
                  label="Latitude"
                  name="lat"
                  defaultValue={venue.lat}
                />

                <Field
                  label="Longitude"
                  name="lng"
                  defaultValue={venue.lng}
                />

              </div>
            </Card>
          )}

          {/* NOTIZEN */}

          <Card
            title="Notizen"
            icon="📝"
          >
            <div className="grid gap-4 xl:grid-cols-2">

              <Textarea
                label="Interne Notiz"
                name="internal_notes"
                defaultValue={
                  venue.internal_notes
                }
              />

              <Textarea
                label="Besonderheiten"
                name="special_notes"
                defaultValue={
                  venue.special_notes
                }
              />

            </div>
          </Card>

          {/* SOCIAL */}

          <Card
            title="Online"
            icon="🌐"
          >
            <div className="grid gap-4 md:grid-cols-2">

              <Field
                label="Instagram"
                name="instagram_url"
                defaultValue={
                  venue.instagram_url
                }
              />

              <Field
                label="Facebook"
                name="facebook_url"
                defaultValue={
                  venue.facebook_url
                }
              />

              <Field
                label="Logo URL"
                name="logo_url"
                defaultValue={
                  venue.logo_url
                }
                className="md:col-span-2"
              />

            </div>
          </Card>

          {/* SAVE BAR */}

          <div className="sticky bottom-5 z-20 flex flex-col gap-3 rounded-[1.5rem] bg-zinc-950 px-5 py-4 text-white shadow-2xl sm:flex-row sm:items-center sm:justify-between">

            <div>
              {message ? (
                <p
                  className={[
                    "text-sm font-bold",
                    success
                      ? "text-lime-300"
                      : "text-red-300",
                  ].join(" ")}
                >
                  {success ? "✓ " : "⚠️ "}
                  {message}
                </p>
              ) : (
                <p className="text-sm text-white/50">
                  {isNew
                    ? "Die neue Location wird in den Stammdaten angelegt."
                    : "Änderungen werden erst mit Speichern übernommen."}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-lime-300 px-6 py-3 text-sm font-black text-zinc-950 transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-50"
            >
              {isPending
                ? "Speichert …"
                : isNew
                  ? "Location anlegen"
                  : "Änderungen speichern"}
            </button>

          </div>
        </form>
      </div>
    </main>
  );
}


// ============================================================
// CARD
// ============================================================

function Card({
  title,
  icon,
  description,
  action,
  children,
}: {
  title: string;
  icon: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.7rem] bg-white p-6 shadow-lg shadow-black/[0.03] ring-1 ring-black/5">

      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="text-2xl">
            {icon}
          </div>

          <div>
            <h2 className="text-lg font-black">
              {title}
            </h2>

            {description && (
              <p className="mt-1 text-sm text-zinc-400">
                {description}
              </p>
            )}
          </div>
        </div>

        {action && (
          <div className="shrink-0 sm:pt-0.5">
            {action}
          </div>
        )}
      </div>

      {children}

    </section>
  );
}


// ============================================================
// FIELD
// ============================================================

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
  className = "",
}: {
  label: string;
  name: string;
  defaultValue?:
    | string
    | number
    | null;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={className}>

      <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-400">
        {label}
      </span>

      <input
        name={name}
        type={type}
        defaultValue={
          defaultValue ?? ""
        }
        placeholder={placeholder}
        className="h-12 w-full rounded-xl bg-[#fbf7ef] px-4 text-sm font-semibold outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-black/10"
      />

    </label>
  );
}


// ============================================================
// SELECT
// ============================================================

function SelectField({
  label,
  name,
  defaultValue,
  options,
  className = "",
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: string[];
  className?: string;
}) {
  const safeOptions =
    defaultValue &&
    !options.includes(defaultValue)
      ? [defaultValue, ...options]
      : options;

  return (
    <label className={className}>

      <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-400">
        {label}
      </span>

      <select
        name={name}
        defaultValue={defaultValue}
        className="h-12 w-full rounded-xl bg-[#fbf7ef] px-4 text-sm font-bold outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-black/10"
      >
        {safeOptions.map(
          (option) => (
            <option
              key={
                option || "empty"
              }
              value={option}
            >
              {option || "—"}
            </option>
          )
        )}
      </select>

    </label>
  );
}


// ============================================================
// TEXTAREA
// ============================================================

function Textarea({
  label,
  name,
  defaultValue,
  className = "",
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  className?: string;
}) {
  return (
    <label className={className}>

      <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-400">
        {label}
      </span>

      <textarea
        name={name}
        defaultValue={
          defaultValue ?? ""
        }
        rows={4}
        className="w-full resize-y rounded-xl bg-[#fbf7ef] px-4 py-3 text-sm font-semibold outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-black/10"
      />

    </label>
  );
}


function activityIcon(
  type: string | null,
  channel: string | null
) {
  const normalizedType = String(type || "").toLowerCase();
  const normalizedChannel = String(channel || "").toLowerCase();

  if (normalizedType.includes("absage")) return "❌";
  if (normalizedType.includes("buchung")) return "🎉";
  if (normalizedType === "wvl") return "📅";
  if (normalizedType.includes("rückmeldung")) return "💬";
  if (normalizedType.includes("notiz")) return "📝";
  if (normalizedChannel.includes("mail")) return "✉️";
  if (normalizedChannel.includes("telefon")) return "☎️";
  if (normalizedChannel.includes("insta")) return "📱";
  if (normalizedChannel.includes("linkedin")) return "💼";
  if (normalizedChannel.includes("persön")) return "🤝";

  return "💬";
}


// ============================================================
// LOCATION-STATUS
// ============================================================

function getLocationStatus(
  shows: LocationShow[],
  acquisition: AcquisitionRecord[]
) {
  const bookedShows = shows.filter((show) => {
    const status = String(
      show.internal_status || ""
    ).toLowerCase();

    return ![
      "option",
      "abgesagt",
      "cancelled",
      "archiv",
      "archiviert",
    ].includes(status);
  });

  const optionShows = shows.filter(
    (show) =>
      String(
        show.internal_status || ""
      ).toLowerCase() === "option"
  );

  if (bookedShows.length > 0) {
    return {
      label: `🟢 Gebucht · ${bookedShows.length} ${
        bookedShows.length === 1
          ? "Show"
          : "Shows"
      }`,
      detail:
        optionShows.length > 0
          ? `Zusätzlich ${optionShows.length} ${
              optionShows.length === 1
                ? "Option"
                : "Optionen"
            }`
          : null,
      dotClass: "bg-lime-400",
    };
  }

  if (optionShows.length > 0) {
    return {
      label: `🟣 Option · ${optionShows.length} ${
        optionShows.length === 1
          ? "Termin"
          : "Termine"
      }`,
      detail: null,
      dotClass: "bg-violet-400",
    };
  }

  const activeAcquisition = acquisition.filter(
    (item) => {
      if (item.archived_at) return false;

      const status = String(
        item.status || ""
      ).toLowerCase();

      return (
        !status.includes("gebucht") &&
        !status.includes("abgesagt")
      );
    }
  );

  const interestAcquisition =
    activeAcquisition.find((item) => {
      const status = String(
        item.status || ""
      ).toLowerCase();

      return (
        status.includes("interesse") ||
        status.includes("verhandlung")
      );
    });

  if (interestAcquisition) {
    const status = String(
      interestAcquisition.status || ""
    ).toLowerCase();

    return {
      label: status.includes("verhandlung")
        ? "🟡 In Verhandlung"
        : "🟡 Interesse",
      detail:
        interestAcquisition.program ||
        null,
      dotClass: "bg-amber-400",
    };
  }

  if (activeAcquisition.length > 0) {
    return {
      label: "🟠 In Akquise",
      detail:
        activeAcquisition[0]?.program ||
        null,
      dotClass: "bg-orange-400",
    };
  }

  if (acquisition.length > 0) {
    return {
      label: "⚪ Keine offene Akquise",
      detail: "Frühere Vorgänge vorhanden",
      dotClass: "bg-zinc-300",
    };
  }

  return {
    label: "⚪ Noch keine Akquise",
    detail: null,
    dotClass: "bg-zinc-300",
  };
}


// ============================================================
// AKQUISE
// ============================================================

function todayDate() {
  const now = new Date();
  const local = new Date(
    now.getTime() - now.getTimezoneOffset() * 60_000
  );
  return local.toISOString().slice(0, 10);
}

function formatAcquisitionDate(date: string | null) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}

function AcquisitionStatus({
  status,
}: {
  status: string | null;
}) {
  const label = status || "ohne Status";
  const normalized = label.toLowerCase();

  let classes = "bg-zinc-100 text-zinc-600";

  if (normalized.includes("gebucht")) {
    classes = "bg-emerald-100 text-emerald-700";
  } else if (
    normalized.includes("interesse") ||
    normalized.includes("verhandlung")
  ) {
    classes = "bg-lime-100 text-lime-800";
  } else if (
    normalized.includes("kontakt") ||
    normalized.includes("follow-up") ||
    normalized.includes("insta")
  ) {
    classes = "bg-orange-100 text-orange-700";
  } else if (normalized.includes("abgesagt")) {
    classes = "bg-red-100 text-red-700";
  } else if (
    normalized.includes("neu") ||
    normalized.includes("vorqualifiziert")
  ) {
    classes = "bg-blue-100 text-blue-700";
  }

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-black ${classes}`}
    >
      {label}
    </span>
  );
}


// ============================================================
// SHOW DATUM
// ============================================================

function formatShowDate(
  date: string | null
) {
  if (!date) return "Datum offen";

  return new Intl.DateTimeFormat(
    "de-DE",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(
    new Date(`${date}T12:00:00`)
  );
}


// ============================================================
// SHOW UHRZEIT
// ============================================================

function formatShowTime(
  time: string | null
) {
  if (!time) return "";

  return `${time.slice(0, 5)} Uhr`;
}


// ============================================================
// SHOW STATUS
// ============================================================

function ShowStatus({
  status,
}: {
  status: string | null;
}) {
  const label =
    status || "ohne Status";

  let classes =
    "bg-zinc-100 text-zinc-600";

  if (status === "neu") {
    classes =
      "bg-blue-50 text-blue-700";
  } else if (
    status === "in_arbeit"
  ) {
    classes =
      "bg-amber-50 text-amber-700";
  } else if (
    status === "option"
  ) {
    classes =
      "bg-violet-50 text-violet-700";
  } else if (
    status === "bestätigt" ||
    status === "bestaetigt" ||
    status === "confirmed"
  ) {
    classes =
      "bg-emerald-50 text-emerald-700";
  } else if (
    status === "abgesagt" ||
    status === "cancelled"
  ) {
    classes =
      "bg-red-50 text-red-700";
  }

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-black ${classes}`}
    >
      {label.replaceAll("_", " ")}
    </span>
  );
}