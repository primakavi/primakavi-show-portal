import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import NewAcquisitionClient from "./NewAcquisitionClient";

export default async function NewAcquisitionPage({
  searchParams,
}: {
  searchParams: Promise<{
    venue?: string;
    organizer?: string;
  }>;
}) {
  const params = await searchParams;

  const initialVenueId =
    params.venue || "";

  const initialOrganizerId =
    params.organizer || "";

  // ============================================================
  // LOCATIONS
  // ============================================================

  const {
    data: venues,
    error: venuesError,
  } = await supabaseAdmin
    .from("venues")
    .select(`
      id,
      name,
      city,
      state,
      contact_name,
      contact_email,
      booking_email,
      relationship_status,
      acquisition_relevant
    `)
    .order("name", {
      ascending: true,
    });

  if (venuesError) {
    return (
      <main className="min-h-screen bg-[#fbf7ef] px-8 py-8 text-zinc-950">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[1.7rem] bg-white p-8 font-bold text-red-600 shadow-xl ring-1 ring-black/5">
            Fehler beim Laden der Locations:{" "}
            {venuesError.message}
          </div>
        </div>
      </main>
    );
  }

  // ============================================================
  // VERANSTALTER
  // ============================================================

  const {
    data: organizers,
    error: organizersError,
  } = await supabaseAdmin
    .from("organizers")
    .select(`
      id,
      name,
      organizer_type,
      city,
      email,
      phone,
      relationship_status,
      organizer_contacts (
        id,
        name,
        role,
        email,
        phone,
        is_primary
      )
    `)
    .order("name", {
      ascending: true,
    });

  if (organizersError) {
    return (
      <main className="min-h-screen bg-[#fbf7ef] px-8 py-8 text-zinc-950">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[1.7rem] bg-white p-8 font-bold text-red-600 shadow-xl ring-1 ring-black/5">
            Fehler beim Laden der Veranstalter:{" "}
            {organizersError.message}
          </div>
        </div>
      </main>
    );
  }

  // ============================================================
  // AKQUISE ANLEGEN
  // ============================================================

  async function createAcquisition(
    formData: FormData
  ) {
    "use server";

    const venueId =
      String(
        formData.get("venue_id") || ""
      ).trim() || null;

    const organizerId =
      String(
        formData.get("organizer_id") || ""
      ).trim() || null;

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
        formData.get(
          "next_follow_up_at"
        ) || ""
      ).trim() || null;

    const nextStep =
      String(
        formData.get("next_step") || ""
      ).trim() || null;

    const notes =
      String(
        formData.get("notes") || ""
      ).trim() || null;

    // Genau EIN Ziel
    if (!venueId && !organizerId) {
      throw new Error(
        "Bitte eine Location oder einen Veranstalter auswählen."
      );
    }

    if (venueId && organizerId) {
      throw new Error(
        "Eine Akquise kann nur einer Location oder einem Veranstalter zugeordnet werden."
      );
    }

    const {
      data: newAcquisition,
      error: insertError,
    } = await supabaseAdmin
      .from("acquisition")
      .insert({
        venue_id: venueId,
        organizer_id: organizerId,

        program:
          program || null,

        status:
          status || "Neu",

        priority:
          priority || "Normal",

        next_follow_up_at:
          nextFollowUpAt,

        next_step:
          nextStep,

        notes,

        archived_at: null,

        updated_at:
          new Date().toISOString(),
      })
      .select("id")
      .single();

    if (
      insertError ||
      !newAcquisition
    ) {
      throw new Error(
        insertError?.message ||
          "Akquise konnte nicht angelegt werden."
      );
    }

    redirect(
      `/admin/acquisition/${newAcquisition.id}`
    );
  }

  return (
    <NewAcquisitionClient
      venues={venues || []}
      organizers={organizers || []}
      createAcquisition={
        createAcquisition
      }
      initialVenueId={
        initialVenueId
      }
      initialOrganizerId={
        initialOrganizerId
      }
    />
  );
}