import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

/** Only contact-derived follow-ups; manually created tasks are never touched. */
export async function completePreviousContactFollowUps(acquisitionId: string, contactAt: string) {
  const { error } = await supabaseAdmin.from("crm_tasks")
    .update({ completed_at: contactAt })
    .eq("acquisition_id", acquisitionId)
    .eq("task_type", "contact_follow_up")
    .is("completed_at", null)
    .lt("created_at", contactAt);
  if (error) throw new Error(`Kontakt-WVL konnte nicht abgeschlossen werden: ${error.message}`);
}

export async function createContactFollowUp(acquisitionId: string, dueDate: string, title: string, description: string) {
  const { data: owner, error: ownerError } = await supabaseAdmin.from("acquisition")
    .select("venue_id,organizer_id,primary_contact_id").eq("id", acquisitionId).single();
  if (ownerError || !owner) throw new Error(ownerError?.message || "Akquise nicht gefunden");
  const { error } = await supabaseAdmin.from("crm_tasks").insert({
    acquisition_id: acquisitionId, venue_id: owner.venue_id || null,
    organizer_id: owner.organizer_id || null, contact_id: owner.primary_contact_id || null,
    title, description, task_type: "contact_follow_up", due_at: `${dueDate}T09:00:00`, priority: "normal",
  });
  if (error) throw new Error(error.message);
}
