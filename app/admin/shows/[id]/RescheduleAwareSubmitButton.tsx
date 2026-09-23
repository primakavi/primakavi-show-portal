"use client";

import { useEffect, useState } from "react";

type Props = {
  formId: string;
  originalDate: string;
  idleLabel?: string;
  savingLabel?: string;
  className?: string;
};

export default function RescheduleAwareSubmitButton({
  formId,
  originalDate,
  idleLabel = "Speichern →",
  savingLabel = "Wird gespeichert …",
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [pendingForm, setPendingForm] = useState<HTMLFormElement | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;

    const handleSubmit = (event: SubmitEvent) => {
      const modeInput = form.elements.namedItem("date_change_kind") as HTMLInputElement | null;
      const dateInput = form.elements.namedItem("show_date") as HTMLInputElement | null;
      const newDate = dateInput?.value || "";

      // Kein Datumswechsel oder die Entscheidung wurde bereits getroffen:
      // ganz normal speichern.
      if (!newDate || !originalDate || newDate === originalDate || modeInput?.value) {
        setSaving(true);
        return;
      }

      event.preventDefault();
      setPendingForm(form);
      setOpen(true);
    };

    form.addEventListener("submit", handleSubmit);
    return () => form.removeEventListener("submit", handleSubmit);
  }, [formId, originalDate]);

  function continueSubmit(kind: "reschedule" | "correction") {
    if (!pendingForm) return;

    let input = pendingForm.elements.namedItem("date_change_kind") as HTMLInputElement | null;
    if (!input) {
      input = document.createElement("input");
      input.type = "hidden";
      input.name = "date_change_kind";
      pendingForm.appendChild(input);
    }

    input.value = kind;
    setOpen(false);
    setSaving(true);
    pendingForm.requestSubmit();
  }

  return (
    <>
      <button type="submit" className={className} disabled={saving}>
        {saving ? savingLabel : idleLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-[1.5rem] bg-white p-6 shadow-2xl ring-1 ring-black/10">
            <p className="text-xs font-black uppercase tracking-[.14em] text-amber-600">
              Showtermin geändert
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-zinc-950">
              Ist die Show verschoben worden?
            </h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-zinc-600">
              Das bisherige Datum war <strong>{formatDate(originalDate)}</strong>. Bei einer
              Verschiebung wird dieses Datum als ursprünglicher Termin gespeichert und künftig
              in der Show-Akte angezeigt.
            </p>

            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => continueSubmit("reschedule")}
                className="rounded-xl bg-zinc-950 px-4 py-3 text-sm font-black text-white"
              >
                🔄 Ja, Verschiebung
              </button>
              <button
                type="button"
                onClick={() => continueSubmit("correction")}
                className="rounded-xl bg-white px-4 py-3 text-sm font-black text-zinc-700 ring-1 ring-black/10"
              >
                Nur Datum korrigieren
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setPendingForm(null);
              }}
              className="mt-3 w-full px-4 py-2 text-xs font-black text-zinc-400"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function formatDate(value: string) {
  if (!value) return "–";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}.${month}.${year}`;
}
