import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CALENDAR_NAME = "Sonja · Booking";
const TIMEZONE = "Europe/Berlin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

 const validToken = process.env.SONJA_CALENDAR_TOKEN;

if (!validToken || token !== validToken) {
    return new NextResponse("Kalender nicht gefunden.", {
      status: 404,
    });
  }

  try {
    const { data: shows, error: showsError } = await supabaseAdmin
      .schema("booking")
      .from("shows")
      .select(`
        id,
        program,
        show_date,
        start_time,
        entry_time,
        arrival_time,
        setup_time,
        soundcheck_time,
        internal_status,
        venue,
        venue_address,
        city,
        venue_id
      `)
      .in("internal_status", ["fix", "gespielt", "abgeschlossen"])
      .not("show_date", "is", null)
      .order("show_date", { ascending: true });

    if (showsError) {
      throw new Error(showsError.message);
    }

    const showIds = (shows ?? []).map((show) => show.id);

    let travelLegs: any[] = [];

    if (showIds.length > 0) {
      const { data, error } = await supabaseAdmin
        .schema("booking")
        .from("show_travel_legs")
        .select(`
          id,
          show_id,
          direction,
          sort_order,
          transport_type,
          from_place,
          to_place,
          departure_at,
          arrival_at,
          booking_info,
          driver_name,
          meeting_point,
          meeting_time,
          pickup_contact,
          pickup_phone,
          notes
        `)
        .in("show_id", showIds)
        .order("direction")
        .order("sort_order");

      if (error) {
        throw new Error(error.message);
      }

      travelLegs = data ?? [];
    }

    const venueIds = [
      ...new Set(
        (shows ?? [])
          .map((show) => show.venue_id)
          .filter(Boolean)
      ),
    ];

    let venues: any[] = [];

    if (venueIds.length > 0) {
      const { data, error } = await supabaseAdmin
        .from("venues")
        .select("id, name, street, postal_code, city")
        .in("id", venueIds);

      if (error) {
        throw new Error(error.message);
      }

      venues = data ?? [];
    }

    const venueMap = new Map(
      venues.map((venue) => [venue.id, venue])
    );

    const lines: string[] = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//primakavi//Sonja Booking//DE",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      `X-WR-CALNAME:${escapeIcs(CALENDAR_NAME)}`,
      `X-WR-TIMEZONE:${TIMEZONE}`,
      "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
      "X-PUBLISHED-TTL:PT1H",
    ];

    for (const show of shows ?? []) {
      const venue = show.venue_id
        ? venueMap.get(show.venue_id)
        : null;

      const venueName =
        show.venue ||
        venue?.name ||
        "Spielstätte";

      const city =
        show.city ||
        venue?.city ||
        "";

      const address =
        show.venue_address ||
        buildAddress(venue);

      /*
       * SHOW
       *
       * Falls keine Endzeit existiert, setzen wir zunächst
       * 2 Stunden als Kalenderblock.
       */
      if (show.show_date && show.start_time) {
        const start = localDateTime(
          show.show_date,
          show.start_time
        );

        const end = addMinutesToLocalDateTime(
          show.show_date,
          show.start_time,
          120
        );

        const description = [
          show.program || "Show",
          "",
          `Spielstätte: ${venueName}`,
          city ? `Ort: ${city}` : null,
          address ? `Adresse: ${address}` : null,
          "",
          show.arrival_time
            ? `Ankunft: ${formatClock(show.arrival_time)}`
            : null,
          show.setup_time
            ? `Aufbau: ${formatClock(show.setup_time)}`
            : null,
          show.soundcheck_time
            ? `Soundcheck: ${formatClock(show.soundcheck_time)}`
            : null,
          show.entry_time
            ? `Einlass: ${formatClock(show.entry_time)}`
            : null,
          `Showbeginn: ${formatClock(show.start_time)}`,
        ]
          .filter(Boolean)
          .join("\n");

        lines.push(
          ...eventLines({
            uid: `show-${show.id}@primakavi-booking`,
            start,
            end,
            summary: `🎭 ${show.program || "Show"}${city ? ` · ${city}` : ""}`,
            location: [venueName, address]
              .filter(Boolean)
              .join(", "),
            description,
          })
        );
      }

      /*
       * REISEETAPPEN DER SHOW
       */
      const showTravelLegs = travelLegs
        .filter((leg) => leg.show_id === show.id)
        .sort((a, b) => {
          const directionOrder = (value: string) =>
            value === "return" ? 1 : 0;

          const directionDiff =
            directionOrder(a.direction) -
            directionOrder(b.direction);

          if (directionDiff !== 0) return directionDiff;

          return Number(a.sort_order ?? 0) -
            Number(b.sort_order ?? 0);
        });

      for (const leg of showTravelLegs) {
        /*
         * Für einen echten Kalenderblock brauchen wir
         * Abfahrt UND Ankunft.
         */
        if (!leg.departure_at || !leg.arrival_at) {
          continue;
        }

        const start = normalizeDatabaseDateTime(
          leg.departure_at
        );

        const end = normalizeDatabaseDateTime(
          leg.arrival_at
        );

        if (!start || !end) {
          continue;
        }

        const icon = transportIcon(
          leg.transport_type
        );

        const from =
          leg.from_place || "Start";

        const to =
          leg.to_place || "Ziel";

        const direction =
          leg.direction === "return"
            ? "Rückreise"
            : "Anreise";

        const description = [
          `${direction} · ${show.program || "Show"}`,
          show.show_date
            ? `Show: ${formatGermanDate(show.show_date)}${city ? ` · ${city}` : ""}`
            : null,
          "",
          leg.transport_type
            ? `Verkehrsmittel: ${leg.transport_type}`
            : null,
          leg.booking_info
            ? `Buchung: ${leg.booking_info}`
            : null,
          leg.driver_name
            ? `Fahrer: ${leg.driver_name}`
            : null,
          leg.meeting_point
            ? `Treffpunkt: ${leg.meeting_point}`
            : null,
          leg.pickup_contact
            ? `Abholung: ${leg.pickup_contact}`
            : null,
          leg.pickup_phone
            ? `Telefon: ${leg.pickup_phone}`
            : null,
          leg.notes
            ? `Hinweis: ${leg.notes}`
            : null,
        ]
          .filter(Boolean)
          .join("\n");

        lines.push(
          ...eventLines({
            uid: `travel-${show.id}-${leg.id}@primakavi-booking`,
            start,
            end,
            summary: `${icon} ${from} → ${to}`,
            location: "",
            description,
          })
        );
      }
    }

    lines.push("END:VCALENDAR");

    const calendar = lines.join("\r\n") + "\r\n";

    return new NextResponse(calendar, {
      status: 200,
      headers: {
        "Content-Type":
          "text/calendar; charset=utf-8",
        "Content-Disposition":
          'inline; filename="sonja-booking.ics"',
        "Cache-Control":
          "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Calendar feed error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Kalender konnte nicht erstellt werden.",
      },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------
   ICS
------------------------------------------------------- */

function eventLines({
  uid,
  start,
  end,
  summary,
  location,
  description,
}: {
  uid: string;
  start: string;
  end: string;
  summary: string;
  location?: string;
  description?: string;
}) {
  return [
    "BEGIN:VEVENT",
    `UID:${escapeIcs(uid)}`,
    `DTSTAMP:${utcStamp(new Date())}`,
    `DTSTART;TZID=${TIMEZONE}:${start}`,
    `DTEND;TZID=${TIMEZONE}:${end}`,
    `SUMMARY:${escapeIcs(summary)}`,
    location
      ? `LOCATION:${escapeIcs(location)}`
      : null,
    description
      ? `DESCRIPTION:${escapeIcs(description)}`
      : null,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "END:VEVENT",
  ].filter(Boolean) as string[];
}

/* -------------------------------------------------------
   DATUM / ZEIT
------------------------------------------------------- */

function localDateTime(
  date: string,
  time: string
) {
  const cleanDate = date.slice(0, 10).replace(/-/g, "");
  const cleanTime = time
    .slice(0, 8)
    .replace(/:/g, "")
    .padEnd(6, "0");

  return `${cleanDate}T${cleanTime}`;
}

function addMinutesToLocalDateTime(
  date: string,
  time: string,
  minutes: number
) {
  const [year, month, day] = date
    .slice(0, 10)
    .split("-")
    .map(Number);

  const [hour, minute] = time
    .split(":")
    .map(Number);

  /*
   * UTC wird hier absichtlich nur als neutrale
   * Rechenhilfe benutzt. Der zurückgegebene Wert
   * wird anschließend als Europe/Berlin interpretiert.
   */
  const value = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      hour,
      minute || 0
    )
  );

  value.setUTCMinutes(
    value.getUTCMinutes() + minutes
  );

  return [
    value.getUTCFullYear(),
    String(value.getUTCMonth() + 1).padStart(2, "0"),
    String(value.getUTCDate()).padStart(2, "0"),
  ].join("") +
    "T" +
    [
      String(value.getUTCHours()).padStart(2, "0"),
      String(value.getUTCMinutes()).padStart(2, "0"),
      "00",
    ].join("");
}

/*
 * Erwartet Werte wie:
 *
 * 2026-10-10T09:15
 * 2026-10-10 09:15:00
 *
 * Wir übernehmen bewusst die lokale Uhrzeit,
 * weil TravelLegEditor datetime-local speichert.
 */
function normalizeDatabaseDateTime(
  value: string | null
) {
  if (!value) return null;

  const match = String(value).match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/
  );

  if (!match) return null;

  const [, year, month, day, hour, minute, second] =
    match;

  return `${year}${month}${day}T${hour}${minute}${
    second || "00"
  }`;
}

function utcStamp(date: Date) {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

/* -------------------------------------------------------
   FORMATIERUNG
------------------------------------------------------- */

function transportIcon(
  transportType: string | null
) {
  const value = String(
    transportType || ""
  ).toLowerCase();

  if (value.includes("zug")) return "🚆";
  if (value.includes("fähre")) return "⛴️";
  if (value.includes("faehre")) return "⛴️";
  if (value.includes("flug")) return "✈️";
  if (value.includes("auto")) return "🚗";
  if (value.includes("öpnv")) return "🚌";
  if (value.includes("bus")) return "🚌";
  if (value.includes("abholung")) return "🚕";

  return "🧳";
}

function buildAddress(venue: any) {
  if (!venue) return "";

  const line1 = venue.street || "";

  const line2 = [
    venue.postal_code,
    venue.city,
  ]
    .filter(Boolean)
    .join(" ");

  return [line1, line2]
    .filter(Boolean)
    .join(", ");
}

function formatClock(value: string | null) {
  if (!value) return "";

  return String(value).slice(0, 5);
}

function formatGermanDate(value: string) {
  const [year, month, day] = value
    .slice(0, 10)
    .split("-");

  return `${day}.${month}.${year}`;
}

function escapeIcs(value: string) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}