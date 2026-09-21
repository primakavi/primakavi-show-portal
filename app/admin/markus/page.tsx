import { revalidatePath } from "next/cache";
import { createClient } from "@/app/lib/supabase/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import MarkusClient from "./MarkusClient";

export default async function AdminMarkusPage() {
  const supabase = await createClient();

  const [
    { data: shows, error },
    { data: absences, error: absencesError },
  ] = await Promise.all([
    supabaseAdmin
      .schema("booking")
      .from("shows")
      .select("*")
      .eq("markus_included", true)
      .order("show_date", { ascending: true }),

    supabaseAdmin
      .schema("booking")
      .from("artist_unavailability")
      .select("id,person,start_date,end_date,reason,note")
      .eq("person", "markus")
      .order("start_date", { ascending: true }),
  ]);

  if (error || absencesError) {
    return (
      <div className="px-6 py-8">
        <div className="mx-auto max-w-[1120px] rounded-[2rem] bg-white p-8 text-red-600 shadow-sm ring-1 ring-black/5">
          Markus-Ansicht konnte nicht geladen werden:{" "}
          {error?.message || absencesError?.message}
        </div>
      </div>
    );
  }

  const visibleShows = (shows ?? []).filter((show) => {
    return (
      show.internal_status !== "archiv" &&
      show.internal_status !== "archiviert" &&
      show.internal_status !== "abgeschlossen" &&
      show.internal_status !== "option"
    );
  });

  return (
    <MarkusClient
      shows={visibleShows}
      absences={absences ?? []}
      createAbsenceAction={createMarkusAbsenceAction}
      deleteAbsenceAction={deleteMarkusAbsenceAction}
    />
  );
}

async function assertMarkusOrAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) throw new Error("Nicht angemeldet.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!["admin", "markus"].includes(String(profile?.role || "").toLowerCase())) {
    throw new Error("Keine Berechtigung für Markus-Abwesenheiten.");
  }

  return user;
}

async function createMarkusAbsenceAction(formData: FormData) {
  "use server";

  const user = await assertMarkusOrAdmin();
  const startDate = String(formData.get("start_date") || "");
  const endDate = String(formData.get("end_date") || "");
  const reason = String(formData.get("reason") || "").trim() || null;
  const note = String(formData.get("note") || "").trim() || null;

  if (!startDate || !endDate || endDate < startDate) {
    throw new Error("Bitte einen gültigen Zeitraum wählen.");
  }

  const { error } = await supabaseAdmin
    .schema("booking")
    .from("artist_unavailability")
    .insert({
      person: "markus",
      start_date: startDate,
      end_date: endDate,
      reason,
      note,
      created_by: user.id,
    });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/markus");
  revalidatePath("/admin");
}

async function deleteMarkusAbsenceAction(formData: FormData) {
  "use server";

  await assertMarkusOrAdmin();

  const absenceId = String(formData.get("absence_id") || "");
  if (!absenceId) return;

  const { error } = await supabaseAdmin
    .schema("booking")
    .from("artist_unavailability")
    .delete()
    .eq("id", absenceId)
    .eq("person", "markus");

  if (error) throw new Error(error.message);

  revalidatePath("/admin/markus");
  revalidatePath("/admin");
}
