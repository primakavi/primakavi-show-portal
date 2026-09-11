"use client";

import Link from "next/link";
import {
  Fragment,
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
  capacity: number | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  booking_email: string | null;
  relationship_status: string | null;
};

type OrganizerVenue = Venue & {
  is_primary: boolean;
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
};

type Acquisition = {
  id: string;

  venue_id: string | null;
  organizer_id: string | null;

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

  venue: Venue[];
  organizer: Organizer[];
  organizer_venues: OrganizerVenue[];
};

type ViewMode = "active" | "archive";

type WorkFilter =
  | "alle"
  | "overdue"
  | "today"
  | "week"
  | "no_follow_up";

type SortKey =
  | "target"
  | "city"
  | "program"
  | "status"
  | "last_contact"
  | "follow_up";

type SortDirection = "asc" | "desc";

const PAGE_SIZE = 20;

// ============================================================
// ABGESCHLOSSENE STATUS
// ============================================================

function isCompletedStatus(status?: string | null) {
  const value = String(status || "").toLowerCase();

  return (
    value.includes("abgesagt") ||
    value.includes("gebucht") ||
    value.includes("abgeschlossen") ||
    value.includes("archiviert") ||
    value.includes("archiv")
  );
}

export default function AcquisitionClient({
  acquisition,
  archiveAcquisition,
  restoreAcquisition,
  createShowFromAcquisition,
}: {
  acquisition: Acquisition[];
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
  const [view, setView] =
    useState<ViewMode>("active");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("alle");

  const [programFilter, setProgramFilter] =
    useState("alle");

  const [workFilter, setWorkFilter] =
    useState<WorkFilter>("alle");

  const [page, setPage] = useState(1);

  const [sortKey, setSortKey] =
    useState<SortKey>("follow_up");

  const [sortDirection, setSortDirection] =
    useState<SortDirection>("asc");

  const [showPickerId, setShowPickerId] =
    useState<string | null>(null);

  const router = useRouter();

  // ============================================================
  // AKTIV / ARCHIV
  // ============================================================

  const activeAcquisition = useMemo(
    () =>
      acquisition.filter(
        (item) =>
          !item.archived_at &&
          !isCompletedStatus(item.status)
      ),
    [acquisition]
  );

  /*
   * "Archiv" zeigt:
   * 1. manuell archivierte Vorgänge
   * 2. abgeschlossene Vorgänge
   *
   * Damit verschwindet nichts aus dem CRM.
   */
  const archivedAcquisition = useMemo(
    () =>
      acquisition.filter(
        (item) =>
          !!item.archived_at ||
          isCompletedStatus(item.status)
      ),
    [acquisition]
  );

  const currentAcquisition =
    view === "active"
      ? activeAcquisition
      : archivedAcquisition;

  // ============================================================
  // FILTEROPTIONEN
  // ============================================================

  const statuses = useMemo(() => {
    return Array.from(
      new Set(
        currentAcquisition
          .map((item) => item.status)
          .filter(Boolean)
      )
    ).sort((a, b) =>
      String(a).localeCompare(
        String(b),
        "de"
      )
    ) as string[];
  }, [currentAcquisition]);

  const programs = useMemo(() => {
    return Array.from(
      new Set(
        currentAcquisition
          .map((item) => item.program)
          .filter(Boolean)
      )
    ).sort((a, b) =>
      String(a).localeCompare(
        String(b),
        "de"
      )
    ) as string[];
  }, [currentAcquisition]);

  // ============================================================
  // FILTERN
  // ============================================================

  const filteredAcquisition = useMemo(() => {
    const needle =
      search.trim().toLowerCase();

    return currentAcquisition.filter(
      (item) => {
        const venue =
          item.venue?.[0] ?? null;

        const organizer =
          item.organizer?.[0] ?? null;

        if (
          statusFilter !== "alle" &&
          item.status !== statusFilter
        ) {
          return false;
        }

        if (
          programFilter !== "alle" &&
          item.program !== programFilter
        ) {
          return false;
        }

        if (
          view === "active" &&
          workFilter !== "alle"
        ) {
          const followUp =
            item.next_follow_up_at;

          const today =
            localDateOnly(new Date());

          const endOfWeek =
            localDateOnly(
              getEndOfWeek(new Date())
            );

          if (
            workFilter === "overdue" &&
            (!followUp ||
              followUp >= today)
          ) {
            return false;
          }

          if (
            workFilter === "today" &&
            followUp !== today
          ) {
            return false;
          }

          if (
            workFilter === "week" &&
            (!followUp ||
              followUp <= today ||
              followUp > endOfWeek)
          ) {
            return false;
          }

          if (
            workFilter ===
              "no_follow_up" &&
            followUp
          ) {
            return false;
          }
        }

        if (!needle) {
          return true;
        }

        const haystack = [
          venue?.name,
          venue?.city,
          venue?.state,

          organizer?.name,
          organizer?.city,
          organizer?.country,
          organizer?.organizer_type,

          ...item.organizer_venues.flatMap(
            (linkedVenue) => [
              linkedVenue.name,
              linkedVenue.city,
              linkedVenue.state,
            ]
          ),

          item.program,
          item.status,
          item.priority,
          item.next_step,
          item.notes,
          item.response,
          item.interest,
          item.context,
          item.contact_note,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(needle);
      }
    );
  }, [
    currentAcquisition,
    search,
    statusFilter,
    programFilter,
    workFilter,
    view,
  ]);

  // ============================================================
  // SORTIEREN
  // ============================================================

  const sortedAcquisition = useMemo(() => {
    const result = [
      ...filteredAcquisition,
    ];

    result.sort((a, b) => {
      const targetA =
        getTarget(a);

      const targetB =
        getTarget(b);

      let valueA:
        | string
        | null = null;

      let valueB:
        | string
        | null = null;

      if (sortKey === "target") {
        valueA = targetA.name;
        valueB = targetB.name;
      }

      if (sortKey === "city") {
        valueA = targetA.city;
        valueB = targetB.city;
      }

      if (sortKey === "program") {
        valueA = a.program || "";
        valueB = b.program || "";
      }

      if (sortKey === "status") {
        valueA = a.status || "";
        valueB = b.status || "";
      }

      if (
        sortKey === "last_contact"
      ) {
        valueA =
          a.last_contact_at;

        valueB =
          b.last_contact_at;
      }

      if (sortKey === "follow_up") {
        valueA =
          a.next_follow_up_at;

        valueB =
          b.next_follow_up_at;
      }

      const emptyA = !valueA;
      const emptyB = !valueB;

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
    filteredAcquisition,
    sortKey,
    sortDirection,
  ]);

  // ============================================================
  // PAGINATION
  // ============================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      sortedAcquisition.length /
        PAGE_SIZE
    )
  );

  const currentPage = Math.min(
    page,
    totalPages
  );

  const paginatedAcquisition =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        PAGE_SIZE;

      return sortedAcquisition.slice(
        start,
        start + PAGE_SIZE
      );
    }, [
      sortedAcquisition,
      currentPage,
    ]);

  // ============================================================
  // STATS
  // ============================================================

  const followUpsDue =
    activeAcquisition.filter(
      (item) =>
        isDue(
          item.next_follow_up_at
        )
    ).length;

  const withInterest =
    activeAcquisition.filter(
      (item) => {
        const status = String(
          item.status || ""
        ).toLowerCase();

        return (
          status.includes("interesse") ||
          status.includes(
            "verhandlung"
          )
        );
      }
    ).length;

  const todayKey =
    localDateOnly(new Date());

  const endOfWeekKey =
    localDateOnly(
      getEndOfWeek(new Date())
    );

  const workCounts = {
    overdue:
      activeAcquisition.filter(
        (item) =>
          !!item.next_follow_up_at &&
          item.next_follow_up_at <
            todayKey
      ).length,

    today:
      activeAcquisition.filter(
        (item) =>
          item.next_follow_up_at ===
          todayKey
      ).length,

    week:
      activeAcquisition.filter(
        (item) =>
          !!item.next_follow_up_at &&
          item.next_follow_up_at >
            todayKey &&
          item.next_follow_up_at <=
            endOfWeekKey
      ).length,

    no_follow_up:
      activeAcquisition.filter(
        (item) =>
          !item.next_follow_up_at
      ).length,
  };

  // ============================================================
  // ACTIONS
  // ============================================================

  function resetFilters() {
    setSearch("");
    setStatusFilter("alle");
    setProgramFilter("alle");
    setWorkFilter("alle");
    setPage(1);
  }

  function changeView(
    value: ViewMode
  ) {
    setView(value);
    setStatusFilter("alle");
    setProgramFilter("alle");
    setWorkFilter("alle");
    setShowPickerId(null);
    setPage(1);
  }

  function changeWorkFilter(
    value: WorkFilter
  ) {
    setWorkFilter(value);
    setSortKey("follow_up");
    setSortDirection("asc");
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

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-5 text-zinc-950 sm:space-y-6">
      {/* HEADER */}

      <header className="flex flex-col gap-5 px-1 py-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
            primakavi · booking crm
          </p>

          <h1 className="mt-2 text-5xl font-black tracking-tight">
            Akquise
          </h1>

          <p className="mt-2 text-zinc-500">
            Locations und Veranstalter ansprechen,
            nachfassen und Buchungen entwickeln.
          </p>
        </div>

        <Link
          href="/admin/acquisition/new"
          className="inline-flex items-center justify-center rounded-full bg-lime-300 px-5 py-3 text-sm font-black text-zinc-950 shadow-sm transition hover:-translate-y-0.5"
        >
          + Neuer Vorgang
        </Link>
      </header>

      {/* STATS */}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="🎯"
          value={
            activeAcquisition.length
          }
          label="aktive Vorgänge"
        />

        <StatCard
          icon="⏰"
          value={followUpsDue}
          label="Follow-up fällig"
        />

        <StatCard
          icon="💚"
          value={withInterest}
          label="mit Interesse"
        />

        <StatCard
          icon="📦"
          value={
            archivedAcquisition.length
          }
          label="abgeschlossen / Archiv"
        />
      </section>

      {/* ARBEITSMODUS */}

      {view === "active" && (
        <section className="rounded-[1.7rem] bg-white p-4 shadow-lg shadow-black/[0.03] ring-1 ring-black/5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
              Arbeitsmodus
            </span>

            <WorkFilterButton
              active={
                workFilter ===
                "overdue"
              }
              onClick={() =>
                changeWorkFilter(
                  "overdue"
                )
              }
              label="🔥 Überfällig"
              count={
                workCounts.overdue
              }
              critical
            />

            <WorkFilterButton
              active={
                workFilter === "today"
              }
              onClick={() =>
                changeWorkFilter(
                  "today"
                )
              }
              label="📅 Heute"
              count={workCounts.today}
            />

            <WorkFilterButton
              active={
                workFilter === "week"
              }
              onClick={() =>
                changeWorkFilter(
                  "week"
                )
              }
              label="⏭ Diese Woche"
              count={workCounts.week}
            />

            <WorkFilterButton
              active={
                workFilter ===
                "no_follow_up"
              }
              onClick={() =>
                changeWorkFilter(
                  "no_follow_up"
                )
              }
              label="💤 Ohne Wiedervorlage"
              count={
                workCounts.no_follow_up
              }
            />

            {workFilter !== "alle" && (
              <button
                type="button"
                onClick={() =>
                  changeWorkFilter(
                    "alle"
                  )
                }
                className="ml-auto rounded-full px-3 py-2 text-xs font-black text-zinc-400 transition hover:bg-[#fbf7ef] hover:text-zinc-800"
              >
                Alle anzeigen
              </button>
            )}
          </div>
        </section>
      )}

      {/* FILTER */}

      <section className="rounded-[1.7rem] bg-white p-4 shadow-lg shadow-black/[0.03] ring-1 ring-black/5">
        <div className="grid gap-3 xl:grid-cols-[1fr_200px_220px_190px_auto]">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
              🔎
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(
                  e.target.value
                );
                setPage(1);
              }}
              placeholder="Ziel, Ort, Notiz …"
              className="h-12 w-full rounded-xl bg-[#fbf7ef] pl-11 pr-4 text-sm font-semibold outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-black/10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(
                e.target.value
              );
              setPage(1);
            }}
            className="h-12 rounded-xl bg-[#fbf7ef] px-4 text-sm font-bold outline-none"
          >
            <option value="alle">
              Alle Status
            </option>

            {statuses.map(
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
            value={programFilter}
            onChange={(e) => {
              setProgramFilter(
                e.target.value
              );
              setPage(1);
            }}
            className="h-12 rounded-xl bg-[#fbf7ef] px-4 text-sm font-bold outline-none"
          >
            <option value="alle">
              Alle Aktionen
            </option>

            {programs.map(
              (program) => (
                <option
                  key={program}
                  value={program}
                >
                  {program}
                </option>
              )
            )}
          </select>

          <div className="flex h-12 rounded-xl bg-[#fbf7ef] p-1">
            <button
              type="button"
              onClick={() =>
                changeView("active")
              }
              className={[
                "flex-1 rounded-lg px-3 text-xs font-black transition",
                view === "active"
                  ? "bg-zinc-950 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-950",
              ].join(" ")}
            >
              Aktiv
            </button>

            <button
              type="button"
              onClick={() =>
                changeView("archive")
              }
              className={[
                "flex-1 rounded-lg px-3 text-xs font-black transition",
                view === "archive"
                  ? "bg-zinc-950 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-950",
              ].join(" ")}
            >
              Archiv
            </button>
          </div>

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
              <col className="w-[19%]" />
              <col className="w-[11%]" />
              <col className="w-[14%]" />
              <col className="w-[12%]" />
              <col className="w-[11%]" />
              <col className="w-[11%]" />
              <col className="w-[13%]" />
              <col className="w-[9%]" />
            </colgroup>

            <thead>
              <tr className="border-b border-black/5 bg-zinc-50/70 text-left">
                <SortableHead
                  label="Ziel"
                  sortKey="target"
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
                  label="Aktion"
                  sortKey="program"
                  activeKey={sortKey}
                  direction={
                    sortDirection
                  }
                  onSort={changeSort}
                />

                <SortableHead
                  label="Status"
                  sortKey="status"
                  activeKey={sortKey}
                  direction={
                    sortDirection
                  }
                  onSort={changeSort}
                />

                <SortableHead
                  label="Kontakt"
                  sortKey="last_contact"
                  activeKey={sortKey}
                  direction={
                    sortDirection
                  }
                  onSort={changeSort}
                />

                <SortableHead
                  label="Follow-up"
                  sortKey="follow_up"
                  activeKey={sortKey}
                  direction={
                    sortDirection
                  }
                  onSort={changeSort}
                />

                <TableHead>
                  Nächster Schritt
                </TableHead>

                <TableHead>
                  Aktion
                </TableHead>
              </tr>
            </thead>

            <tbody>
              {paginatedAcquisition.map(
                (item) => {
                  const target =
                    getTarget(item);

                  const isOrganizer =
                    Boolean(
                      item.organizer_id
                    );

                  const organizerVenues =
                    item.organizer_venues ||
                    [];

                  const needsPicker =
                    isOrganizer &&
                    organizerVenues.length >
                      1;

                  const hasVenue =
                    Boolean(
                      item.venue_id
                    ) ||
                    organizerVenues.length >
                      0;

                 return (
  <Fragment key={item.id}>
    <tr
      onClick={() =>
        router.push(
          `/admin/acquisition/${item.id}`
        )
      }
      className="cursor-pointer border-b border-black/5 transition last:border-0 hover:bg-[#f8f3e9]"
    >
      {/* ZIEL */}

                        <td className="px-5 py-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className="shrink-0 text-sm"
                              title={
                                target.type ===
                                "organizer"
                                  ? "Veranstalter"
                                  : "Location"
                              }
                            >
                              {target.type ===
                              "organizer"
                                ? "🏢"
                                : "🏛️"}
                            </span>

                            <div className="min-w-0">
                              <p className="truncate font-black">
                                {
                                  target.name
                                }
                              </p>

                              {target.type ===
                                "organizer" &&
                                target.subtitle && (
                                  <p className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                                    {
                                      target.subtitle
                                    }
                                  </p>
                                )}
                            </div>
                          </div>
                        </td>

                        {/* ORT */}

                        <td className="px-5 py-3">
                          <p className="truncate text-sm font-bold">
                            {target.city ||
                              "—"}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-zinc-400">
                            {target.region ||
                              "—"}
                          </p>
                        </td>

                        {/* AKTION */}

                        <td className="px-5 py-3">
                          <p className="line-clamp-2 text-sm font-bold">
                            {item.program ||
                              "—"}
                          </p>
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-3">
                          <StatusBadge
                            status={
                              item.status
                            }
                          />
                        </td>

                        {/* KONTAKT */}

                        <td className="px-5 py-3 text-sm font-bold">
                          {formatDate(
                            item.last_contact_at
                          )}
                        </td>

                        {/* FOLLOW-UP */}

                        <td className="px-5 py-3">
                          {item.next_follow_up_at ? (
                            <FollowUpBadge
                              date={
                                item.next_follow_up_at
                              }
                            />
                          ) : (
                            <span className="text-sm text-zinc-300">
                              —
                            </span>
                          )}
                        </td>

                        {/* NÄCHSTER SCHRITT */}

                        <td className="px-5 py-3">
                          <p
                            title={
                              item.next_step ||
                              undefined
                            }
                            className="line-clamp-2 text-xs leading-5 text-zinc-500"
                          >
                            {item.next_step ||
                              "—"}
                          </p>
                        </td>

                        {/* SHOW */}

                        <td className="px-5 py-3">
                          {view ===
                          "active" ? (
                            !item.converted_to_show ? (
                              hasVenue ? (
                                needsPicker ? (
                                  <button
                                    type="button"
                                    onClick={(
                                      e
                                    ) => {
                                      e.stopPropagation();

                                      setShowPickerId(
                                        (
                                          current
                                        ) =>
                                          current ===
                                          item.id
                                            ? null
                                            : item.id
                                      );
                                    }}
                                    className="whitespace-nowrap rounded-full bg-lime-300 px-3 py-2 text-[11px] font-black text-zinc-950 transition hover:-translate-y-0.5"
                                    title="Spielort auswählen und Show-Akte anlegen"
                                  >
                                    🎉 Show
                                  </button>
                                ) : (
                                  <form
                                    action={
                                      createShowFromAcquisition
                                    }
                                    onClick={(
                                      e
                                    ) =>
                                      e.stopPropagation()
                                    }
                                  >
                                    <input
                                      type="hidden"
                                      name="acquisition_id"
                                      value={
                                        item.id
                                      }
                                    />

                                    {isOrganizer &&
                                      organizerVenues.length ===
                                        1 && (
                                        <input
                                          type="hidden"
                                          name="venue_id"
                                          value={
                                            organizerVenues[0]
                                              .id
                                          }
                                        />
                                      )}

                                    <button
                                      type="submit"
                                      onClick={(
                                        e
                                      ) =>
                                        e.stopPropagation()
                                      }
                                      className="whitespace-nowrap rounded-full bg-lime-300 px-3 py-2 text-[11px] font-black text-zinc-950 transition hover:-translate-y-0.5"
                                      title="Show-Akte aus diesem Vorgang anlegen"
                                    >
                                      🎉 Show
                                    </button>
                                  </form>
                                )
                              ) : (
                                <Link
                                  href={
                                    item.organizer_id
                                      ? `/admin/organizers/${item.organizer_id}`
                                      : "#"
                                  }
                                  onClick={(
                                    e
                                  ) =>
                                    e.stopPropagation()
                                  }
                                  className="inline-flex whitespace-nowrap rounded-full bg-zinc-100 px-3 py-2 text-[11px] font-black text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-950"
                                  title="Erst einen Spielort beim Veranstalter hinterlegen"
                                >
                                  + Spielort
                                </Link>
                              )
                            ) : (
                              <span className="inline-flex whitespace-nowrap rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-black text-green-800">
                                ✓ Show
                              </span>
                            )
                          ) : (
                            <span className="text-xs text-zinc-300">
                              —
                            </span>
                          )}
                        </td>
                      </tr>

                      {/* SPIELORTAUSWAHL */}

                      {showPickerId ===
                        item.id &&
                        needsPicker && (
                          <tr
                            key={`${item.id}-show-picker`}
                            className="border-b border-black/5 bg-[#fbf7ef]"
                          >
                            <td
                              colSpan={8}
                              className="px-5 py-4"
                              onClick={(
                                e
                              ) =>
                                e.stopPropagation()
                              }
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <p className="text-sm font-black">
                                    Spielort
                                    für die
                                    Show
                                    auswählen
                                  </p>

                                  <p className="mt-1 text-xs text-zinc-500">
                                    {
                                      target.name
                                    }{" "}
                                    ist mit{" "}
                                    {
                                      organizerVenues.length
                                    }{" "}
                                    Spielorten
                                    verknüpft.
                                  </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  {organizerVenues.map(
                                    (
                                      linkedVenue
                                    ) => (
                                      <form
                                        key={
                                          linkedVenue.id
                                        }
                                        action={
                                          createShowFromAcquisition
                                        }
                                      >
                                        <input
                                          type="hidden"
                                          name="acquisition_id"
                                          value={
                                            item.id
                                          }
                                        />

                                        <input
                                          type="hidden"
                                          name="venue_id"
                                          value={
                                            linkedVenue.id
                                          }
                                        />

                                        <button
                                          type="submit"
                                          className="rounded-full bg-white px-4 py-2 text-xs font-black text-zinc-950 shadow-sm ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:bg-lime-300"
                                        >
                                          {linkedVenue.is_primary
                                            ? "★ "
                                            : ""}
                                          {
                                            linkedVenue.name
                                          }
                                          {linkedVenue.city
                                            ? ` · ${linkedVenue.city}`
                                            : ""}
                                        </button>
                                      </form>
                                    )
                                  )}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowPickerId(
                                        null
                                      )
                                    }
                                    className="rounded-full px-4 py-2 text-xs font-black text-zinc-400 transition hover:bg-white hover:text-zinc-800"
                                  >
                                    Abbrechen
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                    </Fragment>
                  );
                }
              )}
            </tbody>
          </table>
        </div>

        {/* EMPTY */}

        {paginatedAcquisition.length ===
          0 && (
          <div className="px-6 py-14 text-center">
            <div className="text-4xl">
              {view === "active"
                ? "🎯"
                : "📦"}
            </div>

            <h2 className="mt-3 text-lg font-black">
              {view === "active" &&
              activeAcquisition.length ===
                0
                ? "Keine aktive Akquise"
                : view === "archive"
                  ? "Keine abgeschlossenen oder archivierten Vorgänge gefunden"
                  : "Keine Akquise gefunden"}
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              {view === "active" &&
              activeAcquisition.length ===
                0
                ? "Aktuell ist kein offener Akquise-Vorgang vorhanden."
                : "Suchbegriff oder Filter ändern."}
            </p>

            {view === "active" &&
              activeAcquisition.length ===
                0 && (
                <Link
                  href="/admin/acquisition/new"
                  className="mt-5 inline-flex items-center justify-center rounded-full bg-lime-300 px-5 py-3 text-sm font-black text-zinc-950 transition hover:-translate-y-0.5"
                >
                  + Neuer Vorgang
                </Link>
              )}
          </div>
        )}

        {/* PAGINATION */}

        {sortedAcquisition.length >
          0 && (
          <div className="flex flex-col gap-3 border-t border-black/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold text-zinc-400">
              {Math.min(
                (currentPage - 1) *
                  PAGE_SIZE +
                  1,
                sortedAcquisition.length
              )}
              –
              {Math.min(
                currentPage *
                  PAGE_SIZE,
                sortedAcquisition.length
              )}{" "}
              von{" "}
              {
                sortedAcquisition.length
              }{" "}
              Vorgängen
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

      {view === "archive" &&
        archivedAcquisition.length >
          0 && (
          <p className="px-2 text-xs leading-relaxed text-zinc-400">
            📦 Abgeschlossene und
            archivierte Vorgänge bleiben
            vollständig erhalten.
          </p>
        )}
    </div>
  );
}

// ============================================================
// ZIEL
// ============================================================

function getTarget(
  item: Acquisition
): {
  type:
    | "venue"
    | "organizer"
    | "unknown";
  name: string;
  city: string | null;
  region: string | null;
  subtitle: string | null;
} {
  const venue =
    item.venue?.[0] ?? null;

  const organizer =
    item.organizer?.[0] ?? null;

  if (organizer) {
    return {
      type: "organizer",
      name:
        organizer.name ||
        "Unbekannter Veranstalter",
      city:
        organizer.city || null,
      region:
        organizer.country || null,
      subtitle:
        organizer.organizer_type ||
        "Veranstalter",
    };
  }

  if (venue) {
    return {
      type: "venue",
      name:
        venue.name ||
        "Unbekannte Location",
      city: venue.city || null,
      region: venue.state || null,
      subtitle: null,
    };
  }

  return {
    type: "unknown",
    name: "Unbekanntes Ziel",
    city: null,
    region: null,
    subtitle: null,
  };
}

// ============================================================
// ARBEITSMODUS
// ============================================================

function WorkFilterButton({
  active,
  onClick,
  label,
  count,
  critical = false,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  critical?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full px-3 text-xs font-black transition",
        active
          ? critical
            ? "bg-red-500 text-white"
            : "bg-zinc-950 text-white"
          : critical && count > 0
            ? "bg-red-50 text-red-600 ring-1 ring-red-100 hover:bg-red-100"
            : "bg-[#fbf7ef] text-zinc-600 ring-1 ring-black/5 hover:bg-[#f3eee4]",
      ].join(" ")}
    >
      <span>{label}</span>

      <span
        className={[
          "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px]",
          active
            ? "bg-white/20 text-current"
            : "bg-white text-zinc-500 ring-1 ring-black/5",
        ].join(" ")}
      >
        {count}
      </span>
    </button>
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
// STATUS
// ============================================================

function StatusBadge({
  status,
}: {
  status: string | null;
}) {
  const value = status || "Neu";
  const normalized =
    value.toLowerCase();

  let className =
    "bg-zinc-100 text-zinc-600";

  if (
    normalized.includes(
      "vorqualifiziert"
    )
  ) {
    className =
      "bg-violet-100 text-violet-700";
  }

  if (
    normalized.includes("insta")
  ) {
    className =
      "bg-pink-100 text-pink-700";
  }

  if (
    normalized.includes(
      "kontaktiert"
    )
  ) {
    className =
      "bg-blue-100 text-blue-700";
  }

  if (
    normalized.includes(
      "follow-up"
    )
  ) {
    className =
      "bg-orange-100 text-orange-700";
  }

  if (
    normalized.includes(
      "interesse"
    ) ||
    normalized.includes(
      "verhandlung"
    )
  ) {
    className =
      "bg-lime-100 text-lime-800";
  }

  if (
    normalized.includes(
      "gebucht"
    )
  ) {
    className =
      "bg-green-100 text-green-800";
  }

  if (
    normalized.includes(
      "abgesagt"
    )
  ) {
    className =
      "bg-red-100 text-red-700";
  }

  return (
    <span
      className={[
        "inline-flex max-w-full whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-black",
        className,
      ].join(" ")}
    >
      {value}
    </span>
  );
}

// ============================================================
// FOLLOW-UP
// ============================================================

function FollowUpBadge({
  date,
}: {
  date: string;
}) {
  const due = isDue(date);

  return (
    <span
      className={[
        "inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-black",
        due
          ? "bg-red-100 text-red-700"
          : "bg-zinc-100 text-zinc-600",
      ].join(" ")}
    >
      {formatDate(date)}
    </span>
  );
}

// ============================================================
// DATUM
// ============================================================

function formatDate(
  date?: string | null
) {
  if (!date) return "—";

  return new Intl.DateTimeFormat(
    "de-DE",
    {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    }
  ).format(
    new Date(
      `${date}T00:00:00`
    )
  );
}

function isDue(
  date?: string | null
) {
  if (!date) return false;

  const target = new Date(
    `${date}T23:59:59`
  );

  return (
    target.getTime() <=
    Date.now()
  );
}

function localDateOnly(
  date: Date
) {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getEndOfWeek(
  date: Date
) {
  const result =
    new Date(date);

  const day =
    result.getDay();

  const daysUntilSunday =
    day === 0
      ? 0
      : 7 - day;

  result.setDate(
    result.getDate() +
      daysUntilSunday
  );

  return result;
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