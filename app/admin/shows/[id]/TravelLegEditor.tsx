"use client";

import { useState } from "react";

type Leg = {
  id?: string;
  direction: "outbound" | "return";
  sort_order: number;
  transport_type: string;
  booked?: boolean;
  from_place?: string | null;
  to_place?: string | null;
  departure_at?: string | null;
  arrival_at?: string | null;
  booking_info?: string | null;
  actual_cost?: number | string | null;
  driver_name?: string | null;
  meeting_point?: string | null;
  meeting_time?: string | null;
  pickup_contact?: string | null;
  pickup_phone?: string | null;
  parking_status?: string | null;
  loading_zone_status?: string | null;
  notes?: string | null;
};

const TYPES = [
  "Auto",
  "Zug",
  "Fähre",
  "Flug",
  "ÖPNV",
  "Abholung",
  "Sonstiges",
];

export default function TravelLegEditor({
  initialLegs,
}: {
  initialLegs: Leg[];
}) {
  const [legs, setLegs] = useState<Leg[]>(initialLegs);

  // Gespeicherte Etappen starten geschlossen.
  // Neue Etappen bekommen keinen id-Wert und starten offen.
  const [openKeys, setOpenKeys] = useState<Set<string>>(
    () =>
      new Set(
        initialLegs
          .filter((leg) => !leg.id)
          .map((leg, index) => legKey(leg, index))
      )
  );

  const outbound = legs.filter(
    (x) => x.direction === "outbound"
  );

  const returnLegs = legs.filter(
    (x) => x.direction === "return"
  );

  const outboundOnlyCar =
    outbound.length > 0 &&
    outbound.every(
      (x) => x.transport_type === "Auto"
    );

  function add(direction: "outbound" | "return") {
    setLegs((prev) => {
      const nextIndex = prev.length;

      const newLeg: Leg = {
        direction,
        sort_order: prev.filter(
          (x) => x.direction === direction
        ).length,
        transport_type: "Zug",
      };

      const next = [...prev, newLeg];

      setOpenKeys((current) => {
        const copy = new Set(current);
        copy.add(
          legKey(newLeg, nextIndex)
        );
        return copy;
      });

      return next;
    });
  }

  function update(
    index: number,
    patch: Partial<Leg>
  ) {
    setLegs((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, ...patch }
          : item
      )
    );
  }

  function remove(index: number) {
    setLegs((prev) =>
      prev.filter((_, i) => i !== index)
    );
  }

  function toggle(
    leg: Leg,
    index: number
  ) {
    const key = legKey(leg, index);

    setOpenKeys((current) => {
      const copy = new Set(current);

      if (copy.has(key)) {
        copy.delete(key);
      } else {
        copy.add(key);
      }

      return copy;
    });
  }

  const serialized = JSON.stringify(
    legs.map((leg) => ({
      ...leg,
      sort_order: legs
        .filter(
          (x) =>
            x.direction === leg.direction
        )
        .indexOf(leg),
    }))
  );

  return (
    <div className="space-y-5">
      <input
        type="hidden"
        name="travel_legs_json"
        value={serialized}
      />

      <div className="rounded-xl bg-[#f7faff] px-4 py-3 text-xs font-semibold leading-5 text-zinc-600 ring-1 ring-[#e6eefb]">
        <span className="font-black text-[#2867d8]">
          ⓘ Tipp:
        </span>{" "}
        Baue die Anreise Schritt für Schritt
        auf – z. B. Zug → Fähre → Abholung.
      </div>

      <LegGroup
        title="Hinreise"
        direction="outbound"
        legs={legs}
        openKeys={openKeys}
        add={add}
        update={update}
        remove={remove}
        toggle={toggle}
      />

      {!outboundOnlyCar && (
        <LegGroup
          title="Rückreise"
          direction="return"
          legs={legs}
          openKeys={openKeys}
          add={add}
          update={update}
          remove={remove}
          toggle={toggle}
        />
      )}

      {outboundOnlyCar &&
        returnLegs.length > 0 && (
          <p className="text-xs font-semibold text-zinc-400">
            Vorhandene Rückreise-Etappen
            bleiben gespeichert, werden bei
            reiner Autofahrt aber nicht
            benötigt.
          </p>
        )}
    </div>
  );
}

function LegGroup({
  title,
  direction,
  legs,
  openKeys,
  add,
  update,
  remove,
  toggle,
}: {
  title: string;
  direction: "outbound" | "return";
  legs: Leg[];
  openKeys: Set<string>;
  add: (
    direction: "outbound" | "return"
  ) => void;
  update: (
    index: number,
    patch: Partial<Leg>
  ) => void;
  remove: (index: number) => void;
  toggle: (
    leg: Leg,
    index: number
  ) => void;
}) {
  const group = legs.filter(
    (x) => x.direction === direction
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-black text-zinc-900">
          {title}
        </h4>

        <button
          type="button"
          onClick={() => add(direction)}
          className="rounded-full bg-white px-3 py-2 text-xs font-black ring-1 ring-black/10 transition hover:bg-[#fbfaf7]"
        >
          +{" "}
          {group.length
            ? "weitere Etappe"
            : "erste Etappe"}
        </button>
      </div>

      {legs.map(
        (
          leg: Leg,
          index: number
        ) => {
          if (
            leg.direction !== direction
          ) {
            return null;
          }

          const key = legKey(
            leg,
            index
          );

          const isOpen =
            openKeys.has(key);

          return (
            <LegCard
              key={key}
              leg={leg}
              index={index}
              isOpen={isOpen}
              update={update}
              remove={remove}
              toggle={toggle}
            />
          );
        }
      )}
    </div>
  );
}

function LegCard({
  leg,
  index,
  isOpen,
  update,
  remove,
  toggle,
}: {
  leg: Leg;
  index: number;
  isOpen: boolean;
  update: (
    index: number,
    patch: Partial<Leg>
  ) => void;
  remove: (index: number) => void;
  toggle: (
    leg: Leg,
    index: number
  ) => void;
}) {
  const isCar =
    leg.transport_type === "Auto";

  const isPickup =
    leg.transport_type === "Abholung";

  const bookable = [
    "Zug",
    "Fähre",
    "Flug",
  ].includes(leg.transport_type);

  return (
    <div className="overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
      {/* KOMPAKTE ETAPPEN-ZEILE */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() =>
            toggle(leg, index)
          }
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fbf7ef] text-base">
            {transportIcon(
              leg.transport_type
            )}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-sm font-black text-zinc-900">
                {leg.transport_type}
              </span>

              {(leg.from_place ||
                leg.to_place) && (
                <span className="text-sm font-bold text-zinc-600">
                  {leg.from_place ||
                    "offen"}{" "}
                  →{" "}
                  {leg.to_place ||
                    "offen"}
                </span>
              )}
            </div>

            <p className="mt-0.5 truncate text-xs font-semibold text-zinc-400">
              {legSummary(leg)}
            </p>
          </div>

          <span
            className={`shrink-0 text-lg font-black text-zinc-400 transition ${
              isOpen
                ? "rotate-90"
                : ""
            }`}
          >
            ›
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            remove(index)
          }
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black text-rose-600 ring-1 ring-rose-100 transition hover:bg-rose-50"
          aria-label="Etappe löschen"
          title="Etappe löschen"
        >
          ×
        </button>
      </div>

      {/* BEARBEITUNG */}
      {isOpen && (
        <div className="border-t border-black/5 bg-[#fffdf9] p-3">
          <div className="grid gap-2 md:grid-cols-[150px_1fr_1fr]">
            <select
              value={
                leg.transport_type
              }
              onChange={(e) =>
                update(index, {
                  transport_type:
                    e.target.value,
                })
              }
              className="h-10 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold"
            >
              {TYPES.map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              ))}
            </select>

            <SmallInput
              value={leg.from_place}
              onChange={(
                value: string
              ) =>
                update(index, {
                  from_place: value,
                })
              }
              placeholder={
                isPickup
                  ? "Abholort"
                  : "Von"
              }
            />

            <SmallInput
              value={leg.to_place}
              onChange={(
                value: string
              ) =>
                update(index, {
                  to_place: value,
                })
              }
              placeholder="Nach"
            />
          </div>

          {bookable && (
            <div className="mt-2 grid gap-2 md:grid-cols-3">
              <label className="flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-[#fbf7ef] px-3 text-xs font-black ring-1 ring-black/5">
                <input
                  type="checkbox"
                  checked={
                    !!leg.booked
                  }
                  onChange={(e) =>
                    update(index, {
                      booked:
                        e.target
                          .checked,
                    })
                  }
                  className="h-4 w-4"
                />
                Gebucht
              </label>

              <SmallInput
                value={
                  leg.booking_info
                }
                onChange={(
                  value: string
                ) =>
                  update(index, {
                    booking_info:
                      value,
                  })
                }
                placeholder="Verbindung / Buchung"
              />

              <SmallInput
                type="number"
                value={
                  leg.actual_cost
                }
                onChange={(
                  value: string
                ) =>
                  update(index, {
                    actual_cost:
                      value,
                  })
                }
                placeholder="Tatsächliche Kosten €"
              />
            </div>
          )}

          {isCar && (
            <div className="mt-2 grid gap-2 md:grid-cols-3">
              <SmallInput
                value={
                  leg.driver_name
                }
                onChange={(
                  value: string
                ) =>
                  update(index, {
                    driver_name:
                      value,
                  })
                }
                placeholder="Fahrer:in"
              />

              <SmallInput
                value={
                  leg.meeting_point
                }
                onChange={(
                  value: string
                ) =>
                  update(index, {
                    meeting_point:
                      value,
                  })
                }
                placeholder="Treffpunkt"
              />

              <SmallInput
                value={
                  leg.meeting_time
                }
                onChange={(
                  value: string
                ) =>
                  update(index, {
                    meeting_time:
                      value,
                  })
                }
                placeholder="Treffzeit"
              />

              <Choice
                value={
                  leg.parking_status
                }
                onChange={(
                  value: string
                ) =>
                  update(index, {
                    parking_status:
                      value,
                  })
                }
                placeholder="Parken"
              />

              <Choice
                value={
                  leg.loading_zone_status
                }
                onChange={(
                  value: string
                ) =>
                  update(index, {
                    loading_zone_status:
                      value,
                  })
                }
                placeholder="Ladezone"
              />
            </div>
          )}

          {isPickup && (
            <div className="mt-2 grid gap-2 md:grid-cols-3">
              <SmallInput
                value={
                  leg.meeting_time
                }
                onChange={(
                  value: string
                ) =>
                  update(index, {
                    meeting_time:
                      value,
                  })
                }
                placeholder="Uhrzeit"
              />

              <SmallInput
                value={
                  leg.pickup_contact
                }
                onChange={(
                  value: string
                ) =>
                  update(index, {
                    pickup_contact:
                      value,
                  })
                }
                placeholder="Wer holt ab?"
              />

              <SmallInput
                value={
                  leg.pickup_phone
                }
                onChange={(
                  value: string
                ) =>
                  update(index, {
                    pickup_phone:
                      value,
                  })
                }
                placeholder="Telefon"
              />
            </div>
          )}

          {!isCar &&
            !isPickup && (
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                <SmallInput
                  type="datetime-local"
                  value={
                    leg.departure_at
                  }
                  onChange={(
                    value: string
                  ) =>
                    update(index, {
                      departure_at:
                        value,
                    })
                  }
                />

                <SmallInput
                  type="datetime-local"
                  value={
                    leg.arrival_at
                  }
                  onChange={(
                    value: string
                  ) =>
                    update(index, {
                      arrival_at:
                        value,
                    })
                  }
                />
              </div>
            )}

          {/* NOTIZ VOLLE BREITE */}
          <div className="mt-2">
            <textarea
              value={leg.notes ?? ""}
              onChange={(e) =>
                update(index, {
                  notes:
                    e.target.value,
                })
              }
              rows={2}
              placeholder="Notiz zur Etappe"
              className="min-h-[64px] w-full resize-y rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-bold leading-5 text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function SmallInput({
  value,
  onChange,
  placeholder = "",
  type = "text",
}: {
  value?: string | number | null;
  onChange: (
    value: string
  ) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value ?? ""}
      onChange={(e) =>
        onChange(e.target.value)
      }
      placeholder={placeholder}
      className="h-10 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold text-zinc-900"
    />
  );
}

function Choice({
  value,
  onChange,
  placeholder,
}: {
  value?: string | null;
  onChange: (
    value: string
  ) => void;
  placeholder: string;
}) {
  return (
    <select
      value={value ?? "open"}
      onChange={(e) =>
        onChange(e.target.value)
      }
      className="h-10 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold"
    >
      <option value="open">
        {placeholder}: offen
      </option>

      <option value="available">
        {placeholder}: vorhanden
      </option>

      <option value="unavailable">
        {placeholder}: nicht vorhanden
      </option>

      <option value="not_relevant">
        {placeholder}: nicht relevant
      </option>
    </select>
  );
}

function legKey(
  leg: Leg,
  index: number
) {
  return (
    leg.id ||
    `${leg.direction}-${index}`
  );
}

function transportIcon(
  type: string
) {
  switch (type) {
    case "Auto":
      return "🚗";
    case "Zug":
      return "🚆";
    case "Fähre":
      return "⛴️";
    case "Flug":
      return "✈️";
    case "ÖPNV":
      return "🚌";
    case "Abholung":
      return "🚐";
    default:
      return "🧳";
  }
}

function legSummary(leg: Leg) {
  const parts: string[] = [];

  if (
    leg.transport_type === "Auto"
  ) {
    if (leg.driver_name) {
      parts.push(
        `Fahrer: ${leg.driver_name}`
      );
    }

    if (leg.meeting_time) {
      parts.push(
        `Treffen ${leg.meeting_time}`
      );
    }

    const parking =
      choiceLabel(
        leg.parking_status
      );

    if (parking) {
      parts.push(
        `Parken ${parking}`
      );
    }
  }

  if (
    ["Zug", "Fähre", "Flug"].includes(
      leg.transport_type
    )
  ) {
    if (leg.booked) {
      parts.push("gebucht ✓");
    } else {
      parts.push("noch nicht gebucht");
    }

    if (leg.departure_at) {
      parts.push(
        `Abfahrt ${formatDateTime(
          leg.departure_at
        )}`
      );
    }

    if (leg.arrival_at) {
      parts.push(
        `Ankunft ${formatDateTime(
          leg.arrival_at
        )}`
      );
    }
  }

  if (
    leg.transport_type === "Abholung"
  ) {
    if (leg.meeting_time) {
      parts.push(
        leg.meeting_time
      );
    }

    if (leg.pickup_contact) {
      parts.push(
        leg.pickup_contact
      );
    }
  }

  if (leg.notes) {
    parts.push(
      leg.notes
    );
  }

  return (
    parts.join(" · ") ||
    "Details bearbeiten"
  );
}

function choiceLabel(
  value?: string | null
) {
  switch (value) {
    case "available":
      return "✓";
    case "unavailable":
      return "nein";
    case "not_relevant":
      return "nicht relevant";
    case "open":
      return "offen";
    default:
      return "";
  }
}

function formatDateTime(
  value?: string | null
) {
  if (!value) return "";

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    "de-DE",
    {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}