import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import MarkusClient from "./MarkusClient";

export default async function AdminMarkusPage() {
  const { data: shows, error } = await supabaseAdmin
    .from("shows")
    .select("*")
    .eq("markus_included", true)
    .order("show_date", { ascending: true });

  if (error) {
    return (
      <div className="px-6 py-8">
        <div className="mx-auto max-w-[1120px] rounded-[2rem] bg-white p-8 text-red-600 shadow-sm ring-1 ring-black/5">
          Markus-Ansicht konnte nicht geladen werden: {error.message}
        </div>
      </div>
    );
  }

  const visibleShows = (shows ?? []).filter((show) => {
    return (
      show.internal_status !== "archiv" &&
      show.internal_status !== "archiviert"
    );
  });

  return <MarkusClient shows={visibleShows} />;
}