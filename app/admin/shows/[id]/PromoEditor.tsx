"use client";

import { useMemo, useState } from "react";
import CheckTile from "./CheckTile";

type PosterRow = {
  format: string;
  amount: string;
  customFormat?: string;
};

function initialPosterRows(show: any): PosterRow[] {
  if (Array.isArray(show.promo_poster_sizes) && show.promo_poster_sizes.length) {
    return show.promo_poster_sizes.map((row: any) => ({
      format: String(row?.format || ""),
      amount: String(row?.amount ?? ""),
      customFormat: String(row?.customFormat || ""),
    }));
  }

  const legacyAmount = show.poster_amount_text ?? show.poster_amount ?? "";
  const legacyFormat = show.poster_format || "";
  if (legacyAmount || legacyFormat) {
    return [{
      format: legacyFormat,
      amount: String(legacyAmount || ""),
      customFormat: show.poster_format_other || "",
    }];
  }

  return [{ format: "A2", amount: "", customFormat: "" }];
}

export default function PromoEditor({ show }: { show: any }) {
  const [ticketLink, setTicketLink] = useState(show.ticket_link || "");
  const [flyers, setFlyers] = useState(show.flyers_needed || "");
  const [posters, setPosters] = useState(show.posters_needed || "");
  const [posterRows, setPosterRows] = useState<PosterRow[]>(initialPosterRows(show));
  const [sentAt, setSentAt] = useState(show.promo_sent_at || "");

  const promoNeeded = flyers === "Ja" || posters === "Ja";

  const cleanPosterRows = useMemo(
    () => posterRows
      .map((row) => ({
        format: row.format,
        amount: row.amount,
        customFormat: row.format === "other" ? row.customFormat || "" : "",
      }))
      .filter((row) => row.amount || row.format),
    [posterRows]
  );

  function updatePoster(index: number, patch: Partial<PosterRow>) {
    setPosterRows((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function addPosterRow() {
    setPosterRows((rows) => [...rows, { format: "A3", amount: "", customFormat: "" }]);
  }

  function removePosterRow(index: number) {
    setPosterRows((rows) => rows.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Ticketlink">
          <input
            name="ticket_link"
            value={ticketLink}
            onChange={(e) => setTicketLink(e.target.value)}
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold text-zinc-900"
          />
        </Field>
        <div className="self-end">
          <CheckTile
            name="homepage_ticket_linked"
            label="Ticketlink auf Homepage verlinkt"
            defaultChecked={show.homepage_ticket_linked === true}
            disabled={!ticketLink}
          />
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl bg-[#fbf7ef] p-4 ring-1 ring-black/5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Flyer benötigt?">
              <select
                name="flyers_needed"
                value={flyers}
                onChange={(e) => setFlyers(e.target.value)}
                className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold"
              >
                <option value="">Offen</option>
                <option value="Ja">Ja</option>
                <option value="Nein">Nein</option>
              </select>
            </Field>
            {flyers === "Ja" && (
              <Field label="Anzahl Flyer">
                <input
                  name="flyer_amount"
                  defaultValue={show.flyer_amount || ""}
                  className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold"
                />
              </Field>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-[#fbf7ef] p-4 ring-1 ring-black/5">
          <Field label="Plakate benötigt?">
            <select
              name="posters_needed"
              value={posters}
              onChange={(e) => setPosters(e.target.value)}
              className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold"
            >
              <option value="">Offen</option>
              <option value="Ja">Ja</option>
              <option value="Nein">Nein</option>
            </select>
          </Field>

          {posters === "Ja" && (
            <div className="mt-3 space-y-2">
              {posterRows.map((row, index) => (
                <div key={index} className="grid gap-2 sm:grid-cols-[120px_120px_1fr_auto] sm:items-end">
                  <Field label="Format">
                    <select
                      value={row.format}
                      onChange={(e) => updatePoster(index, { format: e.target.value })}
                      className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold"
                    >
                      <option value="">Offen</option>
                      <option value="A1">A1</option>
                      <option value="A2">A2</option>
                      <option value="A3">A3</option>
                      <option value="A4">A4</option>
                      <option value="other">Anderes</option>
                    </select>
                  </Field>
                  <Field label="Stück">
                    <input
                      inputMode="numeric"
                      value={row.amount}
                      onChange={(e) => updatePoster(index, { amount: e.target.value })}
                      className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold"
                    />
                  </Field>
                  {row.format === "other" ? (
                    <Field label="Andere Größe">
                      <input
                        value={row.customFormat || ""}
                        onChange={(e) => updatePoster(index, { customFormat: e.target.value })}
                        className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold"
                      />
                    </Field>
                  ) : <div />}
                  <button
                    type="button"
                    onClick={() => removePosterRow(index)}
                    className="h-11 rounded-xl px-3 text-xs font-black text-zinc-400 hover:bg-white hover:text-red-600"
                    aria-label="Plakatgröße entfernen"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addPosterRow}
                className="rounded-full bg-white px-3 py-2 text-xs font-black text-zinc-700 ring-1 ring-black/10"
              >
                + Größe hinzufügen
              </button>
            </div>
          )}
        </div>
      </div>

      {promoNeeded && (
        <div className="rounded-2xl bg-[#f7faff] p-4 ring-1 ring-[#e6eefb]">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Druckkosten (€)">
              <input
                name="promo_print_cost"
                inputMode="decimal"
                defaultValue={show.promo_print_cost ?? ""}
                placeholder="0,00"
                className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold"
              />
            </Field>
            <Field label="Versandkosten (€)">
              <input
                name="promo_shipping_cost"
                inputMode="decimal"
                defaultValue={show.promo_shipping_cost ?? ""}
                placeholder="0,00"
                className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold"
              />
            </Field>
            <Field label="Verschickt am">
              <input
                type="date"
                name="promo_sent_at"
                value={sentAt}
                onChange={(e) => setSentAt(e.target.value)}
                className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold"
              />
            </Field>
            {!sentAt && (
              <Field label="Promo-Wiedervorlage">
                <input
                  type="date"
                  name="promo_follow_up_date"
                  defaultValue={show.promo_follow_up_date || ""}
                  className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold"
                />
              </Field>
            )}
          </div>
          {sentAt && (
            <p className="mt-2 text-xs font-black text-emerald-700">✓ Promo gilt mit Versanddatum als verschickt.</p>
          )}
        </div>
      )}

      <Field label="Promotion-Hinweise">
        <textarea
          name="promotion"
          defaultValue={show.promotion || ""}
          rows={3}
          className="min-h-[84px] rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm font-bold leading-6 text-zinc-900"
        />
      </Field>

      <input type="hidden" name="promo_poster_sizes_json" value={JSON.stringify(posters === "Ja" ? cleanPosterRows : [])} />

      {/* Legacy-Felder für bestehende Auswertungen/Ansichten weiter mitschicken. */}
      <input type="hidden" name="poster_amount_text" value={posters === "Ja" ? cleanPosterRows.map((r) => `${r.amount || "?"}× ${r.format === "other" ? (r.customFormat || "anderes") : r.format}`).join(", ") : ""} />
      <input type="hidden" name="poster_format" value={posters === "Ja" && cleanPosterRows.length === 1 ? cleanPosterRows[0].format : "multiple"} />
      <input type="hidden" name="poster_format_other" value="" />

      {flyers !== "Ja" && <input type="hidden" name="flyer_amount" value="" />}
      {!promoNeeded && (
        <>
          <input type="hidden" name="promo_print_cost" value="" />
          <input type="hidden" name="promo_shipping_cost" value="" />
          <input type="hidden" name="promo_sent_at" value="" />
          <input type="hidden" name="promo_follow_up_date" value="" />
        </>
      )}
      {promoNeeded && sentAt && <input type="hidden" name="promo_follow_up_date" value="" />}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1.5 text-[11px] font-semibold text-zinc-500">{label}{children}</label>;
}
