"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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
  internal_status: string | null;
};

export default function TourkarteClient({ shows }: { shows: Show[] }) {
  const router = useRouter();

  const [filter, setFilter] = useState<
    "kommend" | "markus" | "alle" | "ohne"
  >("kommend");

  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [isGeocoding, setIsGeocoding] = useState(false);

  async function runGeocoding() {
    setIsGeocoding(true);

    await fetch("/api/jobs/geocode-venues", {
      method: "GET",
    });

    router.refresh();
    setIsGeocoding(false);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ------------------------------------------------------------
  // Nur echte Shows berücksichtigen.
  // Optionen brauchen für die Tourplanung keinen Standort.
  // ------------------------------------------------------------

  const planningShows = useMemo(() => {
    return shows.filter((show) => show.internal_status !== "option");
  }, [shows]);

  // ------------------------------------------------------------
  // Shows, deren Standort noch geladen werden muss
  // Optionen werden bewusst ignoriert.
  // ------------------------------------------------------------

const pendingGeocodingCount = planningShows.filter(
  (show) =>
    show.latitude === null ||
    show.longitude === null
).length;

  // ------------------------------------------------------------
  // Filter
  // ------------------------------------------------------------

  const filteredShows = useMemo(() => {
    return planningShows.filter((show) => {
      const hasCoords =
        show.latitude !== null && show.longitude !== null;

      const showDate = show.show_date
        ? new Date(show.show_date)
        : null;

      const isUpcoming = showDate
        ? showDate >= today
        : true;

      const inRange =
        (!fromDate ||
          (showDate && showDate >= new Date(fromDate))) &&
        (!toDate ||
          (showDate && showDate <= new Date(toDate)));

      if (!inRange) return false;

      if (filter === "kommend") {
        return hasCoords && isUpcoming;
      }

      if (filter === "markus") {
        return (
          hasCoords &&
          show.markus_included === true
        );
      }

      if (filter === "ohne") {
        return !hasCoords;
      }

      return hasCoords;
    });
  }, [
    planningShows,
    filter,
    fromDate,
    toDate,
    today,
  ]);

  // ------------------------------------------------------------
  // Tourstopps chronologisch sortieren
  // ------------------------------------------------------------

  const tourStops = useMemo(() => {
    return filteredShows
      .filter(
        (show) =>
          show.latitude !== null &&
          show.longitude !== null
      )
      .sort((a, b) => {
        const da = a.show_date
          ? new Date(a.show_date).getTime()
          : 0;

        const db = b.show_date
          ? new Date(b.show_date).getTime()
          : 0;

        return da - db;
      });
  }, [filteredShows]);

  // ------------------------------------------------------------
  // Entfernungen zwischen den Tourstopps
  // ------------------------------------------------------------

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

  const longLegs = legs.filter(
    (leg) => leg.distance > 180
  );

  return (
    <div className="space-y-5 text-zinc-950 sm:space-y-6">

        {/* HERO */}

       <header className="flex flex-col gap-5 px-1 py-3 md:flex-row md:items-end md:justify-between">
  <div>
    <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
      PRIMAKAVI · BOOKING CRM
    </p>

    <h1 className="mt-2 text-5xl font-black tracking-tight text-zinc-950">
      Tourkarte
    </h1>

    <p className="mt-2 text-sm font-semibold text-zinc-500">
      Shows räumlich denken – Lücken erkennen und smarter buchen.
    </p>
  </div>

  <div className="flex flex-wrap items-center gap-2">
    {/* STANDORTE LADEN */}

    {pendingGeocodingCount > 0 && (
      <button
        type="button"
        onClick={runGeocoding}
        disabled={isGeocoding}
        className="rounded-full bg-lime-300 px-4 py-2.5 text-sm font-black text-zinc-950 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-wait disabled:opacity-60"
      >
        {isGeocoding
          ? "Lade Standorte…"
          : `Standorte laden (${pendingGeocodingCount})`}
      </button>
    )}

    {/* FILTER */}

    <FilterButton
      active={filter === "kommend"}
      onClick={() => setFilter("kommend")}
    >
      Kommend
    </FilterButton>

    <FilterButton
      active={filter === "markus"}
      onClick={() => setFilter("markus")}
    >
      Markus
    </FilterButton>

    <FilterButton
      active={filter === "alle"}
      onClick={() => setFilter("alle")}
    >
      Alle
    </FilterButton>

    <FilterButton
      active={filter === "ohne"}
      onClick={() => setFilter("ohne")}
    >
      Ohne Ort
    </FilterButton>
  </div>
</header>

        {/* DATUMSFILTER */}

        <section className="rounded-[2rem] bg-white p-5 shadow-xl ring-1 ring-black/5">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) =>
                setFromDate(e.target.value)
              }
              className="h-14 rounded-2xl bg-[#fbf7ef] px-5 font-semibold"
            />

            <input
              type="date"
              value={toDate}
              onChange={(e) =>
                setToDate(e.target.value)
              }
              className="h-14 rounded-2xl bg-[#fbf7ef] px-5 font-semibold"
            />
          </div>
        </section>

        {/* KARTE + LISTE */}

        <div className="grid gap-5 xl:grid-cols-[420px_1fr]">

          {/* SIDEBAR */}

          <aside className="rounded-[2rem] bg-white p-5 shadow-xl ring-1 ring-black/5">
            <div className="grid grid-cols-3 gap-3">
              <Stat
                label="Stops"
                value={tourStops.length}
              />

              <Stat
                label="KM"
                value={Math.round(
                  legs.reduce(
                    (sum, leg) =>
                      sum + leg.distance,
                    0
                  )
                )}
              />

              <Stat
                label="Lücken"
                value={longLegs.length}
              />
            </div>

            <div className="mt-6 max-h-[600px] space-y-3 overflow-auto">
              {tourStops.map((show, i) => (
                <div key={show.id}>
                  <Link
                    href={`/admin/shows/${show.id}`}
                    className="block rounded-2xl bg-[#fbf7ef] p-4 transition hover:bg-white"
                  >
                    <p className="text-xs text-zinc-400">
                      {formatDate(show.show_date)}
                    </p>

                    <p className="font-black">
                      {show.venue}
                    </p>

                    <p className="text-xs text-zinc-500">
                      {show.city}
                    </p>
                  </Link>

                  {legs[i] && (
                    <p className="pl-4 text-xs text-orange-500">
                      ↓{" "}
                      {Math.round(
                        legs[i].distance
                      )}{" "}
                      km
                    </p>
                  )}
                </div>
              ))}
            </div>
          </aside>

          {/* MAP */}

          <section className="rounded-[2rem] bg-white p-3 shadow-xl ring-1 ring-black/5">
            <TourMap shows={tourStops} />
          </section>
        </div>
    </div>
  );
}


// ============================================================
// FILTER BUTTON
// ============================================================

function FilterButton({
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
        "rounded-full px-4 py-2.5 text-sm font-black transition",
        active
          ? "bg-zinc-950 text-white shadow-md"
          : "bg-white text-zinc-600 ring-1 ring-black/5 hover:bg-[#f5ead9] hover:text-zinc-950",
      ].join(" ")}
    >
      {children}
    </button>
  );
}


// ============================================================
// STAT
// ============================================================

function Stat({
  label,
  value,
}: any) {
  return (
    <div className="rounded-2xl bg-[#fbf7ef] p-3 text-center">
      <p className="text-2xl font-black">
        {value}
      </p>

      <p className="text-xs text-zinc-400">
        {label}
      </p>
    </div>
  );
}


// ============================================================
// DATUM FORMATIEREN
// ============================================================

function formatDate(
  date: string | null
) {
  if (!date) return "";

  return new Intl.DateTimeFormat(
    "de-DE"
  ).format(new Date(date));
}


// ============================================================
// ENTFERNUNG IN KM
// ============================================================

function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371;

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(
      (lat1 * Math.PI) / 180
    ) *
      Math.cos(
        (lat2 * Math.PI) / 180
      ) *
      Math.sin(dLon / 2) ** 2;

  return (
    2 *
    R *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )
  );
}