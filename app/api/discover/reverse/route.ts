import { NextRequest, NextResponse } from "next/server";

function cleanString(value: unknown): string | null {
  const text = String(value ?? "").trim();
  return text || null;
}

export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get("lat"));
  const lng = Number(request.nextUrl.searchParams.get("lng"));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ city: null, postalCode: null }, { status: 400 });
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("zoom", "14");
    url.searchParams.set("addressdetails", "1");

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "primakavi-booking-crm/1.0",
        Accept: "application/json",
      },
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!response.ok) {
      return NextResponse.json({ city: null, postalCode: null }, { status: 502 });
    }

    const data = await response.json();
    const address = data?.address || {};

    const city =
      cleanString(address.city) ||
      cleanString(address.town) ||
      cleanString(address.municipality) ||
      cleanString(address.village) ||
      cleanString(address.hamlet) ||
      cleanString(address.suburb) ||
      cleanString(address.city_district) ||
      cleanString(address.county) ||
      null;

    return NextResponse.json({
      city,
      postalCode: cleanString(address.postcode),
    });
  } catch {
    return NextResponse.json({ city: null, postalCode: null }, { status: 502 });
  }
}
