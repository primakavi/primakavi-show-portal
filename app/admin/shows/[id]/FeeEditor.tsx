"use client";

import { useMemo, useState } from "react";

type FeeModel = "" | "fixed" | "minimum_plus_share" | "share" | "other";
type TaxMode = "" | "net" | "gross";

type FeeInitial = {
  model: FeeModel;
  taxMode: TaxMode;
  amount: string;
  artistShare: string;
  organizerShare: string;
  notes: string;
};

export default function FeeEditor({ show }: { show: any }) {
  const initial = useMemo(() => inferInitial(show), [show]);
  const [model, setModel] = useState<FeeModel>(initial.model);
  const [taxMode, setTaxMode] = useState<TaxMode>(initial.taxMode);
  const [amount, setAmount] = useState(initial.amount);
  const [artistShare, setArtistShare] = useState(initial.artistShare);
  const [organizerShare, setOrganizerShare] = useState(initial.organizerShare);
  const [notes, setNotes] = useState(initial.notes);
  const [combinationMode, setCombinationMode] = useState(show.fee_combination_mode || "minimum_or_share");
  const [threshold, setThreshold] = useState(String(show.fee_share_threshold ?? ""));

  const showAmount = model === "fixed" || model === "minimum_plus_share";
  const showShares = model === "minimum_plus_share" || model === "share";
  const showNotes = model !== "";

  return (
    <div className="space-y-2">
      <select
        name="fee_model"
        aria-label="Honorar-Modell"
        value={model}
        onChange={(e) => setModel(e.target.value as FeeModel)}
        className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold text-zinc-900"
      >
        <option value="">Honorar-Modell auswählen</option>
        <option value="fixed">Festgage</option>
        <option value="minimum_plus_share">Mindestgage + Beteiligung</option>
        <option value="share">Umsatzbeteiligung</option>
        <option value="other">Sonstiges</option>
      </select>

      {showAmount && (
        <div className="grid gap-2 sm:grid-cols-[1fr_130px]">
          <label className="block">
            <span className="mb-1.5 block text-xs font-black text-zinc-500">
              {model === "fixed" ? "Festgage €" : "Mindestgage €"}
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              name="fee_base_amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold text-zinc-900"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-black text-zinc-500">
              Preisbasis
            </span>
            <select
              name="fee_tax_mode"
              value={taxMode}
              onChange={(e) => setTaxMode(e.target.value as TaxMode)}
              className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold text-zinc-900"
            >
              <option value="">offen</option>
              <option value="net">netto</option>
              <option value="gross">brutto</option>
            </select>
          </label>
        </div>
      )}

      {!showAmount && (
        <input type="hidden" name="fee_base_amount" value="" />
      )}

      {!showAmount && model !== "" && (
        <label className="block max-w-[160px]">
          <span className="mb-1.5 block text-xs font-black text-zinc-500">
            Preisbasis
          </span>
          <select
            name="fee_tax_mode"
            value={taxMode}
            onChange={(e) => setTaxMode(e.target.value as TaxMode)}
            className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold text-zinc-900"
          >
            <option value="">offen</option>
            <option value="net">netto</option>
            <option value="gross">brutto</option>
          </select>
        </label>
      )}

      {model === "" && <input type="hidden" name="fee_tax_mode" value="" />}

      {model === "minimum_plus_share" && (
        <div className="rounded-xl bg-[#fbf7ef] p-3 ring-1 ring-black/5">
          <label className="block">
            <span className="mb-1.5 block text-xs font-black text-zinc-500">Wie werden Fest-/Mindesthonorar und Beteiligung kombiniert?</span>
            <select name="fee_combination_mode" value={combinationMode} onChange={(e) => setCombinationMode(e.target.value)} className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold">
              <option value="minimum_or_share">Mindesthonorar oder Beteiligung – höherer Betrag zählt</option>
              <option value="fixed_plus_share">Festhonorar + zusätzliche Beteiligung</option>
              <option value="fixed_plus_threshold_share">Festhonorar + Beteiligung erst ab Umsatzschwelle</option>
            </select>
          </label>
          {combinationMode === "fixed_plus_threshold_share" && (
            <label className="mt-2 block">
              <span className="mb-1.5 block text-xs font-black text-zinc-500">Umsatzschwelle €</span>
              <input name="fee_share_threshold" type="number" min="0" step="0.01" value={threshold} onChange={(e) => setThreshold(e.target.value)} className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold" />
              <span className="mt-1 block text-[11px] font-semibold text-zinc-400">Die Beteiligung wird nur auf den Umsatz oberhalb dieser Schwelle berechnet.</span>
            </label>
          )}
          {combinationMode !== "fixed_plus_threshold_share" && <input type="hidden" name="fee_share_threshold" value="" />}
        </div>
      )}
      {model !== "minimum_plus_share" && <><input type="hidden" name="fee_combination_mode" value="" /><input type="hidden" name="fee_share_threshold" value="" /></>}

      {showShares && (
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-black text-zinc-500">
              Anteil Sonja %
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              name="fee_artist_share"
              value={artistShare}
              onChange={(e) => setArtistShare(e.target.value)}
              className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold text-zinc-900"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-black text-zinc-500">
              Anteil Veranstalter %
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              name="fee_organizer_share"
              value={organizerShare}
              onChange={(e) => setOrganizerShare(e.target.value)}
              className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold text-zinc-900"
            />
          </label>
        </div>
      )}

      {!showShares && (
        <>
          <input type="hidden" name="fee_artist_share" value="" />
          <input type="hidden" name="fee_organizer_share" value="" />
        </>
      )}

      {showNotes && (
        <label className="block">
          <span className="mb-1.5 block text-xs font-black text-zinc-500">
            Zusatz / Sondervereinbarung
          </span>
          <textarea
            name="fee_notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              model === "other"
                ? "Honorarvereinbarung kurz beschreiben"
                : "Optional – z. B. Beteiligung greift ab Überschreiten der Mindestgage"
            }
            className="min-h-[64px] w-full resize-y rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-bold leading-5 text-zinc-900"
          />
        </label>
      )}

      {!showNotes && <input type="hidden" name="fee_notes" value="" />}

      {!show.fee_model && show.fee && (
        <div className="rounded-xl bg-[#fbf7ef] px-3 py-2 text-xs font-semibold leading-5 text-zinc-600 ring-1 ring-black/5">
          <span className="font-black text-zinc-700">Bisher:</span> {show.fee}
          <div className="mt-1 text-[11px] text-zinc-400">
            Der alte Honorartext bleibt als historischer Snapshot erhalten.
          </div>
        </div>
      )}
    </div>
  );
}

function inferInitial(show: any): FeeInitial {
  if (show.fee_model) {
    return {
      model: show.fee_model as FeeModel,
      taxMode: (show.fee_tax_mode || "") as TaxMode,
      amount: value(show.fee_base_amount),
      artistShare: value(show.fee_artist_share),
      organizerShare: value(show.fee_organizer_share),
      notes: show.fee_notes || "",
    };
  }

  const legacy = String(show.fee || "");
  const amountMatch = legacy.match(/(\d+(?:[.,]\d{1,2})?)/);
  const shareMatch = legacy.match(/(\d+(?:[.,]\d+)?)\s*\/\s*(\d+(?:[.,]\d+)?)/);
  const lower = legacy.toLowerCase();

  let model: FeeModel = "";
  if (/mindest/.test(lower) && shareMatch) model = "minimum_plus_share";
  else if (/fest|gage|honorar/.test(lower) && amountMatch) model = "fixed";
  else if (shareMatch) model = "share";

  return {
    model,
    taxMode: lower.includes("brutto") ? "gross" : lower.includes("netto") ? "net" : "",
    amount: amountMatch ? amountMatch[1].replace(",", ".") : "",
    artistShare: shareMatch ? shareMatch[1].replace(",", ".") : "",
    organizerShare: shareMatch ? shareMatch[2].replace(",", ".") : "",
    notes: "",
  };
}

function value(input: any) {
  return input === null || input === undefined ? "" : String(input);
}
