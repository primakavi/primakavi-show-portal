"use client";

import { useState } from "react";

const TRI = [
  ["open", "Offen"],
  ["available", "Ja"],
  ["unavailable", "Nein"],
];

export default function BackstageEditor({ show }: { show: any }) {
  const [backstage, setBackstage] = useState(show.backstage_status || legacyBackstage(show));
  const [catering, setCatering] = useState(show.catering_structured_status || legacyCatering(show.catering_status));

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Backstage-Raum">
          <select
            name="backstage_status"
            value={backstage}
            onChange={(e) => setBackstage(e.target.value)}
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold"
          >
            <option value="open">Offen</option>
            <option value="available">Vorhanden</option>
            <option value="unavailable">Nicht vorhanden</option>
          </select>
        </Field>

        <Field label="Catering / Getränke">
          <select
            name="catering_structured_status"
            value={catering}
            onChange={(e) => setCatering(e.target.value)}
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold"
          >
            <option value="open">Offen</option>
            <option value="available">Vorgesehen</option>
            <option value="unavailable">Nicht vorgesehen</option>
          </select>
        </Field>
      </div>

      {backstage === "available" && (
        <div className="grid gap-3 md:grid-cols-3">
          <MiniTri name="backstage_mirror_status" label="Spiegel" value={show.backstage_mirror_status || legacyBool(show.backstage_mirror_available)} />
          <MiniTri name="backstage_seating_status" label="Sitzgelegenheit" value={show.backstage_seating_status || legacyBool(show.backstage_seating_available)} />
          <MiniTri name="backstage_table_status" label="Tisch" value={show.backstage_table_status || legacyBool(show.backstage_table_available)} />
        </div>
      )}

      {catering === "available" && (
        <Field label="Details Catering">
          <textarea
            name="catering_details"
            defaultValue={show.catering_details || ""}
            rows={3}
            className="min-h-[84px] rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm font-bold leading-6"
          />
        </Field>
      )}

      <Field label="Backstage-Notizen">
        <textarea
          name="backstage_notes"
          defaultValue={show.backstage_notes || ""}
          rows={3}
          className="min-h-[84px] rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm font-bold leading-6"
        />
      </Field>

      {backstage !== "available" && (
        <>
          <input type="hidden" name="backstage_mirror_status" value={show.backstage_mirror_status || ""} />
          <input type="hidden" name="backstage_seating_status" value={show.backstage_seating_status || ""} />
          <input type="hidden" name="backstage_table_status" value={show.backstage_table_status || ""} />
        </>
      )}
      {catering !== "available" && <input type="hidden" name="catering_details" value={show.catering_details || ""} />}
    </div>
  );
}

function MiniTri({ name, label, value }: { name: string; label: string; value: string }) {
  return (
    <Field label={label}>
      <select name={name} defaultValue={value} className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold">
        {TRI.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </Field>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1.5 text-[11px] font-semibold text-zinc-500">{label}{children}</label>;
}

function legacyBool(value: any) {
  return value === true ? "available" : "open";
}
function legacyBackstage(show: any) {
  return show.backstage_room_available ? "available" : show.backstage_no_room ? "unavailable" : "open";
}
function legacyCatering(value: any) {
  if (!value) return "open";
  return /nicht|kein/i.test(String(value)) ? "unavailable" : "available";
}
