"use client";

import Link from "next/link";
import {
  useState,
  useEffect,
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

type LinkedOrganizer = {
  id: string;
  name: string;
  city: string | null;
  email: string | null;
  phone: string | null;
  is_primary: boolean;
  link_notes: string | null;
};

type LinkedOrganizerAcquisition = {
  id: string;
  organizer_id: string;
  venue_id: string | null;
  organizer_name: string;
  program: string | null;
  status: string | null;
  next_follow_up_at: string | null;
  archived_at: string | null;
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
  follow_up_status_override?: string | null;
  status_after: string | null;
  interest_after: string | null;
  created_at: string | null;
};

type CrmEmail = {
  id: string;
  acquisition_id: string;
  direction: string;
  status: string;
  from_email: string | null;
  to_emails: string[] | null;
  subject: string | null;
  body_text: string | null;
  sent_at: string | null;
  follow_up_at?: string | null;
  follow_up_status_override?: string | null;
  received_at: string | null;
  created_at: string | null;
};

type AcquisitionRound = {
  id: string;
  name: string;
  active: boolean;
  created_at: string | null;
};

type MailingHistoryItem = {
  id: string;
  round_id: string | null;
  venue_id: string | null;
  email: string | null;
  sent_at: string | null;
  scheduled_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  unsubscribed_at: string | null;
  bounced_at: string | null;
  last_clicked_url: string | null;
  reaction: string | null;
  notes: string | null;
  acquisition_id: string | null;
  created_at: string | null;
  round_name: string;
};

type NewsletterSuppression = {
  email: string;
  reason: string | null;
  unsubscribed_at: string | null;
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
  "⚪ Zu prüfen",
  "🔵 Neu",
  "🟡 Angeschrieben",
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
  linkedOrganizers = [],
  linkedOrganizerAcquisitions = [],
  shows,
  acquisition = [],
  acquisitionActivities = [],
  acquisitionRounds = [],
  mailingHistory = [],
  newsletterSuppressions = [],
  addActivity,
  createAcquisition,
  createAcquisitionRound,
  deleteActivity,
  deleteAcquisition,
  removeAcquisitionRound,
  saveLocation,
  deleteLocation,
  returnTo = "/admin/locations",
  isNew = false,
  importedFromDiscover = false,
}: {
  venue: Venue;
  linkedOrganizers?: LinkedOrganizer[];
  linkedOrganizerAcquisitions?: LinkedOrganizerAcquisition[];
  shows: LocationShow[];
  acquisition?: AcquisitionRecord[];
  acquisitionActivities?: AcquisitionActivity[];
  acquisitionRounds?: AcquisitionRound[];
  mailingHistory?: MailingHistoryItem[];
  newsletterSuppressions?: NewsletterSuppression[];
  addActivity?: (formData: FormData) => Promise<ActionResult>;
  createAcquisition?: (formData: FormData) => Promise<ActionResult>;
  createAcquisitionRound?: (formData: FormData) => Promise<ActionResult>;
  deleteActivity?: (formData: FormData) => Promise<ActionResult>;
  deleteAcquisition?: (formData: FormData) => Promise<ActionResult>;
  removeAcquisitionRound?: (formData: FormData) => Promise<ActionResult>;
  saveLocation: (formData: FormData) => Promise<SaveResult>;
  deleteLocation?: () => Promise<SaveResult>;
  returnTo?: string;
  isNew?: boolean;
  importedFromDiscover?: boolean;
}) {
  const [crmEmails, setCrmEmails] = useState<CrmEmail[]>([]);
  const [mailLoading, setMailLoading] = useState(false);
  const [mailError, setMailError] = useState<string | null>(null);
  const acquisitionIds = acquisition.map((item) => item.id).join(",");

  useEffect(() => {
    const ids = acquisitionIds.split(",").filter(Boolean);
    if (isNew || ids.length === 0) {
      setCrmEmails([]);
      setMailError(null);
      return;
    }
    let cancelled = false;
    setMailLoading(true);
    setMailError(null);
    Promise.allSettled(ids.map(async (id) => {
      const response = await fetch(`/api/booking-mail/acquisition/${encodeURIComponent(id)}`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`E-Mail-Verlauf für Akquise ${id} nicht verfügbar`);
      const data = await response.json() as { emails?: Omit<CrmEmail, "acquisition_id">[] };
      return (data.emails ?? []).map((mail) => ({ ...mail, acquisition_id: id }));
    })).then((results) => {
      if (cancelled) return;
      const successful = results.filter((result): result is PromiseFulfilledResult<CrmEmail[]> => result.status === "fulfilled");
      setCrmEmails(successful.flatMap((result) => result.value));
      if (successful.length !== results.length) setMailError("Ein Teil der E-Mails konnte nicht geladen werden.");
    }).finally(() => { if (!cancelled) setMailLoading(false); });
    return () => { cancelled = true; };
  }, [acquisitionIds, isNew]);

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingLocationContacts, setEditingLocationContacts] = useState<Record<number, boolean>>({1: false, 2: false});
  const [showNewAcquisitionForm, setShowNewAcquisitionForm] = useState(false);
  const [showNewRoundForm, setShowNewRoundForm] = useState(false);
  const [showManageRounds, setShowManageRounds] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [rounds, setRounds] = useState<AcquisitionRound[]>(acquisitionRounds);
  const [selectedRoundName, setSelectedRoundName] = useState("");
  const [showImportSuccess, setShowImportSuccess] = useState(
    importedFromDiscover
  );
  const [isDeletingLocation, setIsDeletingLocation] = useState(false);
  const [deleteLocationMessage, setDeleteLocationMessage] =
    useState<string | null>(null);

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
    acquisition,
    linkedOrganizerAcquisitions
  );

  const suppressedEmailMap = new Map(
    newsletterSuppressions.map((item) => [
      String(item.email || "").trim().toLowerCase(),
      item,
    ])
  );

  const suppressedLocationEmails = [
    venue.contact_email,
    venue.contact_email_2,
    venue.booking_email,
  ]
    .map((email) => String(email || "").trim())
    .filter(Boolean)
    .filter((email, index, all) =>
      all.findIndex((candidate) => candidate.toLowerCase() === email.toLowerCase()) === index
    )
    .filter((email) => suppressedEmailMap.has(email.toLowerCase()));

  const activeAcquisition = acquisition.find((item) => {
    if (item.archived_at) return false;

    const status = String(item.status || "").toLowerCase();

    return (
      !status.includes("gebucht") &&
      !status.includes("abgesagt")
    );
  });

  // Ein neuer Akquise-Vorgang ist noch kein tatsächlicher Kontakt.
  // Historische Kontaktfelder werden nur gezeigt, wenn es noch keine Activities gibt.
  const legacyActivities = acquisition
    .filter((item) =>
      !acquisitionActivities.some((activity) => activity.acquisition_id === item.id) &&
      Boolean(item.last_contact_at || item.contact_note?.trim() || item.response?.trim())
    )
    .map((item) => ({
      id: `legacy-${item.id}`,
      acquisition_id: item.id,
      activity_date: item.last_contact_at || "",
      activity_type: "Bisheriger Kontaktstand",
      channel: item.contact_channel,
      note: item.contact_note,
      response: item.response,
      next_step: item.next_step,
      follow_up_at: item.next_follow_up_at,
      status_after: null,
      interest_after: null,
      created_at: null,
    } as AcquisitionActivity));
  const displayedActivities = [...acquisitionActivities, ...legacyActivities];
  const contactTypes = new Set([
    "Kontakt", "Kontaktversuch", "Rückmeldung", "Telefonat", "Persönlicher Kontakt",
    "Absage", "Buchung", "Weiterleitung", "Bisheriger Kontaktstand",
  ]);
  const contactTimeline = [
    ...crmEmails.filter((mail) => mail.status === "sent" || mail.direction === "incoming").map((mail) => ({ key: `crm-email-${mail.id}`, kind: "email" as const, date: mail.sent_at || mail.created_at || "", mail, parent: acquisition.find((item) => item.id === mail.acquisition_id) })),
    ...mailingHistory.map((mailing) => ({ key: `mailing-${mailing.id}`, kind: "mailing" as const, date: mailing.sent_at || mailing.scheduled_at || mailing.created_at || "", mailing })),
    ...displayedActivities.filter((activity) => contactTypes.has(activity.activity_type || "")).map((activity) => ({ key: `activity-${activity.id}`, kind: "activity" as const, date: activity.activity_date || activity.created_at || "", activity, parent: acquisition.find((item) => item.id === activity.acquisition_id) })),
  ].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  // Nur echte persönliche Kontakte schließen eine Kontakt-WVL automatisch ab.
  // Newsletter, interne Notizen und bloße Statusänderungen zählen nicht dazu.
  const actualContactTypes = new Set(["Kontakt", "Kontaktversuch", "Rückmeldung", "Telefonat", "Persönlicher Kontakt", "Absage", "Buchung", "Weiterleitung"]);
  const contactEvents: ContactEvent[] = [
    ...acquisitionActivities.filter((a) => actualContactTypes.has(a.activity_type || "")).map((a) => ({
      acquisitionId: a.acquisition_id,
      date: a.activity_date,
      timestamp: a.created_at || `${a.activity_date}T00:00:00`,
    })),
    ...crmEmails.filter((m) => m.status === "sent" || m.direction === "incoming").map((m) => ({
      acquisitionId: m.acquisition_id,
      date: (m.sent_at || m.received_at || m.created_at || "").slice(0, 10),
      timestamp: m.sent_at || m.received_at || m.created_at || "",
    })),
  ].filter((event) => event.date);
  const acquisitionOverview = [...acquisition].sort((a, b) =>
    String(b.last_contact_at || b.created_at || "").localeCompare(String(a.last_contact_at || a.created_at || ""))
  );

  const nextAction = acquisition.filter((item) => {
    if (item.archived_at || !item.next_follow_up_at) return false;
    const status = String(item.status || "").toLowerCase();
    return !status.includes("gebucht") && !status.includes("abgesagt");
  }).sort((a, b) => String(a.next_follow_up_at).localeCompare(String(b.next_follow_up_at)))[0];

  return (
    <main className="min-h-screen bg-[#fbf7ef] px-8 py-8 text-zinc-950">
      <div className="mx-auto max-w-7xl space-y-5">

        {/* HEADER */}

        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href={returnTo}
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
              {isNew ? "Neue Spielstätte anlegen." : locationSubtitle}
            </p>
            {!isNew && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-zinc-700 ring-1 ring-black/10">{locationStatus.label}</span>
                {locationStatus.detail && <span className="text-xs font-semibold text-zinc-400">{locationStatus.detail}</span>}
              </div>
            )}
          </div>

          {!isNew && (
            <div className="flex flex-wrap gap-2">
              {venue.website && (
                <a
                  href={normalizeLocationUrl(venue.website)}
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
      label="Straße / Hausnummer"
      name="street"
      defaultValue={venue.street}
      className="md:col-span-8"
    />

    <Field
      label="PLZ"
      name="postal_code"
      defaultValue={venue.postal_code}
      className="md:col-span-3"
    />

    <Field
      label="Ort"
      name="city"
      defaultValue={venue.city}
      className="md:col-span-5"
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
      className="md:col-span-4"
    />

    <Field
      label="Website"
      name="website"
      defaultValue={venue.website}
      className="md:col-span-4"
    />

  </div>
</Card>

          {/* ANSPRECHPARTNER – kompakte Karten wie in der Organizer-Akte.
              Die Felder bleiben auch eingeklappt im DOM und werden beim
              Speichern der Stammdaten weiterhin übermittelt. */}
          <div className="grid min-w-0 gap-5 xl:grid-cols-2">
            {([1, 2] as const).map((slot) => {
              const second = slot === 2;
              const name = second ? venue.contact_name_2 : venue.contact_name;
              const role = second ? venue.contact_role_2 : venue.contact_role;
              const email = second ? venue.contact_email_2 : venue.contact_email;
              const phone = second ? venue.contact_phone_2 : venue.contact_phone;
              const editing = isNew || editingLocationContacts[slot];
              const suffix = second ? "_2" : "";
              if (second && !isNew && !name && !role && !email && !phone && !editing) {
                return (
                  <div key={slot} className="relative min-h-[180px]">
                    <button
                      type="button"
                      onClick={() => setEditingLocationContacts((current) => ({ ...current, [slot]: true }))}
                      className="flex min-h-[180px] w-full items-center justify-center rounded-[1.7rem] border border-dashed border-black/10 bg-white/50 p-6 text-sm font-black text-zinc-500 transition hover:bg-white hover:text-zinc-950"
                    >
                      + Ansprechpartner hinzufügen
                    </button>
                    <div className="hidden" aria-hidden="true">
                      <input name="contact_name_2" defaultValue="" />
                      <input name="contact_role_2" defaultValue="" />
                      <input name="contact_email_2" defaultValue="" />
                      <input name="contact_phone_2" defaultValue="" />
                    </div>
                  </div>
                );
              }
              return (
                <Card
                  key={slot}
                  title={name || (second ? "Weiterer Ansprechpartner" : "Hauptansprechpartner")}
                  icon="👤"
                  action={!isNew ? (
                    <button type="button"
                      onClick={() => setEditingLocationContacts((current) => ({...current, [slot]: !current[slot]}))}
                      aria-expanded={Boolean(editing)}
                      className="rounded-full bg-[#fbf7ef] px-3 py-2 text-xs font-black text-zinc-700 transition hover:bg-lime-100"
                    >{editing ? "Schließen" : "✏️ Bearbeiten"}</button>
                  ) : undefined}
                >
                  {!editing && (
                    <div className="space-y-2 text-sm">
                      {role && <p className="font-semibold text-zinc-500">{role}</p>}
                      {email && <a className="block break-all font-semibold text-zinc-700 hover:text-blue-700" href={`mailto:${email}`}>✉️ {email}</a>}
                      {phone && <a className="block font-semibold text-zinc-700 hover:text-blue-700" href={`tel:${phone}`}>📞 {phone}</a>}
                      {!name && !role && !email && !phone && <p className="text-zinc-400">Noch kein Ansprechpartner hinterlegt.</p>}
                    </div>
                  )}
                  <div className={editing ? "grid gap-4 md:grid-cols-2" : "hidden"}>
                    <Field label="Name" name={`contact_name${suffix}`} defaultValue={name} className="md:col-span-2" />
                    <Field label="Funktion" name={`contact_role${suffix}`} defaultValue={role} className="md:col-span-2" />
                    <Field label="E-Mail" name={`contact_email${suffix}`} type="email" defaultValue={email} />
                    <Field label="Telefon" name={`contact_phone${suffix}`} defaultValue={phone} />
                    {!isNew && <p className="md:col-span-2 text-xs font-semibold text-zinc-400">Änderungen unten über „Änderungen speichern“ übernehmen.</p>}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* AKQUISE */}

          {!isNew && (
            <div id="location-acquisition" className="scroll-mt-5">
            <Card
              title="Kontakt & Akquise"
              icon="🎯"
              description="Direkte Kontakte und Akquise-Vorgänge dieser Spielstätte. Vorgänge externer Veranstalter werden in deren Akten gepflegt."
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
              {acquisition.length === 0 && mailingHistory.length === 0 && !showNewAcquisitionForm ? (
                <div className="rounded-2xl border border-dashed border-black/10 bg-[#fbf7ef] px-5 py-8 text-center">
                  <p className="text-sm font-black text-zinc-700">
                    Noch keine Kontakte oder Akquise für diese Location.
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
                              {selectedRoundName ? (
                                <Link
                                  href={`/admin/acquisition/new?venue=${venue.id}&round=${
                                    rounds.find((round) => round.name === selectedRoundName)?.id || ""
                                  }`}
                                  className="rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-black text-white transition hover:-translate-y-0.5"
                                >
                                  Akquise starten →
                                </Link>
                              ) : (
                                <button
                                  type="button"
                                  disabled
                                  className="rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-black text-white opacity-30"
                                >
                                  Akquise starten →
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  <div className="min-w-0">
                    <div className="mt-5 max-h-[560px] min-h-[180px] overflow-y-auto bg-white pr-1">
                      {mailLoading && <p className="py-3 text-xs font-semibold text-zinc-500">E-Mails werden geladen …</p>}
                      {mailError && <p className="py-3 text-xs font-semibold text-amber-700">{mailError}</p>}
                      {contactTimeline.length === 0 && !mailLoading && <p className="py-6 text-sm font-semibold text-zinc-500">Noch keine Kontakte, E-Mails oder Newsletter dokumentiert.</p>}
                      {contactTimeline.map((entry, index) => (
                        <div key={entry.key} className="grid grid-cols-[18px_minmax(0,1fr)] gap-3">
                          <div className="flex flex-col items-center pt-[19px]">
                            <span className={`h-3 w-3 shrink-0 rounded-full ring-2 ring-white ${entry.kind === "mailing" ? "bg-violet-500" : entry.kind === "email" ? "bg-lime-400" : ["bg-lime-400", "bg-blue-700", "bg-red-500", "bg-zinc-400"][index % 4]}`} />
                            {index < contactTimeline.length - 1 && <span className="mt-2 min-h-5 w-px flex-1 border-l border-dashed border-zinc-300" />}
                          </div>
                          <div className="min-w-0 border-b border-zinc-200">
                            {entry.kind === "email" ? (
                              <LocationEmailRow mail={entry.mail} parent={entry.parent} contactEvents={contactEvents} />
                            ) : entry.kind === "mailing" ? (
                              <LocationMailingRow mailing={entry.mailing} />
                            ) : (
                              <LocationActivityRow activity={entry.activity} parent={entry.parent} contactEvents={contactEvents} deleteActivity={deleteActivity} setActionMessage={setActionMessage} />
                            )}
                          </div>
                        </div>
                      ))}
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

    {venue.booking_email &&
      suppressedEmailMap.has(String(venue.booking_email).trim().toLowerCase()) && (() => {
        const suppression = suppressedEmailMap.get(
          String(venue.booking_email).trim().toLowerCase()
        );

        return (
          <div className="md:col-span-6 -mt-2 flex items-center gap-2 px-1 text-xs font-bold text-red-600">
            <span>🚫 Newsletter abgemeldet</span>
            {suppression?.unsubscribed_at && (
              <span className="font-semibold text-zinc-400">
                · {formatDateTime(suppression.unsubscribed_at)}
              </span>
            )}
          </div>
        );
      })()}

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

          {/* VERANSTALTER-VERKNÜPFUNGEN: keine doppelten Kontaktdaten */}
          {!isNew && (
            <Card
              title="Zuständige Veranstalter"
              icon="🤝"
              description="Diese Veranstalter sind mit der Spielstätte verknüpft. Ihre Kontakte werden ausschließlich in den jeweiligen Veranstalter- und Akquise-Akten gepflegt."
            >
              {linkedOrganizers.length === 0 ? (
                <p className="rounded-xl bg-[#fbf7ef] px-4 py-4 text-sm font-semibold text-zinc-500">
                  Kein separater Veranstalter verknüpft. Wenn die Location selbst bucht, kannst du unten direkt eine Location-Akquise führen.
                </p>
              ) : (
                <div className="space-y-3">
                  {linkedOrganizers.map((organizer) => {
                    const related = linkedOrganizerAcquisitions.filter(
                      (item) => item.organizer_id === organizer.id
                    );
                    return (
                      <div key={organizer.id} className="rounded-2xl border border-black/10 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-black">{organizer.name} {organizer.is_primary ? "· Hauptveranstalter" : ""}</p>
                            {organizer.city && <p className="text-sm text-zinc-500">{organizer.city}</p>}
                            {organizer.link_notes && <p className="mt-1 text-sm text-zinc-600">{organizer.link_notes}</p>}
                          </div>
                          <Link href={`/admin/organizers/${organizer.id}`} className="text-sm font-black underline underline-offset-4">
                            Veranstalter öffnen →
                          </Link>
                        </div>
                        {related.length > 0 && (
                          <div className="mt-3 space-y-2 border-t border-black/5 pt-3">
                            {related.map((item) => (
                              <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                                <div>
                                  <span className="font-bold">{item.program || "Akquise"}</span>
                                  <span className="ml-2 text-zinc-500">{item.status || "Ohne Status"}</span>
                                  {!item.venue_id && (
                                    <span className="ml-2 text-xs text-amber-700">Spielstätte nicht fest zugeordnet</span>
                                  )}
                                </div>
                                <Link href={`/admin/acquisition/${item.id}`} className="font-bold underline underline-offset-4">
                                  Vorgang öffnen →
                                </Link>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
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

          {/* LOCATION LÖSCHEN */}

          {!isNew && deleteLocation && (
            <section className="rounded-[1.7rem] border border-red-200 bg-red-50 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black text-red-800">
                    Location löschen
                  </p>
                  <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-red-700/70">
                    Nur für versehentlich oder doppelt angelegte Locations.
                    Locations mit Shows, Akquise-Vorgängen oder Mailings werden
                    nicht gelöscht.
                  </p>

                  {deleteLocationMessage && (
                    <p className="mt-3 text-sm font-black text-red-800">
                      ⚠️ {deleteLocationMessage}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  disabled={isDeletingLocation}
                  onClick={async () => {
                    const confirmed = window.confirm(
                      `Location „${venue.name}“ wirklich löschen?\n\nDiese Aktion kann nicht rückgängig gemacht werden.`
                    );

                    if (!confirmed) return;

                    setDeleteLocationMessage(null);
                    setIsDeletingLocation(true);

                    try {
                      const result = await deleteLocation();

                      if (!result.success) {
                        setDeleteLocationMessage(result.message);
                      }
                    } catch (error) {
                      // Ein erfolgreicher redirect() der Server Action wird von
                      // Next.js intern als Redirect behandelt. Nur echte Fehler
                      // sollen hier als Meldung erscheinen.
                      if (
                        error instanceof Error &&
                        !error.message.includes("NEXT_REDIRECT")
                      ) {
                        setDeleteLocationMessage(error.message);
                      }
                    } finally {
                      setIsDeletingLocation(false);
                    }
                  }}
                  className="shrink-0 rounded-full border border-red-200 bg-white px-5 py-2.5 text-sm font-black text-red-700 transition hover:bg-red-100 disabled:cursor-wait disabled:opacity-50"
                >
                  {isDeletingLocation
                    ? "Löscht …"
                    : "🗑 Location löschen"}
                </button>
              </div>
            </section>
          )}

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

type ContactEvent = { acquisitionId: string; date: string; timestamp: string };

function followUpState(
  dueDate: string | null | undefined,
  override: string | null | undefined,
  acquisitionId: string,
  originDate: string,
  originTimestamp: string,
  contactEvents: ContactEvent[]
) {
  if (!dueDate) return null;
  const next = contactEvents
    .filter((event) => event.acquisitionId === acquisitionId &&
      (event.date > originDate || (event.date === originDate && event.timestamp > originTimestamp)))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))[0];
  const done = override === "done" || (override !== "open" && Boolean(next));
  return { dueDate, done, completedDate: next?.date || null };
}

function FollowUpLabel({ state }: { state: ReturnType<typeof followUpState> }) {
  if (!state) return null;
  return (
    <span className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-black ${state.done ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
      {state.done ? `✓ Erledigt${state.completedDate ? ` am ${formatAcquisitionDate(state.completedDate)}` : ""}` : `WVL ${formatAcquisitionDate(state.dueDate)}`}
    </span>
  );
}

function formatTimelineTime(value: string | null | undefined) {
  if (!value || !value.includes("T")) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit" }).format(parsed);
}

function TimelineLine({ date, timestamp, icon, title, label, status, children }: {
  date: string | null; timestamp?: string | null; icon: string; title: string; label?: string;
  status?: ReactNode; children?: ReactNode;
}) {
  return (
    <details className="group min-w-0 py-4">
      <summary className="flex w-full min-w-0 cursor-pointer list-none items-center gap-3 rounded-lg py-1 text-left hover:bg-zinc-50 [&::-webkit-details-marker]:hidden">
        <span className="w-[82px] shrink-0 text-xs font-bold text-zinc-700">
          {formatAcquisitionDate(date)}
          {formatTimelineTime(timestamp) && <span className="mt-1 block font-medium text-zinc-400">{formatTimelineTime(timestamp)}</span>}
        </span>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-800">
          <span className="text-lg leading-none">{icon}</span>
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-bold text-zinc-900" title={title}>{title}</span>
        {status && <span className="hidden shrink-0 items-center gap-1 sm:flex">{status}</span>}
        <span className="shrink-0 text-zinc-500 group-open:hidden">⌄</span>
        <span className="hidden shrink-0 text-zinc-500 group-open:inline">⌃</span>
      </summary>
      <div className="mt-3 space-y-2 rounded-xl bg-[#fffdf8] p-4 text-sm text-zinc-700">
        {label && <p className="text-xs font-semibold text-zinc-500">{label}</p>}
        {children}
        {status && <div className="flex flex-wrap gap-1 sm:hidden">{status}</div>}
      </div>
    </details>
  );
}

function LocationEmailRow({ mail, parent, contactEvents }: { mail: CrmEmail; parent?: AcquisitionRecord; contactEvents: ContactEvent[] }) {
  const stamp = mail.sent_at || mail.received_at || mail.created_at || "";
  const date = stamp.slice(0, 10);
  const outgoing = mail.direction !== "incoming";
  const followUp = followUpState(mail.follow_up_at, mail.follow_up_status_override, mail.acquisition_id, date, stamp, contactEvents);
  return (
    <TimelineLine date={date} timestamp={stamp} icon={outgoing ? "✉️" : "📩"} title={mail.subject || "Ohne Betreff"}
      label={`${outgoing ? "E-Mail gesendet" : "E-Mail empfangen"}${parent?.program ? ` · ${parent.program}` : ""}`}
      status={<FollowUpLabel state={followUp} />}>
      <p className="break-all text-xs font-semibold text-zinc-500">{outgoing ? "An" : "Von"}: {outgoing ? (mail.to_emails ?? []).join(", ") || "—" : mail.from_email || "—"}</p>
      <p className="mt-2 whitespace-pre-wrap break-words leading-6">{mail.body_text || "Kein Nachrichtentext vorhanden."}</p>
      {parent && <Link href={`/admin/acquisition/${parent.id}`} className="mt-3 inline-block text-xs font-black text-blue-700">Akquise öffnen →</Link>}
    </TimelineLine>
  );
}

function LocationMailingRow({ mailing }: { mailing: MailingHistoryItem }) {
  const date = (mailing.sent_at || mailing.scheduled_at || mailing.created_at || "").slice(0, 10);
  return (
    <TimelineLine date={date} timestamp={mailing.sent_at || mailing.scheduled_at || mailing.created_at} icon="📨" title={mailing.round_name || "Newsletter"} label="Newsletter"
      status={<span className="flex flex-wrap gap-1">
        {mailing.opened_at && <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-black text-blue-700">👁 Geöffnet</span>}
        {mailing.clicked_at && <span className="rounded-md bg-lime-50 px-2 py-1 text-[10px] font-black text-lime-800">🔗 Geklickt</span>}
        {mailing.unsubscribed_at && <span className="rounded-md bg-red-50 px-2 py-1 text-[10px] font-black text-red-700">🚫 Abgemeldet</span>}
        {mailing.bounced_at && <span className="rounded-md bg-amber-50 px-2 py-1 text-[10px] font-black text-amber-700">⚠️ Unzustellbar</span>}
      </span>}>
      {mailing.email && <p className="break-all text-xs font-semibold text-zinc-500">An: {mailing.email}</p>}
      {mailing.sent_at && <p className="mt-2">Versendet: {formatDateTime(mailing.sent_at)}</p>}
      {mailing.opened_at && <p>Geöffnet: {formatDateTime(mailing.opened_at)}</p>}
      {mailing.clicked_at && <p>Geklickt: {formatDateTime(mailing.clicked_at)}</p>}
      {mailing.last_clicked_url && <p className="break-all">Link: <a className="text-blue-700 underline" href={normalizeLocationUrl(mailing.last_clicked_url)} target="_blank" rel="noreferrer">{mailing.last_clicked_url}</a></p>}
      {mailing.unsubscribed_at && <p>Abgemeldet: {formatDateTime(mailing.unsubscribed_at)}</p>}
      {mailing.bounced_at && <p>Unzustellbar: {formatDateTime(mailing.bounced_at)}</p>}
      {mailing.reaction && <p className="mt-2">Reaktion: {mailing.reaction}</p>}
      {mailing.notes && <p className="mt-2 whitespace-pre-wrap">{mailing.notes}</p>}
      {mailing.acquisition_id && <Link href={`/admin/acquisition/${mailing.acquisition_id}`} className="mt-3 inline-block text-xs font-black text-blue-700">Akquise öffnen →</Link>}
    </TimelineLine>
  );
}

function LocationActivityRow({ activity, parent, contactEvents, deleteActivity, setActionMessage }: {
  activity: AcquisitionActivity; parent?: AcquisitionRecord; contactEvents: ContactEvent[];
  deleteActivity?: (formData: FormData) => Promise<ActionResult>;
  setActionMessage: (message: string | null) => void;
}) {
  const legacy = activity.id.startsWith("legacy-");
  const stamp = activity.created_at || `${activity.activity_date}T23:59:59`;
  const followUp = followUpState(activity.follow_up_at, activity.follow_up_status_override, activity.acquisition_id, activity.activity_date, stamp, contactEvents);
  return (
    <TimelineLine date={activity.activity_date} timestamp={activity.created_at} icon={activityIcon(activity.activity_type, activity.channel)}
      title={activity.note?.split("\n")[0] || activity.activity_type || "Kontakt"}
      label={[activity.activity_type, activity.channel && `via ${activity.channel}`, parent?.program].filter(Boolean).join(" · ")}
      status={<FollowUpLabel state={followUp} />}>
      {activity.note && <p className="whitespace-pre-wrap break-words">{activity.note}</p>}
      {activity.response && <p className="mt-2 whitespace-pre-wrap break-words"><strong>Rückmeldung:</strong> {activity.response}</p>}
      {activity.next_step && <p className="mt-2"><strong>Nächster Schritt:</strong> {activity.next_step}</p>}
      {activity.status_after && <p className="mt-2">Status: {activity.status_after}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {parent && <Link href={`/admin/acquisition/${parent.id}`} className="text-xs font-black text-blue-700">Akquise öffnen →</Link>}
        {!legacy && deleteActivity && parent && <button type="button" className="text-xs font-black text-red-600" onClick={async () => {
          if (!window.confirm("Diesen Kontakteintrag wirklich löschen?")) return;
          const formData = new FormData();
          formData.set("activity_id", activity.id);
          formData.set("acquisition_id", parent.id);
          const result = await deleteActivity(formData);
          setActionMessage(result.message);
        }}>🗑️ Eintrag löschen</button>}
      </div>
    </TimelineLine>
  );
}

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
  acquisition: AcquisitionRecord[],
  linkedOrganizerAcquisitions: LinkedOrganizerAcquisition[] = []
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

  // Standortstatus berücksichtigt auch die Akquisen verknüpfter Veranstalter.
  // Diese werden hier nur ausgewertet – nicht als Location-Akquise dupliziert.
  const allAcquisition = [
    ...acquisition,
    ...linkedOrganizerAcquisitions.filter(
      (item) => !acquisition.some((existing) => existing.id === item.id)
    ),
  ];

  const normalize = (value: string | null | undefined) =>
    String(value || "").trim().toLocaleLowerCase("de-DE");

  const isBooked = (status: string) =>
    status.includes("gebucht") || status.includes("buchung");
  const isRejected = (status: string) =>
    status.includes("abgesagt") || status.includes("absage") ||
    status.includes("abgelehnt") || status.includes("kein interesse");
  const isInterested = (status: string) =>
    (status.includes("interesse") && !status.includes("kein interesse")) ||
    status.includes("interessiert") || status.includes("verhandlung") ||
    status.includes("angebot");
  const isWaiting = (status: string) =>
    status.includes("rückmeldung") || status.includes("kontaktiert") ||
    status.includes("angeschrieben") || status.includes("nachgefasst") ||
    status.includes("warte") || status.includes("offen");

  // Mehrere Vorgänge dürfen nicht zu einem einzigen vermeintlichen
  // Veranstalterstatus verschmolzen werden. Hier nur die Chancen aggregieren.
  const current = allAcquisition.filter((item) => !item.archived_at);
  const evaluated = current.length > 0 ? current : allAcquisition;
  const counts = { booked: 0, interested: 0, waiting: 0, rejected: 0, other: 0 };

  for (const item of evaluated) {
    const status = normalize(item.status);
    if (isBooked(status)) counts.booked++;
    else if (isRejected(status)) counts.rejected++;
    else if (isInterested(status)) counts.interested++;
    else if (isWaiting(status)) counts.waiting++;
    else counts.other++;
  }

  const total = evaluated.length;
  const plural = (count: number) => `${count} ${count === 1 ? "Vorgang" : "Vorgänge"}`;
  const parts = [
    counts.booked && `${counts.booked} gebucht`,
    counts.interested && `${counts.interested} mit Interesse`,
    counts.waiting && `${counts.waiting} Rückmeldung offen`,
    counts.rejected && `${counts.rejected} abgesagt`,
    counts.other && `${counts.other} weiterer Status`,
  ].filter(Boolean).join(" · ");

  if (counts.booked > 0) {
    return { label: "🟢 Buchung vorhanden", detail: parts, dotClass: "bg-lime-400" };
  }
  if (counts.interested > 0) {
    return { label: "🟡 Interesse vorhanden", detail: parts, dotClass: "bg-amber-400" };
  }
  if (counts.waiting > 0) {
    return { label: "🟠 Rückmeldung offen", detail: parts, dotClass: "bg-orange-400" };
  }
  if (counts.other > 0) {
    return { label: "🟠 In Akquise", detail: parts, dotClass: "bg-orange-400" };
  }
  if (total > 0 && counts.rejected === total) {
    return {
      label: `🔴 ${total === 1 ? "Akquise abgesagt" : "Alle Akquisen abgesagt"}`,
      detail: `${plural(total)} · alle abgesagt`,
      dotClass: "bg-red-400",
    };
  }
  if (allAcquisition.length > 0) {
    return { label: "⚪ Keine offene Akquise", detail: parts || `${plural(allAcquisition.length)} vorhanden`, dotClass: "bg-zinc-300" };
  }
  return { label: "⚪ Noch keine Akquise", detail: null, dotClass: "bg-zinc-300" };
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

function formatDateTime(date: string | null) {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
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
function normalizeLocationUrl(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}
