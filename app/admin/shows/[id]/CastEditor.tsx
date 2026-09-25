"use client";

import { useMemo, useState } from "react";

type CastRow = {
  id?: string | null;
  name?: string | null;
  role?: string | null;
  actual_cost?: string | number | null;
  sort_order?: number | null;
};

const SONJA: CastRow = {
  name: "Sonja Gründemann",
  role: "Künstlerin",
  actual_cost: null,
};

function isSonja(row: CastRow) {
  return /sonja gründemann|sonja gruendemann/i.test(
    String(row.name || "")
  );
}

function emptyRow(): CastRow {
  return {
    name: "",
    role: "",
    actual_cost: null,
  };
}

export default function CastEditor({
  initialCast,
}: {
  initialCast: CastRow[];
}) {
  /*
   * Sonja gehört immer zur Besetzung.
   * Falls sie in alten Daten fehlt, wird sie automatisch ergänzt.
   */
  const initialRows = useMemo(() => {
    const existing = initialCast || [];

    const sonjaFromDb = existing.find(isSonja);

    const others = existing
      .filter((row) => !isSonja(row))
      .map((row) => ({
        ...row,
        actual_cost:
          row.actual_cost === null ||
          row.actual_cost === undefined
            ? ""
            : row.actual_cost,
      }));

    return [
      {
        ...(sonjaFromDb || SONJA),
        name: "Sonja Gründemann",
        role: sonjaFromDb?.role || "Künstlerin",
        actual_cost: null,
      },
      ...others,
    ];
  }, [initialCast]);

  const [rows, setRows] =
    useState<CastRow[]>(initialRows);

  const serialized = useMemo(
    () =>
      JSON.stringify(
        rows
          .map((row) => {
            const sonja = isSonja(row);

            return {
              name: sonja
                ? "Sonja Gründemann"
                : String(row.name || "").trim(),

              role: sonja
                ? String(row.role || "Künstlerin").trim()
                : String(row.role || "").trim(),

              /*
               * Sonja bekommt hier bewusst keine Kosten.
               * Ihr Show-Honorar läuft über die Einnahmen.
               */
              actual_cost: sonja
                ? null
                : row.actual_cost === "" ||
                    row.actual_cost === null ||
                    row.actual_cost === undefined
                  ? null
                  : String(row.actual_cost).replace(
                      ",",
                      "."
                    ),
            };
          })
          .filter((row) => row.name)
      ),
    [rows]
  );

  function update(
    index: number,
    key: "name" | "role" | "actual_cost",
    value: string
  ) {
    setRows((current) =>
      current.map((row, rowIndex) => {
        if (rowIndex !== index) return row;

        /*
         * Sonjas Name und Kosten sind nicht veränderbar.
         * Die Funktion/Rolle darf bei Bedarf angepasst werden.
         */
        if (isSonja(row)) {
          if (key === "name" || key === "actual_cost") {
            return row;
          }
        }

        return {
          ...row,
          [key]: value,
        };
      })
    );
  }

  function addRow() {
    setRows((current) => [
      ...current,
      emptyRow(),
    ]);
  }

  function removeRow(index: number) {
    setRows((current) => {
      const row = current[index];

      /*
       * Sonja darf nicht gelöscht werden.
       */
      if (isSonja(row)) {
        return current;
      }

      return current.filter(
        (_, rowIndex) => rowIndex !== index
      );
    });
  }

  return (
    <div className="space-y-3">
      <input
        type="hidden"
        name="show_cast_json"
        value={serialized}
      />

      <div className="hidden grid-cols-[1.2fr_1fr_150px_42px] gap-2 px-1 text-[10px] font-black uppercase tracking-[.1em] text-zinc-400 md:grid">
        <div>Name</div>
        <div>Rolle / Funktion</div>
        <div>Kosten</div>
        <div />
      </div>

      <div className="space-y-2">
        {rows.map((row, index) => {
          const sonja = isSonja(row);

          return (
            <div
              key={
                row.id ||
                `cast-${index}-${row.name || "neu"}`
              }
              className={`grid gap-2 rounded-2xl p-3 ring-1 ring-black/5 md:grid-cols-[1.2fr_1fr_150px_42px] md:items-center md:p-0 md:ring-0 ${
                sonja
                  ? "bg-[#f4f1e9] md:bg-transparent"
                  : "bg-[#fbf7ef] md:bg-transparent"
              }`}
            >
              {/* NAME */}
              <div>
                <div className="mb-1 text-[10px] font-black uppercase tracking-[.1em] text-zinc-400 md:hidden">
                  Name
                </div>

                <input
                  value={
                    sonja
                      ? "Sonja Gründemann"
                      : row.name || ""
                  }
                  onChange={(event) =>
                    update(
                      index,
                      "name",
                      event.target.value
                    )
                  }
                  readOnly={sonja}
                  placeholder="Name"
                  className={`h-11 w-full rounded-xl border px-3 text-sm font-bold ${
                    sonja
                      ? "border-zinc-200 bg-[#f4f1e9] text-zinc-700"
                      : "border-zinc-300 bg-white text-zinc-900"
                  }`}
                />
              </div>

              {/* ROLLE */}
              <div>
                <div className="mb-1 text-[10px] font-black uppercase tracking-[.1em] text-zinc-400 md:hidden">
                  Rolle / Funktion
                </div>

                <input
                  value={row.role || ""}
                  onChange={(event) =>
                    update(
                      index,
                      "role",
                      event.target.value
                    )
                  }
                  placeholder={
                    sonja
                      ? "Künstlerin"
                      : "Rolle / Funktion"
                  }
                  className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-900"
                />
              </div>

              {/* KOSTEN */}
              {sonja ? (
                <div className="flex h-11 items-center rounded-xl bg-[#f4f1e9] px-3 text-xs font-bold text-zinc-400">
                  —
                </div>
              ) : (
                <div>
                  <div className="mb-1 text-[10px] font-black uppercase tracking-[.1em] text-zinc-400 md:hidden">
                    Kosten
                  </div>

                  <div className="relative">
                    <input
                      inputMode="decimal"
                      value={
                        row.actual_cost === null ||
                        row.actual_cost === undefined
                          ? ""
                          : String(
                              row.actual_cost
                            )
                      }
                      onChange={(event) =>
                        update(
                          index,
                          "actual_cost",
                          event.target.value
                        )
                      }
                      placeholder="0,00"
                      className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 pr-8 text-right text-sm font-black text-zinc-900"
                    />

                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-black text-zinc-400">
                      €
                    </span>
                  </div>
                </div>
              )}

              {/* LÖSCHEN */}
              {sonja ? (
                <div className="hidden h-11 md:block" />
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    removeRow(index)
                  }
                  aria-label="Person entfernen"
                  title="Person entfernen"
                  className="flex h-11 items-center justify-center rounded-xl text-lg font-black text-zinc-400 transition hover:bg-red-50 hover:text-red-500"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={addRow}
          className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-black text-zinc-700 transition hover:bg-zinc-50"
        >
          + Person hinzufügen
        </button>

        <p className="text-[11px] font-semibold text-zinc-400">
          Kosten für Musiker:innen und Begleitung
          werden pro Show gespeichert.
        </p>
      </div>
    </div>
  );
}