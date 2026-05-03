export async function geocodeShow(show: any) {
  const query = buildQuery(show);

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

  // Fallback: nur Stadt
  const fallbackQuery = buildFallbackQuery(show);

  if (fallbackQuery && fallbackQuery !== query) {
    const fallbackResult = await geocodeQuery(fallbackQuery);

    if (fallbackResult) {
      return {
        status: "done",
        query: fallbackQuery,
        lat: fallbackResult.lat,
        lng: fallbackResult.lng,
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

function buildQuery(show: any) {
  const address = cleanText(show.venue_address);
  const city = cleanCity(show.city);

  if (address && city) return `${address}, ${city}, Germany`;
  if (address) return `${address}, Germany`;
  if (city) return `${city}, Germany`;

  return null;
}

function buildFallbackQuery(show: any) {
  const city = cleanCity(show.city);
  return city ? `${city}, Germany` : null;
}

async function geocodeQuery(query: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=de&q=${encodeURIComponent(
    query
  )}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "primakavi-show-portal",
    },
  });

  if (!res.ok) return null;

  const data = await res.json();

  if (!data?.length) return null;

  return {
    lat: Number(data[0].lat),
    lng: Number(data[0].lon),
  };
}

function cleanText(value: any) {
  if (!value) return null;

  return String(value)
    .replace(/\n/g, " ")        // Zeilenumbrüche raus
    .replace(/\s+/g, " ")      // doppelte Spaces
    .replace(/,\s*,/g, ",")
    .trim();
}

function cleanCity(value: any) {
  if (!value) return null;

  return String(value)
    .replace("/", ",")         // Westerland/ Sylt → Westerland, Sylt
    .replace(/\s+/g, " ")
    .trim();
}