"use client";

import { useState } from "react";
import TravelLegEditor from "./TravelLegEditor";

type TravelStatus = "open" | "planning_required" | "not_required";

export default function TravelPlanningEditor({
  initialStatus,
  initialLegs,
}: {
  initialStatus?: TravelStatus | string | null;
  initialLegs: any[];
}) {
  const [status, setStatus] = useState<TravelStatus>(
    initialStatus === "planning_required" || initialStatus === "not_required"
      ? initialStatus
      : "open"
  );

  return (
    <div className="space-y-4">
      <label className="grid gap-1.5 text-[11px] font-semibold text-zinc-500">
        Anreise geregelt?
        <select
          name="travel_planning_status"
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as TravelStatus)
          }
className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm font-semibold text-zinc-500">
          <option value="open">Noch offen</option>
          <option value="planning_required">Reiseplanung nötig</option>
          <option value="not_required">Keine Reiseplanung nötig</option>
        </select>
      </label>

      {status === "planning_required" && (
        <TravelLegEditor initialLegs={initialLegs} />
      )}
    </div>
  );
}