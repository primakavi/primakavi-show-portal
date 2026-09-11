"use client";

import Link from "next/link";
import {
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

type OrganizerContact = {
  id: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  is_primary: boolean | null;
};

type Acquisition = {
  id: string;
  status: string | null;
  last_contact_at: string | null;
  next_follow_up_at: string | null;
  archived_at: string | null;
};

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
  created_at: string | null;

  organizer_contacts: OrganizerContact[] | null;
  acquisition: Acquisition[] | null;
};

type SortKey =
  | "name"
  | "city"
  | "type"
  | "contact"
  | "relationship";

type SortDirection = "asc" | "desc";

const PAGE_SIZE = 20;

// ============================================================
// AKQUISE-STATUS
// ============================================================

function isOpenAcquisition(
  item: Acquisition
) {
  if (item.archived_at) {
    return false;
  }

  const status = (
    item.status || ""
  )
    .trim()
    .toLowerCase();

  const closedStatuses = [
    "abgesagt",
    "gebucht",
    "abgeschlossen",
    "archiv",
    "archiviert",
  ];

  return !closedStatuses.some(
    (closedStatus) =>
      status.includes(closedStatus)
  );
}

export default function OrganizersClient({
  organizers,
}: {
  organizers: Organizer[];
}) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [
    relationshipFilter,
    setRelationshipFilter,
  ] = useState("alle");

  const [typeFilter, setTypeFilter] =
    useState("alle");

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
        organizers
          .map(
            (organizer) =>
              organizer.relationship_status
          )
          .filter(Boolean)
      )
    ).sort((a, b) =>
      String(a).localeCompare(
        String(b),
        "de"
      )
    ) as string[];
  }, [organizers]);

  const organizerTypes = useMemo(() => {
    return Array.from(
      new Set(
        organizers
          .map(
            (organizer) =>
              organizer.organizer_type
          )
          .filter(Boolean)
      )
    ).sort((a, b) =>
      String(a).localeCompare(
        String(b),
        "de"
      )
    ) as string[];
  }, [organizers]);

  // ------------------------------------------------------------
  // FILTERN
  // ------------------------------------------------------------

  const filteredOrganizers = useMemo(() => {
    const needle =
      search.trim().toLowerCase();

    return organizers.filter(
      (organizer) => {
        if (
          relationshipFilter !== "alle" &&
          organizer.relationship_status !==
            relationshipFilter
        ) {
          return false;
        }

        if (
          typeFilter !== "alle" &&
          organizer.organizer_type !==
            typeFilter
        ) {
          return false;
        }

        if (!needle) return true;

        const contacts =
          organizer.organizer_contacts || [];

        const haystack = [
          organizer.name,
          organizer.organizer_type,
          organizer.city,
          organizer.country,
          organizer.email,
          organizer.phone,
          organizer.notes,

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

        return haystack.includes(needle);
      }
    );
  }, [
    organizers,
    search,
    relationshipFilter,
    typeFilter,
  ]);

  // ------------------------------------------------------------
  // SORTIEREN
  // ------------------------------------------------------------

  const sortedOrganizers = useMemo(() => {
    const result = [
      ...filteredOrganizers,
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

      if (sortKey === "type") {
        valueA =
          a.organizer_type || "";
        valueB =
          b.organizer_type || "";
      }

      if (sortKey === "contact") {
        valueA =
          getPrimaryContact(a)?.name ||
          "";

        valueB =
          getPrimaryContact(b)?.name ||
          "";
      }

      if (
        sortKey === "relationship"
      ) {
        valueA =
          a.relationship_status || "";

        valueB =
          b.relationship_status || "";
      }

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

      const comparison =
        String(valueA).localeCompare(
          String(valueB),
          "de",
          {
            sensitivity: "base",
            numeric: true,
          }
        );

      return sortDirection === "asc"
        ? comparison
        : -comparison;
    });

    return result;
  }, [
    filteredOrganizers,
    sortKey,
    sortDirection,
  ]);

  // ------------------------------------------------------------
  // PAGINATION
  // ------------------------------------------------------------

  const totalPages = Math.max(
    1,
    Math.ceil(
      sortedOrganizers.length /
        PAGE_SIZE
    )
  );

  const currentPage = Math.min(
    page,
    totalPages
  );

  const paginatedOrganizers =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        PAGE_SIZE;

      return sortedOrganizers.slice(
        start,
        start + PAGE_SIZE
      );
    }, [
      sortedOrganizers,
      currentPage,
    ]);

  // ------------------------------------------------------------
  // STATS
  // ------------------------------------------------------------

  const withContact =
    organizers.filter(
      (organizer) =>
        (
          organizer.organizer_contacts ||
          []
        ).length > 0 ||
        organizer.email
    ).length;

  const withOpenAcquisition =
    organizers.filter((organizer) =>
      (
        organizer.acquisition || []
      ).some(isOpenAcquisition)
    ).length;

  const withoutActiveAcquisition =
    organizers.filter(
      (organizer) =>
        !(
          organizer.acquisition || []
        ).some(isOpenAcquisition)
    ).length;

  // ------------------------------------------------------------
  // ACTIONS
  // ------------------------------------------------------------

  function resetFilters() {
    setSearch("");
    setRelationshipFilter("alle");
    setTypeFilter("alle");
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

  function updateType(
    value: string
  ) {
    setTypeFilter(value);
    setPage(1);
  }

  function changeSort(key: SortKey) {
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

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------

  return (
    <div className="space-y-5 text-zinc-950 sm:space-y-6">

      {/* HEADER */}

      <header className="flex flex-col gap-5 px-1 py-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
            primakavi · booking crm
          </p>

          <h1 className="mt-2 text-5xl font-black tracking-tight">
            Veranstalter
          </h1>

          <p className="mt-2 text-zinc-500">
            Formate, Redaktionen,
            Comedy-Reihen und Veranstalter
            an einem Ort.
          </p>
        </div>

        <Link
          href="/admin/organizers/new"
          className="inline-flex items-center justify-center rounded-full bg-lime-300 px-5 py-3 text-sm font-black text-zinc-950 shadow-sm transition hover:-translate-y-0.5"
        >
          + Neuer Veranstalter
        </Link>
      </header>

      {/* STATS */}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="🏢"
          value={organizers.length}
          label="Veranstalter"
        />

        <StatCard
          icon="👤"
          value={withContact}
          label="mit Kontakt"
        />

        <StatCard
          icon="🎯"
          value={withOpenAcquisition}
          label="offene Akquise"
        />

        <StatCard
          icon="○"
          value={withoutActiveAcquisition}
          label="ohne aktive Akquise"
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
              placeholder="Veranstalter, Ort, Ansprechpartner …"
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
            value={typeFilter}
            onChange={(e) =>
              updateType(
                e.target.value
              )
            }
            className="h-12 rounded-xl bg-[#fbf7ef] px-4 text-sm font-bold outline-none"
          >
            <option value="alle">
              Alle Typen
            </option>

            {organizerTypes.map(
              (type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
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
      </section>

      {/* TABLE */}

      <section className="overflow-hidden rounded-[1.7rem] bg-white shadow-xl shadow-black/[0.04] ring-1 ring-black/5">
        <div className="overflow-x-auto">

          <table className="w-full table-fixed border-collapse">

            <colgroup>
              <col className="w-[24%]" />
              <col className="w-[15%]" />
              <col className="w-[14%]" />
              <col className="w-[22%]" />
              <col className="w-[14%]" />
              <col className="w-[11%]" />
            </colgroup>

            <thead>
              <tr className="border-b border-black/5 bg-zinc-50/70 text-left">

                <SortableHead
                  label="Veranstalter"
                  sortKey="name"
                  activeKey={sortKey}
                  direction={
                    sortDirection
                  }
                  onSort={changeSort}
                />

                <SortableHead
                  label="Typ"
                  sortKey="type"
                  activeKey={sortKey}
                  direction={
                    sortDirection
                  }
                  onSort={changeSort}
                />

                <SortableHead
                  label="Ort"
                  sortKey="city"
                  activeKey={sortKey}
                  direction={
                    sortDirection
                  }
                  onSort={changeSort}
                />

                <SortableHead
                  label="Kontakt"
                  sortKey="contact"
                  activeKey={sortKey}
                  direction={
                    sortDirection
                  }
                  onSort={changeSort}
                />

                <SortableHead
                  label="Beziehung"
                  sortKey="relationship"
                  activeKey={sortKey}
                  direction={
                    sortDirection
                  }
                  onSort={changeSort}
                />

                <TableHead>
                  Akquise
                </TableHead>

              </tr>
            </thead>

            <tbody>
              {paginatedOrganizers.map(
                (organizer) => {
                  const primary =
                    getPrimaryContact(
                      organizer
                    );

                  const activeAcquisition =
                    (
                      organizer.acquisition ||
                      []
                    ).filter(
                      isOpenAcquisition
                    );

                  return (
                    <tr
                      key={organizer.id}
                      onClick={() =>
                        router.push(
                          `/admin/organizers/${organizer.id}`
                        )
                      }
                      className="cursor-pointer border-b border-black/5 transition last:border-0 hover:bg-[#f8f3e9]"
                    >

                      {/* VERANSTALTER */}

                      <td className="px-5 py-3">
                        <p className="truncate font-black">
                          {organizer.name}
                        </p>
                      </td>

                      {/* TYP */}

                      <td className="px-5 py-3">
                        <p className="truncate text-sm font-bold">
                          {organizer.organizer_type ||
                            "—"}
                        </p>
                      </td>

                      {/* ORT */}

                      <td className="px-5 py-3">
                        <p className="truncate text-sm font-bold">
                          {organizer.city ||
                            "—"}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-zinc-400">
                          {organizer.country ||
                            "—"}
                        </p>
                      </td>

                      {/* KONTAKT */}

                      <td className="px-5 py-3">
                        <p className="truncate text-sm font-bold">
                          {primary?.name ||
                            "Kein Ansprechpartner"}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-zinc-500">
                          {primary?.email ||
                            organizer.email ||
                            "Keine E-Mail"}
                        </p>
                      </td>

                      {/* BEZIEHUNG */}

                      <td className="px-5 py-3">
                        {organizer.relationship_status ? (
                          <RelationshipBadge
                            status={
                              organizer.relationship_status
                            }
                          />
                        ) : (
                          <span className="text-sm text-zinc-300">
                            —
                          </span>
                        )}
                      </td>

                      {/* AKQUISE */}

                      <td className="px-5 py-3">
                        {activeAcquisition.length >
                        0 ? (
                          <span className="text-xs font-black text-zinc-700">
                            🎯{" "}
                            {
                              activeAcquisition.length
                            }{" "}
                            offen
                          </span>
                        ) : (
                          <span className="text-sm text-zinc-300">
                            —
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>

        {/* EMPTY */}

        {paginatedOrganizers.length ===
          0 && (
          <div className="px-6 py-14 text-center">
            <div className="text-4xl">
              🔎
            </div>

            <h2 className="mt-3 text-lg font-black">
              Kein Veranstalter gefunden
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Suchbegriff oder Filter
              ändern.
            </p>
          </div>
        )}

        {/* PAGINATION */}

        {sortedOrganizers.length >
          0 && (
          <div className="flex flex-col gap-3 border-t border-black/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-xs font-semibold text-zinc-400">
              {Math.min(
                (currentPage - 1) *
                  PAGE_SIZE +
                  1,
                sortedOrganizers.length
              )}
              –
              {Math.min(
                currentPage *
                  PAGE_SIZE,
                sortedOrganizers.length
              )}{" "}
              von{" "}
              {
                sortedOrganizers.length
              }{" "}
              Veranstaltern
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
                    key={pageNumber}
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
                    ].join(" ")}
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
  );
}


// ============================================================
// HELPERS
// ============================================================

function getPrimaryContact(
  organizer: Organizer
) {
  const contacts =
    organizer.organizer_contacts || [];

  return (
    contacts.find(
      (contact) =>
        contact.is_primary
    ) ||
    contacts[0] ||
    null
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
    normalized.includes("warm") ||
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
    {
      length:
        end - start + 1,
    },
    (_, i) => start + i
  );
}