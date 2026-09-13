"use client";

import { useMemo, useState } from "react";

type Extra = {
  id?: string;
  type: "meal_buyout" | "travel" | "accommodation_buyout" | "other";
  billing: "flat" | "per_km" | "receipt" | "included" | "other";
  amount?: number | string | null;
  note?: string | null;
};

const TYPE_OPTIONS = [
  ["meal_buyout", "Essens-Buyout"],
  ["travel", "Fahrtkosten"],
  ["accommodation_buyout", "Übernachtungs-Buyout"],
  ["other", "Sonstiges"],
] as const;

export default function FeeExtrasEditor({
  initialExtras,
  show,
}: {
  initialExtras?: Extra[];
  show?: any;
}) {
  // Backwards compatible:
  // - V2 should preferably pass `initialExtras={feeExtras}`
  // - older/current call sites using `show={show}` no longer break TypeScript.
  const startingExtras: Extra[] =
    initialExtras ??
    show?.show_fee_extras ??
    show?.fee_extras ??
    [];

  const [extras, setExtras] = useState<Extra[]>(startingExtras);
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(
    () => new Set<number>()
  );

  const serialized = useMemo(() => JSON.stringify(extras), [extras]);

  function add() {
    const index = extras.length;
    setExtras((prev) => [
      ...prev,
      { type: "meal_buyout", billing: "flat", amount: "" },
    ]);
    setOpenIndexes((prev) => new Set(prev).add(index));
  }

  function update(index: number, patch: Partial<Extra>) {
    setExtras((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  }

  function remove(index: number) {
    setExtras((prev) => prev.filter((_, i) => i !== index));
    setOpenIndexes(new Set());
  }

  function toggle(index: number) {
    setOpenIndexes((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }

  return (
    <div className="mt-3">
      <input type="hidden" name="fee_extras_json" value={serialized} />

      <div className="space-y-2">
        {extras.map((extra, index) => {
          const open = openIndexes.has(index);
          return (
            <div
              key={extra.id || index}
              className="overflow-hidden rounded-xl bg-white ring-1 ring-black/5"
            >
              <div className="flex items-center gap-2 px-3 py-2.5">
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
                >
                  <span className="truncate text-xs font-black text-zinc-700">
                    {summary(extra)}
                  </span>
                  <span className={`text-zinc-400 transition ${open ? "rotate-90" : ""}`}>
                    ›
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black text-rose-600 ring-1 ring-rose-100"
                  aria-label="Zusatzleistung löschen"
                >
                  ×
                </button>
              </div>

              {open && (
                <div className="grid gap-2 border-t border-black/5 bg-[#fffdf9] p-3 md:grid-cols-3">
                  <select
                    value={extra.type}
                    onChange={(e) => {
                      const type = e.target.value as Extra["type"];
                      update(index, {
                        type,
                        billing: type === "travel" ? "flat" : "flat",
                      });
                    }}
                    className="h-10 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold"
                  >
                    {TYPE_OPTIONS.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>

                  {extra.type === "travel" ? (
                    <select
                      value={extra.billing}
                      onChange={(e) =>
                        update(index, { billing: e.target.value as Extra["billing"] })
                      }
                      className="h-10 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold"
                    >
                      <option value="flat">Pauschale</option>
                      <option value="per_km">pro km</option>
                      <option value="receipt">gegen Beleg</option>
                      <option value="included">inklusive</option>
                      <option value="other">Sonstige Vereinbarung</option>
                    </select>
                  ) : (
                    <div className="flex h-10 items-center rounded-xl bg-[#fbf7ef] px-3 text-xs font-bold text-zinc-500">
                      Pauschale
                    </div>
                  )}

                  {!["receipt", "included"].includes(extra.billing) && (
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={extra.amount ?? ""}
                        onChange={(e) => update(index, { amount: e.target.value })}
                        placeholder={extra.billing === "per_km" ? "Betrag pro km" : "Betrag"}
                        className="h-10 w-full rounded-xl border border-zinc-300 bg-white px-3 pr-8 text-sm font-bold"
                      />
                      <span className="pointer-events-none absolute right-3 top-2.5 text-sm font-bold text-zinc-400">
                        €
                      </span>
                    </div>
                  )}

                  <input
                    value={extra.note ?? ""}
                    onChange={(e) => update(index, { note: e.target.value })}
                    placeholder="Optionaler Hinweis"
                    className="h-10 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold md:col-span-3"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={add}
        className="mt-2 text-xs font-black text-[#2867d8] transition hover:underline"
      >
        + Zusatzleistung
      </button>
    </div>
  );
}

function summary(extra: Extra) {
  const type =
    TYPE_OPTIONS.find(([value]) => value === extra.type)?.[1] || "Zusatzleistung";

  if (extra.type === "travel") {
    if (extra.billing === "included") return `${type} · inklusive`;
    if (extra.billing === "receipt") return `${type} · gegen Beleg`;
    if (extra.billing === "per_km")
      return `${type} · ${money(extra.amount) || "Betrag offen"}/km`;
  }

  return `${type} · ${money(extra.amount) || "Betrag offen"}`;
}

function money(value?: number | string | null) {
  if (value === null || value === undefined || value === "") return "";
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return `${n.toLocaleString("de-DE", {
    minimumFractionDigits: n % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  })} €`;
}
