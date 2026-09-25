"use client";

import { useMemo, useState } from "react";

type Category = {
  id?: string;
  label: string;
  price?: number | string | null;
  sold_count?: number | string | null;
};

type SalesMode = "total" | "categories";

export default function TicketSalesEditor({
  initialMode,
  initialTotal,
  initialCapacity,
  categories,
}: {
  initialMode?: string | null;
  initialTotal?: number | string | null;
  initialCapacity?: number | string | null;
  categories: Category[];
}) {
  const onlyOneCategory = categories.length === 1;
  const hasMultipleCategories = categories.length > 1;

  /*
   * Bei genau einer Preiskategorie brauchen wir keine Entscheidung:
   * Die verkauften Tickets können eindeutig diesem Preis zugeordnet werden.
   */
  const initialResolvedMode: SalesMode = onlyOneCategory
    ? "categories"
    : initialMode === "categories"
      ? "categories"
      : "total";

  const [mode, setMode] = useState<SalesMode>(initialResolvedMode);
  const [total, setTotal] = useState(String(initialTotal ?? ""));
  const [capacity, setCapacity] = useState(String(initialCapacity ?? ""));

  /*
   * Wichtig für bestehende Shows:
   * Wenn bisher "Gesamt" verwendet wurde und es genau eine Kategorie gibt,
   * übernehmen wir die Gesamtzahl automatisch in diese Kategorie.
   */
  const [rows, setRows] = useState<Category[]>(() =>
    categories.map((row) => {
      const existingSold =
        row.sold_count !== null &&
        row.sold_count !== undefined &&
        String(row.sold_count).trim() !== "";

      if (
        categories.length === 1 &&
        !existingSold &&
        initialTotal !== null &&
        initialTotal !== undefined &&
        String(initialTotal).trim() !== ""
      ) {
        return {
          ...row,
          sold_count: initialTotal,
        };
      }

      return row;
    })
  );

  const hasCategorySales = rows.some(
    (row) =>
      row.sold_count !== null &&
      row.sold_count !== undefined &&
      String(row.sold_count).trim() !== ""
  );

  const hasTotalSales = total.trim() !== "";

  const categoryTotal = useMemo(
    () =>
      rows.reduce(
        (sum, row) => sum + (Number(row.sold_count) || 0),
        0
      ),
    [rows]
  );

  const effectiveMode: SalesMode = onlyOneCategory
    ? "categories"
    : mode;

  const hasSales =
    effectiveMode === "categories"
      ? hasCategorySales
      : hasTotalSales;

  const sold =
    effectiveMode === "categories"
      ? categoryTotal
      : Number(total) || 0;

  const available = Number(capacity) || 0;

  const occupancy =
    hasSales && available > 0
      ? Math.round((sold / available) * 100)
      : null;

  const ticketRevenue = useMemo(
    () =>
      rows.reduce(
        (sum, row) =>
          sum +
          (Number(row.price) || 0) *
            (Number(row.sold_count) || 0),
        0
      ),
    [rows]
  );

  const avgPrice =
    effectiveMode === "categories" &&
    hasCategorySales &&
    categoryTotal > 0
      ? ticketRevenue / categoryTotal
      : null;

  function switchToTotal() {
    /*
     * Wenn bereits Verkäufe je Kategorie erfasst wurden,
     * übernehmen wir deren Summe als Gesamtzahl.
     *
     * Dadurch geht beim Umschalten nichts verloren.
     */
    if (hasCategorySales) {
      setTotal(String(categoryTotal));
    }

    setMode("total");
  }

  function switchToCategories() {
    /*
     * Bei mehreren Kategorien verteilen wir eine vorhandene
     * Gesamtzahl NICHT automatisch. Wir wissen schließlich
     * nicht, zu welchem Preis die Tickets verkauft wurden.
     */
    setMode("categories");
  }

  function updateCategorySold(index: number, value: string) {
    setRows((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, sold_count: value }
          : item
      )
    );
  }

  return (
    <div className="space-y-4">
      <input
        type="hidden"
        name="ticket_sales_mode"
        value={effectiveMode}
      />

      <input
        type="hidden"
        name="tickets_sold"
        value={hasSales ? String(sold) : ""}
      />

      <input
        type="hidden"
        name="ticket_sales_json"
        value={JSON.stringify(rows)}
      />

      {/* ------------------------------------------------ */}
      {/* EINE PREISKATEGORIE                              */}
      {/* ------------------------------------------------ */}

      {onlyOneCategory && (
        <div className="rounded-xl bg-[#f7f8ef] px-4 py-3 ring-1 ring-black/5">
          <p className="text-xs font-black text-zinc-800">
            Eine Preiskategorie
          </p>

          <p className="mt-1 text-xs font-semibold leading-5 text-zinc-500">
            Der Ticketumsatz wird automatisch aus verkauften
            Tickets × Ticketpreis berechnet.
          </p>
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* MEHRERE PREISKATEGORIEN                          */}
      {/* ------------------------------------------------ */}

      {hasMultipleCategories && (
        <>
          <div>
            <p className="text-xs font-black text-zinc-700">
              Wie möchtest du die Ticketverkäufe erfassen?
            </p>

            <p className="mt-1 text-xs font-semibold text-zinc-500">
              Wenn du die Verkäufe je Preis kennst, kann das CRM
              den Ticketumsatz automatisch berechnen.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={switchToTotal}
              className={`rounded-xl p-3 text-left ring-1 transition ${
                mode === "total"
                  ? "bg-white ring-[#c9d65c]"
                  : "bg-white/60 ring-black/5 hover:bg-white"
              }`}
            >
              <div className="text-sm font-black text-zinc-900">
                Nur Gesamtzahl bekannt
              </div>

              <div className="mt-1 text-xs font-semibold leading-5 text-zinc-500">
                Ich weiß nur, wie viele Tickets insgesamt verkauft
                wurden.
              </div>
            </button>

            <button
              type="button"
              onClick={switchToCategories}
              className={`rounded-xl p-3 text-left ring-1 transition ${
                mode === "categories"
                  ? "bg-white ring-[#c9d65c]"
                  : "bg-white/60 ring-black/5 hover:bg-white"
              }`}
            >
              <div className="text-sm font-black text-zinc-900">
                Verkäufe je Preiskategorie bekannt
              </div>

              <div className="mt-1 text-xs font-semibold leading-5 text-zinc-500">
                Ich weiß, wie viele Tickets zu welchem Preis
                verkauft wurden.
              </div>
            </button>
          </div>
        </>
      )}

      {/* ------------------------------------------------ */}
      {/* KEINE PREISKATEGORIE                             */}
      {/* ------------------------------------------------ */}

      {!categories.length && (
        <div className="rounded-xl bg-amber-50 px-4 py-3 text-xs font-semibold leading-5 text-amber-800">
          Es ist noch kein Ticketpreis hinterlegt. Du kannst die
          Gesamtzahl der verkauften Tickets trotzdem erfassen.
          Für eine automatische Umsatzberechnung muss unter
          „Vertrag & Finanzen“ mindestens eine Preiskategorie
          angelegt werden.
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* GESAMTZAHL                                       */}
      {/* ------------------------------------------------ */}

      {effectiveMode === "total" ? (
        <>
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <Field label="Tickets insgesamt verkauft">
              <input
                type="number"
                min="0"
                value={total}
                onChange={(event) =>
                  setTotal(event.target.value)
                }
                className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold text-zinc-900"
              />
            </Field>

            <Field label="Verfügbare Plätze">
              <input
                type="number"
                min="0"
                name="sellable_capacity"
                value={capacity}
                onChange={(event) =>
                  setCapacity(event.target.value)
                }
                className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold text-zinc-900"
              />
            </Field>

            <Metric
              label="Auslastung"
              value={
                occupancy === null
                  ? "—"
                  : `${occupancy} %`
              }
            />
          </div>

          {hasMultipleCategories && hasTotalSales && (
            <div className="rounded-xl bg-amber-50 px-4 py-3 text-xs font-semibold leading-5 text-amber-800">
              <strong>{sold} Tickets</strong> sind erfasst.
              Weil mehrere Ticketpreise existieren, kann der
              genaue Ticketumsatz noch nicht automatisch berechnet
              werden.
            </div>
          )}
        </>
      ) : (
        /* ------------------------------------------------ */
        /* NACH PREISKATEGORIE                              */
        /* ------------------------------------------------ */

        <div className="space-y-2">
          {rows.map((row, index) => {
            const hasValue =
              row.sold_count !== null &&
              row.sold_count !== undefined &&
              String(row.sold_count).trim() !== "";

            const rowRevenue =
              (Number(row.price) || 0) *
              (Number(row.sold_count) || 0);

            return (
              <div
                key={row.id || index}
                className="grid gap-2 rounded-xl bg-[#fbf7ef] p-3 sm:grid-cols-[1fr_140px_160px] sm:items-center"
              >
                <div>
                  <p className="text-sm font-black text-zinc-900">
                    {row.label || "Preiskategorie"}
                  </p>

                  <p className="text-xs font-semibold text-zinc-500">
                    {euro(Number(row.price) || 0)}
                  </p>
                </div>

                <label className="text-[11px] font-semibold text-zinc-500">
                  Verkauft
                  <input
                    type="number"
                    min="0"
                    value={row.sold_count ?? ""}
                    onChange={(event) =>
                      updateCategorySold(
                        index,
                        event.target.value
                      )
                    }
                    className="mt-1 h-10 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold text-zinc-900"
                  />
                </label>

                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-[.12em] text-zinc-400">
                    Umsatz
                  </p>

                  <p className="mt-1 text-sm font-black text-zinc-900">
                    {hasValue
                      ? euro(rowRevenue)
                      : "—"}
                  </p>
                </div>
              </div>
            );
          })}

          <div className="grid gap-3 md:grid-cols-4">
            <Metric
              label="Tickets gesamt"
              value={
                hasCategorySales
                  ? String(categoryTotal)
                  : "—"
              }
            />

            <Field label="Verfügbare Plätze">
              <input
                type="number"
                min="0"
                name="sellable_capacity"
                value={capacity}
                onChange={(event) =>
                  setCapacity(event.target.value)
                }
                className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold text-zinc-900"
              />
            </Field>

            <Metric
              label="Auslastung"
              value={
                occupancy === null
                  ? "—"
                  : `${occupancy} %`
              }
            />

            <Metric
              label="Ticketumsatz"
              value={
                hasCategorySales
                  ? euro(ticketRevenue)
                  : "—"
              }
            />
          </div>

          {hasCategorySales && (
            <div className="rounded-xl bg-[#f7f8ef] px-4 py-3 text-xs font-semibold text-zinc-600 ring-1 ring-black/5">
              Aus den erfassten Verkäufen ergibt sich ein
              Ticketumsatz von{" "}
              <strong>{euro(ticketRevenue)}</strong>
              {avgPrice !== null && (
                <>
                  {" "}
                  bei einem durchschnittlichen Ticketpreis von{" "}
                  <strong>{euro(avgPrice)}</strong>.
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-[11px] font-semibold text-zinc-500">
      {label}
      {children}
    </label>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#fbf7ef] px-4 py-3 ring-1 ring-black/5">
      <p className="text-[10px] font-black uppercase tracking-[.12em] text-zinc-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-zinc-900">
        {value}
      </p>
    </div>
  );
}

function euro(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(Number.isFinite(value) ? value : 0);
}