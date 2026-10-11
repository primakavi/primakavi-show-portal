"use client";

import Link from "next/link";
import {
  useMemo,
  useEffect,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";

// ============================================================
// TYPES
// ============================================================

type Organizer = {
  id: string;
  name: string;
  organizer_type: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  street: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  relationship_status: string | null;
  notes: string | null;
};

type Contact = {
  id: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  is_primary: boolean;
};

type Venue = {
  id: string;
  name: string;
  street: string | null;
  postal_code: string | null;
  city: string | null;
  website: string | null;
  relationship_status: string | null;
  acquisition_relevant: boolean | null;
};

type LinkedVenue =
  Venue & {
    is_primary: boolean;
    link_notes: string | null;
  };

type OrganizerShow = {
  id: string;
  show_date: string | null;
  program: string | null;
  internal_status: string | null;
  start_time: string | null;
  venue: string | null;
  city: string | null;
};

type AcquisitionRecord = {
  id: string;
  round_id: string | null;
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
  subject: string | null;
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

type AcquisitionRound = {
  id: string;
  name: string;
  active: boolean;
  type?: string | null;
  archived_at?: string | null;
  created_at: string | null;
};

type ActionResult = {
  success: boolean;
  message: string;
  roundName?: string;
};

type ServerAction = (
  formData: FormData
) => Promise<ActionResult>;

const RELATIONSHIP_OPTIONS = [
  "",
  "⚪ Neu",
  "🟡 Angeschrieben",
  "🟠 Kontakt",
  "🟢 Bestandskontakt",
  "🔴 Nicht relevant",
];

const ORGANIZER_TYPES = [
  "",
  "Comedy-Format",
  "Comedy Club",
  "TV / Redaktion",
  "Produktionsfirma",
  "Veranstalter",
  "Festival",
  "Netzwerk / Initiative",
  "Sonstiges",
];

// ============================================================
// COMPONENT
// ============================================================

export default function OrganizerClient({
  organizer,
  contacts,
  venues,
  linkedVenues,
  shows,
  acquisition,
  acquisitionActivities,
  acquisitionRounds,
  mailingHistory = [],

  saveOrganizer,
  createShow,

  addContact,
  updateContact,
  deleteContact,

  linkVenue,
  createVenue,
  updateVenueLink,
  unlinkVenue,

  createAcquisition,
  addActivity,
  updateActivity,
  deleteActivity,
  deleteAcquisition,

  deleteOrganizer,
}: {
  organizer: Organizer;

  contacts: Contact[];

  venues: Venue[];

  linkedVenues: LinkedVenue[];

  shows: OrganizerShow[];

  acquisition: AcquisitionRecord[];

  acquisitionActivities: AcquisitionActivity[];

  acquisitionRounds: AcquisitionRound[];
  mailingHistory?: MailingHistoryItem[];

  saveOrganizer: ServerAction;

  createShow:
    (
      formData: FormData
    ) => Promise<void>;

  addContact: ServerAction;

  updateContact: ServerAction;

  deleteContact: ServerAction;

  linkVenue: ServerAction;

  createVenue: ServerAction;

  updateVenueLink: ServerAction;

  unlinkVenue: ServerAction;

  createAcquisition: ServerAction;

  addActivity: ServerAction;

  updateActivity: ServerAction;

  deleteActivity: ServerAction;

  deleteAcquisition: ServerAction;

  deleteOrganizer:
    () => Promise<void>;
}) {
  const [
    isPending,
    startTransition,
  ] = useTransition();

  const [
    message,
    setMessage,
  ] =
    useState<
      string | null
    >(null);

  const [
    success,
    setSuccess,
  ] =
    useState(false);

  const [
    editingContactId,
    setEditingContactId,
  ] =
    useState<
      string | null
    >(null);

  const [
    showNewContact,
    setShowNewContact,
  ] =
    useState(false);

  const [
    showVenueForm,
    setShowVenueForm,
  ] =
    useState(false);

  const [
    venueMode,
    setVenueMode,
  ] =
    useState<
      "search" | "new"
    >("search");

  const [
    venueSearch,
    setVenueSearch,
  ] =
    useState("");

  const [
    showActivityForm,
    setShowActivityForm,
  ] =
    useState(false);

  const [
    showNewAcquisitionForm,
    setShowNewAcquisitionForm,
  ] =
    useState(false);

  const [
    actionMessage,
    setActionMessage,
  ] =
    useState<
      string | null
    >(null);

  const [
    rounds,
    setRounds,
  ] =
    useState<
      AcquisitionRound[]
    >(
      acquisitionRounds
    );

  const [
    selectedRoundId,
    setSelectedRoundId,
  ] = useState("");

  const [
    newRoundName,
    setNewRoundName,
  ] = useState("");

  const [
    showShowMenu,
    setShowShowMenu,
  ] =
    useState(false);

  const [crmEmails, setCrmEmails] = useState<CrmEmail[]>([]);
  const [mailLoading, setMailLoading] = useState(false);
  const [mailError, setMailError] = useState<string | null>(null);
  const acquisitionIds = acquisition.map((item) => item.id).join(",");

  useEffect(() => {
    const ids = acquisitionIds.split(",").filter(Boolean);
    if (ids.length === 0) {
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
  }, [acquisitionIds]);


  // ============================================================
  // DATA
  // ============================================================

  const sortedContacts =
    [...contacts].sort(
      (a, b) => {
        if (
          a.is_primary &&
          !b.is_primary
        ) {
          return -1;
        }

        if (
          !a.is_primary &&
          b.is_primary
        ) {
          return 1;
        }

        return a.name.localeCompare(
          b.name,
          "de"
        );
      }
    );

  const linkedIds =
    useMemo(
      () =>
        new Set(
          linkedVenues.map(
            (venue) =>
              venue.id
          )
        ),
      [
        linkedVenues,
      ]
    );

  const venueResults =
    useMemo(() => {
      const needle =
        venueSearch
          .trim()
          .toLowerCase();

      if (!needle) {
        return [];
      }

      return venues
        .filter(
          (venue) =>
            !linkedIds.has(
              venue.id
            )
        )
        .filter(
          (venue) => {
            const haystack =
              [
                venue.name,
                venue.city,
              ]
                .filter(
                  Boolean
                )
                .join(
                  " "
                )
                .toLowerCase();

            return haystack.includes(
              needle
            );
          }
        )
        .slice(
          0,
          8
        );
    }, [
      venues,
      venueSearch,
      linkedIds,
    ]);

  const activeAcquisition =
    acquisition.find(
      (item) => {
        if (
          item.archived_at
        ) {
          return false;
        }

        const status =
          String(
            item.status ||
              ""
          ).toLowerCase();

        return (
          !status.includes(
            "gebucht"
          ) &&
          !status.includes(
            "abgesagt"
          ) &&
          !status.includes(
            "abgeschlossen"
          )
        );
      }
    );

  // Historische Kontaktdaten können noch direkt im Akquise-Datensatz liegen.
  // Nur übernehmen, wenn es tatsächlich Kontaktinformationen gibt; created_at
  // allein belegt keinen Kontakt. Diese Einträge sind zunächst schreibgeschützt.
  const legacyActivities: AcquisitionActivity[] = acquisition
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
      subject: null,
      note: item.contact_note,
      response: item.response,
      next_step: item.next_step,
      follow_up_at: item.next_follow_up_at,
      status_after: null,
      interest_after: null,
      created_at: null,
    }));

  const displayedActivities = [...acquisitionActivities, ...legacyActivities];
  const contactTypes = new Set([
    "Kontakt", "Kontaktversuch", "Rückmeldung", "Telefonat",
    "Persönlicher Kontakt", "Absage", "Buchung", "Weiterleitung",
    "Bisheriger Kontaktstand",
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
    String(b.last_contact_at || b.created_at || "").localeCompare(
      String(a.last_contact_at || a.created_at || "")
    )
  );

  // ============================================================
  // SAVE
  // ============================================================

  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const formData =
      new FormData(
        event.currentTarget
      );

    setMessage(null);

    startTransition(
      async () => {
        const result =
          await saveOrganizer(
            formData
          );

        setSuccess(
          result.success
        );

        setMessage(
          result.message
        );
      }
    );
  }

  return (
    <main className="min-h-screen bg-[#fbf7ef] px-8 py-8 text-zinc-950">

      <div className="mx-auto max-w-7xl space-y-5">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <Link
              href="/admin/organizers"
              className="text-sm font-bold text-zinc-400 transition hover:text-zinc-950"
            >
              ← Veranstalter
            </Link>

            <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
              primakavi · veranstalter-akte
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight">
              {organizer.name}
            </h1>

            <p className="mt-2 text-zinc-500">
              {[organizer.postal_code, organizer.city]
                .filter(Boolean)
                .join(" ") || "Veranstalter"}
            </p>

          </div>

          <div className="relative flex flex-wrap gap-2">

            {/* ============================================= */}
            {/* + SHOW */}
            {/* ============================================= */}

            {linkedVenues.length === 0 && (

              <form action={createShow}>

                <button
                  type="submit"
                  className="rounded-full bg-lime-300 px-5 py-3 text-sm font-black text-zinc-950 shadow-sm transition hover:-translate-y-0.5"
                >
                  + Show
                </button>

              </form>

            )}

            {linkedVenues.length === 1 && (

              <form action={createShow}>

                <input
                  type="hidden"
                  name="venue_id"
                  value={
                    linkedVenues[0].id
                  }
                />

                <button
                  type="submit"
                  className="rounded-full bg-lime-300 px-5 py-3 text-sm font-black text-zinc-950 shadow-sm transition hover:-translate-y-0.5"
                >
                  + Show
                </button>

              </form>

            )}

            {linkedVenues.length > 1 && (

              <div className="relative">

                <button
                  type="button"
                  onClick={() =>
                    setShowShowMenu(
                      !showShowMenu
                    )
                  }
                  className="rounded-full bg-lime-300 px-5 py-3 text-sm font-black text-zinc-950 shadow-sm transition hover:-translate-y-0.5"
                >
                  + Show
                </button>

                {showShowMenu && (

                  <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[340px] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">

                    <div className="border-b border-black/5 px-4 py-3">

                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-400">
                        Spielort auswählen
                      </p>

                      <p className="mt-1 text-sm font-black text-zinc-800">
                        Neue Show für {organizer.name}
                      </p>

                    </div>

                    <div className="p-2">

                      {linkedVenues.map(
                        (
                          venue
                        ) => (

                          <form
                            key={
                              venue.id
                            }
                            action={
                              createShow
                            }
                          >

                            <input
                              type="hidden"
                              name="venue_id"
                              value={
                                venue.id
                              }
                            />

                            <button
                              type="submit"
                              className="flex w-full items-center justify-between gap-4 rounded-xl px-3 py-3 text-left transition hover:bg-[#fbf7ef]"
                            >

                              <div className="min-w-0">

                                <p className="truncate text-sm font-black text-zinc-950">
                                  {venue.name}
                                </p>

                                <p className="mt-0.5 truncate text-xs font-semibold text-zinc-400">
                                  {venue.city ||
                                    "Ort offen"}
                                </p>

                              </div>

                              <span className="shrink-0 text-zinc-300">
                                →
                              </span>

                            </button>

                          </form>

                        )
                      )}

                      <div className="my-2 h-px bg-black/5" />

                      <form
                        action={
                          createShow
                        }
                      >

                        <button
                          type="submit"
                          className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-black text-zinc-600 transition hover:bg-[#fbf7ef] hover:text-zinc-950"
                        >
                          Spielort später auswählen

                          <span className="text-zinc-300">
                            →
                          </span>
                        </button>

                      </form>

                    </div>

                  </div>

                )}

              </div>

            )}

            {/* WEBSITE */}

            {organizer.website && (
              <a
                href={
                  normalizeUrl(
                    organizer.website
                  )
                }
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-black transition hover:bg-zinc-50"
              >
                Website ↗
              </a>
            )}

          </div>

        </header>

        {/* ================================================== */}
        {/* STAMMDATEN */}
        {/* ================================================== */}

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-5"
        >

          <Card
            title="Stammdaten"
            icon="🏢"
            description="Grunddaten des Veranstalters."
          >

            <div className="grid gap-4 md:grid-cols-12">

              <Field
                label="Veranstalter"
                name="name"
                defaultValue={
                  organizer.name
                }
                required
                className="md:col-span-8"
              />

              <SelectField
                label="Beziehungsstatus"
                name="relationship_status"
                defaultValue={
                  organizer.relationship_status ||
                  "⚪ Neu"
                }
                options={
                  RELATIONSHIP_OPTIONS
                }
                className="md:col-span-4"
              />

              <SelectField
                label="Typ"
                name="organizer_type"
                defaultValue={
                  organizer.organizer_type ||
                  ""
                }
                options={
                  ORGANIZER_TYPES
                }
                className="md:col-span-4"
              />

              <Field
                label="Straße / Hausnummer"
                name="street"
                defaultValue={
                  organizer.street
                }
                autoComplete="street-address"
                className="md:col-span-8"
              />

              <Field
                label="PLZ"
                name="postal_code"
                defaultValue={
                  organizer.postal_code
                }
                autoComplete="postal-code"
                className="md:col-span-3"
              />

              <Field
                label="Ort / Sitz"
                name="city"
                defaultValue={
                  organizer.city
                }
                autoComplete="address-level2"
                className="md:col-span-5"
              />

              <Field
                label="Land"
                name="country"
                defaultValue={
                  organizer.country ||
                  "Deutschland"
                }
                autoComplete="country-name"
                className="md:col-span-4"
              />

              <Field
                label="Website"
                name="website"
                defaultValue={
                  organizer.website
                }
                autoComplete="url"
                className="md:col-span-6"
              />

              <Field
                label="Allgemeine E-Mail"
                name="email"
                type="email"
                defaultValue={
                  organizer.email
                }
                autoComplete="email"
                className="md:col-span-3"
              />

              <Field
                label="Telefon"
                name="phone"
                defaultValue={
                  organizer.phone
                }
                autoComplete="tel"
                className="md:col-span-3"
              />

            </div>

          </Card>

          {/* KONTAKTE – wie Locations: direkt bearbeitbare Karten */}

          <div className="grid min-w-0 gap-5 xl:grid-cols-2">
            {sortedContacts.map((contact) => (
              <ContactCompactCard
                key={contact.id}
                contact={contact}
                updateContact={updateContact}
                deleteContact={deleteContact}
                setActionMessage={setActionMessage}
              />
            ))}

            {showNewContact ? (
              <Card
                title="Neuer Ansprechpartner"
                icon="➕"
                action={
                  <button
                    type="button"
                    onClick={() => setShowNewContact(false)}
                    className="text-xs font-black text-zinc-400 hover:text-zinc-950"
                  >
                    Schließen
                  </button>
                }
              >
                <ContactNewForm
                  addContact={addContact}
                  setActionMessage={setActionMessage}
                  close={() => setShowNewContact(false)}
                />
              </Card>
            ) : (
              <button
                type="button"
                onClick={() => setShowNewContact(true)}
                className="flex min-h-[180px] items-center justify-center rounded-[1.7rem] border border-dashed border-black/10 bg-white/50 p-6 text-sm font-black text-zinc-500 transition hover:bg-white hover:text-zinc-950"
              >
                + Ansprechpartner hinzufügen
              </button>
            )}
          </div>

          {/* ================================================= */}
          {/* AKQUISE */}
          {/* ================================================= */}

          <Card
            title="Kontakt & Akquise"
            icon="🎯"
            description="Kontakte und Akquise-Vorgänge dieses Veranstalters."
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
                    setShowNewAcquisitionForm((value) => !value);
                    setShowActivityForm(false);
                    setActionMessage(null);
                    setSelectedRoundId("");
                    setNewRoundName("");
                  }}
                  className="inline-flex items-center justify-center rounded-full bg-lime-300 px-4 py-2.5 text-sm font-black text-zinc-950 transition hover:-translate-y-0.5"
                >
                  {showNewAcquisitionForm ? "Schließen" : "+ Neue Akquise"}
                </button>
              )
            }
          >

            {actionMessage && (
              <div className="mb-4 rounded-xl bg-zinc-950 px-4 py-3 text-sm font-bold text-white">
                {actionMessage}
              </div>
            )}

            {showNewAcquisitionForm && (
              <div className="mb-6 overflow-hidden rounded-[24px] border border-black/5 bg-white shadow-sm">
                <div className="flex flex-col gap-2 border-b border-black/5 bg-[#fbf7ef] px-6 py-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
                      Neue Akquise
                    </p>
                    <h3 className="mt-1 text-lg font-black text-zinc-950">
                      Akquise-Runde auswählen
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-zinc-500">
                      Bestehende Runde auswählen oder eine neue Runde anlegen.
                    </p>
                  </div>
                  <div className="rounded-full bg-white px-3 py-2 text-xs font-bold text-zinc-500 ring-1 ring-black/5">
                    Neuen Vorgang starten
                  </div>
                </div>

                <div
                  id="organizer-new-acquisition-form"
                  className="grid gap-6 p-6"
                >
                  <section className="grid gap-4 rounded-2xl bg-[#fbf7ef] p-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-zinc-400">
                        1 · Akquise-Runde
                      </p>
                    </div>

                    <label className="block min-w-0 md:col-span-2">
                      <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-400">
                        Akquise-Runde
                      </span>
                      <select
                        name="round_id"
                        value={selectedRoundId}
                        onChange={(event) => {
                          setSelectedRoundId(event.target.value);
                          if (event.target.value !== "__new") {
                            setNewRoundName("");
                          }
                        }}
                        className="h-12 w-full rounded-xl bg-white px-4 text-sm font-bold text-zinc-800 outline-none ring-1 ring-black/10 transition focus:ring-2 focus:ring-zinc-300"
                      >
                        <option value="">Bitte auswählen</option>
                        {rounds.map((round) => (
                          <option key={round.id} value={round.id}>
                            {round.name}
                          </option>
                        ))}
                        <option value="__new">＋ Neue Akquise-Runde anlegen</option>
                      </select>
                    </label>

                    {selectedRoundId === "__new" && (
                      <label className="block min-w-0 md:col-span-2">
                        <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-400">
                          Name der neuen Runde
                        </span>
                        <input
                          name="new_round_name"
                          value={newRoundName}
                          onChange={(event) => setNewRoundName(event.target.value)}
                          placeholder="z. B. TV-Shows"
                          className="h-12 w-full rounded-xl bg-white px-4 text-sm font-semibold text-zinc-800 outline-none ring-1 ring-black/10 transition focus:ring-2 focus:ring-zinc-300"
                        />
                        <span className="mt-2 block text-xs font-semibold leading-5 text-zinc-400">
                          Gibt es eine archivierte Akquise-Runde mit genau diesem Namen,
                          wird sie wieder aktiviert. Alte Vorgänge bleiben archiviert.
                        </span>
                      </label>
                    )}
                  </section>

                  <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="md:col-span-2 xl:col-span-4">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-zinc-400">
                        Kontakt kann danach über „+ Eintrag“ dokumentiert werden
                      </p>
                    </div>

                    <SelectField
                      label="Typ"
                      name="activity_type"
                      defaultValue="Kontaktversuch"
                      options={["Kontaktversuch", "Automatische Antwort", "Rückmeldung", "Telefonat", "Persönlicher Kontakt", "Notiz", "Absage", "Buchung"]}
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
                      options={["", "E-Mail", "Telefon", "Instagram", "LinkedIn", "Persönlich"]}
                    />

                    <Field
                      label="Wiedervorlage"
                      name="follow_up_at"
                      type="date"
                    />

                    <Field
                      label="Betreff"
                      name="subject"
                      placeholder="z. B. Quatsch Comedy Club – Bewerbung Jan.–März 2027"
                      className="md:col-span-2 xl:col-span-4"
                    />

                    <Textarea
                      label="Notiz / Rückmeldung"
                      name="note"
                      className="md:col-span-2 xl:col-span-4"
                    />
                  </section>

                  <section className="grid gap-4 rounded-2xl bg-[#fbf7ef] p-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-zinc-400">
                        3 · Wie geht es weiter?
                      </p>
                    </div>

                    <Field
                      label="Nächster Schritt"
                      name="next_step"
                    />

                    <SelectField
                      label="Status danach"
                      name="status_after"
                      options={["", "Neu", "Vorqualifiziert", "Insta", "Kontaktiert", "Follow-up 1", "Follow-up 2", "Interesse", "Verhandlung", "Gebucht 🎉", "Abgesagt"]}
                    />
                  </section>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-black/5 bg-[#fbf7ef] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewAcquisitionForm(false);
                      setSelectedRoundId("");
                      setNewRoundName("");
                      setActionMessage(null);
                    }}
                    className="rounded-full bg-white px-5 py-2.5 text-sm font-black text-zinc-600 ring-1 ring-black/10 transition hover:bg-zinc-50"
                  >
                    Abbrechen
                  </button>

                  <button
                    type="button"
                    disabled={
                      isPending ||
                      !selectedRoundId ||
                      (selectedRoundId === "__new" && !newRoundName.trim())
                    }
                    onClick={() => {
                      const container = document.getElementById(
                        "organizer-new-acquisition-form"
                      );
                      if (!container) return;

                      const formData = new FormData();
                      container
                        .querySelectorAll<
                          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
                        >("input[name], select[name], textarea[name]")
                        .forEach((field) =>
                          formData.set(field.name, field.value)
                        );

                      if (selectedRoundId === "__new") {
                        formData.delete("round_id");
                        formData.set("new_round_name", newRoundName.trim());
                      } else {
                        formData.set("round_id", selectedRoundId);
                        formData.delete("new_round_name");
                      }

                      startTransition(async () => {
                        const result = await createAcquisition(formData);
                        setActionMessage(result.message);

                        if (result.success) {
                          setShowNewAcquisitionForm(false);
                          setSelectedRoundId("");
                          setNewRoundName("");
                        }
                      });
                    }}
                    className="rounded-full bg-lime-300 px-6 py-3 text-sm font-black text-zinc-950 transition hover:-translate-y-0.5 hover:bg-lime-200 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500 disabled:opacity-100"
                  >
                    {isPending ? "Speichert …" : "Akquise speichern →"}
                  </button>
                </div>
              </div>
            )}

            {activeAcquisition &&
              showActivityForm && (

              <div className="mb-5 rounded-2xl bg-[#fbf7ef] p-5 ring-1 ring-black/5 [&_input]:!bg-white [&_select]:!bg-white [&_textarea]:!bg-white">

                <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
                  Neuer Eintrag
                </p>

                <p className="mt-1 font-black">
                  {activeAcquisition.program ||
                    "Aktuelle Akquise"}
                </p>

                <div
                  id="organizer-activity-form"
                  className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
                >

                  <input
                    type="hidden"
                    name="acquisition_id"
                    value={
                      activeAcquisition.id
                    }
                  />

                  <SelectField
                    label="Typ"
                    name="activity_type"
                    defaultValue="Kontakt"
                    options={["Kontakt", "Rückmeldung", "WVL", "Absage", "Buchung", "Notiz"]}
                  />

                  <Field
                    label="Datum"
                    name="activity_date"
                    type="date"
                    defaultValue={
                      todayDate()
                    }
                  />

                  <SelectField
                    label="Kanal"
                    name="channel"
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
                    onClick={() => {
                      const container =
                        document.getElementById(
                          "organizer-activity-form"
                        );

                      if (
                        !container
                      ) {
                        return;
                      }

                      const formData =
                        new FormData();

                      container
                        .querySelectorAll<
                          | HTMLInputElement
                          | HTMLSelectElement
                          | HTMLTextAreaElement
                        >(
                          "input[name], select[name], textarea[name]"
                        )
                        .forEach(
                          (
                            field
                          ) => {
                            formData.set(
                              field.name,
                              field.value
                            );
                          }
                        );

                      startTransition(
                        async () => {
                          const result =
                            await addActivity(
                              formData
                            );

                          setActionMessage(
                            result.message
                          );

                          if (
                            result.success
                          ) {
                            setShowActivityForm(
                              false
                            );
                          }
                        }
                      );
                    }}
                    className="rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-black text-white transition hover:-translate-y-0.5"
                  >
                    Eintrag speichern
                  </button>

                </div>

              </div>

            )}

            {acquisition.length === 0 && contactTimeline.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-black/10 bg-[#fbf7ef] px-5 py-8 text-center">
                <p className="text-sm font-black text-zinc-700">Noch kein Akquise-Vorgang vorhanden.</p>
                <p className="mt-1 text-sm font-semibold text-zinc-400">Starte den ersten Vorgang über „+ Neue Akquise“.</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">Akquise-Vorgänge</p>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-black text-zinc-500">
                      {acquisitionOverview.length} {acquisitionOverview.length === 1 ? "Vorgang" : "Vorgänge"}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {acquisitionOverview.map((item) => {
                      const itemActivities = displayedActivities
                        .filter((activity) => activity.acquisition_id === item.id && contactTypes.has(activity.activity_type || ""))
                        .sort((a, b) => String(b.activity_date || b.created_at || "").localeCompare(String(a.activity_date || a.created_at || "")));
                      const roundName = acquisitionRounds.find((round) => round.id === item.round_id)?.name;
                      return (
                        <div key={item.id} className="rounded-2xl border border-black/10 bg-white p-4 sm:p-5">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-black text-zinc-900">{roundName || item.program || "Allgemein"}</span>
                                <AcquisitionStatus status={item.status} />
                                {item.archived_at && <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-500">Archiv</span>}
                              </div>
                              {roundName && item.program && item.program !== roundName && <p className="mt-1 text-xs font-semibold text-zinc-500">{item.program}</p>}
                            </div>
                            <Link href={`/admin/acquisition/${item.id}`} className="shrink-0 text-sm font-black text-zinc-600 hover:text-zinc-950">Vorgang öffnen →</Link>
                          </div>
                          <div className="mt-3 grid gap-x-5 gap-y-2 border-t border-zinc-100 pt-3 text-xs sm:grid-cols-3">
                            <p><span className="font-semibold text-zinc-400">Letzter Kontakt</span><span className="mt-1 block font-bold text-zinc-700">{itemActivities.length ? (itemActivities[0].activity_date ? formatDate(itemActivities[0].activity_date) : "Datum nicht erfasst") : "Noch kein Kontakt"}</span></p>
                            <p><span className="font-semibold text-zinc-400">Wiedervorlage</span><span className="mt-1 block font-bold text-amber-700">{item.next_follow_up_at ? formatDate(item.next_follow_up_at) : "—"}</span></p>
                            <p><span className="font-semibold text-zinc-400">Nächste Aktion</span><span className="mt-1 block font-bold text-zinc-700">{item.next_step || "—"}</span></p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

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
            )}

          </Card>

          {/* ================================================= */}
          {/* SHOWS */}
          {/* ================================================= */}

          <Card
            title="Shows dieses Veranstalters"
            icon="🎟️"
            description={
              shows.length === 0
                ? "Noch keine Show mit diesem Veranstalter verknüpft."
                : `${shows.length} ${
                    shows.length === 1
                      ? "Show"
                      : "Shows"
                  } mit diesem Veranstalter verknüpft.`
            }
          >

            {shows.length === 0 ? (

              <div className="rounded-2xl border border-dashed border-black/10 bg-[#fbf7ef] px-5 py-8 text-center text-sm font-semibold text-zinc-400">
                Für diesen Veranstalter gibt es aktuell keine verknüpfte Show.
              </div>

            ) : (

              <div className="overflow-hidden rounded-2xl border border-black/10">

                <div className="divide-y divide-black/5">

                  {shows.map(
                    (
                      show
                    ) => (

                      <Link
                        key={
                          show.id
                        }
                        href={`/admin/shows/${show.id}`}
                        className="group flex flex-col gap-3 bg-white px-5 py-4 transition hover:bg-zinc-50 md:flex-row md:items-center md:justify-between"
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
                            <div className="mt-1 truncate text-sm font-semibold text-zinc-600">
                              {show.program}
                            </div>
                          )}

                          {(show.venue ||
                            show.city) && (
                            <div className="mt-1 truncate text-xs font-semibold text-zinc-400">
                              📍{" "}
                              {[
                                show.venue,
                                show.city,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </div>
                          )}

                        </div>

                        <span className="shrink-0 text-sm font-black text-zinc-400 transition group-hover:text-zinc-950">
                          Show öffnen →
                        </span>

                      </Link>

                    )
                  )}

                </div>

              </div>

            )}

          </Card>

          {/* ================================================= */}
          {/* SPIELORTE */}
          {/* ================================================= */}

          <Card
            title="Spielstätten"
            icon="🏛️"
            description="Locations, an denen Veranstaltungen dieses Veranstalters stattfinden."
            action={
              <button
                type="button"
                onClick={() => {
                  setShowVenueForm(
                    !showVenueForm
                  );

                  setVenueSearch(
                    ""
                  );
                }}
                className="inline-flex items-center justify-center rounded-full bg-lime-300 px-4 py-2.5 text-sm font-black text-zinc-950 transition hover:-translate-y-0.5"
              >
                {showVenueForm
                  ? "Schließen"
                  : "+ Spielstätte"}
              </button>
            }
          >

            {linkedVenues.length ===
            0 ? (

              <div className="rounded-2xl border border-dashed border-black/10 bg-[#fbf7ef] px-5 py-8 text-center">

                <p className="text-sm font-black text-zinc-700">
                  Noch keine Spielstätte verknüpft.
                </p>

                <p className="mt-1 text-sm font-semibold text-zinc-400">
                  Über „+ Spielstätte“ kannst du eine bestehende Location verbinden oder eine neue anlegen.
                </p>

              </div>

            ) : (

              <div className="space-y-3">

                {linkedVenues.map(
                  (venue) => (
                    <VenueRow
                      key={
                        venue.id
                      }
                      venue={
                        venue
                      }
                      updateVenueLink={
                        updateVenueLink
                      }
                      unlinkVenue={
                        unlinkVenue
                      }
                      setActionMessage={
                        setActionMessage
                      }
                    />
                  )
                )}

              </div>

            )}

            {showVenueForm && (

              <div className="mt-5 rounded-2xl bg-[#fbf7ef] p-5 ring-1 ring-black/5">

                <div className="mb-4 flex gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      setVenueMode(
                        "search"
                      )
                    }
                    className={[
                      "rounded-full px-4 py-2 text-xs font-black transition",
                      venueMode ===
                      "search"
                        ? "bg-zinc-950 text-white"
                        : "bg-white text-zinc-500 ring-1 ring-black/5",
                    ].join(" ")}
                  >
                    Location suchen
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setVenueMode(
                        "new"
                      )
                    }
                    className={[
                      "rounded-full px-4 py-2 text-xs font-black transition",
                      venueMode ===
                      "new"
                        ? "bg-zinc-950 text-white"
                        : "bg-white text-zinc-500 ring-1 ring-black/5",
                    ].join(" ")}
                  >
                    + Neue Location
                  </button>

                </div>

                {venueMode ===
                "search" ? (

                  <>
                    <div className="relative">

                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                        🔎
                      </span>

                      <input
                        value={
                          venueSearch
                        }
                        onChange={(
                          event
                        ) =>
                          setVenueSearch(
                            event.target.value
                          )
                        }
                        placeholder="Location suchen …"
                        className="h-12 w-full rounded-xl bg-white pl-11 pr-4 text-sm font-semibold outline-none ring-1 ring-black/5"
                      />

                    </div>

                    {venueSearch.trim() && (

                      <div className="mt-3 overflow-hidden rounded-xl bg-white ring-1 ring-black/5">

                        {venueResults.length >
                        0 ? (

                          venueResults.map(
                            (
                              venue
                            ) => (
                              <VenueSearchResult
                                key={
                                  venue.id
                                }
                                venue={
                                  venue
                                }
                                linkVenue={
                                  linkVenue
                                }
                                setActionMessage={
                                  setActionMessage
                                }
                              />
                            )
                          )

                        ) : (

                          <div className="px-4 py-5 text-sm font-semibold text-zinc-400">
                            Keine passende Location gefunden.
                          </div>

                        )}

                      </div>

                    )}

                  </>

                ) : (

                  <NewVenueForm
                    createVenue={
                      createVenue
                    }
                    setActionMessage={
                      setActionMessage
                    }
                    close={() => {
                      setShowVenueForm(
                        false
                      );
                    }}
                  />

                )}

              </div>

            )}

          </Card>

          {/* ================================================= */}
          {/* NOTIZEN */}
          {/* ================================================= */}

          <Card
            title="Notizen"
            icon="📝"
          >

            <Textarea
              label="Interne Notiz"
              name="notes"
              defaultValue={
                organizer.notes
              }
            />

          </Card>

          {/* ================================================= */}
          {/* SAVE BAR */}
          {/* ================================================= */}

          <div className="sticky bottom-5 z-20 flex flex-col gap-3 rounded-[1.5rem] bg-zinc-950 px-5 py-4 text-white shadow-2xl sm:flex-row sm:items-center sm:justify-between">

            <div>

              {message ? (

                <p
                  className={[
                    "text-sm font-bold",
                    success
                      ? "text-lime-300"
                      : "text-red-300",
                  ].join(
                    " "
                  )}
                >
                  {message}
                </p>

              ) : (

                <p className="text-sm text-white/50">
                  Änderungen an den Stammdaten speichern.
                </p>

              )}

            </div>

            <button
              type="submit"
              disabled={
                isPending
              }
              className="rounded-full bg-lime-300 px-6 py-3 text-sm font-black text-zinc-950 transition hover:-translate-y-0.5 disabled:opacity-50"
            >
              {isPending
                ? "Speichert …"
                : "Änderungen speichern"}
            </button>

          </div>

        </form>

        {/* ================================================== */}
        {/* VERANSTALTER LÖSCHEN */}
        {/* ================================================== */}

        <div className="flex justify-end pb-6">

          <form
            action={
              deleteOrganizer
            }
            onSubmit={(
              event
            ) => {
              if (
                !window.confirm(
                  `„${organizer.name}“ wirklich löschen?\n\nKontakte, Akquise und Spielort-Verknüpfungen werden ebenfalls gelöscht. Locations selbst bleiben bestehen.`
                )
              ) {
                event.preventDefault();
              }
            }}
          >

            <button
              type="submit"
              className="text-xs font-black text-red-400 transition hover:text-red-600"
            >
              Veranstalter löschen
            </button>

          </form>

        </div>

      </div>

    </main>
  );
}

function ExpandableActivityText({
  note,
  response,
}: {
  note: string | null;
  response: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const combinedLength = (note || "").length + (response || "").length;
  const canExpand = combinedLength > 150 || (note || "").includes("\n") || (response || "").includes("\n");

  return (
    <div className="mt-2 min-w-0">
      {note && (
        <p className={`${expanded ? "whitespace-pre-line" : "line-clamp-2"} break-words text-sm font-semibold leading-5 text-zinc-700`}>
          {note}
        </p>
      )}
      {response && (
        <p className={`${expanded ? "whitespace-pre-line" : "line-clamp-2"} ${note ? "mt-1" : ""} break-words text-sm font-semibold leading-5 text-zinc-500`}>
          {response}
        </p>
      )}
      {canExpand && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          className="mt-1 text-xs font-black text-blue-700 hover:text-blue-900"
        >
          {expanded ? "Weniger anzeigen ↑" : "Mehr anzeigen ↓"}
        </button>
      )}
    </div>
  );
}

// Compact overview; existing contact editor and server actions are reused.
function ContactCompactCard({
  contact,
  updateContact,
  deleteContact,
  setActionMessage,
}: {
  contact: Contact;
  updateContact: ServerAction;
  deleteContact: ServerAction;
  setActionMessage: (value: string | null) => void;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <Card
      title={contact.name}
      icon="👤"
      action={
        <div className="flex flex-wrap items-center gap-2">
          {contact.is_primary && (
            <span className="rounded-full bg-lime-200 px-2.5 py-1 text-[10px] font-black text-lime-900">
              Hauptkontakt
            </span>
          )}
          <button
            type="button"
            onClick={() => setEditing((value) => !value)}
            className="rounded-full bg-[#fbf7ef] px-3 py-2 text-xs font-black text-zinc-700 transition hover:bg-lime-100"
            aria-expanded={editing}
          >
            {editing ? "Schließen" : "✏️ Bearbeiten"}
          </button>
        </div>
      }
    >
      {editing ? (
        <ContactEditForm
          contact={contact}
          updateContact={updateContact}
          deleteContact={deleteContact}
          close={() => setEditing(false)}
          setActionMessage={setActionMessage}
        />
      ) : (
        <div className="space-y-2 text-sm">
          {contact.role && <p className="font-semibold text-zinc-500">{contact.role}</p>}
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="block break-all font-semibold text-zinc-700 hover:text-blue-700">
              ✉️ {contact.email}
            </a>
          )}
          {contact.phone && (
            <a href={`tel:${contact.phone}`} className="block font-semibold text-zinc-700 hover:text-blue-700">
              📞 {contact.phone}
            </a>
          )}
          {contact.notes && (
            <p className="line-clamp-2 whitespace-pre-line text-xs font-medium text-zinc-500" title={contact.notes}>
              {contact.notes}
            </p>
          )}
          {!contact.role && !contact.email && !contact.phone && !contact.notes && (
            <p className="text-zinc-400">Noch keine weiteren Kontaktdaten.</p>
          )}
        </div>
      )}
    </Card>
  );
}

// ============================================================
// CONTACT VIEW
// ============================================================

function ContactView({
  contact,
}: {
  contact: Contact;
}) {
  return (
    <div className="grid min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">

      <ReadField
        label="Name"
        value={
          contact.name
        }
        className="md:col-span-2"
      />

      <ReadField
        label="Funktion"
        value={
          contact.role
        }
        className="md:col-span-2"
      />

      <ReadField
        label="E-Mail"
        value={
          contact.email
        }
      />

      <ReadField
        label="Telefon"
        value={
          contact.phone
        }
      />

      {contact.notes && (
        <ReadField
          label="Notiz"
          value={
            contact.notes
          }
          className="md:col-span-2"
        />
      )}

    </div>
  );
}

// ============================================================
// CONTACT EDIT
// ============================================================

function ContactEditForm({
  contact,
  updateContact,
  deleteContact,
  close,
  setActionMessage,
  alwaysOpen = false,
}: {
  contact: Contact;
  updateContact: ServerAction;
  deleteContact: ServerAction;
  close: () => void;
  setActionMessage:
    (
      value:
        | string
        | null
    ) => void;
  alwaysOpen?: boolean;
}) {
  return (
    <div
      id={`contact-${contact.id}`}
    >

      <input
        type="hidden"
        name="contact_id"
        value={
          contact.id
        }
      />

      <div className="grid min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">

        <Field
          label="Name"
          name="name"
          defaultValue={
            contact.name
          }
          required
          className="md:col-span-2"
        />

        <Field
          label="Funktion"
          name="role"
          defaultValue={
            contact.role
          }
          className="md:col-span-2"
        />

        <Field
          label="E-Mail"
          name="email"
          type="email"
          defaultValue={
            contact.email
          }
        />

        <Field
          label="Telefon"
          name="phone"
          defaultValue={
            contact.phone
          }
        />

        <Textarea
          label="Notiz"
          name="notes"
          defaultValue={
            contact.notes
          }
          className="md:col-span-2"
        />

      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">

        <label className="flex items-center gap-2 text-sm font-bold text-zinc-600">

          <input
            type="checkbox"
            name="is_primary"
            defaultChecked={
              contact.is_primary
            }
            className="h-4 w-4"
          />

          Hauptkontakt

        </label>

        <div className="flex gap-2">

          <button
            type="button"
            onClick={() => {
              const container =
                document.getElementById(
                  `contact-${contact.id}`
                );

              if (
                !container
              ) {
                return;
              }

              const formData =
                new FormData();

              container
                .querySelectorAll<
                  | HTMLInputElement
                  | HTMLTextAreaElement
                >(
                  "input[name], textarea[name]"
                )
                .forEach(
                  (
                    field
                  ) => {
                    if (
                      field instanceof
                        HTMLInputElement &&
                      field.type ===
                        "checkbox"
                    ) {
                      if (
                        field.checked
                      ) {
                        formData.set(
                          field.name,
                          "on"
                        );
                      }

                      return;
                    }

                    formData.set(
                      field.name,
                      field.value
                    );
                  }
                );

              updateContact(
                formData
              ).then(
                (
                  result
                ) => {
                  setActionMessage(
                    result.message
                  );

                  if (
                    result.success
                  ) {
                    close();
                  }
                }
              );
            }}
            className="rounded-full bg-zinc-950 px-4 py-2 text-xs font-black text-white"
          >
            Speichern
          </button>

          <button
            type="button"
            onClick={() => {
              if (
                !window.confirm(
                  `Kontakt „${contact.name}“ wirklich löschen?`
                )
              ) {
                return;
              }

              const formData =
                new FormData();

              formData.set(
                "contact_id",
                contact.id
              );

              deleteContact(
                formData
              ).then(
                (
                  result
                ) => {
                  setActionMessage(
                    result.message
                  );

                  if (
                    result.success
                  ) {
                    close();
                  }
                }
              );
            }}
            className="rounded-full bg-red-50 px-4 py-2 text-xs font-black text-red-600"
          >
            Löschen
          </button>

        </div>

      </div>

    </div>
  );
}

// ============================================================
// NEW CONTACT
// ============================================================

function ContactNewForm({
  addContact,
  setActionMessage,
  close,
}: {
  addContact: ServerAction;
  setActionMessage:
    (
      value:
        | string
        | null
    ) => void;
  close: () => void;
}) {
  return (
    <div id="new-contact-fields">

      <div className="grid min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">

        <Field
          label="Name"
          name="name"
          required
          className="md:col-span-2"
        />

        <Field
          label="Funktion"
          name="role"
          className="md:col-span-2"
        />

        <Field
          label="E-Mail"
          name="email"
          type="email"
        />

        <Field
          label="Telefon"
          name="phone"
        />

        <Textarea
          label="Notiz"
          name="notes"
          className="md:col-span-2"
        />

      </div>

      <div className="mt-4 flex items-center justify-between gap-3">

        <label className="flex items-center gap-2 text-sm font-bold text-zinc-600">

          <input
            type="checkbox"
            name="is_primary"
            className="h-4 w-4"
          />

          Hauptkontakt

        </label>

        <button
          type="button"
          onClick={() => {
            const container =
              document.getElementById(
                "new-contact-fields"
              );

            if (
              !container
            ) {
              return;
            }

            const formData =
              new FormData();

            container
              .querySelectorAll<
                | HTMLInputElement
                | HTMLTextAreaElement
              >(
                "input[name], textarea[name]"
              )
              .forEach(
                (
                  field
                ) => {
                  if (
                    field instanceof
                      HTMLInputElement &&
                    field.type ===
                      "checkbox"
                  ) {
                    if (
                      field.checked
                    ) {
                      formData.set(
                        field.name,
                        "on"
                      );
                    }

                    return;
                  }

                  formData.set(
                    field.name,
                    field.value
                  );
                }
              );

            addContact(
              formData
            ).then(
              (
                result
              ) => {
                setActionMessage(
                  result.message
                );

                if (
                  result.success
                ) {
                  close();
                }
              }
            );
          }}
          className="rounded-full bg-lime-300 px-5 py-2.5 text-sm font-black text-zinc-950"
        >
          Kontakt speichern
        </button>

      </div>

    </div>
  );
}

// ============================================================
// VENUE ROW
// ============================================================

function VenueRow({
  venue,
  updateVenueLink,
  unlinkVenue,
  setActionMessage,
}: {
  venue: LinkedVenue;
  updateVenueLink: ServerAction;
  unlinkVenue: ServerAction;
  setActionMessage:
    (
      value:
        | string
        | null
    ) => void;
}) {
  const [
    editing,
    setEditing,
  ] =
    useState(false);

  const [
    venueOnly,
    setVenueOnly,
  ] =
    useState(
      venue.acquisition_relevant ===
        false
    );

  return (
    <div className="rounded-2xl bg-[#fbf7ef] p-5 ring-1 ring-black/5">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div>

          <div className="flex flex-wrap items-center gap-2">

            <p className="font-black text-zinc-950">
              {venue.name}
            </p>

            {venue.acquisition_relevant ===
              false && (
              <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-black text-red-600">
                Nur Spielort
              </span>
            )}

          </div>

          <p className="mt-1 text-xs font-semibold text-zinc-400">
            {venue.city ||
              "Ort offen"}
          </p>

          <p className="mt-2 text-xs font-bold text-zinc-500">
            {venue.relationship_status ||
              "Kein Status"}
          </p>

        </div>

        <div className="flex gap-2">

          <Link
            href={`/admin/locations/${venue.id}`}
            className="rounded-full bg-white px-4 py-2 text-xs font-black text-zinc-700 ring-1 ring-black/5"
          >
            Location öffnen →
          </Link>

          <button
            type="button"
            onClick={() =>
              setEditing(
                !editing
              )
            }
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm ring-1 ring-black/5"
          >
            ✏️
          </button>

        </div>

      </div>

      {editing && (

        <div className="mt-4 border-t border-black/5 pt-4">

          <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-white p-4 ring-1 ring-black/5">

            <input
              type="checkbox"
              checked={
                venueOnly
              }
              onChange={(
                event
              ) =>
                setVenueOnly(
                  event.target.checked
                )
              }
              className="mt-0.5 h-4 w-4"
            />

            <span>

              <span className="block text-sm font-black text-zinc-800">
                Nur Spielstätte / nicht direkt akquirieren
              </span>

              <span className="mt-1 block text-xs font-semibold text-zinc-400">
                {venueOnly
                  ? "Diese Location ist bewusst nicht Ziel der direkten Akquise."
                  : "Diese Location ist für direkte Akquise freigegeben."}
              </span>

            </span>

          </label>

          <div className="mt-3 flex flex-wrap justify-end gap-2">

            <button
              type="button"
              onClick={() => {
                const formData =
                  new FormData();

                formData.set(
                  "venue_id",
                  venue.id
                );

                if (
                  venueOnly
                ) {
                  formData.set(
                    "venue_only",
                    "on"
                  );
                }

                updateVenueLink(
                  formData
                ).then(
                  (
                    result
                  ) => {
                    setActionMessage(
                      result.message
                    );

                    if (
                      result.success
                    ) {
                      setEditing(
                        false
                      );
                    }
                  }
                );
              }}
              className="rounded-full bg-zinc-950 px-4 py-2 text-xs font-black text-white"
            >
              Speichern
            </button>

            <button
              type="button"
              onClick={() => {
                if (
                  !window.confirm(
                    `Verknüpfung zu „${venue.name}“ lösen?\n\nDie Location selbst bleibt bestehen.`
                  )
                ) {
                  return;
                }

                const formData =
                  new FormData();

                formData.set(
                  "venue_id",
                  venue.id
                );

                unlinkVenue(
                  formData
                ).then(
                  (
                    result
                  ) =>
                    setActionMessage(
                      result.message
                    )
                );
              }}
              className="rounded-full bg-red-50 px-4 py-2 text-xs font-black text-red-600"
            >
              Verknüpfung lösen
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

// ============================================================
// VENUE SEARCH RESULT
// ============================================================

function VenueSearchResult({
  venue,
  linkVenue,
  setActionMessage,
}: {
  venue: Venue;
  linkVenue: ServerAction;
  setActionMessage:
    (
      value:
        | string
        | null
    ) => void;
}) {
  const [
    venueOnly,
    setVenueOnly,
  ] =
    useState(false);

  return (
    <div className="border-b border-black/5 p-4 last:border-b-0">

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <p className="text-sm font-black">
            {venue.name}
          </p>

          <p className="mt-0.5 text-xs font-semibold text-zinc-400">
            {venue.city ||
              "Ort offen"}{" "}
            ·{" "}
            {venue.relationship_status ||
              "kein Status"}
          </p>

        </div>

        <button
          type="button"
          onClick={() => {
            const formData =
              new FormData();

            formData.set(
              "venue_id",
              venue.id
            );

            if (
              venueOnly
            ) {
              formData.set(
                "venue_only",
                "on"
              );
            }

            linkVenue(
              formData
            ).then(
              (
                result
              ) =>
                setActionMessage(
                  result.message
                )
            );
          }}
          className="rounded-full bg-lime-300 px-4 py-2 text-xs font-black text-zinc-950"
        >
          Verknüpfen
        </button>

      </div>

      <label className="mt-3 flex items-center gap-2 text-xs font-bold text-zinc-600">

        <input
          type="checkbox"
          checked={
            venueOnly
          }
          onChange={(
            event
          ) =>
            setVenueOnly(
              event.target.checked
            )
          }
        />

        Nur Spielstätte / nicht direkt akquirieren

      </label>

      <p className="mt-2 text-xs font-semibold text-zinc-400">
        Ohne Haken wird nur die Verknüpfung angelegt. Der bestehende Location-Status bleibt unverändert.
      </p>

    </div>
  );
}

// ============================================================
// NEW VENUE
// ============================================================

function NewVenueForm({
  createVenue,
  setActionMessage,
  close,
}: {
  createVenue: ServerAction;
  setActionMessage:
    (
      value:
        | string
        | null
    ) => void;
  close: () => void;
}) {
  const [
    venueOnly,
    setVenueOnly,
  ] =
    useState(true);

  return (
    <div id="new-venue-fields">

      <div className="grid gap-4 md:grid-cols-12">

        <Field
          label="Location"
          name="venue_name"
          required
          className="md:col-span-7"
        />

        <Field
          label="Ort"
          name="venue_city"
          className="md:col-span-5"
        />

        <Field
          label="Website"
          name="venue_website"
          className="md:col-span-12"
        />

      </div>

      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl bg-white p-4 ring-1 ring-black/5">

        <input
          type="checkbox"
          name="venue_only"
          checked={
            venueOnly
          }
          onChange={(
            event
          ) =>
            setVenueOnly(
              event.target.checked
            )
          }
          className="mt-0.5 h-4 w-4"
        />

        <span>

          <span className="block text-sm font-black text-zinc-800">
            Nur Spielstätte / nicht direkt akquirieren
          </span>

          <span className="mt-1 block text-xs font-semibold text-zinc-400">
            Wenn aktiviert, wird die Location bewusst als „🔴 Nicht relevant“ für direkte Akquise angelegt.
          </span>

        </span>

      </label>

      <div className="mt-4 flex justify-end">

        <button
          type="button"
          onClick={() => {
            const container =
              document.getElementById(
                "new-venue-fields"
              );

            if (
              !container
            ) {
              return;
            }

            const formData =
              new FormData();

            container
              .querySelectorAll<
                HTMLInputElement
              >(
                "input[name]"
              )
              .forEach(
                (
                  field
                ) => {
                  if (
                    field.type ===
                      "checkbox"
                  ) {
                    if (
                      field.checked
                    ) {
                      formData.set(
                        field.name,
                        "on"
                      );
                    }

                    return;
                  }

                  formData.set(
                    field.name,
                    field.value
                  );
                }
              );

            createVenue(
              formData
            ).then(
              (
                result
              ) => {
                setActionMessage(
                  result.message
                );

                if (
                  result.success
                ) {
                  close();
                }
              }
            );
          }}
          className="rounded-full bg-lime-300 px-5 py-2.5 text-sm font-black text-zinc-950"
        >
          Location anlegen & verknüpfen
        </button>

      </div>

    </div>
  );
}

// ============================================================
// ACQUISITION CARD
// ============================================================

function AcquisitionCard({
  item,
  activities,
  isCurrent = false,
  updateActivity,
  deleteActivity,
  deleteAcquisition,
  setActionMessage,
}: {
  item: AcquisitionRecord;
  activities: AcquisitionActivity[];
  isCurrent?: boolean;
  updateActivity: ServerAction;
  deleteActivity: ServerAction;
  deleteAcquisition: ServerAction;
  setActionMessage: (value: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [viewingActivityId, setViewingActivityId] = useState<string | null>(null);

  return (
    <section className="overflow-hidden rounded-2xl border border-black/10 bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-[#fbf7ef]"
        aria-expanded={open}
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
            {activities.length} {activities.length === 1 ? "Eintrag" : "Einträge"}
            {item.created_at ? ` · gestartet ${formatDate(item.created_at.slice(0, 10))}` : ""}
          </p>
        </div>
        <span className="shrink-0 text-xl font-black text-zinc-400">
          {open ? "⌃" : "⌄"}
        </span>
      </button>

      {open && (
        <div className="border-t border-black/5">
          {activities.length === 0 ? (
            <div className="px-5 py-5 text-sm font-semibold text-zinc-400">
              Für diesen Vorgang gibt es noch keine Verlaufseinträge.
            </div>
          ) : (
            <div className="divide-y divide-black/5">
              {activities.map((activity) => (
                <div key={activity.id}>
                  <div className="grid gap-3 px-5 py-4 md:grid-cols-[110px_135px_minmax(0,1fr)_210px] md:items-start">
                    <div className="text-sm font-black text-zinc-700">
                      {formatDate(activity.activity_date)}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-black text-zinc-700">
                      <span>{activityIcon(activity.activity_type, activity.channel)}</span>
                      <span>{activity.activity_type || "Kontakt"}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black leading-6 text-zinc-800">
                        {activity.subject || activity.note?.split("\n")[0] || "Ohne Betreff"}
                      </p>
                      {activity.channel && (
                        <p className="mt-1 text-xs font-bold text-zinc-400">
                          via {activity.channel}
                        </p>
                      )}
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 text-xs font-black">
                        {activity.next_step && (
                          <p className="text-zinc-600">→ {activity.next_step}</p>
                        )}
                        {activity.follow_up_at && (
                          <p className="text-amber-700">
                            📅 WVL {formatDate(activity.follow_up_at)}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {activity.note && (
                          <button
                            type="button"
                            onClick={() =>
                              setViewingActivityId(
                                viewingActivityId === activity.id ? null : activity.id
                              )
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm shadow-sm ring-1 ring-black/5 transition hover:bg-[#fbf7ef]"
                            title={viewingActivityId === activity.id ? "Notiz schließen" : "Notiz ansehen"}
                            aria-label={viewingActivityId === activity.id ? "Notiz schließen" : "Notiz ansehen"}
                          >
                            👁️
                          </button>
                        )}
                        {!activity.id.startsWith("legacy-") && <button
                          type="button"
                          onClick={() =>
                            setEditingActivityId(
                              editingActivityId === activity.id ? null : activity.id
                            )
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm shadow-sm ring-1 ring-black/5 transition hover:bg-[#fbf7ef]"
                          title="Kontakteintrag bearbeiten"
                        >
                          ✏️
                        </button>}
                        {!activity.id.startsWith("legacy-") && <button
                          type="button"
                          title="Kontakteintrag löschen"
                          onClick={() => {
                            if (!window.confirm("Diesen Kontakteintrag wirklich löschen?")) return;
                            const formData = new FormData();
                            formData.set("activity_id", activity.id);
                            formData.set("acquisition_id", item.id);
                            deleteActivity(formData).then((result) =>
                              setActionMessage(result.message)
                            );
                          }}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm shadow-sm ring-1 ring-black/5 transition hover:bg-red-50"
                        >
                          🗑️
                        </button>}
                      </div>
                    </div>
                  </div>

                  {editingActivityId !== activity.id &&
                    viewingActivityId === activity.id &&
                    activity.note && (
                    <div className="border-t border-black/5 bg-white px-5 py-4">
                      <p className="mb-1 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-400">
                        Notiz
                      </p>
                      <p className="whitespace-pre-wrap text-sm font-semibold leading-6 text-zinc-600">
                        {activity.note}
                      </p>
                    </div>
                  )}

                  {editingActivityId === activity.id && (
                    <div className="border-t border-black/5 bg-white px-5 py-5">
                      <div className="grid gap-3 md:grid-cols-2">
                        <input type="hidden" name="activity_id" value={activity.id} />
                        <input type="hidden" name="acquisition_id" value={item.id} />
                        <SelectField label="Typ" name="activity_type" defaultValue={activity.activity_type || "Notiz"} options={["Kontaktversuch", "Automatische Antwort", "Rückmeldung", "Telefonat", "Persönlicher Kontakt", "Notiz", "Absage", "Buchung"]} />
                        <Field label="Datum" name="activity_date" type="date" defaultValue={activity.activity_date || ""} />
                        <SelectField label="Kanal" name="channel" defaultValue={activity.channel || ""} options={["", "E-Mail", "Telefon", "Instagram", "LinkedIn", "Persönlich"]} />
                        <Field label="Wiedervorlage" name="follow_up_at" type="date" defaultValue={activity.follow_up_at || ""} />
                        <Field
                          label="Betreff"
                          name="subject"
                          defaultValue={activity.subject || ""}
                          className="md:col-span-2"
                        />
                        <Textarea
                          label="Notiz / Rückmeldung"
                          name="note"
                          defaultValue={activity.note || activity.response || ""}
                          className="md:col-span-2"
                        />
                        <Field label="Nächster Schritt" name="next_step" defaultValue={activity.next_step || ""} className="md:col-span-2" />
                        <SelectField label="Status danach" name="status_after" defaultValue={activity.status_after || ""} options={["", "Neu", "Vorqualifiziert", "Insta", "Kontaktiert", "Follow-up 1", "Follow-up 2", "Interesse", "Verhandlung", "Gebucht 🎉", "Abgesagt"]} className="md:col-span-2" />
                        <div className="flex justify-end gap-2 md:col-span-2">
                          <button type="button" onClick={() => setEditingActivityId(null)} className="rounded-full bg-white px-4 py-2 text-xs font-black text-zinc-600 ring-1 ring-black/5">
                            Abbrechen
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              const editor = event.currentTarget.closest(".grid");
                              if (!editor) return;
                              const formData = new FormData();
                              editor
                                .querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input[name], select[name], textarea[name]")
                                .forEach((field) => formData.set(field.name, field.value));
                              updateActivity(formData).then((result) => {
                                setActionMessage(result.message);
                                if (result.success) setEditingActivityId(null);
                              });
                            }}
                            className="rounded-full bg-zinc-950 px-4 py-2 text-xs font-black text-white"
                          >
                            Änderungen speichern
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 bg-[#fbf7ef] px-5 py-3">
            <Link href={`/admin/acquisition/${item.id}`} className="text-sm font-black text-zinc-500 transition hover:text-zinc-950">
              Vorgang öffnen →
            </Link>
            <button
              type="button"
              onClick={() => {
                if (!window.confirm(`Diese Akquise „${item.program || "ohne Bezeichnung"}“ inklusive aller Kontakteinträge wirklich löschen?`)) return;
                const formData = new FormData();
                formData.set("acquisition_id", item.id);
                deleteAcquisition(formData).then((result) =>
                  setActionMessage(result.message)
                );
              }}
              className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-black text-red-700 transition hover:bg-red-100"
            >
              🗑 Akquise löschen
            </button>
          </div>
        </div>
      )}
    </section>
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
  icon?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-[1.7rem] bg-white p-6 shadow-lg shadow-black/[0.03] ring-1 ring-black/5">

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

        <div>

          <div className="flex items-center gap-2">

            {icon && (
              <span className="text-xl">
                {icon}
              </span>
            )}

            <h2 className="text-xl font-black">
              {title}
            </h2>

          </div>

          {description && (
            <p className="mt-1 text-sm font-medium text-zinc-400">
              {description}
            </p>
          )}

        </div>

        {action && (
          <div className="shrink-0">
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
  type = "text",
  defaultValue,
  required = false,
  autoComplete,
  className = "",
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?:
    | string
    | number
    | null;
  required?: boolean;
  autoComplete?: string;
  className?: string;
  placeholder?: string;
}) {
  return (
    <label
      className={[
        "block min-w-0",
        className,
      ].join(" ")}
    >

      <span className="mb-2 block truncate text-xs font-black uppercase tracking-wider text-zinc-400">
        {label}
      </span>

      <input
        name={name}
        type={type}
        required={
          required
        }
        autoComplete={
          autoComplete
        }
        defaultValue={
          defaultValue ??
          ""
        }
        placeholder={placeholder}
        className="h-12 w-full min-w-0 max-w-full truncate rounded-xl bg-[#fbf7ef] px-4 text-sm font-semibold outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-black/10"
      />

    </label>
  );
}

// ============================================================
// READ FIELD
// ============================================================

function ReadField({
  label,
  value,
  className = "",
}: {
  label: string;
  value:
    | string
    | null;
  className?: string;
}) {
  return (
    <div
      className={[
        "min-w-0 max-w-full",
        className,
      ].join(" ")}
    >

      <span className="mb-2 block truncate text-xs font-black uppercase tracking-wider text-zinc-400">
        {label}
      </span>

      <div
        className="flex min-h-12 w-full min-w-0 max-w-full items-center overflow-hidden rounded-xl bg-[#fbf7ef] px-4 text-sm font-semibold text-zinc-800"
        title={
          value || undefined
        }
      >
        <span className="block min-w-0 max-w-full truncate">
          {value || "—"}
        </span>
      </div>

    </div>
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
  defaultValue?: string | null;
  options: string[];
  className?: string;
}) {
  return (
    <label
      className={[
        "block min-w-0",
        className,
      ].join(" ")}
    >

      <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-400">
        {label}
      </span>

      <select
        name={name}
        defaultValue={
          defaultValue ||
          ""
        }
        className="h-12 w-full min-w-0 max-w-full truncate rounded-xl bg-[#fbf7ef] px-4 text-sm font-bold outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-black/10"
      >

        {options.map(
          (
            option
          ) => (
            <option
              key={
                option ||
                "__empty"
              }
              value={
                option
              }
            >
              {option ||
                "—"}
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
    <label
      className={[
        "block min-w-0",
        className,
      ].join(" ")}
    >

      <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-400">
        {label}
      </span>

      <textarea
        name={name}
        defaultValue={
          defaultValue ||
          ""
        }
        rows={4}
        className="w-full min-w-0 max-w-full break-words rounded-xl bg-[#fbf7ef] px-4 py-3 text-sm font-semibold outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-black/10"
      />

    </label>
  );
}

// ============================================================
// STATUS
// ============================================================

function AcquisitionStatus({
  status,
}: {
  status: string | null;
}) {
  const label =
    status ||
    "ohne Status";

  const normalized =
    label.toLowerCase();

  let classes =
    "bg-zinc-100 text-zinc-600";

  if (
    normalized.includes(
      "gebucht"
    )
  ) {
    classes =
      "bg-emerald-100 text-emerald-700";
  } else if (
    normalized.includes(
      "interesse"
    ) ||
    normalized.includes(
      "verhandlung"
    )
  ) {
    classes =
      "bg-lime-100 text-lime-800";
  } else if (
    normalized.includes(
      "kontakt"
    ) ||
    normalized.includes(
      "follow"
    )
  ) {
    classes =
      "bg-orange-100 text-orange-700";
  } else if (
    normalized.includes(
      "abgesagt"
    )
  ) {
    classes =
      "bg-red-100 text-red-700";
  } else if (
    normalized.includes(
      "neu"
    )
  ) {
    classes =
      "bg-blue-100 text-blue-700";
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
  if (!date) {
    return "Datum offen";
  }

  return new Intl.DateTimeFormat(
    "de-DE",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(
    new Date(
      `${date}T12:00:00`
    )
  );
}

// ============================================================
// SHOW UHRZEIT
// ============================================================

function formatShowTime(
  time: string | null
) {
  if (!time) {
    return "";
  }

  return `${time.slice(
    0,
    5
  )} Uhr`;
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
    status ||
    "ohne Status";

  const normalized =
    label.toLowerCase();

  let classes =
    "bg-zinc-100 text-zinc-600";

  if (
    normalized === "option"
  ) {
    classes =
      "bg-violet-50 text-violet-700";
  } else if (
    normalized === "fix" ||
    normalized === "bestätigt" ||
    normalized === "bestaetigt" ||
    normalized === "confirmed"
  ) {
    classes =
      "bg-emerald-50 text-emerald-700";
  } else if (
    normalized === "gespielt"
  ) {
    classes =
      "bg-blue-50 text-blue-700";
  } else if (
    normalized === "abgeschlossen"
  ) {
    classes =
      "bg-zinc-100 text-zinc-700";
  } else if (
    normalized === "abgesagt" ||
    normalized === "cancelled"
  ) {
    classes =
      "bg-red-50 text-red-700";
  } else if (
    normalized === "neu" ||
    normalized === "in_arbeit"
  ) {
    classes =
      "bg-amber-50 text-amber-700";
  }

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-black ${classes}`}
    >
      {label.replaceAll(
        "_",
        " "
      )}
    </span>
  );
}

// ============================================================
// HELPERS
// ============================================================

function todayDate() {
  const now =
    new Date();

  const local =
    new Date(
      now.getTime() -
        now.getTimezoneOffset() *
          60_000
    );

  return local
    .toISOString()
    .slice(0, 10);
}

function activityIcon(activityType?: string | null, channel?: string | null) {
  const type = String(activityType || "").toLowerCase();
  const ch = String(channel || "").toLowerCase();
  if (type.includes("absage")) return "❌";
  if (type.includes("buchung")) return "🎉";
  if (type.includes("wvl")) return "📅";
  if (type.includes("rückmeldung")) return "💬";
  if (type.includes("notiz")) return "📝";
  if (ch.includes("telefon")) return "📞";
  if (ch.includes("instagram")) return "📱";
  if (ch.includes("linkedin")) return "💼";
  if (ch.includes("persönlich")) return "🤝";
  if (ch.includes("mail")) return "✉️";
  return "📌";
}

function formatDate(
  value:
    | string
    | null
) {
  if (!value) {
    return "—";
  }

  const parsed =
    new Date(
      value
    );

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "de-DE",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(
    parsed
  );
}

function normalizeUrl(
  value: string
) {
  if (
    value.startsWith(
      "http://"
    ) ||
    value.startsWith(
      "https://"
    )
  ) {
    return value;
  }

  return `https://${value}`;
}

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
      {mailing.last_clicked_url && <p className="break-all">Link: <a className="text-blue-700 underline" href={normalizeUrl(mailing.last_clicked_url)} target="_blank" rel="noreferrer">{mailing.last_clicked_url}</a></p>}
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

