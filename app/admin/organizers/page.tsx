import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import OrganizersClient from "./OrganizersClient";

export default async function OrganizersPage() {
  const { data: organizers, error } = await supabaseAdmin
    .from("organizers")
    .select(`
      id, name, organizer_type, website, email, phone, city, country,
      relationship_status, notes, created_at,
      organizer_contacts (id, name, role, email, phone, is_primary)
    `)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  const organizerIds = (organizers || []).map((organizer) => organizer.id);
  const links: { organizer_id: string; venue_id: string }[] = [];

  // Supabase/PostgREST limits may truncate large queries: fetch links in chunks.
  for (let offset = 0; offset < organizerIds.length; offset += 200) {
    const { data, error: linksError } = await supabaseAdmin
      .from("organizer_venues")
      .select("organizer_id, venue_id")
      .in("organizer_id", organizerIds.slice(offset, offset + 200));
    if (linksError) throw new Error(linksError.message);
    links.push(...(data || []));
  }

  const venueIds = [...new Set(links.map((link) => link.venue_id).filter(Boolean))];
  const venues: { id: string; name: string; city: string | null }[] = [];
  for (let offset = 0; offset < venueIds.length; offset += 200) {
    const { data, error: venuesError } = await supabaseAdmin
      .from("venues")
      .select("id, name, city")
      .in("id", venueIds.slice(offset, offset + 200));
    if (venuesError) throw new Error(venuesError.message);
    venues.push(...(data || []));
  }

  const venueById = new Map(venues.map((venue) => [venue.id, venue]));
  const locationsByOrganizer = new Map<string, typeof venues>();
  for (const link of links) {
    const venue = venueById.get(link.venue_id);
    if (!venue) continue;
    const existing = locationsByOrganizer.get(link.organizer_id) || [];
    if (!existing.some((item) => item.id === venue.id)) existing.push(venue);
    locationsByOrganizer.set(link.organizer_id, existing);
  }

  const enrichedOrganizers = (organizers || []).map((organizer) => ({
    ...organizer,
    linked_locations: (locationsByOrganizer.get(organizer.id) || []).sort((a, b) =>
      a.name.localeCompare(b.name, "de")
    ),
  }));

  return <OrganizersClient organizers={enrichedOrganizers} />;
}
