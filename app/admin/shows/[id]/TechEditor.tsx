"use client";

import { useState } from "react";

const OPTIONS = [
  ["open", "Offen"],
  ["available", "Vorhanden"],
  ["unavailable", "Nicht vorhanden"],
];

export default function TechEditor({ show }: { show: any }) {
  const [piano, setPiano] = useState(show.tech_piano_status || legacyPiano(show.piano_type));
  const [epiano, setEpiano] = useState(show.epiano_status || (show.epiano_available ? "available" : "open"));

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <TriSelect name="tech_sound_status" label="Ton" value={show.tech_sound_status || (show.tech_sound_available ? "available" : "open")} />
        <TriSelect name="tech_lights_status" label="Licht" value={show.tech_lights_status || (show.tech_lights_available ? "available" : "open")} />

        <Field label="Klavier / Flügel">
          <select
            name="tech_piano_status"
            value={piano}
            onChange={(e) => setPiano(e.target.value)}
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold"
          >
            {OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Field>

        <Field label="E-Piano">
          <select
            name="epiano_status"
            value={epiano}
            onChange={(e) => setEpiano(e.target.value)}
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold"
          >
            {OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Field>

        {piano === "available" && (
          <Field label="Klavier / Flügel · Marke / Modell">
            <input
              name="tech_piano_model"
              defaultValue={show.tech_piano_model || show.piano_type || ""}
              className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold"
            />
          </Field>
        )}

        {epiano === "available" && (
          <Field label="E-Piano · Marke / Modell">
            <input
              name="tech_epiano_model"
              defaultValue={show.tech_epiano_model || show.piano_notes || ""}
              className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold"
            />
          </Field>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Technik-Ansprechpartner">
          <input
            name="tech_contact"
            defaultValue={show.tech_contact || ""}
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold"
          />
        </Field>
        <Field label="Telefon">
          <input
            name="tech_phone"
            defaultValue={show.tech_phone || ""}
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold"
          />
        </Field>
      </div>

      <Field label="Technik-Notizen">
        <textarea
          name="tech_notes"
          defaultValue={show.tech_notes || ""}
          rows={3}
          className="min-h-[84px] rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm font-bold leading-6"
        />
      </Field>

      {piano !== "available" && <input type="hidden" name="tech_piano_model" value={show.tech_piano_model || ""} />}
      {epiano !== "available" && <input type="hidden" name="tech_epiano_model" value={show.tech_epiano_model || ""} />}
    </div>
  );
}

function TriSelect({ name, label, value }: { name: string; label: string; value: string }) {
  return (
    <Field label={label}>
      <select
        name={name}
        defaultValue={value}
        className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold"
      >
        {OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </Field>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1.5 text-[11px] font-semibold text-zinc-500">{label}{children}</label>;
}

function legacyPiano(value?: string | null) {
  if (!value) return "open";
  if (/^(nein|no)$/i.test(value.trim())) return "unavailable";
  return "available";
}
