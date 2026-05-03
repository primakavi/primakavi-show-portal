"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

const TourMap = dynamic(() => import("./TourMap"), {
  ssr: false,
});

type Show = {
  id: string;
  artist: string | null;
  program: string | null;
  show_date: string | null;
  venue: string | null;
  city: string | null;
  start_time?: string | null;
  latitude: number | null;
  longitude: number | null;
  geocoding_status: string | null;
  markus_included: boolean;
};

export default function TourkarteClient({ shows }: { shows: Show[] }) {
  const [filter, setFilter] = useState<"kommend" | "markus" | "alle" | "ohne">(
    "kommend"
  );

  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredShows = useMemo(() => {
    return shows.filter((show) => {
      const hasCoords = show.latitude !== null && show.longitude !== null;
      const showDate = show.show_date ? new Date(show.show_date) : null;
      const isUpcoming = showDate ? showDate >= today : true;

      const inRange =
        (!fromDate || (showDate && showDate >= new Date(fromDate))) &&
        (!toDate || (showDate && showDate <= new Date(toDate)));

      if (!inRange) return false;

      if (filter === "kommend") return hasCoords && isUpcoming;
      if (filter === "markus") return hasCoords && show.markus_included === true;
      if (filter === "ohne") return !hasCoords;

      return hasCoords;
    });
  }, [shows, filter, fromDate, toDate]);

  const tourStops = useMemo(() => {
    return filteredShows
      .filter((s) => s.latitude && s.longitude)
      .sort((a, b) => {
        const da = a.show_date ? new Date(a.show_date).getTime() : 0;
        const db = b.show_date ? new Date(b.show_date).getTime() : 0;
        return da - db;
      });
  }, [filteredShows]);

  const legs = useMemo(() => {
    return tourStops.slice(0, -1).map((show, index) => {
      const next = tourStops[index + 1];

      return {
        from: show,
        to: next,
        distance: distanceKm(
          show.latitude!,
          show.longitude!,
          next.latitude!,
          next.longitude!
        ),
      };
    });
  }, [tourStops]);

  const longLegs = legs.filter((l) => l.distance > 180);

  return (
    <main className="min-h-screen bg-[#fbf7ef] px-8 py-8 text-zinc-950">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* 🔥 HEADER */}
        <header className="relative overflow-hidden rounded-[2.4rem] bg-[#101014] p-10 text-white shadow-2xl shadow-black/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(255,105,180,0.38),transparent_28%),radial-gradient(circle_at_35%_25%,rgba(255,145,60,0.28),transparent_35%),radial-gradient(circle_at_70%_95%,rgba(190,255,90,0.13),transparent_28%)]" />

          <div className="absolute right-20 top-8 rotate-6 text-7xl text-pink-400">
            🗺️
          </div>
          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-white/50">
                primakavi · tourplanung
              </p>

              <h1 className="mt-4 text-5xl font-black tracking-tight">
                Tourkarte
              </h1>

              <p className="mt-4 max-w-xl text-white/70">
                Shows räumlich denken – Lücken erkennen und smarter buchen.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterButton active={filter === "kommend"} onClick={() => setFilter("kommend")}>
                Kommend
              </FilterButton>
              <FilterButton active={filter === "markus"} onClick={() => setFilter("markus")}>
                Markus
              </FilterButton>
              <FilterButton active={filter === "alle"} onClick={() => setFilter("alle")}>
                Alle
              </FilterButton>
              <FilterButton active={filter === "ohne"} onClick={() => setFilter("ohne")}>
                Ohne Ort
              </FilterButton>
            </div>
          </div>
        </header>

        {/* 🔥 FILTER */}
        <section className="rounded-[2rem] bg-white p-5 shadow-xl ring-1 ring-black/5">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-14 rounded-2xl bg-[#fbf7ef] px-5 font-semibold"
            />

            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-14 rounded-2xl bg-[#fbf7ef] px-5 font-semibold"
            />
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[420px_1fr]">

          {/* 🔥 SIDEBAR */}
          <aside className="rounded-[2rem] bg-white p-5 shadow-xl ring-1 ring-black/5">
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Stops" value={tourStops.length} />
              <Stat label="KM" value={Math.round(legs.reduce((s, l) => s + l.distance, 0))} />
              <Stat label="Lücken" value={longLegs.length} />
            </div>

            <div className="mt-6 space-y-3 max-h-[600px] overflow-auto">
              {tourStops.map((show, i) => (
                <div key={show.id}>
                  <Link
                    href={`/admin/shows/${show.id}`}
                    className="block rounded-2xl bg-[#fbf7ef] p-4 hover:bg-white"
                  >
                    <p className="text-xs text-zinc-400">
                      {formatDate(show.show_date)}
                    </p>
                    <p className="font-black">{show.venue}</p>
                    <p className="text-xs text-zinc-500">{show.city}</p>
                  </Link>

                  {legs[i] && (
                    <p className="text-xs text-orange-500 pl-4">
                      ↓ {Math.round(legs[i].distance)} km
                    </p>
                  )}
                </div>
              ))}
            </div>
          </aside>

          {/* 🔥 MAP */}
          <section className="rounded-[2rem] bg-white p-3 shadow-xl ring-1 ring-black/5">
            <TourMap shows={tourStops} />
          </section>

        </div>
      </div>
    </main>
  );
}

function FilterButton({ active, onClick, children }: any) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-full px-4 py-2 text-sm font-black",
        active
          ? "bg-white text-black"
          : "bg-white/10 text-white",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Stat({ label, value }: any) {
  return (
    <div className="bg-[#fbf7ef] rounded-2xl p-3 text-center">
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs text-zinc-400">{label}</p>
    </div>
  );
}

function formatDate(date: string | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("de-DE").format(new Date(date));
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}