"use client";

import Link from "next/link";
import {
  useMemo,
  useState,
} from "react";

type Venue = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  contact_name: string | null;
  contact_email: string | null;
  booking_email: string | null;
  relationship_status: string | null;
  acquisition_relevant:
    | boolean
    | null;
};

type OrganizerContact = {
  id: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  is_primary: boolean;
};

type Organizer = {
  id: string;
  name: string;
  organizer_type: string | null;
  city: string | null;
  email: string | null;
  phone: string | null;
  relationship_status: string | null;
  organizer_contacts:
    OrganizerContact[];
};

type TargetType =
  | "venue"
  | "organizer";

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
  "Volljährig",
  "Mix",
];

export default function NewAcquisitionClient({
  venues,
  organizers,
  createAcquisition,
  initialVenueId,
  initialOrganizerId,
}: {
  venues: Venue[];
  organizers: Organizer[];
  createAcquisition: (
    formData: FormData
  ) => Promise<void>;
  initialVenueId?: string;
  initialOrganizerId?: string;
}) {
  // ============================================================
  // INITIAL TARGET
  // ============================================================

  const initialVenue =
    useMemo(
      () =>
        venues.find(
          (venue) =>
            venue.id ===
            initialVenueId
        ) || null,
      [
        venues,
        initialVenueId,
      ]
    );

  const initialOrganizer =
    useMemo(
      () =>
        organizers.find(
          (organizer) =>
            organizer.id ===
            initialOrganizerId
        ) || null,
      [
        organizers,
        initialOrganizerId,
      ]
    );

  const [
    targetType,
    setTargetType,
  ] = useState<TargetType>(
    initialOrganizer
      ? "organizer"
      : "venue"
  );

  const [
    search,
    setSearch,
  ] = useState(
    initialOrganizer?.name ||
      initialVenue?.name ||
      ""
  );

  const [
    selectedVenueId,
    setSelectedVenueId,
  ] = useState(
    initialVenue?.id || ""
  );

  const [
    selectedOrganizerId,
    setSelectedOrganizerId,
  ] = useState(
    initialOrganizer?.id || ""
  );

  const [
    program,
    setProgram,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState("Neu");

  const [
    priority,
    setPriority,
  ] = useState("Normal");

  // ============================================================
  // AUSGEWÄHLTE DATENSÄTZE
  // ============================================================

  const selectedVenue =
    useMemo(
      () =>
        venues.find(
          (venue) =>
            venue.id ===
            selectedVenueId
        ) || null,
      [
        venues,
        selectedVenueId,
      ]
    );

  const selectedOrganizer =
    useMemo(
      () =>
        organizers.find(
          (organizer) =>
            organizer.id ===
            selectedOrganizerId
        ) || null,
      [
        organizers,
        selectedOrganizerId,
      ]
    );

  const selectedOrganizerContact =
    useMemo(() => {
      if (
        !selectedOrganizer
      ) {
        return null;
      }

      return (
        selectedOrganizer.organizer_contacts?.find(
          (contact) =>
            contact.is_primary
        ) ||
        selectedOrganizer
          .organizer_contacts?.[0] ||
        null
      );
    }, [selectedOrganizer]);

  // ============================================================
  // LOCATION-SUCHE
  // ============================================================

  const filteredVenues =
    useMemo(() => {
      const needle =
        search
          .trim()
          .toLowerCase();

      // reine Spielorte nicht
      // als Akquise-Ziel anbieten
      const relevantVenues =
        venues.filter(
          (venue) =>
            venue.acquisition_relevant !==
            false
        );

      if (!needle) {
        return relevantVenues.slice(
          0,
          12
        );
      }

      return relevantVenues
        .filter((venue) => {
          const haystack = [
            venue.name,
            venue.city,
            venue.state,
            venue.contact_name,
            venue.contact_email,
            venue.booking_email,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return haystack.includes(
            needle
          );
        })
        .slice(0, 20);
    }, [venues, search]);

  // ============================================================
  // VERANSTALTER-SUCHE
  // ============================================================

  const filteredOrganizers =
    useMemo(() => {
      const needle =
        search
          .trim()
          .toLowerCase();

      if (!needle) {
        return organizers.slice(
          0,
          12
        );
      }

      return organizers
        .filter((organizer) => {
          const contacts =
            organizer.organizer_contacts ||
            [];

          const haystack = [
            organizer.name,
            organizer.organizer_type,
            organizer.city,
            organizer.email,
            organizer.phone,

            ...contacts.flatMap(
              (contact) => [
                contact.name,
                contact.role,
                contact.email,
                contact.phone,
              ]
            ),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return haystack.includes(
            needle
          );
        })
        .slice(0, 20);
    }, [
      organizers,
      search,
    ]);

  // ============================================================
  // TARGET WECHSELN
  // ============================================================

  function changeTargetType(
    type: TargetType
  ) {
    setTargetType(type);

    setSearch("");
    setSelectedVenueId("");
    setSelectedOrganizerId("");
  }

  // ============================================================
  // LOCATION
  // ============================================================

  function selectVenue(
    venue: Venue
  ) {
    setSelectedVenueId(
      venue.id
    );

    setSelectedOrganizerId("");

    setSearch(venue.name);
  }

  function clearVenue() {
    setSelectedVenueId("");
    setSearch("");
  }

  // ============================================================
  // VERANSTALTER
  // ============================================================

  function selectOrganizer(
    organizer: Organizer
  ) {
    setSelectedOrganizerId(
      organizer.id
    );

    setSelectedVenueId("");

    setSearch(
      organizer.name
    );
  }

  function clearOrganizer() {
    setSelectedOrganizerId("");
    setSearch("");
  }

  const hasTarget =
    Boolean(
      selectedVenueId ||
        selectedOrganizerId
    );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <main className="min-h-screen bg-[#fbf7ef] px-8 py-8 text-zinc-950">
      <div className="mx-auto max-w-5xl space-y-5">

        {/* HEADER */}

        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
              primakavi · booking crm
            </p>

            <h1 className="mt-2 text-5xl font-black tracking-tight">
              Neuer Vorgang
            </h1>

            <p className="mt-2 text-zinc-500">
              Neue Akquise für eine
              Location oder einen
              Veranstalter anlegen.
            </p>
          </div>

          <Link
            href="/admin/acquisition"
            className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-black text-zinc-700 shadow-sm transition hover:bg-[#f8f3e9]"
          >
            ← Zurück
          </Link>
        </header>

        {/* FORM */}

        <form
          action={
            createAcquisition
          }
          className="space-y-5"
        >

          {/* TARGET */}

          <section className="rounded-[1.7rem] bg-white p-6 shadow-xl shadow-black/[0.04] ring-1 ring-black/5">
            <div className="mb-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
                Ziel
              </p>

              <h2 className="mt-1 text-xl font-black">
                Wen möchtest du
                akquirieren?
              </h2>
            </div>

            {/* TARGET TYPE */}

            <div className="mb-5 inline-flex rounded-full bg-[#fbf7ef] p-1 ring-1 ring-black/5">
              <button
                type="button"
                onClick={() =>
                  changeTargetType(
                    "venue"
                  )
                }
                className={`rounded-full px-5 py-2.5 text-sm font-black transition ${
                  targetType ===
                  "venue"
                    ? "bg-zinc-950 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-950"
                }`}
              >
                🏛️ Location
              </button>

              <button
                type="button"
                onClick={() =>
                  changeTargetType(
                    "organizer"
                  )
                }
                className={`rounded-full px-5 py-2.5 text-sm font-black transition ${
                  targetType ===
                  "organizer"
                    ? "bg-zinc-950 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-950"
                }`}
              >
                🏢 Veranstalter
              </button>
            </div>

            <input
              type="hidden"
              name="venue_id"
              value={
                selectedVenueId
              }
            />

            <input
              type="hidden"
              name="organizer_id"
              value={
                selectedOrganizerId
              }
            />

            {/* ==================================================
                LOCATION
            ================================================== */}

            {targetType ===
              "venue" && (
              <>
                {!selectedVenue && (
                  <>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                        🔎
                      </span>

                      <input
                        type="text"
                        value={search}
                        onChange={(
                          e
                        ) => {
                          setSearch(
                            e.target
                              .value
                          );

                          setSelectedVenueId(
                            ""
                          );
                        }}
                        placeholder="Location oder Ort suchen …"
                        className="h-12 w-full rounded-xl bg-[#fbf7ef] pl-11 pr-4 text-sm font-semibold outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-black/10"
                      />
                    </div>

                    <div className="mt-3 overflow-hidden rounded-xl border border-black/5">
                      {filteredVenues.map(
                        (
                          venue
                        ) => (
                          <button
                            type="button"
                            key={
                              venue.id
                            }
                            onClick={() =>
                              selectVenue(
                                venue
                              )
                            }
                            className="flex w-full items-center justify-between gap-4 border-b border-black/5 px-4 py-3 text-left transition hover:bg-[#f8f3e9]"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-black">
                                🏛️{" "}
                                {
                                  venue.name
                                }
                              </p>

                              <p className="mt-0.5 text-xs text-zinc-400">
                                {[venue.city, venue.state]
                                  .filter(Boolean)
                                  .join(" · ") ||
                                  "Ort nicht hinterlegt"}
                              </p>
                            </div>

                            <span className="shrink-0 text-xs font-bold text-zinc-400">
                              auswählen
                            </span>
                          </button>
                        )
                      )}

                      {filteredVenues.length ===
                        0 && (
                        <div className="px-4 py-5 text-center">
                          <div className="text-3xl">
                            🏛️
                          </div>

                          <p className="mt-2 text-sm font-black text-zinc-950">
                            Keine passende
                            Location
                            gefunden
                          </p>

                          <p className="mt-1 text-xs text-zinc-400">
                            Die
                            Spielstätte ist
                            vermutlich noch
                            nicht im CRM.
                          </p>
                        </div>
                      )}

                      <div className="border-t border-black/5 bg-[#fbf7ef] px-4 py-3">
                        <Link
                          href="/admin/locations/new?returnTo=acquisition"
                          className="flex w-full items-center justify-center rounded-xl bg-lime-300 px-4 py-3 text-sm font-black text-zinc-950 transition hover:-translate-y-0.5"
                        >
                          + Neue Location
                          anlegen
                        </Link>
                      </div>
                    </div>
                  </>
                )}

                {selectedVenue && (
                  <div className="rounded-[1.3rem] bg-[#fbf7ef] p-5 ring-1 ring-black/5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-black">
                            🏛️{" "}
                            {
                              selectedVenue.name
                            }
                          </p>

                          <span className="inline-flex rounded-full bg-lime-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-lime-800">
                            ausgewählt
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-zinc-500">
                          {[selectedVenue.city, selectedVenue.state]
                            .filter(Boolean)
                            .join(" · ") ||
                            "Ort nicht hinterlegt"}
                        </p>

                        <div className="mt-4">
                          <p className="text-xs font-black uppercase tracking-[0.12em] text-zinc-400">
                            Kontakt
                          </p>

                          <p className="mt-1 text-sm font-bold">
                            {selectedVenue.contact_name ||
                              "Kein Ansprechpartner"}
                          </p>

                          <p className="mt-0.5 text-xs text-zinc-500">
                            {selectedVenue.contact_email ||
                              selectedVenue.booking_email ||
                              "Keine E-Mail hinterlegt"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={
                          clearVenue
                        }
                        className="shrink-0 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-black text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950"
                      >
                        Location ändern
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ==================================================
                VERANSTALTER
            ================================================== */}

            {targetType ===
              "organizer" && (
              <>
                {!selectedOrganizer && (
                  <>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                        🔎
                      </span>

                      <input
                        type="text"
                        value={search}
                        onChange={(
                          e
                        ) => {
                          setSearch(
                            e.target
                              .value
                          );

                          setSelectedOrganizerId(
                            ""
                          );
                        }}
                        placeholder="Veranstalter, Format oder Ort suchen …"
                        className="h-12 w-full rounded-xl bg-[#fbf7ef] pl-11 pr-4 text-sm font-semibold outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-black/10"
                      />
                    </div>

                    <div className="mt-3 overflow-hidden rounded-xl border border-black/5">
                      {filteredOrganizers.map(
                        (
                          organizer
                        ) => (
                          <button
                            type="button"
                            key={
                              organizer.id
                            }
                            onClick={() =>
                              selectOrganizer(
                                organizer
                              )
                            }
                            className="flex w-full items-center justify-between gap-4 border-b border-black/5 px-4 py-3 text-left transition hover:bg-[#f8f3e9]"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-black">
                                🏢{" "}
                                {
                                  organizer.name
                                }
                              </p>

                              <p className="mt-0.5 text-xs text-zinc-400">
                                {[
                                  organizer.organizer_type,
                                  organizer.city,
                                ]
                                  .filter(Boolean)
                                  .join(" · ") ||
                                  "Keine weiteren Angaben"}
                              </p>
                            </div>

                            <span className="shrink-0 text-xs font-bold text-zinc-400">
                              auswählen
                            </span>
                          </button>
                        )
                      )}

                      {filteredOrganizers.length ===
                        0 && (
                        <div className="px-4 py-5 text-center">
                          <div className="text-3xl">
                            🏢
                          </div>

                          <p className="mt-2 text-sm font-black text-zinc-950">
                            Kein passender
                            Veranstalter
                            gefunden
                          </p>

                          <p className="mt-1 text-xs text-zinc-400">
                            Der
                            Veranstalter ist
                            vermutlich noch
                            nicht im CRM.
                          </p>
                        </div>
                      )}

                      <div className="border-t border-black/5 bg-[#fbf7ef] px-4 py-3">
                        <Link
                          href="/admin/organizers/new"
                          className="flex w-full items-center justify-center rounded-xl bg-lime-300 px-4 py-3 text-sm font-black text-zinc-950 transition hover:-translate-y-0.5"
                        >
                          + Neuen
                          Veranstalter
                          anlegen
                        </Link>
                      </div>
                    </div>
                  </>
                )}

                {selectedOrganizer && (
                  <div className="rounded-[1.3rem] bg-[#fbf7ef] p-5 ring-1 ring-black/5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-black">
                            🏢{" "}
                            {
                              selectedOrganizer.name
                            }
                          </p>

                          <span className="inline-flex rounded-full bg-lime-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-lime-800">
                            ausgewählt
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-zinc-500">
                          {[
                            selectedOrganizer.organizer_type,
                            selectedOrganizer.city,
                          ]
                            .filter(Boolean)
                            .join(" · ") ||
                            "Keine weiteren Angaben"}
                        </p>

                        <div className="mt-4">
                          <p className="text-xs font-black uppercase tracking-[0.12em] text-zinc-400">
                            Kontakt
                          </p>

                          <p className="mt-1 text-sm font-bold">
                            {selectedOrganizerContact?.name ||
                              "Kein Ansprechpartner"}
                          </p>

                          {selectedOrganizerContact?.role && (
                            <p className="mt-0.5 text-xs text-zinc-400">
                              {
                                selectedOrganizerContact.role
                              }
                            </p>
                          )}

                          <p className="mt-1 text-xs text-zinc-500">
                            {selectedOrganizerContact?.email ||
                              selectedOrganizer.email ||
                              "Keine E-Mail hinterlegt"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={
                          clearOrganizer
                        }
                        className="shrink-0 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-black text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950"
                      >
                        Veranstalter
                        ändern
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>

          {/* VORGANG */}

          <section className="rounded-[1.7rem] bg-white p-6 shadow-xl shadow-black/[0.04] ring-1 ring-black/5">
            <div className="mb-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
                Vorgang
              </p>

              <h2 className="mt-1 text-xl font-black">
                Was ist der aktuelle
                Stand?
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">

              <Field label="Programm">
                <select
                  name="program"
                  value={program}
                  onChange={(e) =>
                    setProgram(
                      e.target.value
                    )
                  }
                  className="h-12 w-full rounded-xl bg-[#fbf7ef] px-4 text-sm font-bold outline-none"
                >
                  <option value="">
                    Programm auswählen
                  </option>

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
                  value={status}
                  onChange={(e) =>
                    setStatus(
                      e.target.value
                    )
                  }
                  className="h-12 w-full rounded-xl bg-[#fbf7ef] px-4 text-sm font-bold outline-none"
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
                  value={priority}
                  onChange={(e) =>
                    setPriority(
                      e.target.value
                    )
                  }
                  className="h-12 w-full rounded-xl bg-[#fbf7ef] px-4 text-sm font-bold outline-none"
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

              <Field label="Nächstes Follow-up">
                <input
                  type="date"
                  name="next_follow_up_at"
                  className="h-12 w-full rounded-xl bg-[#fbf7ef] px-4 text-sm font-bold outline-none"
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="Nächster Schritt">
                  <input
                    type="text"
                    name="next_step"
                    placeholder="z. B. nächste Woche telefonisch nachfassen"
                    className="h-12 w-full rounded-xl bg-[#fbf7ef] px-4 text-sm font-semibold outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-black/10"
                  />
                </Field>
              </div>

              <div className="md:col-span-2">
                <Field label="Notiz">
                  <textarea
                    name="notes"
                    rows={5}
                    placeholder="Alles, was du zu diesem Akquise-Vorgang wissen willst …"
                    className="w-full resize-y rounded-xl bg-[#fbf7ef] px-4 py-3 text-sm font-semibold outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-black/10"
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* SAVE */}

          <div className="sticky bottom-5 z-10 flex justify-end">
            <button
              type="submit"
              disabled={!hasTarget}
              className="inline-flex items-center justify-center rounded-full bg-lime-300 px-7 py-3.5 text-sm font-black text-zinc-950 shadow-xl shadow-black/10 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
            >
              Vorgang anlegen
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

// ============================================================
// FIELD
// ============================================================

function Field({
  label,
  children,
}: {
  label: string;
  children:
    React.ReactNode;
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