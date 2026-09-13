"use client";

import { useMemo, useState } from "react";

type Category = {
  id?: string;
  label: string;
  price?: number | string | null;
  sold_count?: number | string | null;
};

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
  const [mode, setMode] = useState(initialMode || "total");
  const [total, setTotal] = useState(String(initialTotal ?? ""));
  const [capacity, setCapacity] = useState(String(initialCapacity ?? ""));
  const [rows, setRows] = useState<Category[]>(categories);

  const hasCategorySales = rows.some(
    (row) =>
      row.sold_count !== null &&
      row.sold_count !== undefined &&
      String(row.sold_count).trim() !== ""
  );

  const hasTotalSales = total.trim() !== "";
  const hasSales = mode === "categories" ? hasCategorySales : hasTotalSales;

  const categoryTotal = useMemo(
    () => rows.reduce((sum, row) => sum + (Number(row.sold_count) || 0), 0),
    [rows]
  );

  const sold = mode === "categories" ? categoryTotal : Number(total) || 0;
  const available = Number(capacity) || 0;
  const occupancy =
    hasSales && available > 0
      ? Math.round((sold / available) * 100)
      : null;

  const ticketRevenue = useMemo(
    () =>
      rows.reduce(
        (sum, row) =>
          sum + (Number(row.price) || 0) * (Number(row.sold_count) || 0),
        0
      ),
    [rows]
  );

  const avgPrice =
    mode === "categories" && hasCategorySales && categoryTotal > 0
      ? ticketRevenue / categoryTotal
      : null;

  return (
    <div className="space-y-4">
      <input type="hidden" name="ticket_sales_mode" value={mode} />
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

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode("total")}
          className={`rounded-full px-4 py-2 text-xs font-black ring-1 ${
            mode === "total"
              ? "bg-zinc-950 text-white ring-zinc-950"
              : "bg-white text-zinc-700 ring-black/10"
          }`}
        >
          Gesamt
        </button>

        <button
          type="button"
          onClick={() => setMode("categories")}
          disabled={!categories.length}
          className={`rounded-full px-4 py-2 text-xs font-black ring-1 ${
            mode === "categories"
              ? "bg-zinc-950 text-white ring-zinc-950"
              : "bg-white text-zinc-700 ring-black/10"
          } disabled:cursor-not-allowed disabled:opacity-40`}
        >
          nach Preiskategorie
        </button>
      </div>

      {mode === "total" ? (
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <Field label="Tickets verkauft">
            <input
              type="number"
              min="0"
              value={total}
              onChange={(event) => setTotal(event.target.value)}
              className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold text-zinc-900"
            />
          </Field>

          <Field label="Verfügbare Plätze">
            <input
              type="number"
              min="0"
              name="sellable_capacity"
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
              className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold text-zinc-900"
            />
          </Field>

          <Metric
            label="Auslastung"
            value={occupancy === null ? "—" : `${occupancy} %`}
          />
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((row, index) => (
            <div
              key={row.id || index}
              className="grid gap-2 rounded-xl bg-[#fbf7ef] p-3 sm:grid-cols-[1fr_140px_160px] sm:items-center"
            >
              <div>
                <p className="text-sm font-black text-zinc-900">{row.label}</p>
                <p className="text-xs font-semibold text-zinc-500">
                  {Number(row.price || 0).toFixed(2)} €
                </p>
              </div>

              <label className="text-[11px] font-semibold text-zinc-500">
                Verkauft
                <input
                  type="number"
                  min="0"
                  value={row.sold_count ?? ""}
                  onChange={(event) =>
                    setRows((prev) =>
                      prev.map((item, i) =>
                        i === index
                          ? { ...item, sold_count: event.target.value }
                          : item
                      )
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
                  {row.sold_count === null ||
                  row.sold_count === undefined ||
                  String(row.sold_count).trim() === ""
                    ? "—"
                    : `${(
                        (Number(row.price) || 0) *
                        (Number(row.sold_count) || 0)
                      ).toFixed(2)} €`}
                </p>
              </div>
            </div>
          ))}

          <div className="grid gap-3 md:grid-cols-4">
            <Metric
              label="Tickets gesamt"
              value={hasCategorySales ? String(categoryTotal) : "—"}
            />

            <Field label="Verfügbare Plätze">
              <input
                type="number"
                min="0"
                name="sellable_capacity"
                value={capacity}
                onChange={(event) => setCapacity(event.target.value)}
                className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold text-zinc-900"
              />
            </Field>

            <Metric
              label="Auslastung"
              value={occupancy === null ? "—" : `${occupancy} %`}
            />

            <Metric
              label="Ø Ticketpreis"
              value={avgPrice === null ? "—" : `${avgPrice.toFixed(2)} €`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-[11px] font-semibold text-zinc-500">
      {label}
      {children}
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#fbf7ef] px-4 py-3 ring-1 ring-black/5">
      <p className="text-[10px] font-black uppercase tracking-[.12em] text-zinc-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-zinc-900">{value}</p>
    </div>
  );
}
