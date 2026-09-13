"use client";

import { useState } from "react";
import CheckTile from "./CheckTile";

export default function PromoEditor({ show }: { show: any }) {
  const [ticketLink, setTicketLink] = useState(show.ticket_link || "");
  const [flyers, setFlyers] = useState(show.flyers_needed || "");
  const [posters, setPosters] = useState(show.posters_needed || "");
  const [format, setFormat] = useState(show.poster_format || "");
  const [promo, setPromo] = useState(show.promo_send_status || "open");

  return (
    <div className="space-y-3">
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

      <div className="grid gap-3 lg:grid-cols-3">
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
          <>
            <Field label="Anzahl Plakate">
              <input
                name="poster_amount_text"
                defaultValue={show.poster_amount_text ?? show.poster_amount ?? ""}
                className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold"
              />
            </Field>
            <Field label="Plakatformat">
              <select
                name="poster_format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold"
              >
                <option value="">Offen</option>
                <option value="A3">A3</option>
                <option value="A2">A2</option>
                <option value="other">Anderes</option>
              </select>
            </Field>
            {format === "other" && (
              <Field label="Anderes Format">
                <input
                  name="poster_format_other"
                  defaultValue={show.poster_format_other || ""}
                  className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold"
                />
              </Field>
            )}
          </>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Promo verschickt?">
          <select
            name="promo_send_status"
            value={promo}
            onChange={(e) => setPromo(e.target.value)}
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold"
          >
            <option value="open">Offen</option>
            <option value="sent">Ja</option>
            <option value="follow_up">WVL</option>
          </select>
        </Field>
        {promo === "follow_up" && (
          <Field label="Wiedervorlage am">
            <input
              type="date"
              name="promo_follow_up_date"
              defaultValue={show.promo_follow_up_date || ""}
              className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold"
            />
          </Field>
        )}
      </div>

      <Field label="Promotion-Hinweise">
        <textarea
          name="promotion"
          defaultValue={show.promotion || ""}
          rows={3}
          className="min-h-[84px] rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm font-bold leading-6 text-zinc-900"
        />
      </Field>

      {flyers !== "Ja" && <input type="hidden" name="flyer_amount" value={show.flyer_amount || ""} />}
      {posters !== "Ja" && (
        <>
          <input type="hidden" name="poster_amount_text" value={show.poster_amount || ""} />
          <input type="hidden" name="poster_format" value={show.poster_format || ""} />
          <input type="hidden" name="poster_format_other" value={show.poster_format_other || ""} />
        </>
      )}
      {promo !== "follow_up" && <input type="hidden" name="promo_follow_up_date" value={show.promo_follow_up_date || ""} />}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1.5 text-[11px] font-semibold text-zinc-500">{label}{children}</label>;
}
