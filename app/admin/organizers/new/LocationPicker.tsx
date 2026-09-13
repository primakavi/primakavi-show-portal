"use client";

import {
  useMemo,
  useState,
} from "react";

type Venue = {
  id: string;
  name: string;
  city: string | null;
};

export default function LocationPicker({
  venues,
}: {
  venues: Venue[];
}) {
  const [
    selectedIds,
    setSelectedIds,
  ] =
    useState<string[]>([]);

  const [
    venueOnlyIds,
    setVenueOnlyIds,
  ] =
    useState<Set<string>>(
      new Set()
    );

  const [
    nextVenueId,
    setNextVenueId,
  ] =
    useState("");

  const selectedVenues =
    useMemo(
      () =>
        selectedIds
          .map((id) =>
            venues.find(
              (venue) =>
                venue.id === id
            )
          )
          .filter(Boolean) as Venue[],
      [
        selectedIds,
        venues,
      ]
    );

  const availableVenues =
    useMemo(
      () =>
        venues.filter(
          (venue) =>
            !selectedIds.includes(
              venue.id
            )
        ),
      [
        venues,
        selectedIds,
      ]
    );

  function addVenue() {
    if (!nextVenueId) {
      return;
    }

    setSelectedIds(
      (current) =>
        current.includes(
          nextVenueId
        )
          ? current
          : [
              ...current,
              nextVenueId,
            ]
    );

    setNextVenueId("");
  }

  function removeVenue(
    id: string
  ) {
    setSelectedIds(
      (current) =>
        current.filter(
          (item) =>
            item !== id
        )
    );

    setVenueOnlyIds(
      (current) => {
        const next =
          new Set(current);

        next.delete(id);

        return next;
      }
    );
  }

  function toggleVenueOnly(
    id: string,
    checked: boolean
  ) {
    setVenueOnlyIds(
      (current) => {
        const next =
          new Set(current);

        if (checked) {
          next.add(id);
        } else {
          next.delete(id);
        }

        return next;
      }
    );
  }

  return (
    <div className="min-w-0 space-y-4">

      {selectedIds.map(
        (id) => (
          <input
            key={`venue-${id}`}
            type="hidden"
            name="venue_ids"
            value={id}
          />
        )
      )}

      {Array.from(
        venueOnlyIds
      ).map(
        (id) => (
          <input
            key={`venue-only-${id}`}
            type="hidden"
            name="venue_only_ids"
            value={id}
          />
        )
      )}

      {selectedVenues.length ===
      0 ? (

        <div className="rounded-2xl border border-dashed border-black/10 bg-[#fbf7ef] px-5 py-8 text-center">

          <p className="text-sm font-black text-zinc-700">
            Noch keine Spielstätte verknüpft.
          </p>

          <p className="mt-1 text-sm font-semibold text-zinc-400">
            Wähle unten eine bestehende Location aus.
          </p>

        </div>

      ) : (

        <div className="space-y-3">

          {selectedVenues.map(
            (venue) => {

              const venueOnly =
                venueOnlyIds.has(
                  venue.id
                );

              return (
                <div
                  key={
                    venue.id
                  }
                  className="rounded-2xl bg-[#fbf7ef] p-5 ring-1 ring-black/5"
                >

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <p
                          className="truncate font-black text-zinc-950"
                          title={
                            venue.name
                          }
                        >
                          {venue.name}
                        </p>

                        {venueOnly && (
                          <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-black text-red-600">
                            Nur Spielstätte
                          </span>
                        )}

                      </div>

                      <p className="mt-1 truncate text-xs font-semibold text-zinc-400">
                        {venue.city ||
                          "Ort offen"}
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeVenue(
                          venue.id
                        )
                      }
                      className="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-black text-red-500 ring-1 ring-black/5 transition hover:bg-red-50"
                    >
                      Entfernen
                    </button>

                  </div>

                  <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl bg-white p-4 ring-1 ring-black/5">

                    <input
                      type="checkbox"
                      checked={
                        venueOnly
                      }
                      onChange={(
                        event
                      ) =>
                        toggleVenueOnly(
                          venue.id,
                          event.target
                            .checked
                        )
                      }
                      className="mt-0.5 h-4 w-4"
                    />

                    <span className="min-w-0">

                      <span className="block text-sm font-black text-zinc-800">
                        Nur Spielstätte / nicht direkt akquirieren
                      </span>

                      <span className="mt-1 block text-xs font-semibold text-zinc-400">
                        Nur wenn du das bewusst aktivierst, wird die Location für direkte Akquise auf „🔴 Nicht relevant“ gesetzt.
                      </span>

                    </span>

                  </label>

                </div>
              );
            }
          )}

        </div>

      )}

      <div className="rounded-2xl bg-[#fbf7ef] p-5 ring-1 ring-black/5">

        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
          Spielstätte hinzufügen
        </p>

        <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_auto]">

          <select
            value={
              nextVenueId
            }
            onChange={(
              event
            ) =>
              setNextVenueId(
                event.target.value
              )
            }
            className="h-12 w-full min-w-0 max-w-full truncate rounded-xl bg-white px-4 text-sm font-bold outline-none ring-1 ring-black/5"
          >
            <option value="">
              Location auswählen …
            </option>

            {availableVenues.map(
              (venue) => (
                <option
                  key={
                    venue.id
                  }
                  value={
                    venue.id
                  }
                >
                  {venue.name}
                  {venue.city
                    ? ` · ${venue.city}`
                    : ""}
                </option>
              )
            )}
          </select>

          <button
            type="button"
            onClick={
              addVenue
            }
            disabled={
              !nextVenueId
            }
            className="h-12 rounded-full bg-zinc-950 px-5 text-sm font-black text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-y-0"
          >
            + Spielstätte
          </button>

        </div>

        <p className="mt-3 text-xs font-semibold text-zinc-400">
          Ohne Haken wird nur die Verknüpfung angelegt. Der bestehende Location-Status bleibt unverändert.
        </p>

      </div>

    </div>
  );
}
