"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDate } from "@/app/lib/show-workflow";
import BookingCalendar from "@/components/BookingCalendar";

type FilterKey = "alle" | "kommend" | "vergangen" | "fertig";

type Todo = {
  id: string;
  text: string;
  done: boolean;
};

type PersonalData = {
  notes: Record<string, string>;
  todos: Record<string, Todo[]>;
};

const STORAGE_KEY = "primakavi_markus_personal_v1";

export default function MarkusClient({
  shows,
  absences,
  createAbsenceAction,
  deleteAbsenceAction,
}: {
  shows: any[];
  absences: any[];
  createAbsenceAction: (formData: FormData) => void | Promise<void>;
  deleteAbsenceAction: (formData: FormData) => void | Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("kommend");
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});
  const [personal, setPersonal] = useState<PersonalData>({
    notes: {},
    todos: {},
  });
  const [storageReady, setStorageReady] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setPersonal({
          notes: parsed?.notes || {},
          todos: parsed?.todos || {},
        });
      }
    } catch {
      // Lokale Notizen dürfen die Markus-Ansicht niemals blockieren.
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(personal));
  }, [personal, storageReady]);

  const upcomingShows = useMemo(
    () =>
      shows
        .filter(
          (show) =>
            show.show_date &&
            show.show_date >= today &&
            !isCancelled(show)
        )
        .sort((a, b) => String(a.show_date).localeCompare(String(b.show_date))),
    [shows, today]
  );

  const nextShows = upcomingShows.slice(0, 6);

  const cityCount = useMemo(
    () =>
      new Set(
        upcomingShows
          .map((show) => String(show.city || "").trim())
          .filter(Boolean)
      ).size,
    [upcomingShows]
  );

  const openSummary = useMemo(() => {
    const travel = upcomingShows.filter((show) => travelIsOpen(show)).length;
    const hotel = upcomingShows.filter((show) => hotelIsOpen(show)).length;
    const soundcheck = upcomingShows.filter((show) => !show.soundcheck_time).length;
    const notes = upcomingShows.filter(
      (show) => String(show.markus_notes || "").trim()
    ).length;

    return { travel, hotel, soundcheck, notes };
  }, [upcomingShows]);

  const filteredShows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return shows
      .filter((show) => {
        const searchText = [
          show.venue,
          show.city,
          show.venue_address,
          show.program,
          show.schedule_notes,
          show.venue_access_details,
          show.tech_notes,
          show.piano_type,
          show.piano_notes,
          show.tech_contact,
          show.travel_notes,
          show.parking_details,
          show.accommodation_type,
          show.accommodation_hotel_name,
          show.accommodation_address,
          show.accommodation_notes,
          show.markus_notes,
          show.catering_details,
          show.backstage_notes,
          personal.notes[String(show.id)],
          ...(personal.todos[String(show.id)] || []).map((todo) => todo.text),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !normalizedQuery || searchText.includes(normalizedQuery);

        const isPast = show.show_date && show.show_date < today;
        const isFuture = !show.show_date || show.show_date >= today;
        const done =
          normalize(show.internal_status) === "fertig" ||
          normalize(show.internal_status) === "abgeschlossen";
        const cancelled = isCancelled(show);

        const matchesFilter =
          filter === "alle" ||
          (filter === "kommend" && isFuture && !cancelled) ||
          (filter === "vergangen" && (isPast || cancelled)) ||
          (filter === "fertig" && done);

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => String(a.show_date || "").localeCompare(String(b.show_date || "")));
  }, [shows, query, filter, today, personal]);

  function toggleShow(id: string) {
    setOpenIds((current) => ({ ...current, [id]: !current[id] }));
  }

  function openShow(id: string) {
    setOpenIds((current) => ({ ...current, [id]: true }));
    window.setTimeout(() => {
      document
        .getElementById(`markus-show-${id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function setNote(showId: string, value: string) {
    setPersonal((current) => ({
      ...current,
      notes: { ...current.notes, [showId]: value },
    }));
  }

  function addTodo(showId: string, text: string) {
    const clean = text.trim();
    if (!clean) return;

    setPersonal((current) => ({
      ...current,
      todos: {
        ...current.todos,
        [showId]: [
          ...(current.todos[showId] || []),
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            text: clean,
            done: false,
          },
        ],
      },
    }));
  }

  function toggleTodo(showId: string, todoId: string) {
    setPersonal((current) => ({
      ...current,
      todos: {
        ...current.todos,
        [showId]: (current.todos[showId] || []).map((todo) =>
          todo.id === todoId ? { ...todo, done: !todo.done } : todo
        ),
      },
    }));
  }

  function deleteTodo(showId: string, todoId: string) {
    setPersonal((current) => ({
      ...current,
      todos: {
        ...current.todos,
        [showId]: (current.todos[showId] || []).filter(
          (todo) => todo.id !== todoId
        ),
      },
    }));
  }

  return (
    <main className="px-6 py-8">
      <div className="mx-auto max-w-[1180px]">
        <header className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[.22em] text-[#9a978f]">
              primakavi · Markus
            </p>
            <h1 className="mt-1 text-4xl font-black tracking-tight text-[#191917]">
              Markus
            </h1>
            <p className="mt-1 text-base font-medium text-[#77736c]">
              Deine Shows, Termine und alles, was du dafür brauchst.
            </p>
          </div>

          <div className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-black text-[#68645d]">
            {new Intl.DateTimeFormat("de-DE", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            }).format(new Date())}
          </div>
        </header>

        <section className="mb-5 grid gap-3 sm:grid-cols-3">
          <Metric
            icon="📅"
            value={String(upcomingShows.length)}
            label="kommende Shows"
            sub="mit dir"
          />
          <Metric
            icon="📍"
            value={String(cityCount)}
            label="Städte"
            sub="bei kommenden Shows"
          />
          <Metric
            icon="🗓️"
            value={String(absences.length)}
            label="Abwesenheiten"
            sub="eingetragen"
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.02fr_.98fr]">
          <DashboardCard>
            <CardHeader
              icon="📅"
              title="Nächste Shows"
              action={
                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("markus-shows")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="text-xs font-black text-[#4f4b45] underline decoration-black/20 underline-offset-4"
                >
                  Alle Shows →
                </button>
              }
            />

            <div className="mt-4 divide-y divide-black/5">
              {nextShows.length ? (
                nextShows.map((show) => {
                  const state = showReadiness(show);
                  return (
                    <button
                      key={show.id}
                      type="button"
                      onClick={() => openShow(String(show.id))}
                      className="grid w-full gap-2 py-3 text-left transition hover:bg-[#fbfaf7] md:grid-cols-[92px_minmax(0,1.25fr)_minmax(0,1fr)_auto_18px] md:items-center md:px-2"
                    >
                      <div>
                        <p className="text-sm font-black text-[#191917]">
                          {formatDate(show.show_date)}
                        </p>
                        <p className="mt-0.5 text-[10px] font-bold text-[#aaa59d]">
                          {weekday(show.show_date)}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-[#27241f]">
                          {show.venue || "Location offen"}
                        </p>
                        <p className="truncate text-xs font-semibold text-[#969189]">
                          {show.city || "Ort offen"}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-[#4d4943]">
                          {show.program || "Programm offen"}
                        </p>
                        <p className="mt-0.5 text-[11px] font-semibold text-[#aaa59d]">
                          {show.start_time ? `${show.start_time} Uhr` : "Beginn offen"}
                        </p>
                      </div>

                      <ReadinessPill state={state} />
                      <span className="text-lg font-black text-[#aaa59d]">›</span>
                    </button>
                  );
                })
              ) : (
                <EmptyText>Keine kommenden Shows.</EmptyText>
              )}
            </div>
          </DashboardCard>

          <DashboardCard>
            <CardHeader icon="📅" title="Kalender & Abwesenheiten" />
            <div className="mt-3 overflow-hidden">
              <BookingCalendar
                shows={shows}
                absences={absences}
                canEditMarkus
                createAction={createAbsenceAction}
                deleteAction={deleteAbsenceAction}
              />
            </div>
          </DashboardCard>
        </section>

        <section className="mt-5">
          <DashboardCard>
            <CardHeader icon="⚠️" title="Für dich noch offen" />
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <OpenItem
                icon="🚗"
                value={openSummary.travel}
                label="Reise ungeklärt"
              />
              <OpenItem
                icon="🛏️"
                value={openSummary.hotel}
                label="Unterkunft ungeklärt"
              />
              <OpenItem
                icon="🕐"
                value={openSummary.soundcheck}
                label="Soundcheckzeit fehlt"
              />
              <OpenItem
                icon="📝"
                value={openSummary.notes}
                label="Notizen vom Team"
              />
            </div>
          </DashboardCard>
        </section>

        <section id="markus-shows" className="mt-7 scroll-mt-6">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#aaa59d]">
                Shows
              </p>
              <h2 className="mt-1 text-2xl font-black text-[#191917]">
                Meine Shows
              </h2>
            </div>
            <p className="text-xs font-bold text-[#aaa59d]">
              {filteredShows.length} angezeigt
            </p>
          </div>

          <div className="mb-3 rounded-[1.4rem] bg-white p-3 shadow-sm ring-1 ring-black/5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Location, Stadt, Programm, Notiz …"
                className="h-11 min-w-0 flex-1 rounded-xl border border-black/10 bg-[#fbf7ef] px-4 text-sm font-semibold text-[#292621] outline-none placeholder:text-[#aaa59d] focus:border-black/25"
              />

              <div className="flex flex-wrap gap-1.5">
                <FilterButton
                  active={filter === "kommend"}
                  onClick={() => setFilter("kommend")}
                >
                  Kommend
                </FilterButton>
                <FilterButton
                  active={filter === "alle"}
                  onClick={() => setFilter("alle")}
                >
                  Alle
                </FilterButton>
                <FilterButton
                  active={filter === "vergangen"}
                  onClick={() => setFilter("vergangen")}
                >
                  Vergangen
                </FilterButton>
                <FilterButton
                  active={filter === "fertig"}
                  onClick={() => setFilter("fertig")}
                >
                  ✓ Fertig
                </FilterButton>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.6rem] bg-white shadow-sm ring-1 ring-black/5">
            {filteredShows.length ? (
              filteredShows.map((show, index) => (
                <MarkusShow
                  key={show.id}
                  show={show}
                  open={!!openIds[String(show.id)]}
                  onToggle={() => toggleShow(String(show.id))}
                  note={personal.notes[String(show.id)] || ""}
                  onNoteChange={(value) => setNote(String(show.id), value)}
                  todos={personal.todos[String(show.id)] || []}
                  onAddTodo={(text) => addTodo(String(show.id), text)}
                  onToggleTodo={(todoId) =>
                    toggleTodo(String(show.id), todoId)
                  }
                  onDeleteTodo={(todoId) =>
                    deleteTodo(String(show.id), todoId)
                  }
                  first={index === 0}
                />
              ))
            ) : (
              <div className="p-10 text-center text-sm font-semibold text-[#969189]">
                Keine passenden Shows gefunden.
              </div>
            )}
          </div>
        </section>

        <p className="mt-3 text-right text-[10px] font-semibold text-[#aaa59d]">
          Deine persönlichen Notizen und To-dos werden aktuell nur in diesem Browser gespeichert.
        </p>
      </div>
    </main>
  );
}

function MarkusShow({
  show,
  open,
  onToggle,
  note,
  onNoteChange,
  todos,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
  first,
}: {
  show: any;
  open: boolean;
  onToggle: () => void;
  note: string;
  onNoteChange: (value: string) => void;
  todos: Todo[];
  onAddTodo: (text: string) => void;
  onToggleTodo: (todoId: string) => void;
  onDeleteTodo: (todoId: string) => void;
  first: boolean;
}) {
  const [todoText, setTodoText] = useState("");
  const readiness = showReadiness(show);

  return (
    <article
      id={`markus-show-${show.id}`}
      className={`scroll-mt-6 ${first ? "" : "border-t border-black/5"}`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="grid w-full gap-3 px-5 py-4 text-left transition hover:bg-[#fbfaf7] md:grid-cols-[120px_minmax(0,1.3fr)_minmax(0,1fr)_auto_24px] md:items-center"
      >
        <div>
          <p className="text-sm font-black text-[#191917]">
            {formatDate(show.show_date)}
          </p>
          <p className="mt-0.5 text-[10px] font-bold text-[#aaa59d]">
            {weekday(show.show_date)}
          </p>
        </div>

        <div className="min-w-0">
          <p className="truncate text-base font-black text-[#27241f]">
            {show.venue || "Location offen"}
          </p>
          <p className="truncate text-xs font-semibold text-[#969189]">
            {show.city || "Ort offen"}
          </p>
        </div>

        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-[#4d4943]">
            {show.program || "Programm offen"}
          </p>
          <p className="mt-0.5 text-[11px] font-semibold text-[#aaa59d]">
            {show.start_time ? `${show.start_time} Uhr` : "Beginn offen"}
          </p>
        </div>

        <ReadinessPill state={readiness} />
        <span className="text-right text-xl font-black text-[#aaa59d]">
          {open ? "⌃" : "⌄"}
        </span>
      </button>

      {open && (
        <div className="border-t border-black/5 bg-[#fffdf9] px-5 pb-5 pt-4">
          <ShowTimeline show={show} />

          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            <InfoCard title="📍 Zugang & Treffpunkt">
              {accessText(show) || "Noch keine Angaben hinterlegt."}
            </InfoCard>

            <InfoCard title="⚡ Besonderheiten" warm>
              {show.schedule_notes || "Keine Besonderheiten hinterlegt."}
            </InfoCard>

            <InfoCard title="📝 Notiz für Markus" pink>
              {show.markus_notes || "Keine Notiz vom Team."}
            </InfoCard>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <InfoCard title="🎹 Piano & Technik">
              {technikText(show) || "Noch keine Technikangaben."}
            </InfoCard>
            <InfoCard title="🚗 Anreise">
              {travelText(show) || "Anreise noch nicht hinterlegt."}
            </InfoCard>
            <InfoCard title="🏨 Unterkunft">
              {accommodationText(show) || "Unterkunft noch nicht hinterlegt."}
            </InfoCard>
            <InfoCard title="☕ Catering / Backstage">
              {cateringText(show) || "Noch keine Angaben."}
            </InfoCard>
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl bg-[#eef5ff] p-4 ring-1 ring-[#d9e6fa]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[.13em] text-[#6683aa]">
                    ✏️ Meine Notizen
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold text-[#879bb7]">
                    Nur für dich auf diesem Gerät.
                  </p>
                </div>
              </div>
              <textarea
                value={note}
                onChange={(event) => onNoteChange(event.target.value)}
                placeholder="Noten prüfen, Treffpunkt merken, Frage für Sonja …"
                rows={4}
                className="mt-3 w-full resize-y rounded-xl border border-[#cfddf1] bg-white/80 px-3 py-2.5 text-sm font-semibold leading-5 text-[#303944] outline-none placeholder:text-[#a5b2c2] focus:border-[#8ba7ca]"
              />
            </div>

            <div className="rounded-2xl bg-[#effbf1] p-4 ring-1 ring-[#d4eed9]">
              <p className="text-[10px] font-black uppercase tracking-[.13em] text-[#5f9368]">
                ✓ Meine To-dos
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-[#86a78d]">
                Kleine persönliche Checkliste für diese Show.
              </p>

              <div className="mt-3 space-y-2">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-2 rounded-xl bg-white/75 px-3 py-2"
                  >
                    <button
                      type="button"
                      onClick={() => onToggleTodo(todo.id)}
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs font-black ${
                        todo.done
                          ? "border-[#75b67f] bg-[#75b67f] text-white"
                          : "border-[#a8c9ae] bg-white text-transparent"
                      }`}
                    >
                      ✓
                    </button>
                    <span
                      className={`min-w-0 flex-1 text-sm font-semibold ${
                        todo.done
                          ? "text-[#91a395] line-through"
                          : "text-[#354438]"
                      }`}
                    >
                      {todo.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => onDeleteTodo(todo.id)}
                      className="text-base font-black text-[#a8b9ab] hover:text-red-500"
                      aria-label="To-do löschen"
                    >
                      ×
                    </button>
                  </div>
                ))}

                {!todos.length && (
                  <p className="py-1 text-xs font-semibold text-[#91a395]">
                    Noch keine persönlichen To-dos.
                  </p>
                )}
              </div>

              <form
                className="mt-3 flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  onAddTodo(todoText);
                  setTodoText("");
                }}
              >
                <input
                  value={todoText}
                  onChange={(event) => setTodoText(event.target.value)}
                  placeholder="Neues To-do …"
                  className="h-10 min-w-0 flex-1 rounded-xl border border-[#cfe6d3] bg-white/85 px-3 text-sm font-semibold outline-none placeholder:text-[#9eb2a2] focus:border-[#8fbd97]"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-white px-3 text-xs font-black text-[#47744f] ring-1 ring-[#c5dfca] hover:bg-[#f9fffa]"
                >
                  + Hinzufügen
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function ShowTimeline({ show }: { show: any }) {
  const items = [
    ["Ankunft", show.arrival_time],
    ["Aufbau", show.setup_time],
    ["Soundcheck", show.soundcheck_time],
    ["Einlass", show.entry_time],
    ["SHOW", show.start_time],
  ];

  return (
    <div className="grid overflow-hidden rounded-2xl bg-[#fbf7ef] ring-1 ring-black/5 sm:grid-cols-5">
      {items.map(([label, value], index) => (
        <div
          key={label}
          className={`px-4 py-3 ${
            index ? "border-t border-black/5 sm:border-l sm:border-t-0" : ""
          } ${label === "SHOW" ? "bg-[#111] text-white" : ""}`}
        >
          <p
            className={`text-[9px] font-black uppercase tracking-[.13em] ${
              label === "SHOW" ? "text-white/45" : "text-[#aaa59d]"
            }`}
          >
            {label}
          </p>
          <p className="mt-1 text-base font-black">
            {value ? `${value} Uhr` : "—"}
          </p>
        </div>
      ))}
    </div>
  );
}

function DashboardCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[1.7rem] bg-white p-5 shadow-sm ring-1 ring-black/5">
      {children}
    </div>
  );
}

function CardHeader({
  icon,
  title,
  action,
}: {
  icon: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-xl font-black text-[#191917]">
        <span>{icon}</span>
        {title}
      </h2>
      {action}
    </div>
  );
}

function Metric({
  icon,
  value,
  label,
  sub,
}: {
  icon: string;
  value: string;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex min-h-[72px] items-center gap-3 rounded-[1.35rem] bg-white px-5 py-3 shadow-sm ring-1 ring-black/5">
      <span className="text-xl">{icon}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black text-[#191917]">{value}</span>
        <div>
          <p className="text-xs font-black text-[#37332e]">{label}</p>
          <p className="text-[10px] font-semibold text-[#aaa59d]">{sub}</p>
        </div>
      </div>
    </div>
  );
}

function OpenItem({
  icon,
  value,
  label,
}: {
  icon: string;
  value: number;
  label: string;
}) {
  const okay = value === 0;
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 ring-1 ${
        okay
          ? "bg-[#effbf1] ring-[#d4eed9]"
          : "bg-[#fff9ef] ring-[#f0dfc1]"
      }`}
    >
      <span className="text-xl">{okay ? "✓" : icon}</span>
      <div>
        <p className="text-lg font-black text-[#292621]">{value}</p>
        <p className="text-[11px] font-bold text-[#817b72]">{label}</p>
      </div>
    </div>
  );
}

function InfoCard({
  title,
  children,
  warm = false,
  pink = false,
}: {
  title: string;
  children: React.ReactNode;
  warm?: boolean;
  pink?: boolean;
}) {
  const style = pink
    ? "bg-[#fff0f2] ring-[#f4d8dc]"
    : warm
      ? "bg-[#fff8df] ring-[#f0df9a]"
      : "bg-white ring-black/5";

  return (
    <div className={`h-full rounded-2xl p-4 ring-1 ${style}`}>
      <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#9b958d]">
        {title}
      </p>
      <div className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-5 text-[#4b4741]">
        {children}
      </div>
    </div>
  );
}

function FilterButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2.5 text-xs font-black transition ${
        active
          ? "bg-[#191917] text-white"
          : "bg-[#fbf7ef] text-[#625d56] hover:bg-[#f2eee6]"
      }`}
    >
      {children}
    </button>
  );
}

function ReadinessPill({
  state,
}: {
  state: { label: string; tone: "green" | "amber" | "pink" };
}) {
  const cls =
    state.tone === "green"
      ? "bg-[#e8f8d8] text-[#54852b]"
      : state.tone === "pink"
        ? "bg-[#ffe2e9] text-[#c14b68]"
        : "bg-[#fff0d9] text-[#b47724]";

  return (
    <span
      className={`w-fit whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] font-black ${cls}`}
    >
      {state.label}
    </span>
  );
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return (
    <p className="py-8 text-center text-sm font-semibold text-[#aaa59d]">
      {children}
    </p>
  );
}

function showReadiness(show: any): {
  label: string;
  tone: "green" | "amber" | "pink";
} {
  if (travelIsOpen(show)) return { label: "Anreise offen", tone: "pink" };
  if (hotelIsOpen(show)) return { label: "Hotel offen", tone: "amber" };
  if (!show.soundcheck_time)
    return { label: "Soundcheck offen", tone: "amber" };
  return { label: "Alles geklärt", tone: "green" };
}

function travelIsOpen(show: any) {
  const status = normalize(
    show.travel_status ||
      show.travel_planning_status ||
      show.travel_requirement ||
      show.travel_required
  );

  if (
    ["nicht erforderlich", "nicht_erforderlich", "none", "no", "false"].includes(
      status
    )
  ) {
    return false;
  }

  const hasTravelInfo = Boolean(
    show.travel_notes ||
      show.parking_details ||
      show.travel_type ||
      show.travel_mode ||
      show.arrival_time
  );

  return !hasTravelInfo;
}

function hotelIsOpen(show: any) {
  const type = normalize(show.accommodation_type);

  if (
    [
      "nicht erforderlich",
      "nicht_erforderlich",
      "keine",
      "none",
      "no",
      "false",
    ].includes(type)
  ) {
    return false;
  }

  return !Boolean(
    show.accommodation_hotel_name ||
      show.accommodation_address ||
      show.accommodation_buyout ||
      show.accommodation_notes
  );
}

function isCancelled(show: any) {
  return ["abgesagt", "storniert", "cancelled", "canceled"].includes(
    normalize(show.internal_status)
  );
}

function normalize(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function weekday(date?: string | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("de-DE", { weekday: "short" }).format(
    new Date(`${date}T12:00:00`)
  );
}

function accessText(show: any) {
  return [
    show.venue_address,
    show.venue_access_details,
  ]
    .filter(Boolean)
    .join("\n");
}

function technikText(show: any) {
  return [
    show.piano_type ? `Klavier / Flügel: ${show.piano_type}` : null,
    show.epiano_available ? "E-Piano vorhanden" : null,
    show.piano_notes,
    show.tech_sound_available ? "Ton vorhanden" : null,
    show.tech_lights_available ? "Licht vorhanden" : null,
    show.tech_contact ? `Technik-Kontakt: ${show.tech_contact}` : null,
    show.tech_notes,
  ]
    .filter(Boolean)
    .join("\n");
}

function travelText(show: any) {
  return [
    show.travel_mode || show.travel_type,
    show.parking_available === true ? "Parkplatz vorhanden" : null,
    show.loading_zone_available === true ? "Ladezone vorhanden" : null,
    show.no_parking_available === true ? "Keine Parkmöglichkeit" : null,
    show.public_transport_recommended === true ? "ÖPNV empfohlen" : null,
    show.parking_details,
    show.travel_notes,
  ]
    .filter(Boolean)
    .join("\n");
}

function accommodationText(show: any) {
  return [
    show.accommodation_type,
    show.accommodation_hotel_name,
    show.accommodation_address,
    show.accommodation_buyout
      ? `Buyout: ${show.accommodation_buyout}`
      : null,
    show.accommodation_notes,
  ]
    .filter(Boolean)
    .join("\n");
}

function cateringText(show: any) {
  return [
    show.catering_status,
    show.catering_details,
    show.backstage_room_available ? "Backstage-Raum vorhanden" : null,
    show.backstage_mirror_available ? "Spiegel vorhanden" : null,
    show.backstage_seating_available ? "Sitzgelegenheit vorhanden" : null,
    show.backstage_table_available ? "Tisch vorhanden" : null,
    show.backstage_no_room ? "Kein Backstage-Raum vorhanden" : null,
    show.backstage_notes,
  ]
    .filter(Boolean)
    .join("\n");
}
