import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import NewAcquisitionClient from "./NewAcquisitionClient";

export default async function NewAcquisitionPage({
  searchParams,
}: {
  searchParams: Promise<{
    venue?: string;
  }>;
}) {
  const params = await searchParams;
  const initialVenueId = params.venue || "";

  const { data: venues, error } = await supabaseAdmin
    .from("venues")
    .select(`
      id,
      name,
      city,
      state,
      contact_name,
      contact_email,
      booking_email,
      relationship_status
    `)
    .order("name", { ascending: true });

  if (error) {
    return (
      <main className="min-h-screen bg-[#fbf7ef] px-8 py-8 text-zinc-950">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[1.7rem] bg-white p-8 font-bold text-red-600 shadow-xl ring-1 ring-black/5">
            Fehler beim Laden der Locations: {error.message}
          </div>
        </div>
      </main>
    );
  }

  async function createAcquisition(formData: FormData) {
    "use server";

    const venueId = String(
      formData.get("venue_id") || ""
    ).trim();

    const program = String(
      formData.get("program") || ""
    ).trim();

    const status = String(
      formData.get("status") || ""
    ).trim();

    const priority = String(
      formData.get("priority") || ""
    ).trim();

    const nextFollowUpAt =
      String(
        formData.get("next_follow_up_at") || ""
      ).trim() || null;

    const nextStep =
      String(
        formData.get("next_step") || ""
      ).trim() || null;

    const notes =
      String(
        formData.get("notes") || ""
      ).trim() || null;

    if (!venueId) {
      throw new Error(
        "Bitte eine Location auswählen."
      );
    }

    const { error: insertError } =
      await supabaseAdmin
        .from("acquisition")
        .insert({
          venue_id: venueId,
          program: program || null,
          status: status || "Neu",
          priority: priority || "Normal",
          next_follow_up_at:
            nextFollowUpAt,
          next_step: nextStep,
          notes,
          archived_at: null,
          updated_at:
            new Date().toISOString(),
        });

    if (insertError) {
      throw new Error(
        insertError.message
      );
    }

    redirect("/admin/acquisition");
  }

  return (
    <NewAcquisitionClient
      venues={venues || []}
      createAcquisition={
        createAcquisition
      }
      initialVenueId={
        initialVenueId
      }
    />
  );
}