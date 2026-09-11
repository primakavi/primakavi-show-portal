"use client";

import Link from "next/link";
import {
  useMemo,
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


type ServerAction = (
  formData: FormData
) => Promise<ActionResult>;


const RELATIONSHIP_OPTIONS = [
  "",
  "⚪ Neu",
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
  acquisition,
  acquisitionActivities,
  acquisitionRounds,

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
  createAcquisitionRound,
  addActivity,
  deleteActivity,
  deleteAcquisition,

  deleteOrganizer,
}: {
  organizer: Organizer;

  contacts: Contact[];

  venues: Venue[];

  linkedVenues: LinkedVenue[];

  acquisition: AcquisitionRecord[];

  acquisitionActivities: AcquisitionActivity[];

  acquisitionRounds: AcquisitionRound[];

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

  createAcquisitionRound: ServerAction;

  addActivity: ServerAction;

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
    showNewRoundForm,
    setShowNewRoundForm,
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
    selectedRoundName,
    setSelectedRoundName,
  ] =
    useState("");

  const [
    showShowMenu,
    setShowShowMenu,
  ] =
    useState(false);

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
              {[
                organizer.city,
                organizer.country,
              ]
                .filter(Boolean)
                .join(" · ") ||
                "Veranstalter"}
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
                label="Ort / Sitz"
                name="city"
                defaultValue={
                  organizer.city
                }
                className="md:col-span-4"
              />

              <Field
                label="Land"
                name="country"
                defaultValue={
                  organizer.country ||
                  "Deutschland"
                }
                className="md:col-span-4"
              />

              <Field
                label="Website"
                name="website"
                defaultValue={
                  organizer.website
                }
                className="md:col-span-6"
              />

              <Field
                label="Allgemeine E-Mail"
                name="email"
                type="email"
                defaultValue={
                  organizer.email
                }
                className="md:col-span-3"
              />

              <Field
                label="Telefon"
                name="phone"
                defaultValue={
                  organizer.phone
                }
                className="md:col-span-3"
              />

            </div>

          </Card>

          {/* ================================================= */}
          {/* ANSPRECHPARTNER */}
          {/* ================================================= */}

          <div className="grid gap-5 xl:grid-cols-2">

            {sortedContacts.map(
              (
                contact,
                index
              ) => (
                <Card
                  key={
                    contact.id
                  }
                  title={`Ansprechpartner ${
                    index + 1
                  }`}
                  icon={
                    index === 0
                      ? "👤"
                      : "👥"
                  }
                  action={
                    <div className="flex items-center gap-2">

                      {contact.is_primary && (
                        <span className="rounded-full bg-lime-200 px-2.5 py-1 text-[10px] font-black text-lime-900">
                          Hauptkontakt
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setEditingContactId(
                            editingContactId ===
                              contact.id
                              ? null
                              : contact.id
                          )
                        }
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#fbf7ef] text-sm ring-1 ring-black/5 transition hover:bg-white"
                        title="Kontakt bearbeiten"
                      >
                        ✏️
                      </button>

                    </div>
                  }
                >

                  {editingContactId ===
                  contact.id ? (

                    <ContactEditForm
                      contact={
                        contact
                      }
                      updateContact={
                        updateContact
                      }
                      deleteContact={
                        deleteContact
                      }
                      close={() =>
                        setEditingContactId(
                          null
                        )
                      }
                      setActionMessage={
                        setActionMessage
                      }
                    />

                  ) : (

                    <ContactView
                      contact={
                        contact
                      }
                    />

                  )}

                </Card>
              )
            )}

            {showNewContact ? (

              <Card
                title="Neuer Ansprechpartner"
                icon="➕"
                action={
                  <button
                    type="button"
                    onClick={() =>
                      setShowNewContact(
                        false
                      )
                    }
                    className="text-xs font-black text-zinc-400 hover:text-zinc-950"
                  >
                    Schließen
                  </button>
                }
              >

                <ContactNewForm
                  addContact={
                    addContact
                  }
                  setActionMessage={
                    setActionMessage
                  }
                  close={() =>
                    setShowNewContact(
                      false
                    )
                  }
                />

              </Card>

            ) : (

              <button
                type="button"
                onClick={() =>
                  setShowNewContact(
                    true
                  )
                }
                className="flex min-h-[180px] items-center justify-center rounded-[1.7rem] border border-dashed border-black/10 bg-white/50 p-6 text-sm font-black text-zinc-500 transition hover:bg-white hover:text-zinc-950"
              >
                + Ansprechpartner hinzufügen
              </button>

            )}

          </div>

          {/* ================================================= */}
          {/* SPIELORTE */}
          {/* ================================================= */}

          <Card
            title="Spielorte"
            icon="🏛️"
            description="Locations, an denen dieser Veranstalter spielt."
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
                  : "+ Spielort"}
              </button>
            }
          >

            {linkedVenues.length ===
            0 ? (

              <div className="rounded-2xl border border-dashed border-black/10 bg-[#fbf7ef] px-5 py-8 text-center">

                <p className="text-sm font-black text-zinc-700">
                  Noch kein Spielort verknüpft.
                </p>

                <p className="mt-1 text-sm font-semibold text-zinc-400">
                  Über „+ Spielort“ kannst du eine bestehende Location verbinden oder eine neue anlegen.
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
          {/* AKQUISE */}
          {/* ================================================= */}

          <Card
            title="Akquise"
            icon="🎯"
            description="Aktueller Stand und bisherige Akquise-Vorgänge dieses Veranstalters."
            action={
              activeAcquisition ? (

                <button
                  type="button"
                  onClick={() => {
                    setShowActivityForm(
                      !showActivityForm
                    );

                    setShowNewAcquisitionForm(
                      false
                    );

                    setActionMessage(
                      null
                    );
                  }}
                  className="inline-flex items-center justify-center rounded-full bg-lime-300 px-4 py-2.5 text-sm font-black text-zinc-950 transition hover:-translate-y-0.5"
                >
                  {showActivityForm
                    ? "Schließen"
                    : "+ Eintrag"}
                </button>

              ) : (

                <button
                  type="button"
                  onClick={() => {
                    setShowNewAcquisitionForm(
                      !showNewAcquisitionForm
                    );

                    setShowActivityForm(
                      false
                    );

                    setActionMessage(
                      null
                    );
                  }}
                  className="inline-flex items-center justify-center rounded-full bg-lime-300 px-4 py-2.5 text-sm font-black text-zinc-950 transition hover:-translate-y-0.5"
                >
                  {showNewAcquisitionForm
                    ? "Schließen"
                    : "+ Neue Akquise"}
                </button>

              )
            }
          >

            {actionMessage && (
              <div className="mb-4 rounded-xl bg-zinc-950 px-4 py-3 text-sm font-bold text-white">
                {actionMessage}
              </div>
            )}

            {!activeAcquisition &&
              showNewAcquisitionForm && (

              <div className="mb-5 rounded-2xl bg-[#fbf7ef] p-5 ring-1 ring-black/5">

                <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
                  Neue Akquise
                </p>

                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">

                  <select
                    value={
                      selectedRoundName
                    }
                    onChange={(
                      event
                    ) =>
                      setSelectedRoundName(
                        event.target.value
                      )
                    }
                    className="h-12 rounded-xl bg-white px-4 text-sm font-bold ring-1 ring-black/5"
                  >

                    <option value="">
                      Akquise-Runde auswählen
                    </option>

                    {rounds.map(
                      (
                        round
                      ) => (
                        <option
                          key={
                            round.id
                          }
                          value={
                            round.name
                          }
                        >
                          {round.name}
                        </option>
                      )
                    )}

                    <option value="__new">
                      ＋ Neue Akquise-Runde hinzufügen
                    </option>

                  </select>

                  <button
                    type="button"
                    disabled={
                      !selectedRoundName ||
                      selectedRoundName ===
                        "__new"
                    }
                    onClick={() => {
                      const formData =
                        new FormData();

                      formData.set(
                        "round_name",
                        selectedRoundName
                      );

                      startTransition(
                        async () => {
                          const result =
                            await createAcquisition(
                              formData
                            );

                          setActionMessage(
                            result.message
                          );

                          if (
                            result.success
                          ) {
                            setShowNewAcquisitionForm(
                              false
                            );
                          }
                        }
                      );
                    }}
                    className="h-12 rounded-full bg-zinc-950 px-5 text-sm font-black text-white disabled:opacity-30"
                  >
                    Akquise starten
                  </button>

                </div>

                {selectedRoundName ===
                  "__new" && (

                  <div className="mt-4">

                    {!showNewRoundForm ? (
                      <button
                        type="button"
                        onClick={() =>
                          setShowNewRoundForm(
                            true
                          )
                        }
                        className="text-sm font-black text-zinc-600"
                      >
                        + Neue Runde anlegen
                      </button>
                    ) : (

                      <div className="flex gap-2">

                        <input
                          id="new-round-name"
                          placeholder="Name der Akquise-Runde"
                          className="h-12 flex-1 rounded-xl bg-white px-4 text-sm font-semibold ring-1 ring-black/5"
                        />

                        <button
                          type="button"
                          onClick={() => {
                            const input =
                              document.getElementById(
                                "new-round-name"
                              ) as HTMLInputElement | null;

                            if (
                              !input
                            ) {
                              return;
                            }

                            const formData =
                              new FormData();

                            formData.set(
                              "name",
                              input.value
                            );

                            startTransition(
                              async () => {
                                const result =
                                  await createAcquisitionRound(
                                    formData
                                  );

                                setActionMessage(
                                  result.message
                                );

                                if (
                                  result.success &&
                                  result.roundName
                                ) {
                                  const name =
                                    result.roundName;

                                  setRounds(
                                    (
                                      current
                                    ) => {
                                      if (
                                        current.some(
                                          (
                                            item
                                          ) =>
                                            item.name ===
                                            name
                                        )
                                      ) {
                                        return current;
                                      }

                                      return [
                                        ...current,
                                        {
                                          id:
                                            name,
                                          name,
                                          active:
                                            true,
                                          created_at:
                                            null,
                                        },
                                      ].sort(
                                        (
                                          a,
                                          b
                                        ) =>
                                          a.name.localeCompare(
                                            b.name,
                                            "de"
                                          )
                                      );
                                    }
                                  );

                                  setSelectedRoundName(
                                    name
                                  );

                                  setShowNewRoundForm(
                                    false
                                  );
                                }
                              }
                            );
                          }}
                          className="h-12 rounded-xl bg-lime-300 px-5 text-sm font-black text-zinc-950"
                        >
                          Hinzufügen
                        </button>

                      </div>

                    )}

                  </div>
                )}

              </div>

            )}

            {activeAcquisition &&
              showActivityForm && (

              <div className="mb-5 rounded-2xl bg-[#fbf7ef] p-5 ring-1 ring-black/5">

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

            {acquisition.length ===
            0 ? (

              <div className="rounded-2xl border border-dashed border-black/10 bg-[#fbf7ef] px-5 py-8 text-center">

                <p className="text-sm font-black text-zinc-700">
                  Noch keine Akquise für diesen Veranstalter.
                </p>

                <p className="mt-1 text-sm font-semibold text-zinc-400">
                  Starte den ersten Vorgang über „+ Neue Akquise“.
                </p>

              </div>

            ) : (

              <div className="space-y-5">

                {activeAcquisition && (

                  <div>

                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
                      Aktuell
                    </p>

                    <AcquisitionCard
                      item={
                        activeAcquisition
                      }
                      activities={
                        acquisitionActivities.filter(
                          (
                            activity
                          ) =>
                            activity.acquisition_id ===
                            activeAcquisition.id
                        )
                      }
                      deleteActivity={
                        deleteActivity
                      }
                      deleteAcquisition={
                        deleteAcquisition
                      }
                      setActionMessage={
                        setActionMessage
                      }
                    />

                  </div>

                )}

                {acquisition.some(
                  (item) =>
                    item.id !==
                    activeAcquisition?.id
                ) && (

                  <div>

                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
                      Bisherige Vorgänge
                    </p>

                    <div className="space-y-3">

                      {acquisition
                        .filter(
                          (
                            item
                          ) =>
                            item.id !==
                            activeAcquisition?.id
                        )
                        .map(
                          (
                            item
                          ) => (
                            <AcquisitionCard
                              key={
                                item.id
                              }
                              item={
                                item
                              }
                              activities={
                                acquisitionActivities.filter(
                                  (
                                    activity
                                  ) =>
                                    activity.acquisition_id ===
                                    item.id
                                )
                              }
                              deleteActivity={
                                deleteActivity
                              }
                              deleteAcquisition={
                                deleteAcquisition
                              }
                              setActionMessage={
                                setActionMessage
                              }
                            />
                          )
                        )}

                    </div>

                  </div>

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


// ============================================================
// CONTACT VIEW
// ============================================================

function ContactView({
  contact,
}: {
  contact: Contact;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">

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

      <div className="grid gap-4 md:grid-cols-2">

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

      <div className="grid gap-4 md:grid-cols-2">

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
                Nur Spielort
              </span>

              <span className="mt-1 block text-xs font-semibold text-zinc-400">
                {venueOnly
                  ? "Status wird auf „🔴 Nicht relevant“ gesetzt."
                  : "Status wird auf „⚪ Neu“ gesetzt."}
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
    useState(
      venue.acquisition_relevant ===
        false
    );

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

        Nur Spielort / nicht direkt akquirieren

      </label>

      {venue.relationship_status !==
        (venueOnly
          ? "🔴 Nicht relevant"
          : "⚪ Neu") && (

        <p className="mt-2 text-xs font-semibold text-amber-700">
          ⚠️ Der aktuelle Status „{venue.relationship_status || "ohne Status"}“ wird beim Verknüpfen auf{" "}
          <strong>
            {venueOnly
              ? "🔴 Nicht relevant"
              : "⚪ Neu"}
          </strong>{" "}
          geändert.
        </p>

      )}

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
            Nur Spielort
          </span>

          <span className="mt-1 block text-xs font-semibold text-zinc-400">
            Die Location wird als „🔴 Nicht relevant“ in Locations angelegt.
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
  deleteActivity,
  deleteAcquisition,
  setActionMessage,
}: {
  item: AcquisitionRecord;
  activities: AcquisitionActivity[];
  deleteActivity: ServerAction;
  deleteAcquisition: ServerAction;
  setActionMessage:
    (
      value:
        | string
        | null
    ) => void;
}) {
  const [
    open,
    setOpen,
  ] =
    useState(false);

  return (
    <div className="rounded-2xl bg-[#fbf7ef] p-5 ring-1 ring-black/5">

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

        <div>

          <div className="flex flex-wrap items-center gap-2">

            <span className="text-lg font-black">
              {item.program ||
                "Programm offen"}
            </span>

            <AcquisitionStatus
              status={
                item.status
              }
            />

            {item.archived_at && (
              <span className="rounded-full bg-zinc-200 px-2.5 py-1 text-[10px] font-black text-zinc-600">
                Archiv
              </span>
            )}

          </div>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-zinc-600">

            <span>
              📅 WVL{" "}
              <strong>
                {formatDate(
                  item.next_follow_up_at
                )}
              </strong>
            </span>

            <span>
              Letzter Kontakt{" "}
              <strong>
                {formatDate(
                  item.last_contact_at
                )}
              </strong>
            </span>

          </div>

          {item.next_step && (
            <p className="mt-3 text-sm font-semibold text-zinc-700">
              → {item.next_step}
            </p>
          )}

          {item.response && (
            <p className="mt-2 text-sm font-semibold text-zinc-500">
              {item.response}
            </p>
          )}

        </div>

        <button
          type="button"
          onClick={() =>
            setOpen(
              !open
            )
          }
          className="rounded-full bg-white px-4 py-2 text-xs font-black text-zinc-600 ring-1 ring-black/5"
        >
          {open
            ? "Schließen"
            : `Verlauf (${activities.length})`}
        </button>

      </div>

      {open && (

        <div className="mt-4 border-t border-black/5 pt-4">

          {activities.length ===
          0 ? (

            <p className="text-sm font-semibold text-zinc-400">
              Noch keine Kontakteinträge.
            </p>

          ) : (

            <div className="space-y-2">

              {activities.map(
                (
                  activity
                ) => (
                  <div
                    key={
                      activity.id
                    }
                    className="rounded-xl bg-white p-4 ring-1 ring-black/5"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <p className="text-sm font-black text-zinc-800">
                          {activity.activity_type ||
                            "Eintrag"}{" "}
                          ·{" "}
                          {formatDate(
                            activity.activity_date
                          )}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-zinc-400">
                          {activity.channel ||
                            "kein Kanal"}
                        </p>

                        {activity.note && (
                          <p className="mt-2 text-sm font-semibold text-zinc-600">
                            {activity.note}
                          </p>
                        )}

                        {activity.response && (
                          <p className="mt-1 text-sm font-semibold text-zinc-500">
                            Rückmeldung:{" "}
                            {activity.response}
                          </p>
                        )}

                        {activity.next_step && (
                          <p className="mt-1 text-sm font-bold text-zinc-700">
                            →{" "}
                            {activity.next_step}
                          </p>
                        )}

                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (
                            !window.confirm(
                              "Diesen Kontakteintrag wirklich löschen?"
                            )
                          ) {
                            return;
                          }

                          const formData =
                            new FormData();

                          formData.set(
                            "activity_id",
                            activity.id
                          );

                          formData.set(
                            "acquisition_id",
                            item.id
                          );

                          deleteActivity(
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
                        className="text-xs font-black text-red-400 hover:text-red-600"
                      >
                        🗑️
                      </button>

                    </div>

                  </div>
                )
              )}

            </div>

          )}

          <div className="mt-4 flex justify-end">

            <button
              type="button"
              onClick={() => {
                if (
                  !window.confirm(
                    `Diese Akquise „${item.program || "ohne Bezeichnung"}“ inklusive aller Kontakteinträge wirklich löschen?`
                  )
                ) {
                  return;
                }

                const formData =
                  new FormData();

                formData.set(
                  "acquisition_id",
                  item.id
                );

                deleteAcquisition(
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
              className="text-xs font-black text-red-400 transition hover:text-red-600"
            >
              Akquise löschen
            </button>

          </div>

        </div>

      )}

    </div>
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
    <section className="rounded-[1.7rem] bg-white p-6 shadow-lg shadow-black/[0.03] ring-1 ring-black/5">

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
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?:
    | string
    | number
    | null;
  required?: boolean;
  className?: string;
}) {
  return (
    <label
      className={[
        "block",
        className,
      ].join(" ")}
    >

      <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-400">
        {label}
      </span>

      <input
        name={name}
        type={type}
        required={
          required
        }
        defaultValue={
          defaultValue ??
          ""
        }
        className="h-12 w-full rounded-xl bg-[#fbf7ef] px-4 text-sm font-semibold outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-black/10"
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
      className={
        className
      }
    >

      <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-400">
        {label}
      </span>

      <div className="flex min-h-12 items-center rounded-xl bg-[#fbf7ef] px-4 text-sm font-semibold text-zinc-800">
        {value || "—"}
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
        "block",
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
        className="h-12 w-full rounded-xl bg-[#fbf7ef] px-4 text-sm font-bold outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-black/10"
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
        "block",
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
        className="w-full rounded-xl bg-[#fbf7ef] px-4 py-3 text-sm font-semibold outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-black/10"
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