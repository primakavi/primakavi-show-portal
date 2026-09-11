"use client";

import Link from "next/link";
import {
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

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

  internal_notes: string | null;
  special_notes: string | null;

  lat: number | string | null;
  lng: number | string | null;

  played_before: boolean | null;

  season_notes: string | null;
  program_focus: string[] | null;

  instagram_url: string | null;
  facebook_url: string | null;
  logo_url: string | null;

  created_at: string | null;
  updated_at: string | null;
};

type SortKey =
  | "name"
  | "city"
  | "contact"
  | "relationship"
  | "capacity";

type SortDirection = "asc" | "desc";

const PAGE_SIZE = 20;

export default function LocationsClient({
  venues,
}: {
  venues: Venue[];
}) {
  const router = useRouter();

  const [search, setSearch] =
    useState("");

  const [
    relationshipFilter,
    setRelationshipFilter,
  ] = useState("alle");

  const [stateFilter, setStateFilter] =
    useState("alle");

  const [page, setPage] =
    useState(1);

  const [sortKey, setSortKey] =
    useState<SortKey>("name");

  const [
    sortDirection,
    setSortDirection,
  ] = useState<SortDirection>("asc");

  // ------------------------------------------------------------
  // FILTEROPTIONEN
  // ------------------------------------------------------------

  const relationshipStatuses =
    useMemo(() => {
      return Array.from(
        new Set(
          venues
            .map(
              (venue) =>
                venue.relationship_status
            )
            .filter(Boolean)
        )
      ).sort((a, b) =>
        String(a).localeCompare(
          String(b),
          "de"
        )
      ) as string[];
    }, [venues]);

  const states = useMemo(() => {
    return Array.from(
      new Set(
        venues
          .map((venue) => venue.state)
          .filter(Boolean)
      )
    ).sort((a, b) =>
      String(a).localeCompare(
        String(b),
        "de"
      )
    ) as string[];
  }, [venues]);

  // ------------------------------------------------------------
  // FILTERN
  // ------------------------------------------------------------

  const filteredVenues =
    useMemo(() => {
      const needle = search
        .trim()
        .toLowerCase();

      return venues.filter(
        (venue) => {
          if (
            relationshipFilter !==
              "alle" &&
            venue.relationship_status !==
              relationshipFilter
          ) {
            return false;
          }

          if (
            stateFilter !== "alle" &&
            venue.state !== stateFilter
          ) {
            return false;
          }

          if (!needle) return true;

          const haystack = [
            venue.name,
            venue.city,
            venue.postal_code,
            venue.state,
            venue.contact_name,
            venue.contact_name_2,
            venue.contact_email,
            venue.contact_email_2,
            venue.booking_email,
            venue.internal_notes,
            venue.special_notes,
            venue.season_notes,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return haystack.includes(
            needle
          );
        }
      );
    }, [
      venues,
      search,
      relationshipFilter,
      stateFilter,
    ]);

  // ------------------------------------------------------------
  // SORTIEREN
  // ------------------------------------------------------------

  const sortedVenues =
    useMemo(() => {
      const result = [
        ...filteredVenues,
      ];

      result.sort((a, b) => {
        let valueA:
          | string
          | number
          | null = null;

        let valueB:
          | string
          | number
          | null = null;

        if (sortKey === "name") {
          valueA = a.name;
          valueB = b.name;
        }

        if (sortKey === "city") {
          valueA = a.city;
          valueB = b.city;
        }

        if (sortKey === "contact") {
          valueA =
            a.contact_name ||
            a.contact_name_2 ||
            "";

          valueB =
            b.contact_name ||
            b.contact_name_2 ||
            "";
        }

        if (
          sortKey ===
          "relationship"
        ) {
          valueA =
            a.relationship_status ||
            "";

          valueB =
            b.relationship_status ||
            "";
        }

        if (
          sortKey === "capacity"
        ) {
          valueA = a.capacity;
          valueB = b.capacity;
        }

        const emptyA =
          valueA === null ||
          valueA === undefined ||
          valueA === "";

        const emptyB =
          valueB === null ||
          valueB === undefined ||
          valueB === "";

        if (emptyA && !emptyB) {
          return 1;
        }

        if (!emptyA && emptyB) {
          return -1;
        }

        if (emptyA && emptyB) {
          return 0;
        }

        let comparison = 0;

        if (
          typeof valueA ===
            "number" &&
          typeof valueB ===
            "number"
        ) {
          comparison =
            valueA - valueB;
        } else {
          comparison =
            String(
              valueA
            ).localeCompare(
              String(valueB),
              "de",
              {
                sensitivity: "base",
                numeric: true,
              }
            );
        }

        return sortDirection ===
          "asc"
          ? comparison
          : -comparison;
      });

      return result;
    }, [
      filteredVenues,
      sortKey,
      sortDirection,
    ]);

  // ------------------------------------------------------------
  // PAGINATION
  // ------------------------------------------------------------

  const totalPages = Math.max(
    1,
    Math.ceil(
      sortedVenues.length /
        PAGE_SIZE
    )
  );

  const currentPage = Math.min(
    page,
    totalPages
  );

  const paginatedVenues =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        PAGE_SIZE;

      return sortedVenues.slice(
        start,
        start + PAGE_SIZE
      );
    }, [
      sortedVenues,
      currentPage,
    ]);

  // ------------------------------------------------------------
  // STATS
  // ------------------------------------------------------------

  const withContact =
    venues.filter(
      (venue) =>
        venue.contact_name ||
        venue.contact_email ||
        venue.booking_email
    ).length;

  const playedBefore =
    venues.filter(
      (venue) =>
        venue.played_before === true
    ).length;

  const missingCoordinates =
    venues.filter(
      (venue) =>
        venue.lat === null ||
        venue.lng === null
    ).length;

  // ------------------------------------------------------------
  // ACTIONS
  // ------------------------------------------------------------

  function resetFilters() {
    setSearch("");
    setRelationshipFilter("alle");
    setStateFilter("alle");
    setPage(1);
  }

  function updateSearch(
    value: string
  ) {
    setSearch(value);
    setPage(1);
  }

  function updateRelationship(
    value: string
  ) {
    setRelationshipFilter(value);
    setPage(1);
  }

  function updateState(
    value: string
  ) {
    setStateFilter(value);
    setPage(1);
  }

  function changeSort(
    key: SortKey
  ) {
    if (sortKey === key) {
      setSortDirection(
        (current) =>
          current === "asc"
            ? "desc"
            : "asc"
      );
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }

    setPage(1);
  }

  function exportPdf() {
    window.print();
  }

  // ------------------------------------------------------------
  // FILTERTEXT FÜR PDF
  // ------------------------------------------------------------

  const activeFilterText =
    useMemo(() => {
      const parts: string[] = [];

      if (search.trim()) {
        parts.push(
          `Suche: „${search.trim()}“`
        );
      }

      if (
        relationshipFilter !==
        "alle"
      ) {
        parts.push(
          `Beziehung: ${relationshipFilter}`
        );
      }

      if (
        stateFilter !== "alle"
      ) {
        parts.push(
          `Bundesland: ${stateFilter}`
        );
      }

      return parts.length
        ? parts.join(" · ")
        : "Keine Filter gesetzt";
    }, [
      search,
      relationshipFilter,
      stateFilter,
    ]);

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------

  return (
    <>
      {/* ======================================================
          NORMALE CRM-ANSICHT
      ====================================================== */}

      <div className="space-y-5 text-zinc-950 sm:space-y-6 print:hidden">

        {/* HEADER */}

        <header className="flex flex-col gap-5 px-1 py-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
              primakavi · booking crm
            </p>

            <h1 className="mt-2 text-5xl font-black tracking-tight">
              Locations
            </h1>

            <p className="mt-2 text-zinc-500">
              Spielstätten, Kontakte
              und Stammdaten an einem
              Ort.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">

            <button
              type="button"
              onClick={exportPdf}
              disabled={
                sortedVenues.length === 0
              }
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-black text-zinc-600 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
              📄 PDF exportieren
            </button>

            <Link
              href="/admin/locations/new"
              className="inline-flex items-center justify-center rounded-full bg-lime-300 px-5 py-3 text-sm font-black text-zinc-950 shadow-sm transition hover:-translate-y-0.5"
            >
              + Neue Location
            </Link>

          </div>
        </header>

        {/* STATS */}

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            icon="🏛️"
            value={venues.length}
            label="Locations"
          />

          <StatCard
            icon="👤"
            value={withContact}
            label="mit Kontakt"
          />

          <StatCard
            icon="🎤"
            value={playedBefore}
            label="schon gespielt"
          />

          <StatCard
            icon="📍"
            value={
              missingCoordinates
            }
            label="ohne Koordinaten"
          />

        </section>

        {/* FILTER */}

        <section className="rounded-[1.7rem] bg-white p-4 shadow-lg shadow-black/[0.03] ring-1 ring-black/5">

          <div className="grid gap-3 xl:grid-cols-[1fr_230px_230px_auto]">

            <div className="relative">

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                🔎
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  updateSearch(
                    e.target.value
                  )
                }
                placeholder="Theater, Ort, Ansprechpartner …"
                className="h-12 w-full rounded-xl bg-[#fbf7ef] pl-11 pr-4 text-sm font-semibold outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-black/10"
              />

            </div>

            <select
              value={
                relationshipFilter
              }
              onChange={(e) =>
                updateRelationship(
                  e.target.value
                )
              }
              className="h-12 rounded-xl bg-[#fbf7ef] px-4 text-sm font-bold outline-none"
            >

              <option value="alle">
                Alle Beziehungen
              </option>

              {relationshipStatuses.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                )
              )}

            </select>

            <select
              value={stateFilter}
              onChange={(e) =>
                updateState(
                  e.target.value
                )
              }
              className="h-12 rounded-xl bg-[#fbf7ef] px-4 text-sm font-bold outline-none"
            >

              <option value="alle">
                Alle Bundesländer
              </option>

              {states.map(
                (state) => (
                  <option
                    key={state}
                    value={state}
                  >
                    {state}
                  </option>
                )
              )}

            </select>

            <button
              type="button"
              onClick={resetFilters}
              className="h-12 rounded-xl border border-black/10 bg-white px-4 text-sm font-bold transition hover:bg-[#fbf7ef]"
            >
              Reset
            </button>

          </div>

          {/* FILTERERGEBNIS */}

          {(search.trim() ||
            relationshipFilter !==
              "alle" ||
            stateFilter !==
              "alle") && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-black/5 px-1 pt-3">

              <span className="text-xs font-black text-zinc-600">
                {sortedVenues.length}{" "}
                {sortedVenues.length ===
                1
                  ? "Treffer"
                  : "Treffer"}
              </span>

              <span className="text-zinc-300">
                ·
              </span>

              <span className="text-xs font-semibold text-zinc-400">
                {activeFilterText}
              </span>

            </div>
          )}

        </section>

        {/* TABLE */}

        <section className="overflow-hidden rounded-[1.7rem] bg-white shadow-xl shadow-black/[0.04] ring-1 ring-black/5">

          <div className="overflow-x-auto">

            <table className="w-full table-fixed border-collapse">

              <colgroup>
                <col className="w-[25%]" />
                <col className="w-[17%]" />
                <col className="w-[22%]" />
                <col className="w-[15%]" />
                <col className="w-[8%]" />
                <col className="w-[13%]" />
              </colgroup>

              <thead>
                <tr className="border-b border-black/5 bg-zinc-50/70 text-left">

                  <SortableHead
                    label="Location"
                    sortKey="name"
                    activeKey={sortKey}
                    direction={
                      sortDirection
                    }
                    onSort={
                      changeSort
                    }
                  />

                  <SortableHead
                    label="Ort"
                    sortKey="city"
                    activeKey={sortKey}
                    direction={
                      sortDirection
                    }
                    onSort={
                      changeSort
                    }
                  />

                  <SortableHead
                    label="Kontakt"
                    sortKey="contact"
                    activeKey={sortKey}
                    direction={
                      sortDirection
                    }
                    onSort={
                      changeSort
                    }
                  />

                  <SortableHead
                    label="Beziehung"
                    sortKey="relationship"
                    activeKey={sortKey}
                    direction={
                      sortDirection
                    }
                    onSort={
                      changeSort
                    }
                  />

                  <SortableHead
                    label="Plätze"
                    sortKey="capacity"
                    activeKey={sortKey}
                    direction={
                      sortDirection
                    }
                    onSort={
                      changeSort
                    }
                  />

                  <TableHead>
                    Notiz
                  </TableHead>

                </tr>
              </thead>

              <tbody>

                {paginatedVenues.map(
                  (venue) => {

                    const email =
                      venue.contact_email ||
                      venue.booking_email ||
                      venue.contact_email_2;

                    const contact =
                      venue.contact_name ||
                      venue.contact_name_2;

                    const note =
                      venue.internal_notes ||
                      venue.special_notes ||
                      venue.season_notes;

                    return (
                      <tr
                        key={venue.id}
                        onClick={() =>
                          router.push(
                            `/admin/locations/${venue.id}`
                          )
                        }
                        className="cursor-pointer border-b border-black/5 transition last:border-0 hover:bg-[#f8f3e9]"
                      >

                        {/* LOCATION */}

                        <td className="px-5 py-3">
                          <p className="truncate font-black">
                            {venue.name}
                          </p>
                        </td>

                        {/* ORT */}

                        <td className="px-5 py-3">

                          <p className="truncate text-sm font-bold">
                            {[
                              venue.postal_code,
                              venue.city,
                            ]
                              .filter(
                                Boolean
                              )
                              .join(
                                " "
                              ) ||
                              "—"}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-zinc-400">
                            {venue.state ||
                              "—"}
                          </p>

                        </td>

                        {/* KONTAKT */}

                        <td className="px-5 py-3">

                          <p className="truncate text-sm font-bold">
                            {contact ||
                              "Kein Ansprechpartner"}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-zinc-500">
                            {email ||
                              "Keine E-Mail"}
                          </p>

                        </td>

                        {/* BEZIEHUNG */}

                        <td className="px-5 py-3">

                          {venue.relationship_status ? (
                            <RelationshipBadge
                              status={
                                venue.relationship_status
                              }
                            />
                          ) : (
                            <span className="text-sm text-zinc-300">
                              —
                            </span>
                          )}

                        </td>

                        {/* PLÄTZE */}

                        <td className="px-5 py-3 text-sm font-bold">
                          {venue.capacity ??
                            "—"}
                        </td>

                        {/* NOTIZ */}

                        <td className="px-5 py-3">

                          <p
                            title={
                              note ||
                              undefined
                            }
                            className="line-clamp-2 text-xs leading-5 text-zinc-500"
                          >
                            {note ||
                              "—"}
                          </p>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

          {/* EMPTY */}

          {paginatedVenues.length ===
            0 && (
            <div className="px-6 py-14 text-center">

              <div className="text-4xl">
                🔎
              </div>

              <h2 className="mt-3 text-lg font-black">
                Keine Location gefunden
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Suchbegriff oder
                Filter ändern.
              </p>

            </div>
          )}

          {/* PAGINATION */}

          {sortedVenues.length >
            0 && (
            <div className="flex flex-col gap-3 border-t border-black/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-xs font-semibold text-zinc-400">

                {Math.min(
                  (currentPage - 1) *
                    PAGE_SIZE +
                    1,
                  sortedVenues.length
                )}
                –
                {Math.min(
                  currentPage *
                    PAGE_SIZE,
                  sortedVenues.length
                )}{" "}
                von{" "}
                {sortedVenues.length}{" "}
                Locations

              </p>

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  disabled={
                    currentPage === 1
                  }
                  onClick={() =>
                    setPage((p) =>
                      Math.max(
                        1,
                        p - 1
                      )
                    )
                  }
                  className="h-9 min-w-9 rounded-lg border border-black/10 px-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ←
                </button>

                {getVisiblePages(
                  currentPage,
                  totalPages
                ).map(
                  (pageNumber) => (
                    <button
                      type="button"
                      key={
                        pageNumber
                      }
                      onClick={() =>
                        setPage(
                          pageNumber
                        )
                      }
                      className={[
                        "h-9 min-w-9 rounded-lg px-3 text-sm font-bold transition",
                        currentPage ===
                        pageNumber
                          ? "bg-zinc-950 text-white"
                          : "border border-black/10 bg-white hover:bg-[#fbf7ef]",
                      ].join(
                        " "
                      )}
                    >
                      {pageNumber}
                    </button>
                  )
                )}

                <button
                  type="button"
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setPage((p) =>
                      Math.min(
                        totalPages,
                        p + 1
                      )
                    )
                  }
                  className="h-9 min-w-9 rounded-lg border border-black/10 px-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-30"
                >
                  →
                </button>

              </div>

            </div>
          )}

        </section>

      </div>

      {/* ======================================================
          PDF / DRUCKANSICHT
      ====================================================== */}

      <section className="hidden print:block">

        {/* PDF HEADER */}

        <div className="mb-6 border-b border-zinc-300 pb-4">

          <p className="text-[9pt] font-bold uppercase tracking-widest text-zinc-500">
            primakavi · booking crm
          </p>

          <div className="mt-2 flex items-end justify-between gap-6">

            <div>

              <h1 className="text-[24pt] font-black leading-none text-black">
                Locations
              </h1>

              <p className="mt-2 text-[9pt] text-zinc-500">
                Booking-Übersicht
              </p>

            </div>

            <div className="text-right">

              <p className="text-[13pt] font-black text-black">
                {sortedVenues.length}
              </p>

              <p className="text-[8pt] font-bold text-zinc-500">
                {sortedVenues.length ===
                1
                  ? "Location"
                  : "Locations"}
              </p>

            </div>

          </div>

          <div className="mt-4 rounded-md bg-zinc-100 px-3 py-2">

            <p className="text-[8pt] font-bold text-zinc-600">
              {activeFilterText}
            </p>

          </div>

        </div>

        {/* PDF TABLE */}

        <table className="w-full border-collapse text-[7.5pt]">

          <thead>
            <tr className="border-b-2 border-black text-left">

              <PrintHead>
                Location
              </PrintHead>

              <PrintHead>
                Ort
              </PrintHead>

              <PrintHead>
                Plätze
              </PrintHead>

              <PrintHead>
                Kontakt
              </PrintHead>

              <PrintHead>
                E-Mail / Telefon
              </PrintHead>

              <PrintHead>
                Beziehung
              </PrintHead>

              <PrintHead>
                Notiz
              </PrintHead>

            </tr>
          </thead>

          <tbody>

            {sortedVenues.map(
              (venue) => {

                const contact =
                  venue.contact_name ||
                  venue.contact_name_2 ||
                  "—";

                const email =
                  venue.contact_email ||
                  venue.booking_email ||
                  venue.contact_email_2 ||
                  null;

                const phone =
                  venue.contact_phone ||
                  venue.contact_phone_2 ||
                  null;

                const note =
                  venue.internal_notes ||
                  venue.special_notes ||
                  venue.season_notes ||
                  "—";

                return (
                  <tr
                    key={
                      venue.id
                    }
                    className="break-inside-avoid border-b border-zinc-200 align-top"
                  >

                    <PrintCell>
                      <span className="font-black">
                        {venue.name}
                      </span>
                    </PrintCell>

                    <PrintCell>

                      <span className="font-bold">
                        {[
                          venue.postal_code,
                          venue.city,
                        ]
                          .filter(
                            Boolean
                          )
                          .join(
                            " "
                          ) ||
                          "—"}
                      </span>

                      {venue.state && (
                        <div className="mt-0.5 text-[6.5pt] text-zinc-500">
                          {venue.state}
                        </div>
                      )}

                    </PrintCell>

                    <PrintCell>
                      {venue.capacity ??
                        "—"}
                    </PrintCell>

                    <PrintCell>
                      {contact}
                    </PrintCell>

                    <PrintCell>

                      <div>
                        {email || "—"}
                      </div>

                      {phone && (
                        <div className="mt-1 text-zinc-500">
                          {phone}
                        </div>
                      )}

                    </PrintCell>

                    <PrintCell>
                      {venue.relationship_status ||
                        "—"}
                    </PrintCell>

                    <PrintCell>
                      {note}
                    </PrintCell>

                  </tr>
                );
              }
            )}

          </tbody>

        </table>

        {/* FOOTER */}

        <div className="mt-5 border-t border-zinc-300 pt-2 text-[7pt] text-zinc-400">
          primakavi · Booking CRM ·{" "}
          {new Intl.DateTimeFormat(
            "de-DE"
          ).format(new Date())}
        </div>

      </section>

      {/* ======================================================
          DRUCKEINSTELLUNGEN
      ====================================================== */}

      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }

          html,
          body {
            background: white !important;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          aside,
          nav {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

// ============================================================
// SORTIERBARER TABELLENKOPF
// ============================================================

function SortableHead({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  direction: SortDirection;
  onSort: (
    key: SortKey
  ) => void;
}) {
  const active =
    activeKey === sortKey;

  return (
    <th className="px-5 py-3">

      <button
        type="button"
        onClick={() =>
          onSort(sortKey)
        }
        className={[
          "inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] font-black uppercase tracking-wider transition",
          active
            ? "text-zinc-950"
            : "text-zinc-400 hover:text-zinc-700",
        ].join(" ")}
      >

        {label}

        <span
          className={
            active
              ? "text-zinc-950"
              : "text-zinc-300"
          }
        >
          {active
            ? direction === "asc"
              ? "↑"
              : "↓"
            : "↕"}
        </span>

      </button>

    </th>
  );
}

// ============================================================
// NORMALER TABELLENKOPF
// ============================================================

function TableHead({
  children,
}: {
  children?: ReactNode;
}) {
  return (
    <th className="px-5 py-3 text-[11px] font-black uppercase tracking-wider text-zinc-400">
      {children}
    </th>
  );
}

// ============================================================
// STAT
// ============================================================

function StatCard({
  icon,
  value,
  label,
}: {
  icon: string;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-[1.4rem] bg-white px-5 py-4 shadow-lg shadow-black/[0.03] ring-1 ring-black/5">

      <div className="flex items-center gap-4">

        <div className="text-3xl">
          {icon}
        </div>

        <div>

          <p className="text-2xl font-black leading-none">
            {value}
          </p>

          <p className="mt-1 text-xs font-semibold text-zinc-400">
            {label}
          </p>

        </div>

      </div>

    </div>
  );
}

// ============================================================
// BEZIEHUNGSSTATUS
// ============================================================

function RelationshipBadge({
  status,
}: {
  status: string;
}) {
  const normalized =
    status.toLowerCase();

  let className =
    "bg-zinc-100 text-zinc-600";

  if (
    normalized.includes(
      "bestand"
    ) ||
    normalized.includes(
      "warm"
    ) ||
    normalized.includes(
      "gespielt"
    ) ||
    normalized.includes(
      "partner"
    )
  ) {
    className =
      "bg-lime-100 text-lime-800";
  }

  if (
    normalized.includes(
      "akquise"
    ) ||
    normalized.includes(
      "kontakt"
    ) ||
    normalized.includes(
      "interess"
    )
  ) {
    className =
      "bg-orange-100 text-orange-700";
  }

  if (
    normalized.includes(
      "pause"
    ) ||
    normalized.includes(
      "cold"
    ) ||
    normalized.includes(
      "kalt"
    )
  ) {
    className =
      "bg-zinc-100 text-zinc-500";
  }

  return (
    <span
      className={[
        "inline-flex max-w-full whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-black",
        className,
      ].join(" ")}
    >
      {status}
    </span>
  );
}

// ============================================================
// PDF TABLE HELPERS
// ============================================================

function PrintHead({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <th className="px-2 py-2 font-black uppercase tracking-wide text-black">
      {children}
    </th>
  );
}

function PrintCell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <td className="max-w-[45mm] px-2 py-2 leading-[1.35] text-zinc-800">
      {children}
    </td>
  );
}

// ============================================================
// PAGINATION
// ============================================================

function getVisiblePages(
  currentPage: number,
  totalPages: number
) {
  if (totalPages <= 5) {
    return Array.from(
      {
        length: totalPages,
      },
      (_, i) => i + 1
    );
  }

  let start = Math.max(
    1,
    currentPage - 2
  );

  const end = Math.min(
    totalPages,
    start + 4
  );

  if (end - start < 4) {
    start = Math.max(
      1,
      end - 4
    );
  }

  return Array.from(
    {
      length:
        end - start + 1,
    },
    (_, i) => start + i
  );
}