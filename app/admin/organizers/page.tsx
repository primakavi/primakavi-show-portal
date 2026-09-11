import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import OrganizersClient from "./OrganizersClient";

export default async function OrganizersPage() {
  const { data: organizers, error } = await supabaseAdmin
    .from("organizers")
    .select(`
      id,
      name,
      organizer_type,
      website,
      email,
      phone,
      city,
      country,
      relationship_status,
      notes,
      created_at,
      organizer_contacts (
        id,
        name,
        role,
        email,
        phone,
        is_primary
      ),
      acquisition (
        id,
        status,
        last_contact_at,
        next_follow_up_at,
        archived_at
      )
    `)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <OrganizersClient
      organizers={organizers || []}
    />
  );
}