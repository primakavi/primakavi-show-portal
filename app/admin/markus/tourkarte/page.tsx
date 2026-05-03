import { createClient } from "@supabase/supabase-js";
import MarkusTourkarteClient from "./MarkusTourkarteClient";

export default async function MarkusTourkartePage() {
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
      weekday,
      venue,
      city,
      venue_address,
      start_time,
      entry_time,
      arrival_time,
      soundcheck_time,
      schedule,
      schedule_notes,
      piano,
      epiano,
      piano_type,
      epiano_available,
      piano_notes,
      technik,
      tech_notes,
      tech_contact,
      tech_sound_available,
      tech_lights_available,
      parking_available,
      parking_details,
      loading_zone_available,
      latitude,
      longitude,
      markus_included
    `)
    .eq("markus_included", true)
    .order("show_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return <MarkusTourkarteClient shows={shows || []} />;
}