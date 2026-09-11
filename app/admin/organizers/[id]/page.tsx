import {
  notFound,
  redirect,
} from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import OrganizerClient from "./OrganizerClient";

export default async function OrganizerDetailPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  // ============================================================
  // VERANSTALTER
  // ============================================================

  const {
    data: organizer,
    error: organizerError,
  } = await supabaseAdmin
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
      updated_at,
      organizer_contacts (
        id,
        name,
        role,
        email,
        phone,
        notes,
        is_primary,
        created_at
      )
    `)
    .eq("id", id)
    .single();

  if (
    organizerError ||
    !organizer
  ) {
    notFound();
  }

  // ============================================================
  // LOCATIONS
  // ============================================================

  const {
    data: allVenues,
    error: venuesError,
  } = await supabaseAdmin
    .from("venues")
    .select(`
      id,
      name,
      street,
      postal_code,
      city,
      website,
      relationship_status,
      acquisition_relevant
    `)
    .order("name", {
      ascending: true,
    });

  if (venuesError) {
    throw new Error(
      venuesError.message
    );
  }

  // ============================================================
  // VERKNÜPFTE LOCATIONS
  // ============================================================

  const {
    data: venueLinks,
    error: venueLinksError,
  } = await supabaseAdmin
    .from("organizer_venues")
    .select(`
      organizer_id,
      venue_id,
      is_primary,
      notes
    `)
    .eq(
      "organizer_id",
      id
    );

  if (venueLinksError) {
    throw new Error(
      venueLinksError.message
    );
  }

  const linkedVenues =
    (venueLinks || [])
      .map((link) => {
        const venue =
          (allVenues || []).find(
            (item) =>
              item.id ===
              link.venue_id
          );

        if (!venue) {
          return null;
        }

        return {
          ...venue,

          is_primary:
            link.is_primary ||
            false,

          link_notes:
            link.notes ||
            null,
        };
      })
      .filter(Boolean);

  // ============================================================
  // AKQUISE-RUNDEN
  // ============================================================

  const {
    data: acquisitionRounds,
    error:
      acquisitionRoundsError,
  } = await supabaseAdmin
    .from("acquisition_rounds")
    .select(`
      id,
      name,
      active,
      created_at
    `)
    .eq("active", true)
    .order("name", {
      ascending: true,
    });

  if (
    acquisitionRoundsError
  ) {
    console.error(
      acquisitionRoundsError
    );
  }

  // ============================================================
  // AKQUISE
  // ============================================================

  const {
    data: acquisition,
    error: acquisitionError,
  } = await supabaseAdmin
    .from("acquisition")
    .select(`
      id,
      program,
      status,
      priority,
      last_contact_at,
      next_follow_up_at,
      contact_channel,
      contact_note,
      response,
      next_step,
      notes,
      archived_at,
      created_at
    `)
    .eq(
      "organizer_id",
      id
    )
    .order(
      "last_contact_at",
      {
        ascending: false,
        nullsFirst: false,
      }
    );

  if (acquisitionError) {
    console.error(
      acquisitionError
    );
  }

  // ============================================================
  // AKQUISE-AKTIVITÄTEN
  // ============================================================

  const acquisitionIds =
    (
      acquisition || []
    ).map(
      (item) => item.id
    );

  let acquisitionActivities:
    any[] = [];

  if (
    acquisitionIds.length >
    0
  ) {
    const {
      data: activities,
      error: activitiesError,
    } =
      await supabaseAdmin
        .from(
          "acquisition_activities"
        )
        .select(`
          id,
          acquisition_id,
          activity_date,
          activity_type,
          channel,
          note,
          response,
          next_step,
          follow_up_at,
          status_after,
          interest_after,
          created_at
        `)
        .in(
          "acquisition_id",
          acquisitionIds
        )
        .order(
          "activity_date",
          {
            ascending: false,
          }
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        );

    if (activitiesError) {
      console.error(
        activitiesError
      );
    } else {
      acquisitionActivities =
        activities || [];
    }
  }

  // ============================================================
  // VERANSTALTER SPEICHERN
  // ============================================================

  async function saveOrganizer(
    formData: FormData
  ) {
    "use server";

    const name =
      valueOrNull(
        formData.get("name")
      );

    if (!name) {
      return {
        success: false,
        message:
          "Bitte einen Namen eingeben.",
      };
    }

    const { error } =
      await supabaseAdmin
        .from("organizers")
        .update({
          name,

          organizer_type:
            valueOrNull(
              formData.get(
                "organizer_type"
              )
            ),

          website:
            valueOrNull(
              formData.get(
                "website"
              )
            ),

          email:
            valueOrNull(
              formData.get(
                "email"
              )
            ),

          phone:
            valueOrNull(
              formData.get(
                "phone"
              )
            ),

          city:
            valueOrNull(
              formData.get(
                "city"
              )
            ),

          country:
            valueOrNull(
              formData.get(
                "country"
              )
            ) ||
            "Deutschland",

          relationship_status:
            valueOrNull(
              formData.get(
                "relationship_status"
              )
            ),

          notes:
            valueOrNull(
              formData.get(
                "notes"
              )
            ),

          updated_at:
            new Date()
              .toISOString(),
        })
        .eq(
          "id",
          id
        );

    if (error) {
      return {
        success: false,
        message:
          error.message,
      };
    }

    revalidateOrganizer(
      id
    );

    return {
      success: true,
      message:
        "Veranstalter gespeichert.",
    };
  }

  // ============================================================
  // SHOW AUS VERANSTALTER ANLEGEN
  // ============================================================

  async function createShow(
    formData: FormData
  ) {
    "use server";

    const venueId =
      valueOrNull(
        formData.get(
          "venue_id"
        )
      );

    // Veranstalter + Kontakte frisch laden,
    // damit wir keine alten Props verwenden.

    const {
      data: currentOrganizer,
      error: currentOrganizerError,
    } =
      await supabaseAdmin
        .from("organizers")
        .select(`
          id,
          name,
          email,
          phone,
          organizer_contacts (
            id,
            name,
            role,
            email,
            phone,
            is_primary
          )
        `)
        .eq(
          "id",
          id
        )
        .single();

    if (
      currentOrganizerError ||
      !currentOrganizer
    ) {
      throw new Error(
        currentOrganizerError
          ?.message ||
          "Veranstalter konnte nicht geladen werden."
      );
    }

    const contacts =
      currentOrganizer
        .organizer_contacts ||
      [];

    const primaryContact =
      contacts.find(
        (contact) =>
          contact.is_primary
      ) ||
      contacts[0] ||
      null;

    let venue:
      | {
          id: string;
          name: string;
          street: string | null;
          postal_code: string | null;
          city: string | null;
        }
      | null = null;

    if (venueId) {
      const {
        data: venueData,
        error: venueError,
      } =
        await supabaseAdmin
          .from("venues")
          .select(`
            id,
            name,
            street,
            postal_code,
            city
          `)
          .eq(
            "id",
            venueId
          )
          .single();

      if (
        venueError ||
        !venueData
      ) {
        throw new Error(
          venueError?.message ||
          "Spielort konnte nicht geladen werden."
        );
      }

      venue =
        venueData;
    }

    const venueAddress =
      venue
        ? [
            venue.street,
            [
              venue.postal_code,
              venue.city,
            ]
              .filter(Boolean)
              .join(" "),
          ]
            .filter(Boolean)
            .join(", ")
        : null;

    const token =
      createToken(
        venue?.name ||
          currentOrganizer.name
      );

    const {
      data: show,
      error: showError,
    } =
      await supabaseAdmin
        .schema("booking")
        .from("shows")
        .insert({
          token,

          artist:
            "Sonja Gründemann",

          program:
            null,

          show_date:
            null,

          weekday:
            null,

          venue_id:
            venue?.id ||
            null,

          venue:
            venue?.name ||
            null,

          city:
            venue?.city ||
            null,

          venue_address:
            venueAddress ||
            null,

          contact_name:
            primaryContact
              ?.name ||
            null,

          contact_email:
            primaryContact
              ?.email ||
            currentOrganizer.email ||
            null,

          contact_phone:
            primaryContact
              ?.phone ||
            currentOrganizer.phone ||
            null,

          internal_status:
            "neu",

          billing_status:
            "offen",

          contract_status:
            "offen",

          markus_included:
            false,

          checklist: {},
        })
        .select("id")
        .single();

    if (
      showError ||
      !show
    ) {
      throw new Error(
        showError?.message ||
        "Show konnte nicht angelegt werden."
      );
    }

    revalidatePath(
      "/admin/shows"
    );

    revalidatePath(
      "/admin"
    );

    revalidatePath(
      `/admin/organizers/${id}`
    );

    if (venue?.id) {
      revalidatePath(
        `/admin/locations/${venue.id}`
      );
    }

    redirect(
      `/admin/shows/${show.id}`
    );
  }

  // ============================================================
  // KONTAKT HINZUFÜGEN
  // ============================================================

  async function addContact(
    formData: FormData
  ) {
    "use server";

    const name =
      valueOrNull(
        formData.get("name")
      );

    if (!name) {
      return {
        success: false,
        message:
          "Bitte einen Namen eingeben.",
      };
    }

    const isPrimary =
      formData.get(
        "is_primary"
      ) === "on";

    if (isPrimary) {
      await supabaseAdmin
        .from(
          "organizer_contacts"
        )
        .update({
          is_primary:
            false,
        })
        .eq(
          "organizer_id",
          id
        );
    }

    const { error } =
      await supabaseAdmin
        .from(
          "organizer_contacts"
        )
        .insert({
          organizer_id:
            id,

          name,

          role:
            valueOrNull(
              formData.get(
                "role"
              )
            ),

          email:
            valueOrNull(
              formData.get(
                "email"
              )
            ),

          phone:
            valueOrNull(
              formData.get(
                "phone"
              )
            ),

          notes:
            valueOrNull(
              formData.get(
                "notes"
              )
            ),

          is_primary:
            isPrimary,
        });

    if (error) {
      return {
        success: false,
        message:
          error.message,
      };
    }

    revalidateOrganizer(
      id
    );

    return {
      success: true,
      message:
        "Kontakt hinzugefügt.",
    };
  }

  // ============================================================
  // KONTAKT ÄNDERN
  // ============================================================

  async function updateContact(
    formData: FormData
  ) {
    "use server";

    const contactId =
      valueOrNull(
        formData.get(
          "contact_id"
        )
      );

    const name =
      valueOrNull(
        formData.get(
          "name"
        )
      );

    if (
      !contactId ||
      !name
    ) {
      return {
        success: false,
        message:
          "Kontakt konnte nicht gespeichert werden.",
      };
    }

    const isPrimary =
      formData.get(
        "is_primary"
      ) === "on";

    if (isPrimary) {
      await supabaseAdmin
        .from(
          "organizer_contacts"
        )
        .update({
          is_primary:
            false,
        })
        .eq(
          "organizer_id",
          id
        );
    }

    const { error } =
      await supabaseAdmin
        .from(
          "organizer_contacts"
        )
        .update({
          name,

          role:
            valueOrNull(
              formData.get(
                "role"
              )
            ),

          email:
            valueOrNull(
              formData.get(
                "email"
              )
            ),

          phone:
            valueOrNull(
              formData.get(
                "phone"
              )
            ),

          notes:
            valueOrNull(
              formData.get(
                "notes"
              )
            ),

          is_primary:
            isPrimary,
        })
        .eq(
          "id",
          contactId
        )
        .eq(
          "organizer_id",
          id
        );

    if (error) {
      return {
        success: false,
        message:
          error.message,
      };
    }

    revalidateOrganizer(
      id
    );

    return {
      success: true,
      message:
        "Kontakt gespeichert.",
    };
  }

  // ============================================================
  // KONTAKT LÖSCHEN
  // ============================================================

  async function deleteContact(
    formData: FormData
  ) {
    "use server";

    const contactId =
      valueOrNull(
        formData.get(
          "contact_id"
        )
      );

    if (!contactId) {
      return {
        success: false,
        message:
          "Kontakt fehlt.",
      };
    }

    const { error } =
      await supabaseAdmin
        .from(
          "organizer_contacts"
        )
        .delete()
        .eq(
          "id",
          contactId
        )
        .eq(
          "organizer_id",
          id
        );

    if (error) {
      return {
        success: false,
        message:
          error.message,
      };
    }

    revalidateOrganizer(
      id
    );

    return {
      success: true,
      message:
        "Kontakt gelöscht.",
    };
  }

  // ============================================================
  // BESTEHENDE LOCATION VERKNÜPFEN
  // ============================================================

  async function linkVenue(
    formData: FormData
  ) {
    "use server";

    const venueId =
      valueOrNull(
        formData.get(
          "venue_id"
        )
      );

    if (!venueId) {
      return {
        success: false,
        message:
          "Bitte eine Location auswählen.",
      };
    }

    const venueOnly =
      formData.get(
        "venue_only"
      ) === "on";

    const {
      error: venueError,
    } =
      await supabaseAdmin
        .from("venues")
        .update({
          acquisition_relevant:
            !venueOnly,

          relationship_status:
            venueOnly
              ? "🔴 Nicht relevant"
              : "⚪ Neu",
        })
        .eq(
          "id",
          venueId
        );

    if (venueError) {
      return {
        success: false,
        message:
          venueError.message,
      };
    }

    const {
      error: linkError,
    } =
      await supabaseAdmin
        .from(
          "organizer_venues"
        )
        .upsert(
          {
            organizer_id:
              id,

            venue_id:
              venueId,
          },
          {
            onConflict:
              "organizer_id,venue_id",
          }
        );

    if (linkError) {
      return {
        success: false,
        message:
          linkError.message,
      };
    }

    revalidateOrganizer(
      id
    );

    return {
      success: true,
      message:
        "Spielort verknüpft.",
    };
  }

  // ============================================================
  // NEUE LOCATION ANLEGEN
  // ============================================================

  async function createVenue(
    formData: FormData
  ) {
    "use server";

    const name =
      valueOrNull(
        formData.get(
          "venue_name"
        )
      );

    if (!name) {
      return {
        success: false,
        message:
          "Bitte einen Namen für die Location eingeben.",
      };
    }

    const venueOnly =
      formData.get(
        "venue_only"
      ) === "on";

    const {
      data: created,
      error,
    } =
      await supabaseAdmin
        .from("venues")
        .insert({
          name,

          city:
            valueOrNull(
              formData.get(
                "venue_city"
              )
            ),

          website:
            valueOrNull(
              formData.get(
                "venue_website"
              )
            ),

          relationship_status:
            venueOnly
              ? "🔴 Nicht relevant"
              : "⚪ Neu",

          acquisition_relevant:
            !venueOnly,
        })
        .select("id")
        .single();

    if (
      error ||
      !created
    ) {
      return {
        success: false,
        message:
          error?.message ||
          "Location konnte nicht angelegt werden.",
      };
    }

    const {
      error: linkError,
    } =
      await supabaseAdmin
        .from(
          "organizer_venues"
        )
        .insert({
          organizer_id:
            id,

          venue_id:
            created.id,
        });

    if (linkError) {
      return {
        success: false,
        message:
          linkError.message,
      };
    }

    revalidateOrganizer(
      id
    );

    return {
      success: true,
      message:
        "Location angelegt und verknüpft.",
    };
  }

  // ============================================================
  // LOCATION-STATUS ÄNDERN
  // ============================================================

  async function updateVenueLink(
    formData: FormData
  ) {
    "use server";

    const venueId =
      valueOrNull(
        formData.get(
          "venue_id"
        )
      );

    if (!venueId) {
      return {
        success: false,
        message:
          "Location fehlt.",
      };
    }

    const venueOnly =
      formData.get(
        "venue_only"
      ) === "on";

    const { error } =
      await supabaseAdmin
        .from("venues")
        .update({
          acquisition_relevant:
            !venueOnly,

          relationship_status:
            venueOnly
              ? "🔴 Nicht relevant"
              : "⚪ Neu",
        })
        .eq(
          "id",
          venueId
        );

    if (error) {
      return {
        success: false,
        message:
          error.message,
      };
    }

    revalidateOrganizer(
      id
    );

    return {
      success: true,
      message:
        "Spielort gespeichert.",
    };
  }

  // ============================================================
  // LOCATION-VERKNÜPFUNG LÖSEN
  // ============================================================

  async function unlinkVenue(
    formData: FormData
  ) {
    "use server";

    const venueId =
      valueOrNull(
        formData.get(
          "venue_id"
        )
      );

    if (!venueId) {
      return {
        success: false,
        message:
          "Location fehlt.",
      };
    }

    const { error } =
      await supabaseAdmin
        .from(
          "organizer_venues"
        )
        .delete()
        .eq(
          "organizer_id",
          id
        )
        .eq(
          "venue_id",
          venueId
        );

    if (error) {
      return {
        success: false,
        message:
          error.message,
      };
    }

    revalidateOrganizer(
      id
    );

    return {
      success: true,
      message:
        "Verknüpfung gelöst. Die Location bleibt erhalten.",
    };
  }

  // ============================================================
  // AKQUISE-RUNDE ANLEGEN
  // ============================================================

  async function createAcquisitionRound(
    formData: FormData
  ) {
    "use server";

    const name =
      valueOrNull(
        formData.get(
          "name"
        )
      );

    if (!name) {
      return {
        success: false,
        message:
          "Bitte einen Namen eingeben.",
      };
    }

    const {
      data: existing,
    } =
      await supabaseAdmin
        .from(
          "acquisition_rounds"
        )
        .select(
          "id, name"
        )
        .ilike(
          "name",
          name
        )
        .maybeSingle();

    if (existing) {
      return {
        success: true,
        message:
          "Diese Akquise-Runde gibt es bereits.",
        roundName:
          existing.name,
      };
    }

    const {
      data: created,
      error,
    } =
      await supabaseAdmin
        .from(
          "acquisition_rounds"
        )
        .insert({
          name,
        })
        .select(
          "id, name"
        )
        .single();

    if (
      error ||
      !created
    ) {
      return {
        success: false,
        message:
          error?.message ||
          "Akquise-Runde konnte nicht angelegt werden.",
      };
    }

    revalidateOrganizer(
      id
    );

    return {
      success: true,
      message:
        "Akquise-Runde hinzugefügt.",
      roundName:
        created.name,
    };
  }

  // ============================================================
  // AKQUISE STARTEN
  // ============================================================

  async function createAcquisition(
    formData: FormData
  ) {
    "use server";

    const roundName =
      valueOrNull(
        formData.get(
          "round_name"
        )
      );

    if (!roundName) {
      return {
        success: false,
        message:
          "Bitte eine Akquise-Runde auswählen.",
      };
    }

    const {
      data: activeExisting,
    } =
      await supabaseAdmin
        .from("acquisition")
        .select("id")
        .eq(
          "organizer_id",
          id
        )
        .is(
          "archived_at",
          null
        )
        .not(
          "status",
          "ilike",
          "%gebucht%"
        )
        .not(
          "status",
          "ilike",
          "%abgesagt%"
        )
        .limit(1);

    if (
      activeExisting &&
      activeExisting.length >
        0
    ) {
      return {
        success: false,
        message:
          "Für diesen Veranstalter gibt es bereits eine offene Akquise.",
      };
    }

    const { error } =
      await supabaseAdmin
        .from("acquisition")
        .insert({
          organizer_id:
            id,

          venue_id:
            null,

          program:
            roundName,

          status:
            "Neu",

          priority:
            "Normal",
        });

    if (error) {
      return {
        success: false,
        message:
          error.message,
      };
    }

    revalidateOrganizer(
      id
    );

    revalidatePath(
      "/admin/acquisition"
    );

    return {
      success: true,
      message:
        "Neue Akquise gestartet.",
    };
  }

  // ============================================================
  // AKQUISE-EINTRAG
  // ============================================================

  async function addActivity(
    formData: FormData
  ) {
    "use server";

    const acquisitionId =
      valueOrNull(
        formData.get(
          "acquisition_id"
        )
      );

    if (!acquisitionId) {
      return {
        success: false,
        message:
          "Keine aktive Akquise gefunden.",
      };
    }

    const {
      data: current,
      error: currentError,
    } =
      await supabaseAdmin
        .from("acquisition")
        .select(
          "id, status, archived_at"
        )
        .eq(
          "id",
          acquisitionId
        )
        .eq(
          "organizer_id",
          id
        )
        .single();

    if (
      currentError ||
      !current ||
      current.archived_at
    ) {
      return {
        success: false,
        message:
          "Diese Akquise gehört nicht zu diesem Veranstalter.",
      };
    }

    const activityType =
      valueOrNull(
        formData.get(
          "activity_type"
        )
      ) ||
      "Kontakt";

    const activityDate =
      valueOrNull(
        formData.get(
          "activity_date"
        )
      ) ||
      new Date()
        .toISOString()
        .slice(0, 10);

    const channel =
      valueOrNull(
        formData.get(
          "channel"
        )
      );

    const note =
      valueOrNull(
        formData.get(
          "note"
        )
      );

    const response =
      valueOrNull(
        formData.get(
          "response"
        )
      );

    const nextStep =
      valueOrNull(
        formData.get(
          "next_step"
        )
      );

    const followUpAt =
      valueOrNull(
        formData.get(
          "follow_up_at"
        )
      );

    let statusAfter =
      valueOrNull(
        formData.get(
          "status_after"
        )
      );

    if (
      activityType ===
      "Absage"
    ) {
      statusAfter =
        "Abgesagt";
    }

    if (
      activityType ===
      "Buchung"
    ) {
      statusAfter =
        "Gebucht 🎉";
    }

    if (
      !statusAfter &&
      activityType ===
        "Kontakt" &&
      [
        "Neu",
        "Vorqualifiziert",
        "Insta",
      ].includes(
        current.status || ""
      )
    ) {
      statusAfter =
        "Kontaktiert";
    }

    const {
      error: insertError,
    } =
      await supabaseAdmin
        .from(
          "acquisition_activities"
        )
        .insert({
          acquisition_id:
            acquisitionId,

          activity_date:
            activityDate,

          activity_type:
            activityType,

          channel,

          note,

          response,

          next_step:
            nextStep,

          follow_up_at:
            followUpAt,

          status_after:
            statusAfter,
        });

    if (insertError) {
      return {
        success: false,
        message:
          insertError.message,
      };
    }

    const update: Record<
      string,
      string | null
    > = {};

    if (
      [
        "Kontakt",
        "Rückmeldung",
        "Absage",
        "Buchung",
      ].includes(
        activityType
      )
    ) {
      update.last_contact_at =
        activityDate;

      update.contact_channel =
        channel;
    }

    if (note !== null) {
      update.contact_note =
        note;
    }

    if (response !== null) {
      update.response =
        response;
    }

    if (nextStep !== null) {
      update.next_step =
        nextStep;
    }

    if (
      followUpAt !== null
    ) {
      update.next_follow_up_at =
        followUpAt;
    }

    if (statusAfter) {
      update.status =
        statusAfter;
    }

    if (
      Object.keys(update)
        .length > 0
    ) {
      const {
        error: updateError,
      } =
        await supabaseAdmin
          .from("acquisition")
          .update(update)
          .eq(
            "id",
            acquisitionId
          )
          .eq(
            "organizer_id",
            id
          );

      if (updateError) {
        return {
          success: false,
          message:
            updateError.message,
        };
      }
    }

    revalidateOrganizer(
      id
    );

    revalidatePath(
      "/admin/acquisition"
    );

    revalidatePath(
      "/admin"
    );

    return {
      success: true,
      message:
        "Akquise-Eintrag gespeichert.",
    };
  }

  // ============================================================
  // AKQUISE-EINTRAG LÖSCHEN
  // ============================================================

  async function deleteActivity(
    formData: FormData
  ) {
    "use server";

    const activityId =
      valueOrNull(
        formData.get(
          "activity_id"
        )
      );

    const acquisitionId =
      valueOrNull(
        formData.get(
          "acquisition_id"
        )
      );

    if (
      !activityId ||
      !acquisitionId
    ) {
      return {
        success: false,
        message:
          "Eintrag fehlt.",
      };
    }

    const { error } =
      await supabaseAdmin
        .from(
          "acquisition_activities"
        )
        .delete()
        .eq(
          "id",
          activityId
        )
        .eq(
          "acquisition_id",
          acquisitionId
        );

    if (error) {
      return {
        success: false,
        message:
          error.message,
      };
    }

    await recomputeAcquisition(
      acquisitionId
    );

    revalidateOrganizer(
      id
    );

    revalidatePath(
      "/admin/acquisition"
    );

    revalidatePath(
      "/admin"
    );

    return {
      success: true,
      message:
        "Eintrag gelöscht.",
    };
  }

  // ============================================================
  // AKQUISE LÖSCHEN
  // ============================================================

  async function deleteAcquisition(
    formData: FormData
  ) {
    "use server";

    const acquisitionId =
      valueOrNull(
        formData.get(
          "acquisition_id"
        )
      );

    if (!acquisitionId) {
      return {
        success: false,
        message:
          "Akquise fehlt.",
      };
    }

    await supabaseAdmin
      .from(
        "acquisition_activities"
      )
      .delete()
      .eq(
        "acquisition_id",
        acquisitionId
      );

    const { error } =
      await supabaseAdmin
        .from("acquisition")
        .delete()
        .eq(
          "id",
          acquisitionId
        )
        .eq(
          "organizer_id",
          id
        );

    if (error) {
      return {
        success: false,
        message:
          error.message,
      };
    }

    revalidateOrganizer(
      id
    );

    revalidatePath(
      "/admin/acquisition"
    );

    revalidatePath(
      "/admin"
    );

    return {
      success: true,
      message:
        "Akquise gelöscht.",
    };
  }

  // ============================================================
  // VERANSTALTER LÖSCHEN
  // ============================================================

  async function deleteOrganizer() {
    "use server";

    const {
      data: acquisitions,
    } =
      await supabaseAdmin
        .from("acquisition")
        .select("id")
        .eq(
          "organizer_id",
          id
        );

    const acquisitionIds =
      (
        acquisitions || []
      ).map(
        (item) => item.id
      );

    if (
      acquisitionIds.length >
      0
    ) {
      await supabaseAdmin
        .from(
          "acquisition_activities"
        )
        .delete()
        .in(
          "acquisition_id",
          acquisitionIds
        );

      await supabaseAdmin
        .from("acquisition")
        .delete()
        .eq(
          "organizer_id",
          id
        );
    }

    await supabaseAdmin
      .from(
        "organizer_venues"
      )
      .delete()
      .eq(
        "organizer_id",
        id
      );

    await supabaseAdmin
      .from(
        "organizer_contacts"
      )
      .delete()
      .eq(
        "organizer_id",
        id
      );

    const { error } =
      await supabaseAdmin
        .from("organizers")
        .delete()
        .eq(
          "id",
          id
        );

    if (error) {
      throw new Error(
        error.message
      );
    }

    revalidatePath(
      "/admin/organizers"
    );

    redirect(
      "/admin/organizers"
    );
  }

  // ============================================================
  // AKQUISE NEU BERECHNEN
  // ============================================================

  async function recomputeAcquisition(
    acquisitionId: string
  ) {
    const {
      data: activities,
    } =
      await supabaseAdmin
        .from(
          "acquisition_activities"
        )
        .select(`
          activity_date,
          activity_type,
          channel,
          note,
          response,
          next_step,
          follow_up_at,
          status_after,
          created_at
        `)
        .eq(
          "acquisition_id",
          acquisitionId
        )
        .order(
          "activity_date",
          {
            ascending: false,
          }
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        );

    const list =
      activities || [];

    const latestContact =
      list.find(
        (activity) =>
          [
            "Kontakt",
            "Rückmeldung",
            "Absage",
            "Buchung",
          ].includes(
            activity.activity_type ||
              ""
          )
      );

    const latestNote =
      list.find(
        (item) =>
          item.note
      );

    const latestResponse =
      list.find(
        (item) =>
          item.response
      );

    const latestNextStep =
      list.find(
        (item) =>
          item.next_step
      );

    const latestFollowUp =
      list.find(
        (item) =>
          item.follow_up_at
      );

    const latestStatus =
      list.find(
        (item) =>
          item.status_after
      );

    await supabaseAdmin
      .from("acquisition")
      .update({
        last_contact_at:
          latestContact
            ?.activity_date ||
          null,

        contact_channel:
          latestContact
            ?.channel ||
          null,

        contact_note:
          latestNote?.note ||
          null,

        response:
          latestResponse
            ?.response ||
          null,

        next_step:
          latestNextStep
            ?.next_step ||
          null,

        next_follow_up_at:
          latestFollowUp
            ?.follow_up_at ||
          null,

        status:
          latestStatus
            ?.status_after ||
          "Neu",
      })
      .eq(
        "id",
        acquisitionId
      );
  }

  return (
    <OrganizerClient
      organizer={
        organizer
      }

      contacts={
        organizer.organizer_contacts ||
        []
      }

      venues={
        allVenues || []
      }

      linkedVenues={
        linkedVenues as any[]
      }

      acquisition={
        acquisition || []
      }

      acquisitionActivities={
        acquisitionActivities
      }

      acquisitionRounds={
        acquisitionRounds ||
        []
      }

      saveOrganizer={
        saveOrganizer
      }

      createShow={
        createShow
      }

      addContact={
        addContact
      }

      updateContact={
        updateContact
      }

      deleteContact={
        deleteContact
      }

      linkVenue={
        linkVenue
      }

      createVenue={
        createVenue
      }

      updateVenueLink={
        updateVenueLink
      }

      unlinkVenue={
        unlinkVenue
      }

      createAcquisition={
        createAcquisition
      }

      createAcquisitionRound={
        createAcquisitionRound
      }

      addActivity={
        addActivity
      }

      deleteActivity={
        deleteActivity
      }

      deleteAcquisition={
        deleteAcquisition
      }

      deleteOrganizer={
        deleteOrganizer
      }
    />
  );
}


// ============================================================
// HELPERS
// ============================================================

function valueOrNull(
  value:
    | FormDataEntryValue
    | null
) {
  if (value === null) {
    return null;
  }

  const text =
    String(value).trim();

  return text === ""
    ? null
    : text;
}


function revalidateOrganizer(
  id: string
) {
  revalidatePath(
    `/admin/organizers/${id}`
  );

  revalidatePath(
    "/admin/organizers"
  );

  revalidatePath(
    "/admin/locations"
  );
}


function createToken(
  source: string
) {
  const cleanSource =
    source
      .toLowerCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      )
      .slice(0, 18) ||
    "show";

  const random =
    crypto
      .randomUUID()
      .slice(0, 6);

  return `show-${cleanSource}-${random}`;
}