import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { geocodeShow } from "@/lib/geocoding/geocodeShow";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: shows, error: selectError } = await supabase
    .schema("booking")
    .from("shows")
    .select("*")
    .eq("geocoding_status", "pending")
    .limit(10);

  if (selectError) {
    return NextResponse.json(
      { error: selectError.message },
      { status: 500 }
    );
  }

  for (const show of shows || []) {
    const result = await geocodeShow(show);

    const { error: updateError } = await supabase
      .schema("booking")
      .from("shows")
      .update({
        latitude: result.lat ?? null,
        longitude: result.lng ?? null,
        geocoding_status: result.status,
        geocoding_query: result.query,
        geocoding_provider: "nominatim",
        geocoded_at: new Date().toISOString(),
        geocoding_error: result.error ?? null,
      })
      .eq("id", show.id);

    if (updateError) {
      return NextResponse.json(
        {
          error: updateError.message,
          show_id: show.id,
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    processed: shows?.length || 0,
  });
}