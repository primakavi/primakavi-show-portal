"use client";

import { useMemo, useState } from "react";
import { formatDate } from "@/app/lib/show-workflow";

type FilterKey = "alle" | "kommend" | "vergangen" | "fertig";

export default function MarkusClient({ shows }: { shows: any[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("kommend");
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

  const today = new Date().toISOString().slice(0, 10);

  const filteredShows = useMemo(() => {
    return shows.filter((show) => {
      const searchText = [
        show.venue,
        show.city,
        show.venue_address,
        show.program,
        show.schedule_notes,
        show.tech_notes,
        show.piano_type,
        show.epiano_available,
        show.piano_notes,
        show.tech_contact,
        show.travel_notes,
        show.parking_details,
        show.accommodation_type,
        show.accommodation_hotel_name,
        show.accommodation_address,
        show.accommodation_buyout,
        show.accommodation_notes,
        show.markus_notes,
        show.catering_details,
        show.backstage_notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchText.includes(query.toLowerCase());

      const isPast = show.show_date && show.show_date < today;
      const isFuture = !show.show_date || show.show_date >= today;

      const isDone =
        show.internal_status === "fertig" ||
        show.internal_status === "abgeschlossen";

      const matchesFilter =
        filter === "alle" ||
        (filter === "kommend" && isFuture) ||
        (filter === "vergangen" && isPast) ||
        (filter === "fertig" && isDone);

      return matchesSearch && matchesFilter;
    });
  }, [shows, query, filter, today]);

  function toggle(id: string) {
    setOpenIds((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }

  function openAll() {
    const next: Record<string, boolean> = {};

    filteredShows.forEach((show) => {
      next[String(show.id)] = true;
    });

    setOpenIds(next);
  }

  function closeAll() {
    setOpenIds({});
  }

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-[1120px] space-y-6">
        <header className="relative overflow-hidden rounded-[2.4rem] bg-[#111] p-8 text-white shadow-xl shadow-black/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(255,105,180,0.42),transparent_27%),radial-gradient(circle_at_30%_20%,rgba(255,145,60,0.32),transparent_35%),radial-gradient(circle_at_65%_90%,rgba(190,255,90,0.18),transparent_28%)]" />

          <div className="absolute -right-8 -top-8 h-44 w-44 rounded-full bg-pink-400/20 blur-2xl" />
          <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-lime-300/10 blur-2xl" />

          <div className="absolute right-8 top-7 rounded-[2rem] bg-white/10 px-6 py-5 text-center ring-1 ring-white/10 backdrop-blur">
            <p className="text-xs font-black uppercase tracking-wide text-white/45">
              Shows
            </p>
            <p className="mt-1 text-4xl font-black">{filteredShows.length}</p>
          </div>

          <div className="absolute bottom-8 right-48 text-6xl opacity-80">
            🎹
          </div>
          <div className="absolute right-100 top-32 text-4xl opacity-80">
            🎵
          </div>
          <div className="absolute bottom-40 right-75 text-3xl opacity-80">
            ✨
          </div>

          <div className="relative max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-white/45">
              Primakavi · Markus
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
              Markus-Ansicht
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/65">
              Piano-fokussierte Übersicht aller relevanten Shows – reduziert und
              schnell lesbar.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              <HeroBadge>🎹 Piano-Fokus</HeroBadge>
              <HeroBadge>Read only</HeroBadge>
              <HeroBadge>Kommende Shows</HeroBadge>
            </div>
          </div>
        </header>

        <section className="rounded-[2rem] bg-white/90 p-5 shadow-sm ring-1 ring-black/5">
          <div className="flex flex-col gap-4">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Suche nach Location, Stadt, Adresse, Programm, Technik..."
              className="min-h-14 w-full rounded-2xl border border-black/10 bg-[#fbf7ef] px-5 text-sm font-semibold outline-none placeholder:text-zinc-400 focus:border-black/25"
            />

            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap gap-2">
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
                  Fertig
                </FilterButton>
              </div>

              <div className="flex flex-wrap gap-2">
                <MiniButton onClick={openAll}>Alle öffnen</MiniButton>
                <MiniButton onClick={closeAll}>Alle schließen</MiniButton>
              </div>
            </div>
          </div>
        </section>

        {filteredShows.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-10 text-center text-zinc-500 shadow-sm ring-1 ring-black/5">
            Keine passenden Shows für Markus gefunden.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredShows.map((show) => (
              <MarkusAccordion
                key={show.id}
                show={show}
                isOpen={!!openIds[String(show.id)]}
                onToggle={() => toggle(String(show.id))}
                today={today}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MarkusAccordion({
  show,
  isOpen,
  onToggle,
  today,
}: {
  show: any;
  isOpen: boolean;
  onToggle: () => void;
  today: string;
}) {
  const isPast = show.show_date && show.show_date < today;

  return (
    <article className="rounded-[2rem] bg-white p-4 shadow-xl shadow-zinc-200/60 ring-1 ring-black/5">
      <button
        type="button"
        onClick={onToggle}
        className="w-full rounded-[1.6rem] bg-[#fbf7ef] p-5 text-left transition hover:bg-[#f7efe2]"
      >
        <div className="grid gap-4 lg:grid-cols-[145px_1fr_220px_40px] lg:items-center">
          <div>
            <p className="text-xl font-black">{formatDate(show.show_date)}</p>

            <p className="mt-1 text-xs font-black text-pink-500">
              {daysUntilText(show.show_date)}
            </p>

            <p className="mt-1 text-sm font-bold text-zinc-500">
              {show.weekday || "—"}
            </p>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-black text-zinc-950">
                {show.venue || "Location offen"}
              </h2>

              <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-black text-lime-800">
                🎹 Markus
              </span>

              {isPast && (
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-black text-zinc-500">
                  vergangen
                </span>
              )}
            </div>

            <p className="mt-1 text-sm font-bold text-zinc-500">
              {show.city || "Ort offen"} · {show.program || "Programm offen"}
            </p>

            {show.venue_address && (
              <p className="mt-2 text-sm text-zinc-500">{show.venue_address}</p>
            )}
          </div>

          <div className="rounded-2xl bg-white px-4 py-3 text-sm shadow-sm ring-1 ring-black/5">
            <p className="font-black text-zinc-950">
              Beginn: {show.start_time || "—"}
            </p>
            <p className="mt-1 text-zinc-500">
              Einlass: {show.entry_time || "—"}
            </p>
          </div>

          <div className="text-right text-3xl font-black text-zinc-400">
            {isOpen ? "−" : "+"}
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="mt-4 rounded-[1.6rem] bg-[#fbf7ef] p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <Info title="Adresse" value={addressText(show)} />
            <Info title="Ablauf" value={scheduleText(show)} />
            <Info title="Piano / Technik" value={technikText(show)} highlight />

            {show.markus_notes && (
              <Info
                title="Notizen für Markus"
                value={show.markus_notes}
                highlight
              />
            )}

            <Info title="Anreise" value={travelText(show)} />
            <Info title="Unterkunft" value={accommodationText(show)} />
            <Info title="Catering / Backstage" value={cateringText(show)} />
          </div>
        </div>
      )}
    </article>
  );
}

function HeroBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-black text-white ring-1 ring-white/10">
      {children}
    </span>
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
      className={[
        "rounded-full px-4 py-3 text-sm font-black transition",
        active
          ? "bg-black text-white shadow-lg shadow-black/10"
          : "bg-[#fbf7ef] text-zinc-700 hover:bg-zinc-100",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function MiniButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full bg-zinc-100 px-4 py-3 text-sm font-black text-zinc-700 transition hover:bg-zinc-200"
    >
      {children}
    </button>
  );
}

function Info({
  title,
  value,
  highlight = false,
}: {
  title: string;
  value?: string | null;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-3xl p-4 ring-1 ring-black/5",
        highlight ? "bg-lime-50" : "bg-white",
      ].join(" ")}
    >
      <p className="text-xs font-black uppercase tracking-wide text-zinc-400">
        {title}
      </p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
        {value || "—"}
      </p>
    </div>
  );
}

function addressText(show: any) {
  return [show.venue, show.venue_address, show.city].filter(Boolean).join("\n") || null;
}

function technikText(show: any) {
  const values = [
    show.tech_sound_available ? "Ton vorhanden" : null,
    show.tech_lights_available ? "Licht vorhanden" : null,
    show.piano_type ? `Klavier / Flügel: ${show.piano_type}` : null,
    show.epiano_available ? "E-Piano vorhanden" : null,
    show.piano_notes ? `Modell: ${show.piano_notes}` : null,
    show.tech_contact ? `Technik-Kontakt: ${show.tech_contact}` : null,
    show.tech_notes,
  ];

  return values.filter(Boolean).join("\n") || null;
}

function travelText(show: any) {
  const values = [
    show.parking_available === true ? "Parkplatz vorhanden" : null,
    show.loading_zone_available === true ? "Ladezone vorhanden" : null,
    show.no_parking_available === true ? "Keine Parkmöglichkeit" : null,
    show.public_transport_recommended === true ? "ÖPNV empfohlen" : null,
    show.parking_details,
    show.travel_notes,
  ];

  return values.filter(Boolean).join("\n") || null;
}

function cateringText(show: any) {
  const values = [
    show.catering_status,
    show.catering_details,
    show.backstage_room_available ? "Backstage-Raum vorhanden" : null,
    show.backstage_mirror_available ? "Spiegel vorhanden" : null,
    show.backstage_seating_available ? "Sitzgelegenheit vorhanden" : null,
    show.backstage_table_available ? "Tisch vorhanden" : null,
    show.backstage_no_room ? "Kein Backstage-Raum vorhanden" : null,
    show.backstage_notes,
  ];

  return values.filter(Boolean).join("\n") || null;
}

function accommodationText(show: any) {
  const values = [
    show.accommodation_type,
    show.accommodation_hotel_name,
    show.accommodation_address,
    show.accommodation_buyout ? `Buyout: ${show.accommodation_buyout}` : null,
    show.accommodation_notes,
  ];

  return values.filter(Boolean).join("\n") || null;
}

function scheduleText(show: any) {
  const values = [
    show.arrival_time ? `Ankunft: ${show.arrival_time}` : null,
    show.soundcheck_time ? `Soundcheck: ${show.soundcheck_time}` : null,
    show.entry_time ? `Einlass: ${show.entry_time}` : null,
    show.start_time ? `Beginn: ${show.start_time}` : null,
    show.schedule_notes ? `Notizen: ${show.schedule_notes}` : null,
  ];

  return values.filter(Boolean).join("\n") || null;
}

function daysUntilText(date: string | null) {
  if (!date) return "ohne Datum";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const showDate = new Date(date);
  showDate.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (showDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "heute";
  if (diffDays === 1) return "morgen";
  if (diffDays > 1) return `in ${diffDays} Tagen`;
  if (diffDays === -1) return "gestern";

  return `vor ${Math.abs(diffDays)} Tagen`;
}