"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/app/lib/supabase/server";

export async function saveAkteAction(formData: FormData) {
  const supabase = await createClient();

  const showId = String(formData.get("show_id"));

  const newCity = value(formData, "city");
  const newVenueAddress = value(formData, "venue_address");

  const { data: oldShow } = await supabase
    .from("shows")
    .select("city")
    .eq("id", showId)
    .single();

  const { data: oldDetails } = await supabase
    .from("show_details")
    .select("venue_address")
    .eq("show_id", showId)
    .maybeSingle();

  const hasLocationInput = Boolean(newCity || newVenueAddress);

  const locationChanged =
    oldShow?.city !== newCity ||
    oldDetails?.venue_address !== newVenueAddress;

  const showPayload: any = {
    artist: value(formData, "artist"),
    program: value(formData, "program"),
    show_date: value(formData, "show_date"),
    weekday: value(formData, "weekday"),
    venue: value(formData, "venue"),
    city: newCity,
    start_time: value(formData, "start_time"),
    entry_time: value(formData, "entry_time"),
  };

  if (locationChanged && hasLocationInput) {
    showPayload.latitude = null;
    showPayload.longitude = null;
    showPayload.geocoding_status = "pending";
    showPayload.geocoding_query = null;
    showPayload.geocoding_provider = null;
    showPayload.geocoded_at = null;
    showPayload.geocoding_error = null;
  }

  if (locationChanged && !hasLocationInput) {
    showPayload.latitude = null;
    showPayload.longitude = null;
    showPayload.geocoding_status = "missing";
    showPayload.geocoding_query = null;
    showPayload.geocoding_provider = null;
    showPayload.geocoded_at = null;
    showPayload.geocoding_error = "Keine Adresse oder Stadt vorhanden.";
  }

  const detailsPayload = {
    show_id: showId,
    contact_name: value(formData, "contact_name"),
    contact_email: value(formData, "contact_email"),
    contact_phone: value(formData, "contact_phone"),
    venue_address: newVenueAddress,
    schedule: value(formData, "schedule"),
    technik: value(formData, "technik"),
    piano: value(formData, "piano"),
    sound: value(formData, "sound"),
    light: value(formData, "light"),
    anreise: value(formData, "anreise"),
    unterkunft: value(formData, "unterkunft"),
    vertrag: value(formData, "vertrag"),
    tickets: value(formData, "tickets"),
    promotion: value(formData, "promotion"),
    general_notes: value(formData, "general_notes"),
  };

  const adminPayload = {
    show_id: showId,
    internal_status: value(formData, "internal_status"),
    billing_status: value(formData, "billing_status"),
    next_step: value(formData, "next_step"),
    follow_up_date: value(formData, "follow_up_date"),
    internal_notes: value(formData, "internal_notes"),
    markus_included: formData.get("markus_included") === "on",
    checklist: {
      portal: formData.get("checklist_portal") === "on",
      technik: formData.get("checklist_technik") === "on",
      vertrag: formData.get("checklist_vertrag") === "on",
      promotion: formData.get("checklist_promotion") === "on",
      abrechnung: formData.get("checklist_abrechnung") === "on",
    },
  };

  const { error: showError } = await supabase
    .from("shows")
    .update(showPayload)
    .eq("id", showId);

  if (showError) {
    throw new Error(`Show konnte nicht gespeichert werden: ${showError.message}`);
  }

  const { error: detailsError } = await supabase
    .from("show_details")
    .upsert(detailsPayload, { onConflict: "show_id" });

  if (detailsError) {
    throw new Error(
      `Show-Details konnten nicht gespeichert werden: ${detailsError.message}`
    );
  }

  const { error: adminError } = await supabase
    .from("show_admin_notes")
    .upsert(adminPayload, { onConflict: "show_id" });

  if (adminError) {
    throw new Error(
      `Admin-Notizen konnten nicht gespeichert werden: ${adminError.message}`
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/shows");
  revalidatePath(`/admin/shows/${showId}`);
}

function value(formData: FormData, key: string) {
  const raw = formData.get(key);

  if (raw === null) return null;

  const stringValue = String(raw).trim();

  return stringValue === "" ? null : stringValue;
}