"use client";

import { useState } from "react";

type CastRow = {
  id?: string;
  name: string;
  role?: string | null;
  sort_order?: number;
};

export default function CastEditor({ initialCast }: { initialCast: CastRow[] }) {
  const [rows, setRows] = useState<CastRow[]>(initialCast);

  return (
    <div className="space-y-3">
      <input type="hidden" name="show_cast_json" value={JSON.stringify(rows)} />

      <div className="grid gap-2 rounded-2xl bg-[#fbf7ef] p-3 sm:grid-cols-[1fr_1fr_36px] sm:items-center">
        <div className="text-sm font-black text-zinc-900">Sonja Gründemann</div>
        <div className="text-sm font-semibold text-zinc-500">Comédienne</div>
        <div />
      </div>

      {rows.map((row, index) => (
        <div
          key={row.id || index}
          className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-center"
        >
          <input
            value={row.name}
            onChange={(e) =>
              setRows((prev) =>
                prev.map((item, i) =>
                  i === index ? { ...item, name: e.target.value } : item
                )
              )
            }
            placeholder="Name"
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold text-zinc-900 outline-none focus:border-zinc-400"
          />
          <input
            value={row.role || ""}
            onChange={(e) =>
              setRows((prev) =>
                prev.map((item, i) =>
                  i === index ? { ...item, role: e.target.value } : item
                )
              )
            }
            placeholder="Rolle / Funktion"
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold text-zinc-900 outline-none focus:border-zinc-400"
          />
          <button
            type="button"
            onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
            className="h-11 rounded-xl px-3 text-xs font-black text-rose-600 ring-1 ring-rose-100"
          >
            ×
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setRows((prev) => [...prev, { name: "", role: "" }])}
        className="rounded-full bg-white px-4 py-2 text-xs font-black text-zinc-700 ring-1 ring-black/10"
      >
        + Person hinzufügen
      </button>
    </div>
  );
}
