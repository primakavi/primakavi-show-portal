import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import AdminClient from "../AdminClient";

export default async function ShowsPage() {
  const { data: shows, error } = await supabaseAdmin
    .from("shows")
    .select(`
      id,
      token,
      artist,
      program,
      show_date,
      weekday,
      venue,
      city,
      start_time,
      entry_time,

      contact_name,
      contact_email,
      contact_phone,
      venue_address,
      schedule,
      technik,
      anreise,
      unterkunft,

      internal_status,
      billing_status,
      contract_status,
      markus_included,

      portal_data,
      checklist,

      show_files (id, file_name, file_type)
    `)
    .order("show_date", { ascending: true });

  if (error) {
    return (
      <main className="min-h-screen bg-[#fbf7ef] p-8">
        <div className="rounded-3xl bg-white p-8 font-bold text-red-600 shadow-xl">
          Fehler: {error.message}
        </div>
      </main>
    );
  }

  return (
    <AdminClient
      shows={shows || []}
      createShowAction={createShowAction}
      deleteShowAction={deleteShowAction}
      duplicateShowAction={duplicateShowAction}
    />
  );
}

// ---------------- ACTIONS ----------------

async function createShowAction(formData: FormData) {
  "use server";

  const showDate = String(formData.get("show_date") || "");
  const venue = String(formData.get("venue") || "");

  const token = createToken(showDate, venue);

  const { data, error } = await supabaseAdmin
    .from("shows")
    .insert({
      token,
      artist: String(formData.get("artist") || "Sonja Gründemann"),
      program: String(formData.get("program") || ""),
      show_date: showDate || null,
      weekday: getWeekday(showDate),
      venue,
      city: String(formData.get("city") || ""),
      start_time: String(formData.get("start_time") || ""),
      entry_time: String(formData.get("entry_time") || ""),
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Show konnte nicht erstellt werden.");
  }

  revalidateAll();

  redirect(`/admin/shows/${data.id}`);
}

async function duplicateShowAction(formData: FormData) {
  "use server";

  const id = String(formData.get("show_id") || "");
  if (!id) return;

  const { data: original } = await supabaseAdmin
    .from("shows")
    .select("*")
    .eq("id", id)
    .single();

  const token = createToken(original?.show_date || "", original?.venue || "");

  const { data: duplicate } = await supabaseAdmin
    .from("shows")
    .insert({
      token,
      artist: original?.artist,
      program: original?.program,
      show_date: original?.show_date,
      weekday: original?.weekday,
      venue: `${original?.venue} Kopie`,
      city: original?.city,
      start_time: original?.start_time,
      entry_time: original?.entry_time,
    })
    .select("id")
    .single();

  revalidateAll();

  redirect(`/admin/shows/${duplicate?.id}`);
}

async function deleteShowAction(formData: FormData) {
  "use server";

  const id = String(formData.get("show_id") || "");
  if (!id) return;

  await supabaseAdmin.from("shows").delete().eq("id", id);

  revalidateAll();
}

function revalidateAll() {
  revalidatePath("/admin");
  revalidatePath("/admin/shows");
  revalidatePath("/admin/markus");
}

// ---------------- HELPERS ----------------

function createToken(date: string, venue: string) {
  const cleanVenue =
    venue
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 18) || "show";

  const cleanDate = date ? date.replaceAll("-", "") : "date";
  const random = crypto.randomUUID().slice(0, 6);

  return `${cleanDate}-${cleanVenue}-${random}`;
}

function getWeekday(date: string) {
  if (!date) return null;

  const d = new Date(date);

  return d.toLocaleDateString("de-DE", { weekday: "long" }).toUpperCase();
}