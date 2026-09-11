"use client";

import Link from "next/link";
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

type LinkedVenue =
  Venue & {
    is_primary:
      boolean;
    link_notes:
      string | null;
  };

type ServerAction = (
  formData: FormData
) => Promise<void>;

export default function OrganizerVenueManager({
  venues,
  linkedVenues,
  linkExistingVenue,
  createAndLinkVenue,
  updateLinkedVenue,
  unlinkVenue,
}: {
  venues: Venue[];
  linkedVenues: LinkedVenue[];
  linkExistingVenue: ServerAction;
  createAndLinkVenue: ServerAction;
  updateLinkedVenue: ServerAction;
  unlinkVenue: ServerAction;
}) {
  const [
    search,
    setSearch,
  ] = useState("");

  const [
    addMode,
    setAddMode,
  ] = useState<
    "none" |
    "search" |
    "new"
  >("none");

  const linkedIds =
    useMemo(
      () =>
        new Set(
          linkedVenues.map(
            (venue) =>
              venue.id
          )
        ),
      [
        linkedVenues,
      ]
    );

  const searchResults =
    useMemo(() => {
      const needle =
        search
          .trim()
          .toLowerCase();

      if (!needle) {
        return [];
      }

      return venues
        .filter(
          (venue) =>
            !linkedIds.has(
              venue.id
            )
        )
        .filter(
          (venue) => {
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
          }
        )
        .slice(
          0,
          8
        );
    }, [
      venues,
      linkedIds,
      search,
    ]);

  return (
    <div className="space-y-5">

      {/* ==================================================== */}
      {/* VERKNÜPFTE SPIELORTE */}
      {/* ==================================================== */}

      {linkedVenues.length >
      0 ? (

        <div className="space-y-3">

          {linkedVenues.map(
            (venue) => (
              <VenueRow
                key={
                  venue.id
                }
                venue={
                  venue
                }
                updateLinkedVenue={
                  updateLinkedVenue
                }
                unlinkVenue={
                  unlinkVenue
                }
              />
            )
          )}

        </div>

      ) : (

        <div className="rounded-2xl border border-dashed border-black/10 bg-[#fbf7ef] px-5 py-8 text-center">

          <p className="text-sm font-black text-zinc-700">
            Noch kein Spielort verknüpft.
          </p>

          <p className="mt-1 text-sm font-semibold text-zinc-400">
            Du kannst eine bestehende Location suchen oder direkt eine neue anlegen.
          </p>

        </div>

      )}

      {/* ==================================================== */}
      {/* BUTTONS */}
      {/* ==================================================== */}

      {addMode ===
        "none" && (
        <div className="flex flex-wrap gap-2">

          <button
            type="button"
            onClick={() => {
              setAddMode(
                "search"
              );
              setSearch("");
            }}
            className="rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-black text-white transition hover:-translate-y-0.5"
          >
            + Spielort hinzufügen
          </button>

          <button
            type="button"
            onClick={() => {
              setAddMode(
                "new"
              );
              setSearch("");
            }}
            className="rounded-full bg-[#fbf7ef] px-5 py-2.5 text-sm font-black text-zinc-700 ring-1 ring-black/5 transition hover:bg-white"
          >
            + Neue Location anlegen
          </button>

        </div>
      )}

      {/* ==================================================== */}
      {/* LOCATION SUCHEN */}
      {/* ==================================================== */}

      {addMode ===
        "search" && (
        <div className="rounded-2xl bg-[#fbf7ef] p-5 ring-1 ring-black/5">

          <div className="mb-4 flex items-start justify-between gap-3">

            <div>

              <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
                Spielort hinzufügen
              </p>

              <p className="mt-1 text-sm font-black text-zinc-800">
                Bestehende Location suchen
              </p>

            </div>

            <button
              type="button"
              onClick={() => {
                setAddMode(
                  "none"
                );
                setSearch("");
              }}
              className="text-xs font-black text-zinc-400 transition hover:text-zinc-950"
            >
              abbrechen ×
            </button>

          </div>

          <div className="relative">

            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
              🔎
            </span>

            <input
              type="text"
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Location suchen …"
              autoComplete="off"
              className="h-12 w-full rounded-xl bg-white pl-11 pr-4 text-sm font-semibold outline-none ring-1 ring-black/5 transition focus:ring-black/10"
            />

          </div>

          {search.trim() && (
            <div className="mt-3 overflow-hidden rounded-xl bg-white ring-1 ring-black/5">

              {searchResults.length >
              0 ? (

                searchResults.map(
                  (venue) => (
                    <SearchResult
                      key={
                        venue.id
                      }
                      venue={
                        venue
                      }
                      linkExistingVenue={
                        linkExistingVenue
                      }
                    />
                  )
                )

              ) : (

                <div className="px-4 py-5 text-sm font-semibold text-zinc-400">
                  Keine passende Location gefunden.
                </div>

              )}

            </div>
          )}

        </div>
      )}

      {/* ==================================================== */}
      {/* NEUE LOCATION */}
      {/* ==================================================== */}

      {addMode ===
        "new" && (
        <form
          action={
            createAndLinkVenue
          }
          className="rounded-2xl bg-[#fbf7ef] p-5 ring-1 ring-black/5"
        >

          <div className="mb-4 flex items-start justify-between gap-3">

            <div>

              <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
                Neue Location
              </p>

              <p className="mt-1 text-sm font-black text-zinc-800">
                Spielort direkt anlegen
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setAddMode(
                  "none"
                )
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
                required
                className="h-12 w-full rounded-xl bg-white px-4 text-sm font-semibold outline-none ring-1 ring-black/5"
              />

            </label>

            <label className="block md:col-span-5">

              <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-400">
                Ort
              </span>

              <input
                name="new_venue_city"
                className="h-12 w-full rounded-xl bg-white px-4 text-sm font-semibold outline-none ring-1 ring-black/5"
              />

            </label>

            <label className="block md:col-span-12">

              <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-400">
                Website
              </span>

              <input
                name="new_venue_website"
                className="h-12 w-full rounded-xl bg-white px-4 text-sm font-semibold outline-none ring-1 ring-black/5"
              />

            </label>

          </div>

          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl bg-white p-4 ring-1 ring-black/5">

            <input
              type="checkbox"
              name="venue_only"
              defaultChecked
              className="mt-0.5 h-4 w-4"
            />

            <span>

              <span className="block text-sm font-black text-zinc-800">
                Nur Spielort
              </span>

              <span className="mt-1 block text-xs font-semibold text-zinc-400">
                Die Location wird als „🔴 Nicht relevant“ für direkte Akquise geführt.
              </span>

            </span>

          </label>

          <div className="mt-4 flex justify-end">

            <button
              type="submit"
              className="rounded-full bg-lime-300 px-5 py-2.5 text-sm font-black text-zinc-950 transition hover:-translate-y-0.5"
            >
              Location anlegen & verknüpfen
            </button>

          </div>

        </form>
      )}

    </div>
  );
}


// ============================================================
// VERKNÜPFTE LOCATION
// ============================================================

function VenueRow({
  venue,
  updateLinkedVenue,
  unlinkVenue,
}: {
  venue: LinkedVenue;
  updateLinkedVenue: ServerAction;
  unlinkVenue: ServerAction;
}) {
  const [
    venueOnly,
    setVenueOnly,
  ] = useState(
    venue.acquisition_relevant ===
      false
  );

  const targetStatus =
    venueOnly
      ? "🔴 Nicht relevant"
      : "⚪ Neu";

  return (
    <div className="rounded-2xl bg-[#fbf7ef] p-5 ring-1 ring-black/5">

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

        <div className="min-w-0">

          <p className="font-black text-zinc-950">
            {venue.name}
          </p>

          <p className="mt-1 text-xs font-semibold text-zinc-400">
            {venue.city ||
              "Ort offen"}
          </p>

          <div className="mt-2 flex flex-wrap gap-2">

            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-zinc-600 ring-1 ring-black/5">
              {venue.relationship_status ||
                "ohne Status"}
            </span>

            {venue.acquisition_relevant ===
              false && (
              <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-black text-red-600">
                Nur Spielort
              </span>
            )}

          </div>

        </div>

        <div className="flex flex-wrap gap-2">

          <Link
            href={`/admin/locations/${venue.id}`}
            className="rounded-full bg-white px-4 py-2 text-xs font-black text-zinc-700 ring-1 ring-black/5 transition hover:bg-zinc-50"
          >
            Location öffnen →
          </Link>

        </div>

      </div>

      <form
        action={
          updateLinkedVenue
        }
        className="mt-4"
      >

        <input
          type="hidden"
          name="venue_id"
          value={
            venue.id
          }
        />

        <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-white p-4 ring-1 ring-black/5">

          <input
            type="checkbox"
            name="venue_only"
            checked={
              venueOnly
            }
            onChange={(
              event
            ) =>
              setVenueOnly(
                event.target.checked
              )
            }
            className="mt-0.5 h-4 w-4"
          />

          <span>

            <span className="block text-sm font-black text-zinc-800">
              Nur Spielort
            </span>

            <span className="mt-1 block text-xs font-semibold text-zinc-400">
              {venueOnly
                ? "Die Location wird als „🔴 Nicht relevant“ geführt."
                : "Die Location wird wieder als eigenes Akquise-Ziel geführt."}
            </span>

          </span>

        </label>

        {venue.relationship_status !==
          targetStatus && (
          <div className="mt-3 rounded-xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200">

            <p className="text-xs font-black text-amber-900">
              ⚠️ Status wird geändert
            </p>

            <p className="mt-1 text-xs font-semibold text-amber-800">
              {venue.relationship_status ||
                "Ohne Status"}{" "}
              →{" "}
              <strong>
                {targetStatus}
              </strong>
            </p>

          </div>
        )}

        <div className="mt-3 flex flex-wrap justify-end gap-2">

          <button
            type="submit"
            className="rounded-full bg-zinc-950 px-4 py-2 text-xs font-black text-white transition hover:-translate-y-0.5"
          >
            Änderung speichern
          </button>

        </div>

      </form>

      <form
        action={
          unlinkVenue
        }
        className="mt-2 flex justify-end"
        onSubmit={(
          event
        ) => {
          if (
            !window.confirm(
              `Verknüpfung zu „${venue.name}“ wirklich lösen? Die Location selbst bleibt bestehen.`
            )
          ) {
            event.preventDefault();
          }
        }}
      >

        <input
          type="hidden"
          name="venue_id"
          value={
            venue.id
          }
        />

        <button
          type="submit"
          className="px-2 py-1 text-xs font-black text-red-500 transition hover:text-red-700"
        >
          Verknüpfung lösen
        </button>

      </form>

    </div>
  );
}


// ============================================================
// SUCHERGEBNIS
// ============================================================

function SearchResult({
  venue,
  linkExistingVenue,
}: {
  venue: Venue;
  linkExistingVenue: ServerAction;
}) {
  const [
    venueOnly,
    setVenueOnly,
  ] = useState(
    venue.acquisition_relevant ===
      false
  );

  const targetStatus =
    venueOnly
      ? "🔴 Nicht relevant"
      : "⚪ Neu";

  return (
    <form
      action={
        linkExistingVenue
      }
      className="border-b border-black/5 p-4 last:border-b-0"
    >

      <input
        type="hidden"
        name="venue_id"
        value={
          venue.id
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

        <div>

          <p className="text-sm font-black text-zinc-950">
            {venue.name}
          </p>

          <p className="mt-0.5 text-xs font-semibold text-zinc-400">
            {venue.city ||
              "Ort offen"}
          </p>

          <p className="mt-1 text-xs font-semibold text-zinc-500">
            Status:{" "}
            {venue.relationship_status ||
              "—"}
          </p>

        </div>

        <button
          type="submit"
          className="shrink-0 rounded-full bg-lime-300 px-4 py-2 text-xs font-black text-zinc-950"
        >
          verknüpfen
        </button>

      </div>

      <label className="mt-3 flex items-center gap-2 text-xs font-bold text-zinc-600">

        <input
          type="checkbox"
          name="venue_only"
          checked={
            venueOnly
          }
          onChange={(
            event
          ) =>
            setVenueOnly(
              event.target.checked
            )
          }
          className="h-4 w-4"
        />

        Nur Spielort / nicht direkt akquirieren

      </label>

      {venue.relationship_status !==
        targetStatus && (
        <p className="mt-2 text-xs font-semibold text-amber-700">
          ⚠️ Status wird beim Verknüpfen auf{" "}
          <strong>
            {targetStatus}
          </strong>{" "}
          geändert.
        </p>
      )}

    </form>
  );
}