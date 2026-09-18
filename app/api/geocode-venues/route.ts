import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { geocodeVenue } from "@/app/lib/geocoding/geocodeVenue";

const BATCH_SIZE = 10;
const NOMINATIM_DELAY_MS = 1100;

export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: venues, error: selectError } = await supabase
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
    .or("lat.is.null,lng.is.null")
    .order("name", { ascending: true })
    .limit(BATCH_SIZE);

  if (selectError) {
    return NextResponse.json(
      { error: selectError.message },
      { status: 500 }
    );
  }

  let updated = 0;
  let failed = 0;
  const results: any[] = [];

  for (let index = 0; index < (venues || []).length; index++) {
    const venue = venues![index];
    const result = await geocodeVenue(venue);

    if (result.status === "done" && result.lat != null && result.lng != null) {
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

      updated += 1;
    } else {
      failed += 1;
    }

    results.push({
      id: venue.id,
      name: venue.name,
      status: result.status,
      query: result.query,
      error: result.error,
    });

    // Öffentlichen Nominatim-Dienst nicht parallel / zu schnell abfragen.
    if (index < (venues || []).length - 1) {
      await sleep(NOMINATIM_DELAY_MS);
    }
  }

  return NextResponse.json({
    processed: venues?.length || 0,
    updated,
    failed,
    results,
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
