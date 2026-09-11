"use client";

import {
  useMemo,
  useState,
} from "react";

type Venue = {
  id: string;
  name: string;
  city: string | null;
  website: string | null;
  relationship_status:
    | string
    | null;
  acquisition_relevant:
    | boolean
    | null;
};

type Mode =
  | "none"
  | "existing"
  | "new";

export default function LocationPicker({
  venues,
}: {
  venues: Venue[];
}) {
  const [
    mode,
    setMode,
  ] = useState<Mode>("none");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    selectedId,
    setSelectedId,
  ] = useState("");

  const [
    venueOnly,
    setVenueOnly,
  ] = useState(false);

  const selectedVenue =
    venues.find(
      (venue) =>
        venue.id === selectedId
    ) || null;

  // ------------------------------------------------------------
  // SUCHERGEBNISSE
  // ------------------------------------------------------------

  const results = useMemo(() => {
    const needle =
      search
        .trim()
        .toLowerCase();

    if (!needle) {
      return [];
    }

    return venues
      .filter((venue) => {
        const haystack = [
          venue.name,
          venue.city,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(
          needle
        );
      })
      .slice(0, 8);
  }, [
    venues,
    search,
  ]);

  // ------------------------------------------------------------
  // NEUER STATUS
  // ------------------------------------------------------------

  const targetStatus =
    venueOnly
      ? "🔴 Nicht relevant"
      : "⚪ Neu";

  // ------------------------------------------------------------
  // AUSWAHL
  // ------------------------------------------------------------

  function selectVenue(
    venue: Venue
  ) {
    setSelectedId(
      venue.id
    );

    setMode(
      "existing"
    );

    setSearch("");
  }

  function clearSelection() {
    setSelectedId("");
    setSearch("");
    setMode("none");
    setVenueOnly(false);
  }

  function startNewVenue() {
    setSelectedId("");
    setSearch("");
    setMode("new");
    setVenueOnly(false);
  }

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------

  return (
    <div className="space-y-4">

      {/* HIDDEN VALUES */}

      <input
        type="hidden"
        name="venue_mode"
        value={mode}
      />

      <input
        type="hidden"
        name="venue_id"
        value={selectedId}
      />

      {/* -------------------------------------------------- */}
      {/* KEINE LOCATION AUSGEWÄHLT */}
      {/* -------------------------------------------------- */}

      {mode === "none" && (
        <div className="space-y-3">

          <div className="relative">

            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
              🔎
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Location suchen …"
              autoComplete="off"
              className="h-12 w-full rounded-xl bg-[#fbf7ef] pl-11 pr-4 text-sm font-semibold outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-black/10"
            />

            {search.trim() && (
              <div className="absolute left-0 right-0 top-[56px] z-40 max-h-[320px] overflow-y-auto rounded-xl bg-white shadow-xl ring-1 ring-black/5">

                {results.length >
                0 ? (
                  results.map(
                    (venue) => (
                      <button
                        key={
                          venue.id
                        }
                        type="button"
                        onClick={() =>
                          selectVenue(
                            venue
                          )
                        }
                        className="flex w-full items-center justify-between gap-4 border-b border-black/5 px-4 py-3 text-left transition last:border-b-0 hover:bg-[#fbf7ef]"
                      >

                        <div className="min-w-0">

                          <p className="truncate text-sm font-black text-zinc-950">
                            {
                              venue.name
                            }
                          </p>

                          <p className="mt-0.5 truncate text-xs font-semibold text-zinc-400">
                            {venue.city ||
                              "Ort offen"}
                          </p>

                        </div>

                        <span className="shrink-0 text-xs font-black text-zinc-300">
                          auswählen →
                        </span>

                      </button>
                    )
                  )
                ) : (
                  <div className="px-4 py-4 text-sm font-semibold text-zinc-400">
                    Keine passende
                    Location gefunden.
                  </div>
                )}

              </div>
            )}

          </div>

          <div className="flex items-center gap-3">

            <div className="h-px flex-1 bg-black/5" />

            <span className="text-xs font-bold text-zinc-300">
              oder
            </span>

            <div className="h-px flex-1 bg-black/5" />

          </div>

          <button
            type="button"
            onClick={
              startNewVenue
            }
            className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-black text-white transition hover:-translate-y-0.5"
          >
            + Neue Location anlegen
          </button>

        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* BESTEHENDE LOCATION */}
      {/* -------------------------------------------------- */}

      {mode ===
        "existing" &&
        selectedVenue && (
        <div className="space-y-4">

          <div className="rounded-2xl bg-[#fbf7ef] p-4 ring-1 ring-black/5">

            <div className="flex items-start justify-between gap-4">

              <div className="min-w-0">

                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-400">
                  Ausgewählte Location
                </p>

                <p className="mt-1 truncate font-black text-zinc-950">
                  {
                    selectedVenue.name
                  }
                </p>

                <p className="mt-1 text-xs font-semibold text-zinc-400">
                  {selectedVenue.city ||
                    "Ort offen"}
                </p>

                {selectedVenue.relationship_status && (
                  <p className="mt-2 text-xs font-bold text-zinc-500">
                    Aktueller Status:{" "}
                    {
                      selectedVenue.relationship_status
                    }
                  </p>
                )}

              </div>

              <button
                type="button"
                onClick={
                  clearSelection
                }
                className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-black text-zinc-500 shadow-sm ring-1 ring-black/5 transition hover:text-zinc-950"
              >
                ändern ×
              </button>

            </div>
          </div>

          <VenueOnlyToggle
            checked={
              venueOnly
            }
            onChange={
              setVenueOnly
            }
          />

          {selectedVenue.relationship_status !==
            targetStatus && (
            <div className="rounded-xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200">

              <p className="text-xs font-black text-amber-900">
                ⚠️ Status wird geändert
              </p>

              <p className="mt-1 text-xs font-semibold leading-5 text-amber-800">
                Der bisherige Status{" "}
                <strong>
                  {selectedVenue.relationship_status ||
                    "ohne Status"}
                </strong>{" "}
                wird beim Speichern
                auf{" "}
                <strong>
                  {targetStatus}
                </strong>{" "}
                gesetzt.
              </p>

            </div>
          )}

        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* NEUE LOCATION */}
      {/* -------------------------------------------------- */}

      {mode === "new" && (
        <div className="space-y-4">

          <div className="rounded-2xl bg-[#fbf7ef] p-5 ring-1 ring-black/5">

            <div className="mb-5 flex items-start justify-between gap-4">

              <div>

                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-400">
                  Neue Location
                </p>

                <p className="mt-1 text-sm font-black text-zinc-950">
                  Spielort direkt
                  mit anlegen
                </p>

              </div>

              <button
                type="button"
                onClick={
                  clearSelection
                }
                className="text-xs font-black text-zinc-400 transition hover:text-zinc-950"
              >
                abbrechen ×
              </button>

            </div>

            <div className="grid gap-4 md:grid-cols-12">

              <label className="block md:col-span-7">

                <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-400">
                  Location *
                </span>

                <input
                  name="new_venue_name"
                  required={
                    mode === "new"
                  }
                  className="h-12 w-full rounded-xl bg-white px-4 text-sm font-semibold outline-none ring-1 ring-black/5 transition focus:ring-black/10"
                />

              </label>

              <label className="block md:col-span-5">

                <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-400">
                  Ort
                </span>

                <input
                  name="new_venue_city"
                  className="h-12 w-full rounded-xl bg-white px-4 text-sm font-semibold outline-none ring-1 ring-black/5 transition focus:ring-black/10"
                />

              </label>

              <label className="block md:col-span-12">

                <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-400">
                  Website
                </span>

                <input
                  name="new_venue_website"
                  className="h-12 w-full rounded-xl bg-white px-4 text-sm font-semibold outline-none ring-1 ring-black/5 transition focus:ring-black/10"
                />

              </label>

            </div>

          </div>

          <VenueOnlyToggle
            checked={
              venueOnly
            }
            onChange={
              setVenueOnly
            }
          />

          <div className="rounded-xl bg-[#fbf7ef] px-4 py-3">

            <p className="text-xs font-semibold leading-5 text-zinc-500">
              Die neue Location wird
              mit dem Status{" "}
              <strong className="text-zinc-800">
                {targetStatus}
              </strong>{" "}
              angelegt.
            </p>

          </div>

        </div>
      )}

    </div>
  );
}


// ============================================================
// NUR SPIELORT TOGGLE
// ============================================================

function VenueOnlyToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (
    value: boolean
  ) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-[#fbf7ef] p-4 ring-1 ring-black/5">

      <input
        type="checkbox"
        name="venue_only"
        checked={checked}
        onChange={(e) =>
          onChange(
            e.target.checked
          )
        }
        className="mt-0.5 h-4 w-4"
      />

      <span>

        <span className="block text-sm font-black text-zinc-800">
          Nur Spielort
        </span>

        <span className="mt-1 block text-xs font-semibold leading-5 text-zinc-400">
          Diese Location ist kein
          eigenes Akquise-Ziel und
          wird in Locations als
          „🔴 Nicht relevant“
          geführt.
        </span>

      </span>

    </label>
  );
}