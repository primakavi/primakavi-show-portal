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


type AcquisitionRound = {
  id: string;
  name: string;
  type: "acquisition" | "mailing";
  active: boolean;
  created_at: string | null;
  archived_at: string | null;
};


type MailingVenue = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  contact_name: string | null;
  contact_email: string | null;
  booking_email: string | null;
  capacity: number | null;
  played_before: boolean | null;
  relationship_status: string | null;
  program_focus: string[] | null;
  acquisition_relevant: boolean | null;
};

type MailingOrganizer = {
  id: string;
  name: string;
  city: string | null;
  email: string | null;
  organizer_type: string | null;
};

type MailingRecipient = {
  id: string;
  round_id: string;
  venue_id: string | null;
  organizer_id: string | null;
  email: string | null;
  sent_at: string | null;
  scheduled_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  unsubscribed_at: string | null;
  bounced_at: string | null;
  last_clicked_url: string | null;
  klicktipp_contact_id: string | null;
  reaction: string | null;
  notes: string | null;
  show_id: string | null;
  acquisition_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  venue: MailingVenue | null;
  organizer: MailingOrganizer | null;
};

type RoundSelection = "all" | "legacy" | string;

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
  rounds,
  initialRoundId,
  mailingRecipients,
  mailingVenues,
  mailingOrganizers,
  addMailingRecipient,
  addMailingRecipientsBulk,
  updateMailingRecipient,
  updateMailingTracking,
  createAcquisitionFromMailing,
  suppressedEmails,
  markMailingSent,
  markWholeMailingSent,
  scheduleWholeMailing,
  addNoteToWholeMailing,
  deleteMailingRecipient,
  createRound,
  archiveRound,
  restoreRound,
  archiveAcquisition,
  restoreAcquisition,
  createShowFromAcquisition,
}: {
  acquisition: Acquisition[];
  rounds: AcquisitionRound[];
  initialRoundId?: string;
  mailingRecipients: MailingRecipient[];
  mailingVenues: MailingVenue[];
  mailingOrganizers: MailingOrganizer[];
  addMailingRecipient: (formData: FormData) => Promise<void>;
  addMailingRecipientsBulk: (formData: FormData) => Promise<void>;
  updateMailingRecipient: (formData: FormData) => Promise<void>;
  updateMailingTracking: (formData: FormData) => Promise<void>;
  createAcquisitionFromMailing: (formData: FormData) => Promise<void>;
  suppressedEmails: string[];
  markMailingSent: (formData: FormData) => Promise<void>;
  markWholeMailingSent: (formData: FormData) => Promise<void>;
  scheduleWholeMailing: (formData: FormData) => Promise<void>;
  addNoteToWholeMailing: (formData: FormData) => Promise<void>;
  deleteMailingRecipient: (formData: FormData) => Promise<void>;
  createRound: (formData: FormData) => Promise<void>;
  archiveRound: (formData: FormData) => Promise<void>;
  restoreRound: (formData: FormData) => Promise<void>;
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

  const activeRounds = useMemo(
    () => rounds.filter((round) => round.active),
    [rounds]
  );

  const archivedRounds = useMemo(
    () => rounds.filter((round) => !round.active),
    [rounds]
  );

  const [selectedRound, setSelectedRound] = useState<RoundSelection>(
    initialRoundId && rounds.some((round) => round.id === initialRoundId)
      ? initialRoundId
      : activeRounds[0]?.id || "all"
  );
  const [showNewRound, setShowNewRound] = useState(false);

  const selectedRoundData =
    rounds.find((round) => round.id === selectedRound) || null;

  const isMailingRound = selectedRoundData?.type === "mailing";

 const selectedMailingRecipients = useMemo(
  () =>
    selectedRoundData?.type === "mailing"
      ? (mailingRecipients ?? []).filter(
          (recipient) =>
            recipient.round_id === selectedRoundData.id
        )
      : [],
  [mailingRecipients, selectedRoundData]
);


  const roundScopedAcquisition = useMemo(() => {
    if (selectedRound === "all") return acquisition;
    if (selectedRound === "legacy") {
      return acquisition.filter((item) => !item.round_id);
    }
    return acquisition.filter((item) => item.round_id === selectedRound);
  }, [acquisition, selectedRound]);

  // ============================================================
  // AKTIV / ARCHIV
  // ============================================================

  const activeAcquisition = useMemo(
    () =>
      roundScopedAcquisition.filter(
        (item) =>
          !item.archived_at &&
          !isCompletedStatus(item.status)
      ),
    [roundScopedAcquisition]
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
      roundScopedAcquisition.filter(
        (item) =>
          !!item.archived_at ||
          isCompletedStatus(item.status)
      ),
    [roundScopedAcquisition]
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

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/acquisition/new"
            className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-zinc-800"
          >
            + Neue Akquise
          </Link>
          <button
            type="button"
            onClick={() => setShowNewRound(true)}
            className="inline-flex items-center justify-center rounded-full bg-lime-300 px-5 py-3 text-sm font-black text-zinc-950 shadow-sm transition hover:-translate-y-0.5"
          >
            + Neue Runde
          </button>
        </div>
      </header>

      {/* RUNDENSTEUERUNG */}

      <section className="rounded-[1.7rem] bg-white p-4 shadow-lg shadow-black/[0.03] ring-1 ring-black/5 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
              Akquise-Runde
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <select
                value={selectedRound}
                onChange={(event) => {
                  setSelectedRound(event.target.value);
                  setView(event.target.value === "legacy" ? "archive" : "active");
                  setPage(1);
                }}
                className="h-11 min-w-0 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-bold text-zinc-800 outline-none transition focus:border-zinc-400 sm:min-w-[310px]"
              >
                <option value="all">Alle aktiven Runden</option>
                {activeRounds.map((round) => (
                  <option key={round.id} value={round.id}>
                    {round.type === "mailing" ? "📨 " : "🎯 "}
                    {round.name}
                  </option>
                ))}
                <option disabled>──────────</option>
                <option value="legacy">📦 Alte Akquise</option>
                {archivedRounds.map((round) => (
                  <option key={round.id} value={round.id}>
                    📦 {round.name}
                  </option>
                ))}
              </select>

              {selectedRoundData && (
                <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-black ${
                  selectedRoundData.active
                    ? "bg-lime-100 text-zinc-800"
                    : "bg-zinc-100 text-zinc-500"
                }`}>
                  {selectedRoundData.type === "mailing" ? "Mailing" : "Akquise"}
                  {" · "}
                  {selectedRoundData.active ? "aktiv" : "archiviert"}
                </span>
              )}
            </div>

            <p className="mt-3 text-sm text-zinc-500">
              {selectedRoundData
                ? selectedRoundData.type === "mailing"
                  ? `${selectedMailingRecipients.length} Empfänger in „${selectedRoundData.name}“.`
                  : `${roundScopedAcquisition.length} Vorgänge in „${selectedRoundData.name}“.`
                : selectedRound === "legacy"
                ? `${roundScopedAcquisition.length} ältere Vorgänge ohne Rundenzuordnung.`
                : `${activeRounds.length} aktive Runden im Überblick.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedRoundData?.active && selectedRoundData.type === "acquisition" && (
              <Link
                href={`/admin/acquisition/new?round=${selectedRoundData.id}`}
                className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-black text-white transition hover:bg-zinc-800"
              >
                + Eintrag
              </Link>
            )}

            {selectedRoundData?.active && (
              <form action={archiveRound}>
                <input type="hidden" name="round_id" value={selectedRoundData.id} />
                <button
                  type="submit"
                  className="h-11 rounded-full bg-white px-4 text-xs font-black text-zinc-500 ring-1 ring-black/10 transition hover:bg-zinc-50"
                >
                  Runde abschließen
                </button>
              </form>
            )}

            {selectedRoundData && !selectedRoundData.active && (
              <form action={restoreRound}>
                <input type="hidden" name="round_id" value={selectedRoundData.id} />
                <button
                  type="submit"
                  className="h-11 rounded-full bg-white px-4 text-xs font-black text-zinc-600 ring-1 ring-black/10 transition hover:bg-zinc-50"
                >
                  Runde reaktivieren
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {showNewRound && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/25 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-lg rounded-[1.8rem] bg-[#fbf7ef] p-5 shadow-2xl ring-1 ring-black/10 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
                  Neue Aktion
                </div>
                <h2 className="mt-1 text-2xl font-black tracking-tight">
                  Was möchtest du starten?
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowNewRound(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-white text-lg font-bold text-zinc-500 ring-1 ring-black/5"
              >
                ×
              </button>
            </div>

            <form action={createRound} className="mt-5 space-y-4">
              <label className="grid gap-1.5 text-[11px] font-semibold text-zinc-500">
                Typ
                <select
                  name="type"
                  defaultValue="acquisition"
                  className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 outline-none focus:border-zinc-400"
                >
                  <option value="acquisition">🎯 Akquise-Runde</option>
                  <option value="mailing">📨 Mailing / Newsletter</option>
                </select>
              </label>

              <label className="grid gap-1.5 text-[11px] font-semibold text-zinc-500">
                Name
                <input
                  name="name"
                  required
                  autoFocus
                  placeholder="z. B. Frühjahrstour 2027"
                  className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 outline-none placeholder:text-zinc-300 focus:border-zinc-400"
                />
              </label>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowNewRound(false)}
                  className="rounded-full bg-white px-4 py-2.5 text-sm font-black text-zinc-500 ring-1 ring-black/10"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-lime-300 px-5 py-2.5 text-sm font-black text-zinc-950"
                >
                  Runde anlegen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {isMailingRound && selectedRoundData && (
        <MailingPanel
          round={selectedRoundData}
          recipients={selectedMailingRecipients}
          venues={mailingVenues}
          organizers={mailingOrganizers}
          addMailingRecipient={addMailingRecipient}
          addMailingRecipientsBulk={addMailingRecipientsBulk}
          updateMailingRecipient={updateMailingRecipient}
          updateMailingTracking={updateMailingTracking}
          createAcquisitionFromMailing={createAcquisitionFromMailing}
          suppressedEmails={suppressedEmails}
          markMailingSent={markMailingSent}
          markWholeMailingSent={markWholeMailingSent}
          scheduleWholeMailing={scheduleWholeMailing}
          addNoteToWholeMailing={addNoteToWholeMailing}
          deleteMailingRecipient={deleteMailingRecipient}
        />
      )}

      {!isMailingRound && (
        <>

      {/* ARBEITSÜBERSICHT */}

      {view === "active" && (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <WorkStatCard
            icon="🔥"
            value={workCounts.overdue}
            label="Überfällig"
            active={workFilter === "overdue"}
            critical
            onClick={() =>
              changeWorkFilter(
                workFilter === "overdue" ? "alle" : "overdue"
              )
            }
          />

          <WorkStatCard
            icon="📅"
            value={workCounts.today}
            label="Heute"
            active={workFilter === "today"}
            onClick={() =>
              changeWorkFilter(
                workFilter === "today" ? "alle" : "today"
              )
            }
          />

          <WorkStatCard
            icon="⏭"
            value={workCounts.week}
            label="Diese Woche"
            active={workFilter === "week"}
            onClick={() =>
              changeWorkFilter(
                workFilter === "week" ? "alle" : "week"
              )
            }
          />

          <WorkStatCard
            icon="💤"
            value={workCounts.no_follow_up}
            label="Ohne Wiedervorlage"
            active={workFilter === "no_follow_up"}
            onClick={() =>
              changeWorkFilter(
                workFilter === "no_follow_up" ? "alle" : "no_follow_up"
              )
            }
          />
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

        </>
      )}

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


function MailingPanel({
  round,
  recipients,
  venues,
  organizers,
  addMailingRecipientsBulk,
  updateMailingRecipient,
  updateMailingTracking,
  createAcquisitionFromMailing,
  suppressedEmails,
  markMailingSent,
  markWholeMailingSent,
  scheduleWholeMailing,
  addNoteToWholeMailing,
  deleteMailingRecipient,
}: {
  round: AcquisitionRound;
  recipients: MailingRecipient[];
  venues: MailingVenue[];
  organizers: MailingOrganizer[];
  addMailingRecipient: (formData: FormData) => Promise<void>;
  addMailingRecipientsBulk: (formData: FormData) => Promise<void>;
  updateMailingRecipient: (formData: FormData) => Promise<void>;
  updateMailingTracking: (formData: FormData) => Promise<void>;
  createAcquisitionFromMailing: (formData: FormData) => Promise<void>;
  suppressedEmails: string[];
  markMailingSent: (formData: FormData) => Promise<void>;
  markWholeMailingSent: (formData: FormData) => Promise<void>;
  scheduleWholeMailing: (formData: FormData) => Promise<void>;
  addNoteToWholeMailing: (formData: FormData) => Promise<void>;
  deleteMailingRecipient: (formData: FormData) => Promise<void>;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "venue" | "organizer">("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [minCapacity, setMinCapacity] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");
  const [onlyWithEmail, setOnlyWithEmail] = useState(true);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [playedFilter, setPlayedFilter] = useState<"all" | "played" | "not_played">("all");
  const [relationshipFilter, setRelationshipFilter] = useState("all");
  const [selectedTargets, setSelectedTargets] = useState<Set<string>>(new Set());
  const [showSchedule, setShowSchedule] = useState(false);
  const [showBulkNote, setShowBulkNote] = useState(false);
  const [scheduleValue, setScheduleValue] = useState("");
  const [sentValue, setSentValue] = useState("");
  const [editingSentAt, setEditingSentAt] = useState(false);
  const [recipientSort, setRecipientSort] = useState<
    "name" | "opened" | "clicked" | "unsubscribed" | "bounced"
  >("name");

  const sentCount = recipients.filter((item) => item.sent_at).length;
  const openedCount = recipients.filter((item) => item.opened_at).length;
  const clickedCount = recipients.filter((item) => item.clicked_at).length;
  const unsubscribedCount = recipients.filter((item) => item.unsubscribed_at).length;
  const bouncedCount = recipients.filter((item) => item.bounced_at).length;
  const mailingSentAt =
    recipients.find((item) => item.sent_at)?.sent_at || null;
  const isSent = Boolean(mailingSentAt);
  const suppressedEmailSet = useMemo(
    () => new Set(suppressedEmails.map((email) => email.trim().toLowerCase())),
    [suppressedEmails]
  );
  const plannedRecipients = recipients.filter(
    (item) => item.scheduled_at && !item.sent_at
  );
  const plannedCount = plannedRecipients.length;
  const plannedAt = plannedRecipients[0]?.scheduled_at || null;

  const sortedRecipients = useMemo(() => {
    const getName = (recipient: MailingRecipient) =>
      (recipient.venue?.name || recipient.organizer?.name || recipient.email || "")
        .toLocaleLowerCase("de");

    return [...recipients].sort((a, b) => {
      if (recipientSort === "name") {
        return getName(a).localeCompare(getName(b), "de");
      }

      const fieldMap = {
        opened: "opened_at",
        clicked: "clicked_at",
        unsubscribed: "unsubscribed_at",
        bounced: "bounced_at",
      } as const;

      const field = fieldMap[recipientSort];
      const aActive = Boolean(a[field]);
      const bActive = Boolean(b[field]);

      if (aActive !== bActive) return aActive ? -1 : 1;
      return getName(a).localeCompare(getName(b), "de");
    });
  }, [recipients, recipientSort]);

  const existingKeys = useMemo(
    () =>
      new Set(
        recipients.flatMap((recipient) => [
          recipient.venue_id ? `venue:${recipient.venue_id}` : "",
          recipient.organizer_id ? `organizer:${recipient.organizer_id}` : "",
        ]).filter(Boolean)
      ),
    [recipients]
  );

  const candidates = useMemo(() => {
    const venueCandidates = venues.map((venue) => ({
      key: `venue:${venue.id}`,
      type: "venue" as const,
      id: venue.id,
      name: venue.name,
      city: venue.city,
      state: venue.state,
      email: venue.booking_email || venue.contact_email,
      capacity: venue.capacity,
      played_before: venue.played_before,
      relationship_status: venue.relationship_status,
      program_focus: venue.program_focus || [],
      suppressed: Boolean(
        (venue.booking_email || venue.contact_email) &&
        suppressedEmailSet.has(String(venue.booking_email || venue.contact_email).trim().toLowerCase())
      ),
    }));

    const organizerCandidates = organizers.map((organizer) => ({
      key: `organizer:${organizer.id}`,
      type: "organizer" as const,
      id: organizer.id,
      name: organizer.name,
      city: organizer.city,
      state: null as string | null,
      email: organizer.email,
      capacity: null as number | null,
      played_before: null as boolean | null,
      relationship_status: null as string | null,
      program_focus: [] as string[],
      suppressed: Boolean(
        organizer.email &&
        suppressedEmailSet.has(String(organizer.email).trim().toLowerCase())
      ),
    }));

    return [...venueCandidates, ...organizerCandidates];
  }, [venues, organizers, suppressedEmailSet]);

  const states = useMemo(
    () =>
      Array.from(
        new Set(
          venues.map((venue) => venue.state).filter(Boolean) as string[]
        )
      ).sort((a, b) => a.localeCompare(b, "de")),
    [venues]
  );

  const relationships = useMemo(
    () =>
      Array.from(
        new Set(
          venues
            .map((venue) => venue.relationship_status)
            .filter(Boolean) as string[]
        )
      ).sort((a, b) => a.localeCompare(b, "de")),
    [venues]
  );

  const filteredCandidates = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const min = minCapacity ? Number(minCapacity) : null;
    const max = maxCapacity ? Number(maxCapacity) : null;

    return candidates.filter((candidate) => {
      if (typeFilter !== "all" && candidate.type !== typeFilter) return false;

      if (
        needle &&
        ![candidate.name, candidate.city, candidate.state, candidate.email]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(needle)
      ) {
        return false;
      }

      if (onlyWithEmail && !candidate.email) return false;

      // Location-spezifische Filter: Veranstalter bleiben bei "Alle" sichtbar.
      if (candidate.type === "venue") {
        if (stateFilter !== "all" && candidate.state !== stateFilter) return false;
        if (min !== null && (candidate.capacity === null || candidate.capacity < min)) return false;
        if (max !== null && (candidate.capacity === null || candidate.capacity > max)) return false;
        if (playedFilter === "played" && candidate.played_before !== true) return false;
        if (playedFilter === "not_played" && candidate.played_before === true) return false;
        if (
          relationshipFilter !== "all" &&
          candidate.relationship_status !== relationshipFilter
        ) return false;
      }

      return true;
    });
  }, [
    candidates,
    search,
    typeFilter,
    stateFilter,
    minCapacity,
    maxCapacity,
    onlyWithEmail,
    playedFilter,
    relationshipFilter,
  ]);

  const selectableVisible = filteredCandidates.filter(
    (candidate) =>
      !existingKeys.has(candidate.key) &&
      Boolean(candidate.email) &&
      !candidate.suppressed
  );

  const allVisibleSelected =
    selectableVisible.length > 0 &&
    selectableVisible.every((candidate) => selectedTargets.has(candidate.key));

  function toggleTarget(key: string) {
    setSelectedTargets((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleAllVisible() {
    setSelectedTargets((current) => {
      const next = new Set(current);
      if (allVisibleSelected) {
        selectableVisible.forEach((candidate) => next.delete(candidate.key));
      } else {
        selectableVisible.forEach((candidate) => next.add(candidate.key));
      }
      return next;
    });
  }

  const selectedPayload = candidates
    .filter((candidate) => selectedTargets.has(candidate.key))
    .map((candidate) => ({ type: candidate.type, id: candidate.id }));

  const alreadyCount = filteredCandidates.filter((candidate) =>
    existingKeys.has(candidate.key)
  ).length;

  const missingEmailCount = filteredCandidates.filter(
    (candidate) => !candidate.email
  ).length;

  // ============================================================
  // KLICKTIPP CSV EXPORT
  // ============================================================

  const exportableRecipients = useMemo(() => {
    const seenEmails = new Set<string>();

    return recipients
      .map((recipient) => {
        const email = recipient.email?.trim() || "";
        if (!email) return null;

        const normalizedEmail = email.toLowerCase();
        if (seenEmails.has(normalizedEmail)) return null;
        seenEmails.add(normalizedEmail);

        const venue = recipient.venue;
        const organizer = recipient.organizer;

        return {
          email,
          company: venue?.name || organizer?.name || "",
          city: venue?.city || organizer?.city || "",
          state: venue?.state || "",
          contactName: venue?.contact_name || "",
          recipientType: venue ? "Location" : organizer ? "Veranstalter" : "",
          capacity:
            venue?.capacity !== null && venue?.capacity !== undefined
              ? String(venue.capacity)
              : "",
        };
      })
      .filter(
        (item): item is {
          email: string;
          company: string;
          city: string;
          state: string;
          contactName: string;
          recipientType: string;
          capacity: string;
        } => Boolean(item)
      );
  }, [recipients]);

  function escapeCsv(value: string) {
    return `"${String(value ?? "").replace(/"/g, '""')}"`;
  }

  function exportKlickTippCsv() {
    if (!exportableRecipients.length) {
      window.alert("In dieser Mailing-Runde gibt es keine Empfänger mit E-Mail-Adresse.");
      return;
    }

    const headers = [
      "E-Mail",
      "Firma",
      "Ansprechpartner",
      "Ort",
      "Bundesland",
      "Typ",
      "Kapazität",
    ];

    const rows = exportableRecipients.map((recipient) => [
      recipient.email,
      recipient.company,
      recipient.contactName,
      recipient.city,
      recipient.state,
      recipient.recipientType,
      recipient.capacity,
    ]);

    const csv = [
      headers.map(escapeCsv).join(";"),
      ...rows.map((row) => row.map(escapeCsv).join(";")),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const safeRoundName = round.name
      .toLowerCase()
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    link.href = url;
    link.download = `klicktipp-${safeRoundName || "mailing"}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <MailingStat value={recipients.length} label="Empfänger" icon="👥" />
        <MailingStat value={sentCount} label="Versendet" icon="📨" />
        <MailingStat value={openedCount} label="Geöffnet" icon="👁️" />
        <MailingStat value={clickedCount} label="Geklickt" icon="🔗" />
        <MailingStat value={unsubscribedCount} label="Abgemeldet" icon="🚫" />
        <MailingStat value={bouncedCount} label="Bounce" icon="⚠️" />
      </section>

      <section className="overflow-hidden rounded-[1.7rem] bg-white shadow-lg shadow-black/[0.03] ring-1 ring-black/5">
        <div className="flex flex-col gap-3 border-b border-black/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
              Mailing / Newsletter
            </p>
            <h2 className="mt-1 text-xl font-black">{round.name}</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Empfänger, Versand und Reaktionen an einem Ort.
            </p>
          </div>

          {round.active && (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {!isSent ? (
                <>
                  <button
                    type="button"
                    onClick={exportKlickTippCsv}
                    disabled={exportableRecipients.length === 0}
                    className="h-10 rounded-full bg-white px-4 text-xs font-black text-zinc-600 ring-1 ring-black/10 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ↓ CSV · {exportableRecipients.length}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowSchedule((current) => !current);
                      setShowBulkNote(false);
                    }}
                    disabled={recipients.length === 0}
                    className="h-10 rounded-full bg-white px-4 text-xs font-black text-zinc-600 ring-1 ring-black/10 transition hover:bg-zinc-50 disabled:opacity-40"
                  >
                    📅 Versand planen
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAdd((current) => !current)}
                    className="h-10 rounded-full bg-zinc-950 px-5 text-xs font-black text-white transition hover:bg-zinc-800"
                  >
                    + Empfänger
                  </button>

                  <form action={markWholeMailingSent} className="flex items-center gap-2">
                    <input type="hidden" name="round_id" value={round.id} />
                    <input
                      type="datetime-local"
                      name="sent_at"
                      value={sentValue}
                      onChange={(event) => setSentValue(event.target.value)}
                      disabled={recipients.length === 0}
                      className="h-10 rounded-full bg-white px-3 text-xs font-bold text-zinc-600 ring-1 ring-black/10 outline-none disabled:opacity-40"
                    />
                    <button
                      type="submit"
                      disabled={recipients.length === 0 || !sentValue}
                      className="h-10 rounded-full bg-lime-300 px-4 text-xs font-black text-zinc-950 disabled:opacity-40"
                    >
                      ✓ Als versendet speichern
                    </button>
                  </form>
                </>
              ) : !editingSentAt ? (
                <>
                  <div className="inline-flex h-10 items-center gap-2 rounded-full bg-lime-100 px-4 text-xs font-black text-zinc-700">
                    📨 Versendet {formatMailingDateTime(mailingSentAt)}
                    <button
                      type="button"
                      title="Versandzeitpunkt ändern"
                      onClick={() => {
                        const date = new Date(mailingSentAt!);
                        const pad = (value: number) => String(value).padStart(2, "0");
                        setSentValue(
                          `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
                        );
                        setEditingSentAt(true);
                      }}
                      className="ml-1 text-sm opacity-60 transition hover:opacity-100"
                    >
                      ✏️
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBulkNote((current) => !current);
                      setShowSchedule(false);
                    }}
                    disabled={recipients.length === 0}
                    className="h-10 rounded-full bg-white px-4 text-xs font-black text-zinc-600 ring-1 ring-black/10 transition hover:bg-zinc-50 disabled:opacity-40"
                  >
                    📝 Notiz für alle
                  </button>
                </>
              ) : (
                <form action={markWholeMailingSent} className="flex items-center gap-2">
                  <input type="hidden" name="round_id" value={round.id} />
                  <input
                    type="datetime-local"
                    name="sent_at"
                    value={sentValue}
                    onChange={(event) => setSentValue(event.target.value)}
                    className="h-10 rounded-full bg-white px-3 text-xs font-bold text-zinc-600 ring-1 ring-black/10 outline-none"
                  />
                  <button
                    type="submit"
                    className="h-10 rounded-full bg-zinc-950 px-4 text-xs font-black text-white"
                  >
                    Speichern
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingSentAt(false)}
                    className="h-10 rounded-full bg-white px-3 text-xs font-black text-zinc-500 ring-1 ring-black/10"
                  >
                    Abbrechen
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {(plannedAt || plannedCount > 0) && (
          <div className="border-b border-black/5 bg-lime-50 px-5 py-3">
            <p className="text-sm font-black text-zinc-800">
              📅 Geplant · {formatMailingDateTime(plannedAt)}
              {plannedCount > 0 ? ` · ${plannedCount} Empfänger` : ""}
            </p>
          </div>
        )}

        {showSchedule && round.active && !isSent && (
          <div className="border-b border-black/5 bg-[#fbf7ef] p-5">
            <form action={scheduleWholeMailing} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <input type="hidden" name="round_id" value={round.id} />
              <input
                type="hidden"
                name="scheduled_at"
                value={scheduleValue ? new Date(scheduleValue).toISOString() : ""}
              />

              <label className="flex-1">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-zinc-400">
                  Geplanter Versand
                </span>
                <input
                  type="datetime-local"
                  value={scheduleValue}
                  onChange={(event) => setScheduleValue(event.target.value)}
                  required
                  className="h-11 w-full rounded-xl bg-white px-4 text-sm font-bold outline-none ring-1 ring-black/5"
                />
              </label>

              <button
                type="submit"
                disabled={!scheduleValue}
                className="h-11 rounded-full bg-zinc-950 px-5 text-sm font-black text-white disabled:opacity-40"
              >
                Für alle eintragen
              </button>
            </form>

            <p className="mt-3 text-xs font-semibold text-zinc-500">
              Planung setzt einen bereits versehentlich gesetzten Versandstatus zurück.
              Erst nach dem tatsächlichen Versand auf „Jetzt als versendet markieren“ klicken.
            </p>
          </div>
        )}

        {showBulkNote && round.active && (
          <div className="border-b border-black/5 bg-[#fbf7ef] p-5">
            <form action={addNoteToWholeMailing} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <input type="hidden" name="round_id" value={round.id} />

              <label className="flex-1">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-zinc-400">
                  Notiz für alle Empfänger
                </span>
                <input
                  name="note"
                  required
                  placeholder="z. B. Newsletter in KlickTipp für morgen früh geplant"
                  className="h-11 w-full rounded-xl bg-white px-4 text-sm font-semibold outline-none ring-1 ring-black/5"
                />
              </label>

              <button
                type="submit"
                className="h-11 rounded-full bg-lime-300 px-5 text-sm font-black text-zinc-950"
              >
                Bei allen ergänzen
              </button>
            </form>

            <p className="mt-3 text-xs font-semibold text-zinc-500">
              Vorhandene individuelle Notizen bleiben erhalten; die Sammelnotiz wird angehängt.
            </p>
          </div>
        )}

        {showAdd && round.active && !isSent && (
          <div className="border-b border-black/5 bg-[#fbf7ef] p-5">
            <div className="mb-4 flex flex-col gap-3 xl:flex-row">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                  🔎
                </span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Name, Ort oder E-Mail suchen …"
                  className="h-11 w-full rounded-xl bg-white pl-11 pr-4 text-sm font-semibold outline-none ring-1 ring-black/5"
                />
              </div>

              <div className="inline-flex h-11 shrink-0 rounded-full bg-white p-1 ring-1 ring-black/5">
                {[
                  ["all", "Alle"],
                  ["venue", "Locations"],
                  ["organizer", "Veranstalter"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTypeFilter(value as "all" | "venue" | "organizer")}
                    className={[
                      "rounded-full px-4 text-xs font-black transition",
                      typeFilter === value ? "bg-zinc-950 text-white" : "text-zinc-500",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <select
                value={stateFilter}
                onChange={(event) => setStateFilter(event.target.value)}
                className="h-11 rounded-xl bg-white px-3 text-sm font-bold outline-none ring-1 ring-black/5"
              >
                <option value="all">Alle Bundesländer</option>
                {states.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>

              <input
                type="number"
                min="0"
                value={minCapacity}
                onChange={(event) => setMinCapacity(event.target.value)}
                placeholder="Kapazität von"
                className="h-11 rounded-xl bg-white px-3 text-sm font-bold outline-none ring-1 ring-black/5"
              />

              <input
                type="number"
                min="0"
                value={maxCapacity}
                onChange={(event) => setMaxCapacity(event.target.value)}
                placeholder="Kapazität bis"
                className="h-11 rounded-xl bg-white px-3 text-sm font-bold outline-none ring-1 ring-black/5"
              />

              <label className="flex h-11 items-center gap-3 rounded-xl bg-white px-4 text-sm font-bold ring-1 ring-black/5">
                <input
                  type="checkbox"
                  checked={onlyWithEmail}
                  onChange={(event) => setOnlyWithEmail(event.target.checked)}
                  className="h-4 w-4 accent-zinc-950"
                />
                Nur mit E-Mail
              </label>
            </div>

            <button
              type="button"
              onClick={() => setShowMoreFilters((current) => !current)}
              className="mt-3 text-xs font-black text-zinc-500"
            >
              {showMoreFilters ? "− Weitere Filter ausblenden" : "+ Weitere Filter"}
            </button>

            {showMoreFilters && (
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <select
                  value={playedFilter}
                  onChange={(event) =>
                    setPlayedFilter(event.target.value as "all" | "played" | "not_played")
                  }
                  className="h-11 rounded-xl bg-white px-3 text-sm font-bold outline-none ring-1 ring-black/5"
                >
                  <option value="all">Schon gespielt: alle</option>
                  <option value="played">Schon gespielt</option>
                  <option value="not_played">Noch nicht gespielt</option>
                </select>

                <select
                  value={relationshipFilter}
                  onChange={(event) => setRelationshipFilter(event.target.value)}
                  className="h-11 rounded-xl bg-white px-3 text-sm font-bold outline-none ring-1 ring-black/5"
                >
                  <option value="all">Beziehungsstatus: alle</option>
                  {relationships.map((relationship) => (
                    <option key={relationship} value={relationship}>
                      {relationship}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mt-4 flex flex-col gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-black/5 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs font-bold text-zinc-500">
                <span className="font-black text-zinc-950">{filteredCandidates.length} Treffer</span>
                {alreadyCount > 0 && <> · {alreadyCount} bereits dabei</>}
                {missingEmailCount > 0 && <> · {missingEmailCount} ohne E-Mail</>}
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-xs font-black">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleAllVisible}
                  className="h-4 w-4 accent-zinc-950"
                />
                Alle sichtbaren auswählen
              </label>
            </div>

            <div className="mt-3 max-h-[420px] overflow-y-auto rounded-xl bg-white ring-1 ring-black/5">
              {filteredCandidates.map((candidate) => {
                const alreadyAdded = existingKeys.has(candidate.key);
                const noEmail = !candidate.email;
                const suppressed = candidate.suppressed;
                const disabled = alreadyAdded || noEmail || suppressed;
                const checked = selectedTargets.has(candidate.key);

                return (
                  <label
                    key={candidate.key}
                    className={[
                      "flex items-center gap-4 border-b border-black/5 px-4 py-3 last:border-b-0",
                      disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer hover:bg-[#fffdf8]",
                    ].join(" ")}
                  >
                    <input
                      type="checkbox"
                      disabled={disabled}
                      checked={checked}
                      onChange={() => toggleTarget(candidate.key)}
                      className="h-4 w-4 shrink-0 accent-zinc-950"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-black">{candidate.name}</p>
                        <span className="rounded-full bg-[#fbf7ef] px-2 py-1 text-[10px] font-black text-zinc-500">
                          {candidate.type === "venue" ? "Location" : "Veranstalter"}
                        </span>
                        {alreadyAdded && (
                          <span className="rounded-full bg-lime-100 px-2 py-1 text-[10px] font-black text-zinc-700">
                            bereits dabei
                          </span>
                        )}
                        {noEmail && (
                          <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-black text-amber-800">
                            keine E-Mail
                          </span>
                        )}
                        {suppressed && (
                          <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-black text-red-700">
                            🚫 Newsletter abgemeldet
                          </span>
                        )}
                      </div>
                      <p className="mt-1 truncate text-xs text-zinc-400">
                        {[candidate.city, candidate.state, candidate.email]
                          .filter(Boolean)
                          .join(" · ") || "Keine weiteren Angaben"}
                      </p>
                    </div>

                    {candidate.type === "venue" && (
                      <div className="shrink-0 text-right">
                        <p className="text-xs font-black text-zinc-600">
                          {candidate.capacity ? `${candidate.capacity} Plätze` : "Kapazität offen"}
                        </p>
                      </div>
                    )}
                  </label>
                );
              })}

              {filteredCandidates.length === 0 && (
                <div className="px-5 py-10 text-center text-sm font-bold text-zinc-400">
                  Keine passenden Empfänger gefunden.
                </div>
              )}
            </div>

            <form action={addMailingRecipientsBulk} className="mt-4 flex items-center justify-between gap-4">
              <input type="hidden" name="round_id" value={round.id} />
              <input
                type="hidden"
                name="targets"
                value={JSON.stringify(selectedPayload)}
              />
              <p className="text-xs font-bold text-zinc-500">
                <span className="font-black text-zinc-950">{selectedPayload.length}</span>{" "}
                ausgewählt
              </p>
              <button
                type="submit"
                disabled={selectedPayload.length === 0}
                className="h-11 rounded-full bg-lime-300 px-5 text-sm font-black text-zinc-950 transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                {selectedPayload.length || 0} Empfänger hinzufügen
              </button>
            </form>
          </div>
        )}

        {recipients.length > 0 ? (
          <div>
            <div className="flex items-center justify-end border-b border-black/5 px-5 py-2.5">
              <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-zinc-400">
                Sortierung
                <select
                  value={recipientSort}
                  onChange={(event) =>
                    setRecipientSort(
                      event.target.value as
                        | "name"
                        | "opened"
                        | "clicked"
                        | "unsubscribed"
                        | "bounced"
                    )
                  }
                  className="h-8 rounded-lg bg-[#fbf7ef] px-2 text-xs font-bold normal-case tracking-normal text-zinc-700 outline-none"
                >
                  <option value="name">Empfänger A–Z</option>
                  <option value="opened">Geöffnet zuerst</option>
                  <option value="clicked">Geklickt zuerst</option>
                  <option value="unsubscribed">Abgemeldet zuerst</option>
                  <option value="bounced">Bounce zuerst</option>
                </select>
              </label>
            </div>
            <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-black/5 bg-white text-[12px] font-semibold text-zinc-500">
                <tr>
                  <th className="px-4 py-2.5">Empfänger</th>
                  <th className="px-4 py-2.5">E-Mail</th>
                  <th className="px-4 py-2.5">Aktivität</th>
                  <th className="px-4 py-2.5">Reaktion / Notiz</th>
                  <th className="w-[130px] px-4 py-2.5 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {sortedRecipients.map((recipient) => {
                  const target = recipient.venue || recipient.organizer;
                  const city = target?.city || null;

                  return (
                    <tr key={recipient.id} className="align-top hover:bg-[#fffdf8]">
                      <td className="px-4 py-2.5">
                        <p className="font-black">
                          {recipient.venue ? "🏛️ " : "🏢 "}
                          {target?.name || "Unbekannter Empfänger"}
                        </p>
                        {city && <p className="mt-1 text-xs text-zinc-400">{city}</p>}
                      </td>
                      <td className="px-4 py-2.5 text-xs font-semibold text-zinc-600">
                        {recipient.email || <span className="text-amber-600">Keine E-Mail</span>}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex min-w-[112px] items-center gap-1">
                          <ActivityEmoji recipient={recipient} field="opened_at" active={Boolean(recipient.opened_at)} emoji="👁️" label="Geöffnet" action={updateMailingTracking} />
                          <ActivityEmoji recipient={recipient} field="clicked_at" active={Boolean(recipient.clicked_at)} emoji="🔗" label="Geklickt" action={updateMailingTracking} />
                          <ActivityEmoji recipient={recipient} field="unsubscribed_at" active={Boolean(recipient.unsubscribed_at)} emoji="🚫" label="Abgemeldet" action={updateMailingTracking} />
                          <ActivityEmoji recipient={recipient} field="bounced_at" active={Boolean(recipient.bounced_at)} emoji="⚠️" label="Bounce" action={updateMailingTracking} />
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <form action={updateMailingRecipient} className="flex min-w-[300px] gap-2">
                          <input type="hidden" name="id" value={recipient.id} />
                          <select
                            name="reaction"
                            defaultValue={recipient.reaction || ""}
                            className="h-10 rounded-xl bg-[#fbf7ef] px-3 text-xs font-bold outline-none"
                          >
                            <option value="">Keine Reaktion</option>
                            <option value="Interesse">Interesse</option>
                            <option value="Termin angefragt">Termin angefragt</option>
                            <option value="Rückfrage">Rückfrage</option>
                            <option value="Absage">Absage</option>
                            <option value="Gebucht">Gebucht</option>
                          </select>
                          <input
                            name="notes"
                            defaultValue={recipient.notes || ""}
                            placeholder="Notiz …"
                            className="h-10 min-w-0 flex-1 rounded-xl bg-[#fbf7ef] px-3 text-xs font-semibold outline-none"
                          />
                          <button
                            type="submit"
                            className="h-9 min-w-[96px] rounded-full bg-[#fbf7ef] px-3 text-[11px] font-black text-zinc-600 ring-1 ring-black/5 transition hover:bg-zinc-100 hover:text-zinc-950"
                          >
                            ✓ Speichern
                          </button>
                        </form>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {recipient.show_id ? (
                          <Link
                            href={`/admin/shows/${recipient.show_id}`}
                            className="inline-flex rounded-full bg-lime-100 px-2.5 py-1.5 text-[11px] font-black text-zinc-700"
                          >
                            🎉 Show
                          </Link>
                        ) : recipient.acquisition_id ? (
                          <span
                            title="Aus diesem Mailing-Empfänger wurde bereits ein Akquise-Vorgang angelegt."
                            className="inline-flex rounded-full bg-lime-100 px-2.5 py-1.5 text-[11px] font-black text-zinc-700"
                          >
                            🎯 Akquise
                          </span>
                        ) : isSent ? (
                          <form action={createAcquisitionFromMailing}>
                            <input type="hidden" name="recipient_id" value={recipient.id} />
                            <button
                              type="submit"
                              title="Als echten Akquise-Vorgang weiterführen"
                              className="h-9 min-w-[96px] rounded-full bg-lime-100 px-3 text-[11px] font-black text-zinc-700 ring-1 ring-lime-200/70 transition hover:bg-lime-200 hover:text-zinc-950"
                            >
                              → Akquise
                            </button>
                          </form>
                        ) : round.active ? (
                          <form action={deleteMailingRecipient}>
                            <input type="hidden" name="id" value={recipient.id} />
                            <button
                              type="submit"
                              title="Empfänger entfernen"
                              className="rounded-full px-2 py-1.5 text-xs font-black text-zinc-300 transition hover:bg-red-50 hover:text-red-600"
                            >
                              ×
                            </button>
                          </form>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <div className="text-4xl">📨</div>
            <h3 className="mt-3 text-lg font-black">Noch keine Empfänger</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Füge passende Locations oder Veranstalter gesammelt hinzu.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}


function ActivityEmoji({
  recipient, field, active, emoji, label, action,
}: {
  recipient: MailingRecipient;
  field: "opened_at" | "clicked_at" | "unsubscribed_at" | "bounced_at";
  active: boolean;
  emoji: string;
  label: string;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action} className="leading-none">
      <input type="hidden" name="id" value={recipient.id} />
      <input type="hidden" name="field" value={field} />
      <input type="hidden" name="active" value={active ? "false" : "true"} />
      <button type="submit" title={`${label}${active ? " – klicken zum Entfernen" : " – klicken zum Setzen"}`} aria-label={`${label}${active ? " entfernen" : " setzen"}`} className={["inline-flex h-7 w-7 items-center justify-center rounded-md text-[15px] transition", active ? "opacity-100 hover:bg-black/5" : "opacity-[0.30] grayscale hover:bg-black/5 hover:opacity-55"].join(" ")}>
        {emoji}
      </button>
    </form>
  );
}

function MailingStat({
  value,
  label,
  icon,
}: {
  value: number;
  label: string;
  icon: string;
}) {
  return (
    <div className="rounded-[1.4rem] bg-white px-5 py-4 shadow-lg shadow-black/[0.03] ring-1 ring-black/5">
      <div className="flex items-center gap-4">
        <div className="text-3xl">{icon}</div>
        <div>
          <p className="text-2xl font-black leading-none">{value}</p>
          <p className="mt-1 text-xs font-semibold text-zinc-400">{label}</p>
        </div>
      </div>
    </div>
  );
}

function formatMailingDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("de-DE");
}

function formatMailingDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  }).format(date);
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
// ARBEITS-KACHEL
// ============================================================

function WorkStatCard({
  icon,
  value,
  label,
  active,
  onClick,
  critical = false,
}: {
  icon: string;
  value: number;
  label: string;
  active: boolean;
  onClick: () => void;
  critical?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group w-full rounded-[1.4rem] px-5 py-4 text-left shadow-lg shadow-black/[0.03] ring-1 transition",
        active
          ? critical
            ? "bg-red-50 ring-red-200"
            : "bg-lime-100 ring-lime-200"
          : critical && value > 0
            ? "bg-white ring-red-100 hover:-translate-y-0.5 hover:bg-red-50"
            : "bg-white ring-black/5 hover:-translate-y-0.5 hover:bg-[#faf8f2]",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="shrink-0 text-3xl">{icon}</div>

          <div className="min-w-0">
            <p
              className={[
                "text-2xl font-black leading-none",
                active && critical ? "text-red-700" : "text-zinc-950",
              ].join(" ")}
            >
              {value}
            </p>

            <p
              className={[
                "mt-1 truncate text-xs font-semibold",
                active && critical
                  ? "text-red-600"
                  : active
                    ? "text-zinc-700"
                    : "text-zinc-400",
              ].join(" ")}
            >
              {label}
            </p>
          </div>
        </div>

        <div
          className={[
            "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-black transition",
            active
              ? critical
                ? "bg-red-500 text-white"
                : "bg-zinc-950 text-white"
              : "bg-[#fbf7ef] text-zinc-300 group-hover:text-zinc-600",
          ].join(" ")}
        >
          {active ? "✓" : "→"}
        </div>
      </div>
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