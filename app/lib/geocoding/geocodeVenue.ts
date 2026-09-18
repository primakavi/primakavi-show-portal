export async function geocodeVenue(venue: any) {
  const query = buildVenueQuery(venue);

  if (!query) {
    return {
      status: "failed",
      query: null,
      lat: null,
      lng: null,
      error: "Keine vollständige Adresse vorhanden.",
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

  return {
    status: "failed",
    query,
    lat: null,
    lng: null,
    error: "No results",
  };
}

function buildVenueQuery(venue: any) {
  const street = cleanText(venue.street);
  const postalCode = cleanText(venue.postal_code);
  const city = cleanCity(venue.city);
  const country = cleanText(venue.country) || "Germany";

  // Für Stammdaten bewusst KEIN reiner Stadt-Fallback.
  // Mindestens Straße + Ort müssen vorhanden sein.
  if (!street || !city) return null;

  return [street, postalCode, city, country]
    .filter(Boolean)
    .join(", ");
}

async function geocodeQuery(query: string) {
  const url =
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
      query
    )}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "primakavi-booking-crm",
      "Accept-Language": "de",
    },
    cache: "no-store",
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
