"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
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

  const [search, setSearch] = useState("");
  const [relationshipFilter, setRelationshipFilter] =
    useState("alle");
  const [stateFilter, setStateFilter] = useState("alle");
  const [page, setPage] = useState(1);

  const [sortKey, setSortKey] =
    useState<SortKey>("name");

  const [sortDirection, setSortDirection] =
    useState<SortDirection>("asc");

  // ------------------------------------------------------------
  // FILTEROPTIONEN
  // ------------------------------------------------------------

  const relationshipStatuses = useMemo(() => {
    return Array.from(
      new Set(
        venues
          .map((venue) => venue.relationship_status)
          .filter(Boolean)
      )
    ).sort((a, b) =>
      String(a).localeCompare(String(b), "de")
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
      String(a).localeCompare(String(b), "de")
    ) as string[];
  }, [venues]);

  // ------------------------------------------------------------
  // FILTERN
  // ------------------------------------------------------------

  const filteredVenues = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return venues.filter((venue) => {
      if (
        relationshipFilter !== "alle" &&
        venue.relationship_status !== relationshipFilter
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

      return haystack.includes(needle);
    });
  }, [
    venues,
    search,
    relationshipFilter,
    stateFilter,
  ]);

  // ------------------------------------------------------------
  // SORTIEREN
  // ------------------------------------------------------------

  const sortedVenues = useMemo(() => {
    const result = [...filteredVenues];

    result.sort((a, b) => {
      let valueA: string | number | null = null;
      let valueB: string | number | null = null;

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

      if (sortKey === "relationship") {
        valueA = a.relationship_status || "";
        valueB = b.relationship_status || "";
      }

      if (sortKey === "capacity") {
        valueA = a.capacity;
        valueB = b.capacity;
      }

      // Leere Werte immer nach hinten
      const emptyA =
        valueA === null ||
        valueA === undefined ||
        valueA === "";

      const emptyB =
        valueB === null ||
        valueB === undefined ||
        valueB === "";

      if (emptyA && !emptyB) return 1;
      if (!emptyA && emptyB) return -1;
      if (emptyA && emptyB) return 0;

      let comparison = 0;

      if (
        typeof valueA === "number" &&
        typeof valueB === "number"
      ) {
        comparison = valueA - valueB;
      } else {
        comparison = String(valueA).localeCompare(
          String(valueB),
          "de",
          {
            sensitivity: "base",
            numeric: true,
          }
        );
      }

      return sortDirection === "asc"
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
    Math.ceil(sortedVenues.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedVenues = useMemo(() => {
    const start =
      (currentPage - 1) * PAGE_SIZE;

    return sortedVenues.slice(
      start,
      start + PAGE_SIZE
    );
  }, [sortedVenues, currentPage]);

  // ------------------------------------------------------------
  // STATS
  // ------------------------------------------------------------

  const withContact = venues.filter(
    (venue) =>
      venue.contact_name ||
      venue.contact_email ||
      venue.booking_email
  ).length;

  const playedBefore = venues.filter(
    (venue) => venue.played_before === true
  ).length;

  const missingCoordinates = venues.filter(
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

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function updateRelationship(value: string) {
    setRelationshipFilter(value);
    setPage(1);
  }

  function updateState(value: string) {
    setStateFilter(value);
    setPage(1);
  }

  function changeSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((current) =>
        current === "asc" ? "desc" : "asc"
      );
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }

    setPage(1);
  }

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------

  return (
    <main className="min-h-screen bg-[#fbf7ef] px-8 py-8 text-zinc-950">
      <div className="mx-auto max-w-7xl space-y-5">

        {/* HEADER */}

        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
              primakavi · booking crm
            </p>

            <h1 className="mt-2 text-5xl font-black tracking-tight">
              Locations
            </h1>

            <p className="mt-2 text-zinc-500">
              Spielstätten, Kontakte und Stammdaten an
              einem Ort.
            </p>
          </div>

          <Link
            href="/admin/locations/new"
            className="inline-flex items-center justify-center rounded-full bg-lime-300 px-5 py-3 text-sm font-black text-zinc-950 shadow-sm transition hover:-translate-y-0.5"
          >
            + Neue Location
          </Link>
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
            value={missingCoordinates}
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
                  updateSearch(e.target.value)
                }
                placeholder="Theater, Ort, Ansprechpartner …"
                className="h-12 w-full rounded-xl bg-[#fbf7ef] pl-11 pr-4 text-sm font-semibold outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-black/10"
              />
            </div>

            <select
              value={relationshipFilter}
              onChange={(e) =>
                updateRelationship(e.target.value)
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
                updateState(e.target.value)
              }
              className="h-12 rounded-xl bg-[#fbf7ef] px-4 text-sm font-bold outline-none"
            >
              <option value="alle">
                Alle Bundesländer
              </option>

              {states.map((state) => (
                <option
                  key={state}
                  value={state}
                >
                  {state}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={resetFilters}
              className="h-12 rounded-xl border border-black/10 bg-white px-4 text-sm font-bold transition hover:bg-[#fbf7ef]"
            >
              Reset
            </button>
          </div>
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
                    direction={sortDirection}
                    onSort={changeSort}
                  />

                  <SortableHead
                    label="Ort"
                    sortKey="city"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={changeSort}
                  />

                  <SortableHead
                    label="Kontakt"
                    sortKey="contact"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={changeSort}
                  />

                  <SortableHead
                    label="Beziehung"
                    sortKey="relationship"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={changeSort}
                  />

                  <SortableHead
                    label="Plätze"
                    sortKey="capacity"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={changeSort}
                  />

                  <TableHead>
                    Notiz
                  </TableHead>

                </tr>
              </thead>

              <tbody>
                {paginatedVenues.map((venue) => {

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
                            .filter(Boolean)
                            .join(" ") || "—"}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-zinc-400">
                          {venue.state || "—"}
                        </p>
                      </td>

                      {/* KONTAKT */}

                      <td className="px-5 py-3">
                        <p className="truncate text-sm font-bold">
                          {contact ||
                            "Kein Ansprechpartner"}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-zinc-500">
                          {email || "Keine E-Mail"}
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
                        {venue.capacity ?? "—"}
                      </td>

                      {/* NOTIZ */}

                      <td className="px-5 py-3">
                        <p
                          title={note || undefined}
                          className="line-clamp-2 text-xs leading-5 text-zinc-500"
                        >
                          {note || "—"}
                        </p>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* EMPTY */}

          {paginatedVenues.length === 0 && (
            <div className="px-6 py-14 text-center">
              <div className="text-4xl">
                🔎
              </div>

              <h2 className="mt-3 text-lg font-black">
                Keine Location gefunden
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Suchbegriff oder Filter ändern.
              </p>
            </div>
          )}

          {/* PAGINATION */}

          {sortedVenues.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-black/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-xs font-semibold text-zinc-400">
                {Math.min(
                  (currentPage - 1) * PAGE_SIZE + 1,
                  sortedVenues.length
                )}
                –
                {Math.min(
                  currentPage * PAGE_SIZE,
                  sortedVenues.length
                )}{" "}
                von {sortedVenues.length} Locations
              </p>

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setPage((p) =>
                      Math.max(1, p - 1)
                    )
                  }
                  className="h-9 min-w-9 rounded-lg border border-black/10 px-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ←
                </button>

                {getVisiblePages(
                  currentPage,
                  totalPages
                ).map((pageNumber) => (
                  <button
                    type="button"
                    key={pageNumber}
                    onClick={() =>
                      setPage(pageNumber)
                    }
                    className={[
                      "h-9 min-w-9 rounded-lg px-3 text-sm font-bold transition",
                      currentPage === pageNumber
                        ? "bg-zinc-950 text-white"
                        : "border border-black/10 bg-white hover:bg-[#fbf7ef]",
                    ].join(" ")}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={
                    currentPage === totalPages
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
    </main>
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
  onSort: (key: SortKey) => void;
}) {
  const active = activeKey === sortKey;

  return (
    <th className="px-5 py-3">
      <button
        type="button"
        onClick={() => onSort(sortKey)}
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
  const normalized = status.toLowerCase();

  let className =
    "bg-zinc-100 text-zinc-600";

  if (
    normalized.includes("bestand") ||
    normalized.includes("warm") ||
    normalized.includes("gespielt") ||
    normalized.includes("partner")
  ) {
    className =
      "bg-lime-100 text-lime-800";
  }

  if (
    normalized.includes("akquise") ||
    normalized.includes("kontakt") ||
    normalized.includes("interess")
  ) {
    className =
      "bg-orange-100 text-orange-700";
  }

  if (
    normalized.includes("pause") ||
    normalized.includes("cold") ||
    normalized.includes("kalt")
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
// PAGINATION
// ============================================================

function getVisiblePages(
  currentPage: number,
  totalPages: number
) {
  if (totalPages <= 5) {
    return Array.from(
      { length: totalPages },
      (_, i) => i + 1
    );
  }

  let start = Math.max(
    1,
    currentPage - 2
  );

  let end = Math.min(
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
    { length: end - start + 1 },
    (_, i) => start + i
  );
}