"use client";

import { useMemo, useRef, useState } from "react";

const PROGRAMS = [
  "Alltagswahnsinn",
  "TYPisch Frau?!",
  "Jetzt mal Tacheles",
  "Süßer die Glocken nie hingen",
  "Volljährig",
  "Mix-Show",
] as const;

function normalize(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("de-DE");
}

function canonicalProgram(value: string) {
  const normalized = normalize(value);

  return (
    PROGRAMS.find(
      (program) => normalize(program) === normalized
    ) || null
  );
}

export default function ProgramEditor({
  defaultValue,
}: {
  defaultValue?: string | null;
}) {
  const initialRaw = String(defaultValue || "").trim();

  const initialCanonical = useMemo(
    () => canonicalProgram(initialRaw),
    [initialRaw]
  );

  const [value, setValue] = useState(
    initialCanonical || initialRaw
  );

  const [open, setOpen] = useState(false);
  const [customMode, setCustomMode] = useState(
    Boolean(initialRaw && !initialCanonical)
  );

  const inputRef = useRef<HTMLInputElement>(null);

  /*
   * Wenn Sonja aktiv tippt, filtern wir die Vorschläge.
   * Beim normalen Öffnen über den Pfeil zeigen wir aber
   * IMMER alle Programme.
   */
  const matches = useMemo(() => {
    const query = normalize(value);

    if (!query) return [...PROGRAMS];

    return PROGRAMS.filter((program) =>
      normalize(program).includes(query)
    );
  }, [value]);

  function choose(program: string) {
    setValue(program);
    setCustomMode(false);
    setOpen(false);
    inputRef.current?.blur();
  }

  function chooseOther() {
    /*
     * Dasselbe Feld wird zum Freitextfeld.
     * Kein zweites Eingabefeld.
     */
    setValue("");
    setCustomMode(true);
    setOpen(false);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }

  function openFullList() {
    /*
     * Über den Pfeil immer vollständige Auswahl anzeigen.
     */
    setOpen(true);
  }

  const visiblePrograms =
    open && !customMode
      ? PROGRAMS
      : matches;

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        name="program"
        value={value}
        onFocus={() => {
          /*
           * Bei einem individuellen Wert nicht sofort
           * die Standardliste darüberlegen.
           */
          if (!customMode) {
            setOpen(true);
          }
        }}
        onChange={(event) => {
          const nextValue = event.target.value;

          setValue(nextValue);
          setCustomMode(false);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
            inputRef.current?.blur();
          }
        }}
        placeholder={
          customMode
            ? "Eigene Bezeichnung eingeben …"
            : "Programm / Format auswählen …"
        }
        autoComplete="off"
        className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 pr-10 text-sm font-bold text-zinc-900"
      />

      <button
        type="button"
        onMouseDown={(event) => {
          /*
           * Verhindert, dass der Input vorher
           * seinen Fokus verliert.
           */
          event.preventDefault();
        }}
        onClick={() => {
          if (open) {
            setOpen(false);
          } else {
            setCustomMode(false);
            openFullList();
          }
        }}
        aria-label="Programme anzeigen"
        title="Programme anzeigen"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-1 text-xs font-black text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
      >
        ▾
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Programmauswahl schließen"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white p-1 shadow-xl">
            {visiblePrograms.map((program) => {
              const selected =
                canonicalProgram(value) === program;

              return (
                <button
                  key={program}
                  type="button"
                  onMouseDown={(event) =>
                    event.preventDefault()
                  }
                  onClick={() => choose(program)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm font-bold text-zinc-900 transition hover:bg-[#fbf7ef]"
                >
                  <span>{program}</span>

                  {selected && (
                    <span className="text-[#7d8f00]">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}

            <div className="my-1 border-t border-zinc-100" />

            <button
              type="button"
              onMouseDown={(event) =>
                event.preventDefault()
              }
              onClick={chooseOther}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm font-black text-[#2867d8] transition hover:bg-[#fbf7ef]"
            >
              Sonstiges …
            </button>
          </div>
        </>
      )}
    </div>
  );
}