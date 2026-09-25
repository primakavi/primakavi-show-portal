"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Venue = {
  id: string;
  name?: string | null;
  city?: string | null;
  postal_code?: string | null;
};

export default function LocationCombobox({
  venues,
  defaultValue,
  hideLabel = false,
  hideHint = false,
}: {
  venues: Venue[];
  defaultValue?: string | null;
  hideLabel?: boolean;
  hideHint?: boolean;
}) {
  const initialVenue =
    venues.find((venue) => venue.id === defaultValue) || null;

  const [value, setValue] = useState(defaultValue || "");
  const [query, setQuery] = useState(
    initialVenue ? label(initialVenue) : ""
  );
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLLabelElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedVenue = useMemo(
    () => venues.find((venue) => venue.id === value) || null,
    [venues, value]
  );

  const selectedLabel = selectedVenue
    ? label(selectedVenue)
    : "";

  const isSearching =
    query.trim().length > 0 &&
    (!selectedVenue || query !== selectedLabel);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return [];

    if (selectedVenue && query === selectedLabel) {
      return [];
    }

    return venues
      .filter((venue) => {
        const haystack = [
          venue.name,
          venue.city,
          venue.postal_code,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(q);
      })
      .slice(0, 12);
  }, [query, venues, selectedVenue, selectedLabel]);

  /*
   * Klick außerhalb schließt das Dropdown.
   */
  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);

        if (selectedVenue) {
          setQuery(selectedLabel);
        }
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown
      );
    };
  }, [selectedVenue, selectedLabel]);

  /*
   * Escape schließt das Dropdown.
   */
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      setOpen(false);

      if (selectedVenue) {
        setQuery(selectedLabel);
      }

      inputRef.current?.blur();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedVenue, selectedLabel]);

  function choose(venue: Venue) {
    setValue(venue.id);
    setQuery(label(venue));
    setOpen(false);
    inputRef.current?.blur();
  }

  function clearSelection() {
    setValue("");
    setQuery("");
    setOpen(false);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }

  function handleChange(nextQuery: string) {
    setQuery(nextQuery);

    /*
     * Sobald der Text verändert wird, ist die bisherige
     * venue_id nicht mehr automatisch gültig.
     */
    setValue("");

    setOpen(nextQuery.trim().length > 0);
  }

  return (
    <label
      ref={containerRef}
      className="relative block"
    >
      {!hideLabel && (
        <span className="mb-1.5 block text-xs font-black text-zinc-500">
          Spielstätte
        </span>
      )}

      <input
        type="hidden"
        name="venue_id"
        value={value}
      />

      <div className="relative">
        <input
          ref={inputRef}
          value={query}
          onFocus={() => {
            /*
             * Eine bestehende Auswahl soll beim bloßen
             * Anklicken NICHT die Ergebnisliste öffnen.
             */
            if (isSearching) {
              setOpen(true);
            }
          }}
          onChange={(event) =>
            handleChange(event.target.value)
          }
          placeholder="Name, Ort oder PLZ suchen …"
          autoComplete="off"
          className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 pr-10 text-sm font-bold text-zinc-900"
        />

        {query && (
          <button
            type="button"
            aria-label="Spielstätte ändern"
            title="Spielstätte ändern"
            onClick={clearSelection}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
          >
            ×
          </button>
        )}
      </div>

      {open && query.trim() && (
        <div className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-zinc-200 bg-white p-1 shadow-xl">
          {matches.length ? (
            matches.map((venue) => (
              <button
                key={venue.id}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
                onClick={() => choose(venue)}
                className="block w-full rounded-lg px-3 py-2 text-left transition hover:bg-[#fbf7ef]"
              >
                <div className="text-sm font-black text-zinc-900">
                  {venue.name || "Ohne Namen"}
                </div>

                <div className="text-xs font-semibold text-zinc-500">
                  {[venue.postal_code, venue.city]
                    .filter(Boolean)
                    .join(" ") || "Ort offen"}
                </div>
              </button>
            ))
          ) : (
            <div className="px-3 py-4">
              <div className="text-sm font-bold text-zinc-600">
                Keine Location gefunden.
              </div>

              <div className="mt-1 text-xs font-semibold text-zinc-400">
                Suche nach Name, Ort oder PLZ.
              </div>
            </div>
          )}
        </div>
      )}

      {!hideHint && (
        <div className="mt-1 text-[11px] font-semibold text-zinc-400">
          {selectedVenue
            ? "Spielstätte ausgewählt. Zum Ändern auf × klicken und eine andere Location suchen."
            : "Name, Ort oder PLZ eingeben, um eine Spielstätte auszuwählen."}
        </div>
      )}
    </label>
  );
}

function label(venue: Venue) {
  return `${venue.name || "Ohne Namen"}${
    venue.city ? ` · ${venue.city}` : ""
  }`;
}