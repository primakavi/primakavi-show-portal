"use client";
import { useState } from "react";

export default function VenueCapacityEditor({ showCapacity, venueCapacity }: { showCapacity?: number | string | null; venueCapacity?: number | string | null }) {
  const [value, setValue] = useState(String(showCapacity ?? venueCapacity ?? ""));
  const venue = venueCapacity === null || venueCapacity === undefined || String(venueCapacity) === "" ? null : Number(venueCapacity);
  const current = value === "" ? null : Number(value);
  const differs = venue !== null && current !== null && venue !== current;
  return (
    <div>
      <label className="block">
        <span className="mb-1.5 block text-xs font-black text-zinc-500">Kapazität</span>
        <input name="capacity" type="number" min="0" value={value} onChange={(e) => setValue(e.target.value)} className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold text-zinc-900" />
      </label>
      {venue !== null && <div className="mt-1 text-[11px] font-semibold text-zinc-400">Location-Stammdaten: {venue} Plätze</div>}
      {differs && (
        <div className="mt-2 rounded-xl bg-amber-50 p-3 ring-1 ring-amber-200">
          <div className="text-xs font-black text-amber-900">Die Kapazität weicht von den Location-Stammdaten ab.</div>
          <div className="mt-2 space-y-1 text-xs font-semibold text-amber-900">
            <label className="flex gap-2"><input type="radio" name="capacity_update_scope" value="show" defaultChecked /> Nur für diese Show ({current} Plätze)</label>
            <label className="flex gap-2"><input type="radio" name="capacity_update_scope" value="venue" /> Auch Location-Stammdaten auf {current} Plätze aktualisieren</label>
          </div>
          <div className="mt-2 text-[11px] text-amber-700">Alte Shows werden dabei nicht rückwirkend geändert.</div>
        </div>
      )}
    </div>
  );
}
