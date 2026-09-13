"use client";

import { useState } from "react";

export default function AccommodationEditor({ show }: { show: any }) {
  const [status, setStatus] = useState(show.accommodation_status || legacyAccommodation(show));

  return (
    <div className="space-y-3">
      <Field label="Regelung der Unterkunft">
        <select
          name="accommodation_status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold"
        >
          <option value="open">Offen</option>
          <option value="organizer">Vom Veranstalter gestellt</option>
          <option value="buyout">Buyout</option>
          <option value="not_required">Nicht erforderlich</option>
        </select>
      </Field>

      {status === "organizer" && (
        <div className="grid gap-3 md:grid-cols-2">
          <HotelFields show={show} />
        </div>
      )}

      {status === "buyout" && (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Buyout vereinbart €">
              <input name="accommodation_buyout" defaultValue={show.accommodation_buyout || ""} className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold" />
            </Field>
            <label className="flex min-h-11 items-center gap-3 rounded-xl bg-white px-4 text-sm font-black ring-1 ring-black/5">
              <input type="checkbox" name="accommodation_booked" defaultChecked={show.accommodation_booked === true} className="h-4 w-4" />
              Unterkunft gebucht
            </label>
            <HotelFields show={show} />
            <Field label="Tatsächliche Kosten €">
              <input type="number" step="0.01" name="accommodation_actual_cost" defaultValue={show.accommodation_actual_cost ?? ""} className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold" />
            </Field>
          </div>
        </>
      )}

      {(status === "organizer" || status === "buyout") && (
        <Field label="Unterkunftsnotizen">
          <textarea name="accommodation_notes" defaultValue={show.accommodation_notes || ""} rows={3} className="min-h-[84px] rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm font-bold leading-6" />
        </Field>
      )}

      {status !== "buyout" && (
        <>
          <input type="hidden" name="accommodation_buyout" value={show.accommodation_buyout || ""} />
          <input type="hidden" name="accommodation_actual_cost" value={show.accommodation_actual_cost || ""} />
        </>
      )}
      {status === "not_required" || status === "open" ? (
        <>
          <input type="hidden" name="accommodation_hotel_name" value={show.accommodation_hotel_name || ""} />
          <input type="hidden" name="accommodation_address" value={show.accommodation_address || ""} />
          <input type="hidden" name="accommodation_checkin" value={show.accommodation_checkin || ""} />
          <input type="hidden" name="accommodation_checkout" value={show.accommodation_checkout || ""} />
          <input type="hidden" name="accommodation_booking_ref" value={show.accommodation_booking_ref || ""} />
          <input type="hidden" name="accommodation_notes" value={show.accommodation_notes || ""} />
        </>
      ) : null}
    </div>
  );
}

function HotelFields({ show }: { show: any }) {
  return (
    <>
      <Field label="Hotel / Unterkunft">
        <input name="accommodation_hotel_name" defaultValue={show.accommodation_hotel_name || ""} className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold" />
      </Field>
      <Field label="Adresse">
        <input name="accommodation_address" defaultValue={show.accommodation_address || ""} className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold" />
      </Field>
      <Field label="Check-in">
        <input name="accommodation_checkin" defaultValue={show.accommodation_checkin || ""} className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold" />
      </Field>
      <Field label="Check-out">
        <input name="accommodation_checkout" defaultValue={show.accommodation_checkout || ""} className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold" />
      </Field>
      <Field label="Reservierung / Buchung">
        <input name="accommodation_booking_ref" defaultValue={show.accommodation_booking_ref || ""} className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold" />
      </Field>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1.5 text-[11px] font-semibold text-zinc-500">{label}{children}</label>;
}

function legacyAccommodation(show: any) {
  const value = String(show.accommodation_type || "").toLowerCase();
  if (!value) return "open";
  if (value.includes("buyout")) return "buyout";
  if (value.includes("nicht")) return "not_required";
  return "organizer";
}
