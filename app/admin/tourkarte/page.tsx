import { createClient } from "@supabase/supabase-js";
import TourkarteClient from "./TourkarteClient";

export default async function TourkartePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: shows, error } = await supabase
    .schema("booking")
    .from("shows")
    .select(`
      id,
      artist,
      program,
      show_date,
      venue,
      city,
      start_time,
      latitude,
      longitude,
      geocoding_status,
      markus_included
    `)
    .order("show_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const normalizedShows = (shows || []).map((show: any) => ({
    ...show,
    markus_included: show.markus_included === true,
  }));

  return <TourkarteClient shows={normalizedShows} />;
}