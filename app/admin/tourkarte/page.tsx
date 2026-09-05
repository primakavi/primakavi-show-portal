import { createClient } from "@supabase/supabase-js";
import TourkarteClient from "./TourkarteClient";

export default async function TourkartePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Shows laden
  const { data: shows, error: showsError } = await supabase
    .schema("booking")
    .from("shows")
    .select(`
      id,
      artist,
      program,
      show_date,
      venue,
      venue_id,
      city,
      start_time,
      latitude,
      longitude,
      geocoding_status,
      markus_included,
      internal_status
    `)
    .order("show_date", { ascending: true });

  if (showsError) {
    throw new Error(showsError.message);
  }

  // 2. Alle verknüpften Location-IDs sammeln
  const venueIds = Array.from(
    new Set(
      (shows || [])
        .map((show: any) => show.venue_id)
        .filter(Boolean)
    )
  );

  // 3. Zugehörige Locations laden
  let venues: any[] = [];

  if (venueIds.length > 0) {
    const { data, error: venuesError } = await supabase
      .from("venues")
      .select(`
        id,
        legacy_id,
        name,
        street,
        postal_code,
        city,
        lat,
        lng
      `)
      .in("id", venueIds);

    if (venuesError) {
      throw new Error(venuesError.message);
    }

    venues = data || [];
  }

  // 4. Location-Daten schnell über venue_id finden
  const venueMap = new Map(
    venues.map((venue: any) => [venue.id, venue])
  );

  // 5. Shows mit den kanonischen Location-Daten zusammenführen
  const normalizedShows = (shows || []).map((show: any) => {
    const location = show.venue_id
      ? venueMap.get(show.venue_id)
      : null;

    return {
      ...show,

      markus_included: show.markus_included === true,
      internal_status: show.internal_status ?? null,

      // Wichtig:
      // Für die Tourkarte kommen die Koordinaten jetzt
      // aus der Location.
      latitude: location?.lat ?? null,
      longitude: location?.lng ?? null,

      location_id: location?.id ?? null,
      location_legacy_id: location?.legacy_id ?? null,
      location_name: location?.name ?? null,
      location_street: location?.street ?? null,
      location_postal_code: location?.postal_code ?? null,
      location_city: location?.city ?? null,

      // Auch Name und Ort stammen bei verknüpften Shows
      // aus den Stammdaten.
      venue: location?.name ?? show.venue,
      city: location?.city ?? show.city,
    };
  });

  return <TourkarteClient shows={normalizedShows} />;
}