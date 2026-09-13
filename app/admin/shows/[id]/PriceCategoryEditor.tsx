"use client";

import { useState } from "react";

type Category = {
  id?: string;
  label: string;
  price?: number | string | null;
  sold_count?: number | string | null;
};

function formatPriceInput(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "";

  const normalized = String(value).trim().replace(",", ".");
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) return String(value);

  return parsed.toFixed(2).replace(".", ",");
}

export default function PriceCategoryEditor({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const [rows, setRows] = useState<Category[]>(
    initialCategories.map((row) => ({
      ...row,
      price: formatPriceInput(row.price),
    }))
  );

  function addCategory() {
    setRows((prev) => [...prev, { label: "", price: "" }]);
  }

  function updatePrice(index: number, value: string) {
    setRows((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, price: value } : row
      )
    );
  }

  function normalizePrice(index: number) {
    setRows((prev) =>
      prev.map((row, i) =>
        i === index
          ? { ...row, price: formatPriceInput(row.price) }
          : row
      )
    );
  }

  return (
    <div>
      <input
        type="hidden"
        name="ticket_categories_json"
        value={JSON.stringify(rows)}
      />

      <div className="space-y-2">
        {!rows.length && (
          <p className="flex h-11 items-center text-xs font-semibold text-zinc-400">
            Noch keine Preiskategorie
          </p>
        )}

        {rows.map((row, index) => (
          <div
            key={row.id || index}
            className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_140px_44px]"
          >
            <input
              value={row.label}
              onChange={(e) =>
                setRows((prev) =>
                  prev.map((r, i) =>
                    i === index
                      ? { ...r, label: e.target.value }
                      : r
                  )
                )
              }
              placeholder="z. B. regulär"
              className="h-11 min-w-0 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold text-zinc-900"
            />

            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={row.price ?? ""}
                onChange={(e) => updatePrice(index, e.target.value)}
                onBlur={() => normalizePrice(index)}
                placeholder="Preis"
                className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 pr-8 text-sm font-bold text-zinc-900"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">
                €
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                setRows((prev) =>
                  prev.filter((_, i) => i !== index)
                )
              }
              className="h-11 rounded-xl text-sm font-black text-rose-600 ring-1 ring-rose-100 transition hover:bg-rose-50"
              aria-label="Preiskategorie löschen"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addCategory}
        className="mt-3 text-xs font-black text-[#2867d8] transition hover:underline"
      >
        + Preiskategorie
      </button>
    </div>
  );
}
