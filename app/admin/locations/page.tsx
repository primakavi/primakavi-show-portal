import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import LocationsClient from "./LocationsClient";

export default async function LocationsPage() {
  const { data: venues, error } = await supabaseAdmin
    .from("venues")
    .select(`
      id,
      legacy_id,
      name,
      street,
      postal_code,
      city,
      state,
      country,
      website,
      capacity,
      venue_type,

      contact_name,
      contact_email,
      contact_phone,

      contact_name_2,
      contact_email_2,
      contact_phone_2,

      booking_email,
      relationship_status,

      internal_notes,
      special_notes,

      lat,
      lng,

      played_before,
      season_notes,
      program_focus,

      instagram_url,
      facebook_url,
      logo_url,

      created_at,
      updated_at
    `)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return <LocationsClient venues={venues || []} />;
}