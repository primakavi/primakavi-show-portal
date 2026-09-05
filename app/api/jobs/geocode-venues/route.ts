import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // ------------------------------------------------------------
  // 1. Nur Locations berücksichtigen, die tatsächlich
  //    mit einer echten Show verknüpft sind.
  //    Optionen werden ignoriert.
  // ------------------------------------------------------------

  const { data: shows, error: showsError } = await supabase
    .schema("booking")
    .from("shows")
    .select("venue_id")
    .not("venue_id", "is", null)
    .neq("internal_status", "option");

  if (showsError) {
    return NextResponse.json(
      { error: showsError.message },
      { status: 500 }
    );
  }

  const venueIds = Array.from(
    new Set(
      (shows || [])
        .map((show: any) => show.venue_id)
        .filter(Boolean)
    )
  );

  if (venueIds.length === 0) {
    return NextResponse.json({
      processed: 0,
      updated: 0,
    });
  }

  // ------------------------------------------------------------
  // 2. Davon nur Locations ohne Koordinaten laden
  // ------------------------------------------------------------

  const { data: venues, error: venuesError } = await supabase
    .from("venues")
    .select(`
      id,
      name,
      street,
      postal_code,
      city,
      country,
      lat,
      lng
    `)
    .in("id", venueIds)
    .or("lat.is.null,lng.is.null")
    .limit(10);

  if (venuesError) {
    return NextResponse.json(
      { error: venuesError.message },
      { status: 500 }
    );
  }

  let updated = 0;

  const results: any[] = [];

  // ------------------------------------------------------------
  // 3. Locations geocodieren
  // ------------------------------------------------------------

  for (const venue of venues || []) {
    const result = await geocodeVenue(venue);

    if (result.lat !== null && result.lng !== null) {
      const { error: updateError } = await supabase
        .from("venues")
        .update({
          lat: result.lat,
          lng: result.lng,
        })
        .eq("id", venue.id);

      if (updateError) {
        return NextResponse.json(
          {
            error: updateError.message,
            venue_id: venue.id,
          },
          { status: 500 }
        );
      }

      updated++;
    }

    results.push({
      id: venue.id,
      name: venue.name,
      query: result.query,
      status: result.status,
      error: result.error,
    });

    // Nominatim nicht mit Anfragen bombardieren
    await wait(1100);
  }

  return NextResponse.json({
    processed: venues?.length || 0,
    updated,
    results,
  });
}


// ============================================================
// LOCATION GEOCODIEREN
// ============================================================

async function geocodeVenue(venue: any) {
  const query = buildQuery(venue);

  if (!query) {
    return {
      status: "failed",
      query: null,
      lat: null,
      lng: null,
      error: "Keine Adresse oder Stadt vorhanden.",
    };
  }

  const result = await geocodeQuery(query);

  if (result) {
    return {
      status: "done",
      query,
      lat: result.lat,
      lng: result.lng,
      error: null,
    };
  }

  // ------------------------------------------------------------
  // Fallback 1: Locationname + Stadt
  // ------------------------------------------------------------

  const nameCityQuery = buildNameCityQuery(venue);

  if (nameCityQuery && nameCityQuery !== query) {
    const nameCityResult = await geocodeQuery(nameCityQuery);

    if (nameCityResult) {
      return {
        status: "done",
        query: nameCityQuery,
        lat: nameCityResult.lat,
        lng: nameCityResult.lng,
        error: "Fallback über Locationname + Stadt",
      };
    }
  }

  // ------------------------------------------------------------
  // Fallback 2: nur Stadt
  // ------------------------------------------------------------

  const cityQuery = buildCityQuery(venue);

  if (cityQuery && cityQuery !== query) {
    const cityResult = await geocodeQuery(cityQuery);

    if (cityResult) {
      return {
        status: "done",
        query: cityQuery,
        lat: cityResult.lat,
        lng: cityResult.lng,
        error: "Fallback über Stadt",
      };
    }
  }

  return {
    status: "failed",
    query,
    lat: null,
    lng: null,
    error: "No results",
  };
}


// ============================================================
// SUCHANFRAGEN BAUEN
// ============================================================

function buildQuery(venue: any) {
  const name = cleanText(venue.name);
  const street = cleanText(venue.street);
  const postalCode = cleanText(venue.postal_code);
  const city = cleanCity(venue.city);

  const parts = [
    name,
    street,
    postalCode,
    city,
    "Germany",
  ].filter(Boolean);

  return parts.length > 1
    ? parts.join(", ")
    : null;
}

function buildNameCityQuery(venue: any) {
  const name = cleanText(venue.name);
  const city = cleanCity(venue.city);

  if (name && city) {
    return `${name}, ${city}, Germany`;
  }

  return null;
}

function buildCityQuery(venue: any) {
  const city = cleanCity(venue.city);

  return city
    ? `${city}, Germany`
    : null;
}


// ============================================================
// NOMINATIM
// ============================================================

async function geocodeQuery(query: string) {
  const url =
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=de&q=${encodeURIComponent(
      query
    )}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "primakavi-show-portal",
    },
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();

  if (!data?.length) {
    return null;
  }

  return {
    lat: Number(data[0].lat),
    lng: Number(data[0].lon),
  };
}


// ============================================================
// HELFER
// ============================================================

function cleanText(value: any) {
  if (!value) return null;

  return String(value)
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .replace(/,\s*,/g, ",")
    .trim();
}

function cleanCity(value: any) {
  if (!value) return null;

  return String(value)
    .replace("/", ",")
    .replace(/\s+/g, " ")
    .trim();
}

function wait(ms: number) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}