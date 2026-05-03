import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import AdminClient from "../AdminClient";

export default async function ShowsPage() {
  const { data: shows, error } = await supabaseAdmin
    .schema("booking")
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

      internal_status,
      billing_status,
      contract_status,
      markus_included,

      checklist,
      last_portal_update,
      last_reviewed_at,

      show_files (id, file_name, file_type),
      show_portal_submissions (
        id,
        submitted_at,
        reviewed_at
      )
    `)
    .order("show_date", { ascending: true, nullsFirst: false });

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

async function createShowAction() {
  "use server";

  const token = createToken("", "");

  const { data, error } = await supabaseAdmin
    .schema("booking")
    .from("shows")
    .insert({
      token,
      artist: "Sonja Gründemann",
      program: "Jetzt mal Tacheles",
      internal_status: "neu",
      billing_status: "offen",
      contract_status: "offen",
      markus_included: false,
      checklist: {},
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

  const { data: original, error: originalError } = await supabaseAdmin
    .schema("booking")
    .from("shows")
    .select("*")
    .eq("id", id)
    .single();

  if (originalError || !original) {
    throw new Error(
      originalError?.message || "Original-Show konnte nicht geladen werden."
    );
  }

  const token = createToken(original.show_date || "", original.venue || "");

  const {
    id: _oldId,
    created_at: _oldCreatedAt,
    token: _oldToken,
    contract_created_at: _oldContractCreatedAt,
    last_portal_update: _oldLastPortalUpdate,
    last_reviewed_at: _oldLastReviewedAt,
    ...copy
  } = original;

  const { data: duplicate, error } = await supabaseAdmin
    .schema("booking")
    .from("shows")
    .insert({
      ...copy,
      token,
      venue: `${original.venue || "Show"} (Kopie)`,
      internal_status: "neu",
      billing_status: "offen",
      checklist: {},
      last_portal_update: null,
      last_reviewed_at: null,
    })
    .select("id")
    .single();

  if (error || !duplicate) {
    throw new Error(error?.message || "Show konnte nicht dupliziert werden.");
  }

  revalidateAll();

  redirect(`/admin/shows/${duplicate.id}`);
}

async function deleteShowAction(formData: FormData) {
  "use server";

  const id = String(formData.get("show_id") || "");
  if (!id) return;

  const { error } = await supabaseAdmin
    .schema("booking")
    .from("shows")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidateAll();
}

function revalidateAll() {
  revalidatePath("/admin");
  revalidatePath("/admin/shows");
  revalidatePath("/admin/markus");
}

function createToken(date: string, venue: string) {
  const cleanVenue =
    venue
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 18) || "show";

  const cleanDate = date ? date.replaceAll("-", "") : "date";
  const random = crypto.randomUUID().slice(0, 6);

  return `${cleanDate}-${cleanVenue}-${random}`;
}