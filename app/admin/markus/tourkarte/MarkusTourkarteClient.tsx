"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

const MarkusTourMap = dynamic(() => import("./MarkusTourMap"), {
  ssr: false,
});

type Show = {
  id: string;
  program: string | null;
  show_date: string | null;
  weekday: string | null;
  venue: string | null;
  city: string | null;
  venue_address: string | null;
  start_time: string | null;
  soundcheck_time: string | null;
  piano: string | null;
  epiano: string | null;
  piano_type: string | null;
  epiano_available: boolean | null;
  piano_notes: string | null;
  latitude: number | null;
  longitude: number | null;
};

export default function MarkusTourkarteClient({ shows }: { shows: Show[] }) {
  const [range, setRange] = useState<"kommend" | "alle">("kommend");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredShows = useMemo(() => {
    return shows
      .filter((show) => {
        const hasCoords = show.latitude !== null && show.longitude !== null;
        const showDate = show.show_date ? new Date(show.show_date) : null;
        const isUpcoming = showDate ? showDate >= today : true;

        if (!hasCoords) return false;
        if (range === "kommend") return isUpcoming;
        return true;
      })
      .sort((a, b) => {
        const da = a.show_date ? new Date(a.show_date).getTime() : 0;
        const db = b.show_date ? new Date(b.show_date).getTime() : 0;
        return da - db;
      });
  }, [shows, range]);

  return (
    <main className="min-h-screen bg-[#fbf7ef] px-8 py-8 text-zinc-950">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="relative overflow-hidden rounded-[2.4rem] bg-[#101014] p-10 text-white shadow-2xl shadow-black/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(190,255,90,0.22),transparent_28%),radial-gradient(circle_at_35%_25%,rgba(255,145,60,0.22),transparent_35%),radial-gradient(circle_at_70%_95%,rgba(255,105,180,0.18),transparent_28%)]" />

          <div className="absolute right-16 top-10 rotate-6 text-6xl text-orange-300">
            🗺️
          </div>

          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-white/50">
                Markus · Tourplan
              </p>

              <h1 className="mt-4 text-5xl font-black tracking-tight">
                Deine Shows
              </h1>

              <p className="mt-4 max-w-xl text-white/70">
                Wo, wann, Piano — mehr nicht.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <RangeButton active={range === "kommend"} onClick={() => setRange("kommend")}>
                Kommend
              </RangeButton>
              <RangeButton active={range === "alle"} onClick={() => setRange("alle")}>
                Alle
              </RangeButton>
            </div>
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
          <aside className="rounded-[2rem] bg-white p-5 shadow-xl shadow-black/5 ring-1 ring-black/5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                  Tourliste
                </p>
                <p className="mt-1 text-2xl font-black text-zinc-950">
                  {filteredShows.length} Shows
                </p>
              </div>

              <span className="rounded-full bg-lime-100 px-3 py-2 text-xs font-black text-zinc-900">
                🎹 Markus
              </span>
            </div>

            <div className="max-h-[720px] space-y-3 overflow-auto pr-1">
              {filteredShows.length === 0 ? (
                <div className="rounded-3xl bg-[#fbf7ef] p-6 text-center">
                  <p className="text-3xl">🎹</p>
                  <p className="mt-3 text-sm font-black text-zinc-500">
                    Keine relevanten Shows gefunden.
                  </p>
                </div>
              ) : (
                filteredShows.map((show, index) => (
                  <article
                    key={show.id}
                    className="rounded-3xl bg-[#fbf7ef] p-4 ring-1 ring-black/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-zinc-400">
                          {formatDate(show.show_date)}
                        </p>

                        <p className="mt-2 text-base font-black text-zinc-950">
                          {show.venue || "Ohne Venue"}
                        </p>

                        <p className="mt-1 text-sm font-bold text-zinc-500">
                          {show.city || "Ohne Stadt"}
                        </p>
                      </div>

                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-xs font-black text-white">
                        {index + 1}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-2xl bg-white px-3 py-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-400">
                          Start
                        </p>
                        <p className="mt-1 text-lg font-black text-pink-500">
                          {show.start_time || "—"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white px-3 py-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-400">
                          Soundcheck
                        </p>
                        <p className="mt-1 text-lg font-black text-zinc-950">
                          {show.soundcheck_time || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 rounded-2xl bg-lime-100 px-3 py-2 text-xs font-black text-zinc-900">
                      🎹 {pianoLabel(show)}
                    </div>

                    {show.piano_notes && (
                      <p className="mt-2 rounded-2xl bg-white px-3 py-2 text-xs font-semibold leading-relaxed text-zinc-600">
                        {show.piano_notes}
                      </p>
                    )}

                    {show.venue_address && (
                      <a
                        href={mapsUrl(show)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 flex h-11 items-center justify-center rounded-2xl bg-zinc-950 text-sm font-black text-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/15"
                      >
                        Navigation öffnen →
                      </a>
                    )}
                  </article>
                ))
              )}
            </div>
          </aside>

          <section className="overflow-hidden rounded-[2rem] bg-white p-3 shadow-xl shadow-black/5 ring-1 ring-black/5">
            <MarkusTourMap shows={filteredShows} />
          </section>
        </div>
      </div>
    </main>
  );
}

function RangeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full px-4 py-2 text-sm font-black transition",
        active
          ? "bg-white text-zinc-950 shadow-lg shadow-black/20"
          : "bg-white/10 text-white hover:bg-white/20",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function pianoLabel(show: Show) {
  if (show.epiano_available === true) return "E-Piano vorhanden";
  if (show.piano_type) return show.piano_type;
  if (show.piano) return show.piano;
  if (show.epiano) return show.epiano;
  return "Piano prüfen";
}

function formatDate(date: string | null) {
  if (!date) return "Ohne Datum";

  return new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function mapsUrl(show: Show) {
  const query = [show.venue_address, show.city, show.venue]
    .filter(Boolean)
    .join(", ");

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query
  )}`;
}