import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import LocationClient from "./LocationClient";

export default async function LocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Location laden
  const { data: venue, error: venueError } = await supabaseAdmin
    .from("venues")
    .select("*")
    .eq("id", id)
    .single();

  if (venueError || !venue) {
    notFound();
  }

  // Alle Shows dieser Location laden
  const { data: shows, error: showsError } = await supabaseAdmin
    .schema("booking")
    .from("shows")
    .select(`
      id,
      show_date,
      program,
      internal_status,
      start_time,
      venue_submitted
    `)
    .eq("venue_id", id)
    .order("show_date", { ascending: false });

  if (showsError) {
    console.error("Shows konnten nicht geladen werden:", showsError);
  }

  async function saveLocation(formData: FormData) {
    "use server";

    const payload = {
      name: valueOrNull(formData.get("name")),
      legacy_id: valueOrNull(formData.get("legacy_id")),

      street: valueOrNull(formData.get("street")),
      postal_code: valueOrNull(formData.get("postal_code")),
      city: valueOrNull(formData.get("city")),
      state: valueOrNull(formData.get("state")),
      country: valueOrNull(formData.get("country")),

      website: valueOrNull(formData.get("website")),
      capacity: formData.get("capacity")
        ? Number(formData.get("capacity"))
        : null,
      venue_type: valueOrNull(formData.get("venue_type")),
      audience_notes: valueOrNull(formData.get("audience_notes")),

      contact_name: valueOrNull(formData.get("contact_name")),
      contact_role: valueOrNull(formData.get("contact_role")),
      contact_email: valueOrNull(formData.get("contact_email")),
      contact_phone: valueOrNull(formData.get("contact_phone")),

      contact_name_2: valueOrNull(formData.get("contact_name_2")),
      contact_role_2: valueOrNull(formData.get("contact_role_2")),
      contact_email_2: valueOrNull(formData.get("contact_email_2")),
      contact_phone_2: valueOrNull(formData.get("contact_phone_2")),

      booking_email: valueOrNull(formData.get("booking_email")),
      relationship_status: valueOrNull(
        formData.get("relationship_status")
      ),

      internal_notes: valueOrNull(formData.get("internal_notes")),
      special_notes: valueOrNull(formData.get("special_notes")),

      lat: valueOrNull(formData.get("lat")),
      lng: valueOrNull(formData.get("lng")),

      played_before: formData.get("played_before") === "on",
      season_notes: valueOrNull(formData.get("season_notes")),

      program_focus: valueOrNull(formData.get("program_focus"))
        ? String(formData.get("program_focus"))
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],

      instagram_url: valueOrNull(formData.get("instagram_url")),
      facebook_url: valueOrNull(formData.get("facebook_url")),
      logo_url: valueOrNull(formData.get("logo_url")),
    };

    const { error } = await supabaseAdmin
      .from("venues")
      .update(payload)
      .eq("id", id);

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    revalidatePath("/admin/locations");
    revalidatePath(`/admin/locations/${id}`);

    return {
      success: true,
      message: "Location gespeichert.",
    };
  }

  return (
    <LocationClient
      venue={venue}
      shows={shows || []}
      saveLocation={saveLocation}
    />
  );
}

function valueOrNull(value: FormDataEntryValue | null) {
  if (value === null) return null;

  const stringValue = String(value).trim();

  return stringValue === "" ? null : stringValue;
}