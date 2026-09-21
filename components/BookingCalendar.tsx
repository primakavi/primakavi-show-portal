"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";

type CalendarShow = {
  id: string;
  show_date: string | null;
  venue: string | null;
  city: string | null;
  program: string | null;
  markus_included?: boolean | null;
};

type Absence = {
  id: string;
  person: "sonja" | "markus";
  start_date: string;
  end_date: string;
  reason: string | null;
  note: string | null;
};

type Props = {
  shows: CalendarShow[];
  absences: Absence[];
  canEditSonja?: boolean;
  canEditMarkus?: boolean;
  createAction?: (formData: FormData) => void | Promise<void>;
  deleteAction?: (formData: FormData) => void | Promise<void>;
  sonjaCalendarUrl?: string;
};

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export default function BookingCalendar({
  shows,
  absences,
  canEditSonja = false,
  canEditMarkus = false,
  createAction,
  deleteAction,
  sonjaCalendarUrl,
}: Props) {
  const today = new Date();
  const [cursor, setCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [showForm, setShowForm] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState<Absence | null>(null);

  const [createResult, createFormAction] = useActionState(
    async (_previousState: number, formData: FormData) => {
      if (!createAction) return _previousState;
      await createAction(formData);
      return _previousState + 1;
    },
    0
  );

  useEffect(() => {
    if (createResult > 0) {
      setShowForm(false);
    }
  }, [createResult]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const monthLabel = new Intl.DateTimeFormat("de-DE", {
    month: "long",
    year: "numeric",
  }).format(cursor);

  const days = useMemo(() => {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const leading = (first.getDay() + 6) % 7;

    return [
      ...Array.from({ length: leading }, () => null),
      ...Array.from({ length: last.getDate() }, (_, i) => i + 1),
    ];
  }, [year, month]);

  const canCreate = Boolean(
    createAction && (canEditSonja || canEditMarkus)
  );

  function isoForDay(day: number) {
    return [
      year,
      String(month + 1).padStart(2, "0"),
      String(day).padStart(2, "0"),
    ].join("-");
  }

  function isToday(day: number) {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  }

  function showsForDay(day: number) {
    const iso = isoForDay(day);
    return shows.filter((show) => show.show_date === iso);
  }

  function absencesForDay(day: number) {
    const iso = isoForDay(day);
    return absences.filter(
      (absence) => absence.start_date <= iso && absence.end_date >= iso
    );
  }

  return (
    <div className="relative">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="grid h-8 w-8 place-items-center rounded-full bg-[#f7f3ea] text-xs font-black text-zinc-600 transition hover:bg-zinc-100"
            aria-label="Vorheriger Monat"
          >
            ←
          </button>

          <h3 className="min-w-[145px] text-center text-sm font-black capitalize text-zinc-800">
            {monthLabel}
          </h3>

          <button
            type="button"
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="grid h-8 w-8 place-items-center rounded-full bg-[#f7f3ea] text-xs font-black text-zinc-600 transition hover:bg-zinc-100"
            aria-label="Nächster Monat"
          >
            →
          </button>
        </div>

        <div className="flex items-center gap-2">
          {sonjaCalendarUrl && (
            <a
              href={sonjaCalendarUrl}
              className="rounded-full bg-[#f7f3ea] px-4 py-2 text-xs font-black text-zinc-700 transition hover:bg-zinc-100"
            >
              📅 Kalender abonnieren
            </a>
          )}

          {canCreate && (
            <button
              type="button"
              onClick={() => {
                setSelectedAbsence(null);
                setShowForm((value) => !value);
              }}
              className="rounded-full bg-zinc-950 px-4 py-2 text-xs font-black text-white transition hover:bg-zinc-800"
            >
              {showForm ? "Schließen" : "+ Abwesenheit"}
            </button>
          )}
        </div>
      </div>

      {showForm && createAction && (
        <>
          <button
            type="button"
            aria-label="Abwesenheitsformular schließen"
            onClick={() => setShowForm(false)}
            className="fixed inset-0 z-40 cursor-default bg-transparent"
          />
          <div className="absolute right-0 top-11 z-50 w-full max-w-[430px] rounded-[1.5rem] bg-white p-4 shadow-2xl ring-1 ring-black/10">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-400">Verfügbarkeit</p>
                <h4 className="mt-1 text-lg font-black text-zinc-950">Abwesenheit eintragen</h4>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 text-sm font-black text-zinc-500" aria-label="Schließen">×</button>
            </div>
            <form action={createFormAction} className="grid gap-3 sm:grid-cols-2">
              <label className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-500">Person
                <select name="person" required defaultValue={canEditSonja ? "sonja" : "markus"} className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-bold text-zinc-900">
                  {canEditSonja && <option value="sonja">Sonja</option>}
                  {canEditMarkus && <option value="markus">Markus</option>}
                </select>
              </label>
              <label className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-500">Grund
                <input name="reason" placeholder="optional" className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-bold text-zinc-900" />
              </label>
              <label className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-500">Von
                <input type="date" name="start_date" required className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-bold text-zinc-900" />
              </label>
              <label className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-500">Bis
                <input type="date" name="end_date" required className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-bold text-zinc-900" />
              </label>
              <label className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-500 sm:col-span-2">Notiz
                <input name="note" placeholder="optional · intern" className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-bold text-zinc-900" />
              </label>
              <div className="flex justify-end gap-2 sm:col-span-2">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-full bg-zinc-100 px-4 py-2 text-xs font-black text-zinc-600">Abbrechen</button>
                <button type="submit" className="rounded-full bg-[#b8f238] px-4 py-2 text-xs font-black text-zinc-950">Speichern</button>
              </div>
            </form>
          </div>
        </>
      )}

      {selectedAbsence && (
        <>
          <button
            type="button"
            aria-label="Abwesenheitsdetails schließen"
            onClick={() => setSelectedAbsence(null)}
            className="fixed inset-0 z-40 cursor-default bg-transparent"
          />

          <div className="absolute right-0 top-11 z-50 w-full max-w-[360px] rounded-[1.5rem] bg-white p-4 shadow-2xl ring-1 ring-black/10">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-400">
                  Nicht verfügbar
                </p>
                <h4 className="mt-1 text-lg font-black text-zinc-950">
                  🔒 {selectedAbsence.person === "sonja" ? "Sonja" : "Markus"}
                </h4>
                <p className="mt-2 text-sm font-bold text-zinc-600">
                  {new Date(`${selectedAbsence.start_date}T12:00:00`).toLocaleDateString("de-DE")}
                  {" – "}
                  {new Date(`${selectedAbsence.end_date}T12:00:00`).toLocaleDateString("de-DE")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAbsence(null)}
                className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 text-sm font-black text-zinc-500 transition hover:bg-zinc-200"
                aria-label="Schließen"
              >
                ×
              </button>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedAbsence(null)}
                className="rounded-full bg-zinc-100 px-4 py-2 text-xs font-black text-zinc-600"
              >
                Schließen
              </button>

              {deleteAction &&
                ((selectedAbsence.person === "sonja" && canEditSonja) ||
                  (selectedAbsence.person === "markus" && canEditMarkus)) && (
                  <form
                    action={deleteAction}
                    onSubmit={() => setSelectedAbsence(null)}
                  >
                    <input type="hidden" name="absence_id" value={selectedAbsence.id} />
                    <button
                      type="submit"
                      className="rounded-full bg-rose-50 px-4 py-2 text-xs font-black text-rose-600 transition hover:bg-rose-100"
                    >
                      Löschen
                    </button>
                  </form>
                )}
            </div>
          </div>
        </>
      )}

      <div className="mb-1 grid grid-cols-7 text-center text-[9px] font-black uppercase tracking-[0.14em] text-zinc-400">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-1.5">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
        {days.map((day, index) => {
          if (!day) {
            return (
              <div
                key={`empty-${index}`}
                className="min-h-[62px] border-b border-r border-black/[0.04] bg-zinc-50/40"
              />
            );
          }

          const dayShows = showsForDay(day);
          const dayAbsences = absencesForDay(day);
          const todayFlag = isToday(day);
          const totalMarkers = dayShows.length + dayAbsences.length;

          return (
            <div
              key={isoForDay(day)}
              className={[
                "relative min-h-[62px] border-b border-r border-black/[0.04] p-1.5",
                todayFlag ? "bg-lime-50/70" : "bg-white",
              ].join(" ")}
            >
              <div
                className={[
                  "grid h-5 w-5 place-items-center rounded-full text-[10px] font-black",
                  todayFlag
                    ? "bg-zinc-950 text-white"
                    : "text-zinc-400",
                ].join(" ")}
              >
                {day}
              </div>

              <div className="space-y-1">
                {dayShows.slice(0, 1).map((show) => (
                  <Link
                    key={show.id}
                    href={`/admin/shows/${show.id}`}
                    title={[show.venue || show.program || "Show", show.city, show.program].filter(Boolean).join(" · ")}
                    className="block truncate rounded-md bg-lime-100 px-1.5 py-1 text-[9px] font-black leading-none text-lime-800 transition hover:bg-lime-200"
                  >
                    🎭 {show.city || show.venue || show.program || "Show"}
                  </Link>
                ))}
                {dayAbsences.slice(0, Math.max(0, 2 - dayShows.length)).map((absence) => (
                  <button
                    type="button"
                    key={absence.id}
                    onClick={() => {
                      setShowForm(false);
                      setSelectedAbsence(absence);
                    }}
                    title={absence.person === "sonja" ? "Sonja nicht verfügbar" : "Markus nicht verfügbar"}
                    className={[
                      "block w-full truncate rounded-md px-1.5 py-1 text-left text-[9px] font-black leading-none transition",
                      absence.person === "sonja"
                        ? "bg-pink-100 text-pink-700 hover:bg-pink-200"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200",
                    ].join(" ")}
                  >
                    🔒 {absence.person === "sonja" ? "Sonja" : "Markus"}
                  </button>
                ))}
                {dayShows.length + dayAbsences.length > 2 && (
                  <div className="px-1 text-[8px] font-black text-zinc-400">+{dayShows.length + dayAbsences.length - 2}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] font-bold text-zinc-400">
        <span className="rounded-md bg-lime-100 px-1.5 py-1 text-lime-800">🎭 Show</span>
        <span className="rounded-md bg-pink-100 px-1.5 py-1 text-pink-700">🔒 Sonja</span>
        <span className="rounded-md bg-blue-100 px-1.5 py-1 text-blue-700">🔒 Markus</span>
      </div>
    </div>
  );
}
