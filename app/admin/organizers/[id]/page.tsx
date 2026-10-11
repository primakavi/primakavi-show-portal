import {

  notFound,

  redirect,

} from "next/navigation";

import { revalidatePath } from "next/cache";

import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

import OrganizerClient from "./OrganizerClient";

// ============================================================

// AKQUISE NEU BERECHNEN

// ============================================================

// Historie ist die Quelle der Wahrheit. Der Akquise-Datensatz enthält nur
// abgeleitete Kontaktfelder. Vorgangsstatus bleibt unabhängig bearbeitbar.
const CONTACT_TYPES = new Set([
  "Kontakt", "Kontaktversuch", "Rückmeldung", "Telefonat",
  "Persönlicher Kontakt", "Absage", "Buchung", "Weiterleitung",
]);

async function recomputeAcquisition(acquisitionId: string) {
  const { data, error } = await supabaseAdmin
    .from("acquisition_activities")
    .select("activity_date, activity_type, channel, note, response, next_step, follow_up_at, created_at")
    .eq("acquisition_id", acquisitionId)
    .order("activity_date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const entries = data || [];
  const contact = entries.find((entry) => CONTACT_TYPES.has(entry.activity_type || ""));
  const latestNote = entries.find((entry) => entry.note?.trim());
  const latestResponse = entries.find((entry) => entry.response?.trim());
  const latestNextStep = entries.find((entry) => entry.next_step?.trim());
  const latestFollowUp = entries.find((entry) => entry.follow_up_at);

  const { error: updateError } = await supabaseAdmin
    .from("acquisition")
    .update({
      last_contact_at: contact?.activity_date ?? null,
      contact_channel: contact?.channel ?? null,
      contact_note: latestNote?.note ?? null,
      response: latestResponse?.response ?? null,
      next_step: latestNextStep?.next_step ?? null,
      next_follow_up_at: latestFollowUp?.follow_up_at ?? null,
    })
    .eq("id", acquisitionId);
  if (updateError) throw new Error(updateError.message);
}

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

      street,

      postal_code,

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

  // SHOWS DIESES VERANSTALTERS

  // ============================================================

  const {

    data: shows,

    error: showsError,

  } = await supabaseAdmin

    .schema("booking")

    .from("shows")

    .select(`

      id,

      show_date,

      program,

      internal_status,

      start_time,

      venue,

      city

    `)

    .eq(

      "organizer_id",

      id

    )

    .order(

      "show_date",

      {

        ascending: true,

        nullsFirst: false,

      }

    );

  if (showsError) {

    console.error(

      "Shows des Veranstalters konnten nicht geladen werden:",

      showsError

    );

  }

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

      type,

      archived_at,

      created_at

    `)

    .eq("active", true)

    .eq("type", "acquisition")

    .is("archived_at", null)

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

      round_id,

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

          subject,

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

  // NEWSLETTER-HISTORIE DES VERANSTALTERS

  // Zuordnung über Akquise-Vorgang und bekannte Kontakt-E-Mail-Adressen.

  // Gleiche Empfänger werden anhand ihrer ID nur einmal angezeigt.

  // ============================================================

  const mailingColumns = `
    id, round_id, venue_id, email, sent_at, scheduled_at,
    opened_at, clicked_at, unsubscribed_at, bounced_at,
    last_clicked_url, reaction, notes, acquisition_id, created_at
  `;

  const organizerEmails = Array.from(new Set(
    [organizer.email, ...(organizer.organizer_contacts || []).map((contact) => contact.email)]
      .map((email) => String(email || "").trim().toLowerCase())
      .filter(Boolean)
  ));

  const [byAcquisition, byEmail] = await Promise.all([
    acquisitionIds.length
      ? supabaseAdmin.from("mailing_recipients")
          .select(mailingColumns)
          .in("acquisition_id", acquisitionIds)
      : Promise.resolve({ data: [], error: null }),
    organizerEmails.length
      ? supabaseAdmin.from("mailing_recipients")
          .select(mailingColumns)
          .in("email", organizerEmails)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (byAcquisition.error) {
    console.error("Newsletter nach Akquise konnten nicht geladen werden:", byAcquisition.error);
  }
  if (byEmail.error) {
    console.error("Newsletter nach Kontaktadresse konnten nicht geladen werden:", byEmail.error);
  }

  const mailingRecipientMap = new Map<string, NonNullable<typeof byAcquisition.data>[number]>();
  for (const recipient of [...(byAcquisition.data || []), ...(byEmail.data || [])]) {
    mailingRecipientMap.set(recipient.id, recipient);
  }
  const mailingRecipients = Array.from(mailingRecipientMap.values());
  const mailingRoundIds = Array.from(new Set(
    mailingRecipients.map((recipient) => recipient.round_id).filter((value): value is string => Boolean(value))
  ));

  const { data: mailingRounds, error: mailingRoundsError } = mailingRoundIds.length
    ? await supabaseAdmin.from("acquisition_rounds")
        .select("id, name")
        .in("id", mailingRoundIds)
    : { data: [], error: null };

  if (mailingRoundsError) {
    console.error("Newsletter-Runden konnten nicht geladen werden:", mailingRoundsError);
  }
  const mailingRoundNames = new Map(
    (mailingRounds || []).map((round) => [round.id, round.name])
  );
  const mailingHistory = mailingRecipients.map((recipient) => ({
    ...recipient,
    round_name: (recipient.round_id && mailingRoundNames.get(recipient.round_id)) || "Newsletter",
  }));

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

          street:

            valueOrNull(

              formData.get(

                "street"

              )

            ),

          postal_code:

            valueOrNull(

              formData.get(

                "postal_code"

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

    // Beim normalen Verknüpfen verändern wir die Location NICHT.

    // Nur der bewusst gesetzte Haken markiert sie als reine Spielstätte.

    if (venueOnly) {

      const {

        error: venueError,

      } =

        await supabaseAdmin

          .from("venues")

          .update({

            acquisition_relevant:

              false,

            relationship_status:

              "🔴 Nicht relevant",

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

        venueOnly

          ? "Spielstätte verknüpft und bewusst als nicht direkt akquirierbar markiert."

          : "Spielstätte verknüpft. Der Location-Status blieb unverändert.",

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

        venueOnly

          ? "Location angelegt, verknüpft und als reine Spielstätte markiert."

          : "Location angelegt und verknüpft.",

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

    const {

      data: currentVenue,

      error: currentVenueError,

    } =

      await supabaseAdmin

        .from("venues")

        .select(`

          acquisition_relevant,

          relationship_status

        `)

        .eq(

          "id",

          venueId

        )

        .single();

    if (

      currentVenueError ||

      !currentVenue

    ) {

      return {

        success: false,

        message:

          currentVenueError?.message ||

          "Location konnte nicht geladen werden.",

      };

    }

    const venueUpdate:

      Record<

        string,

        string | boolean | null

      > = {

        acquisition_relevant:

          !venueOnly,

      };

    if (venueOnly) {

      venueUpdate.relationship_status =

        "🔴 Nicht relevant";

    } else if (

      currentVenue.relationship_status ===

      "🔴 Nicht relevant"

    ) {

      venueUpdate.relationship_status =

        "⚪ Neu";

    }

    const { error } =

      await supabaseAdmin

        .from("venues")

        .update(

          venueUpdate

        )

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

        venueOnly

          ? "Als reine Spielstätte gespeichert."

          : "Location wieder für direkte Akquise freigegeben.",

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

  // AKQUISE ANLEGEN – RUNDE + ERSTER EINTRAG IN EINEM SCHRITT

  // ============================================================

  async function createAcquisition(formData: FormData) {

    "use server";

    let roundId = valueOrNull(formData.get("round_id"));

    const newRoundName = valueOrNull(formData.get("new_round_name"));

    if (!roundId && !newRoundName) {

      return {

        success: false,

        message: "Bitte eine Akquise-Runde auswählen.",

      };

    }

    // Wie bei Locations: pro Veranstalter nur ein offener Akquise-Vorgang.

    const { data: activeExisting, error: activeError } = await supabaseAdmin

      .from("acquisition")

      .select("id")

      .eq("organizer_id", id)

      .is("archived_at", null)

      .not("status", "ilike", "%gebucht%")

      .not("status", "ilike", "%abgesagt%")

      .limit(1);

    if (activeError) {

      return { success: false, message: activeError.message };

    }

    if (activeExisting && activeExisting.length > 0) {

      return {

        success: false,

        message: "Für diesen Veranstalter gibt es bereits einen offenen Akquise-Vorgang.",

      };

    }

    let roundName: string | null = null;

    if (newRoundName) {

      const { data: existingRound } = await supabaseAdmin

        .from("acquisition_rounds")

        .select("id, name, active, type, archived_at")

        .ilike("name", newRoundName)

        .maybeSingle();

      if (existingRound) {

        if (existingRound.type !== "acquisition") {

          return {

            success: false,

            message: "Eine Runde mit diesem Namen existiert bereits, gehört aber nicht zur Akquise.",

          };

        }

        if (!existingRound.active || existingRound.archived_at) {

          const { data: reactivatedRound, error: reactivateError } = await supabaseAdmin

            .from("acquisition_rounds")

            .update({ active: true, archived_at: null })

            .eq("id", existingRound.id)

            .select("id, name")

            .single();

          if (reactivateError || !reactivatedRound) {

            return {

              success: false,

              message: reactivateError?.message || "Akquise-Runde konnte nicht wieder aktiviert werden.",

            };

          }

          roundId = reactivatedRound.id;

          roundName = reactivatedRound.name;

        } else {

          roundId = existingRound.id;

          roundName = existingRound.name;

        }

      } else {

        const { data: createdRound, error: roundError } = await supabaseAdmin

          .from("acquisition_rounds")

          .insert({ name: newRoundName, active: true, type: "acquisition" })

          .select("id, name")

          .single();

        if (roundError || !createdRound) {

          return {

            success: false,

            message: roundError?.message || "Akquise-Runde konnte nicht angelegt werden.",

          };

        }

        roundId = createdRound.id;

        roundName = createdRound.name;

      }

    }

    if (roundId && !roundName) {

      const { data: selectedRound, error: roundError } = await supabaseAdmin

        .from("acquisition_rounds")

        .select("id, name, active, type, archived_at")

        .eq("id", roundId)

        .single();

      if (

        roundError ||

        !selectedRound ||

        selectedRound.type !== "acquisition" ||

        !selectedRound.active ||

        selectedRound.archived_at

      ) {

        return {

          success: false,

          message: "Die ausgewählte Akquise-Runde ist nicht mehr aktiv.",

        };

      }

      roundName = selectedRound.name;

    }

    const { error } = await supabaseAdmin

      .from("acquisition")

      .insert({

        organizer_id: id,

        venue_id: null,

        round_id: roundId,

        program: roundName,

        status: "Neu",

        priority: "Normal",

      });

    if (error) {

      return { success: false, message: error.message };

    }

    revalidateOrganizer(id);

    revalidatePath("/admin/acquisition");

    revalidatePath("/admin");

    return {

      success: true,

      message: "Neue Akquise gestartet.",

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

      "Kontaktversuch";

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

    const subject =

      valueOrNull(

        formData.get(

          "subject"

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

        "Kontaktversuch" &&

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

          subject,

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

    // Auch rückdatierte Einträge dürfen den aktuellen Kontaktstand nicht überschreiben.
  await recomputeAcquisition(acquisitionId);
  if (statusAfter) {
    const { error: statusError } = await supabaseAdmin
      .from("acquisition")
      .update({ status: statusAfter })
      .eq("id", acquisitionId)
      .eq("organizer_id", id);
    if (statusError) return { success: false, message: statusError.message };
  }

  const organizerRelationship =

      activityType === "Kontaktversuch"

        ? "🟡 Angeschrieben"

        : ["Rückmeldung", "Telefonat", "Persönlicher Kontakt", "Absage", "Buchung"].includes(activityType)

          ? "🟠 Kontakt"

          : null;

    if (organizerRelationship) {

      const allowedCurrentStatuses =

        organizerRelationship === "🟡 Angeschrieben"

          ? ["⚪ Neu", "🔵 Neu", "🟡 Angeschrieben"]

          : ["⚪ Neu", "🔵 Neu", "🟡 Angeschrieben", "🟠 Kontakt"];

      const { error: organizerStatusError } = await supabaseAdmin

        .from("organizers")

        .update({ relationship_status: organizerRelationship })

        .eq("id", id)

        .in("relationship_status", allowedCurrentStatuses);

      if (organizerStatusError) {

        console.error("Veranstalter-Status konnte nicht aktualisiert werden:", organizerStatusError);

      }

    }

    revalidatePath(`/admin/acquisition/${acquisitionId}`);

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

  // AKQUISE-EINTRAG BEARBEITEN

  // ============================================================

  async function updateActivity(

    formData: FormData

  ) {

    "use server";

    const activityId = valueOrNull(formData.get("activity_id"));

    const acquisitionId = valueOrNull(formData.get("acquisition_id"));

    if (!activityId || !acquisitionId) {

      return { success: false, message: "Eintrag fehlt." };

    }

    const { data: ownedAcquisition } = await supabaseAdmin

      .from("acquisition")

      .select("id")

      .eq("id", acquisitionId)

      .eq("organizer_id", id)

      .single();

    if (!ownedAcquisition) {

      return {

        success: false,

        message: "Diese Akquise gehört nicht zu diesem Veranstalter.",

      };

    }

    const activityType = valueOrNull(formData.get("activity_type")) || "Kontakt";

    const activityDate =

      valueOrNull(formData.get("activity_date")) ||

      new Date().toISOString().slice(0, 10);

    const channel = valueOrNull(formData.get("channel"));

    const subject = valueOrNull(formData.get("subject"));

    const note = valueOrNull(formData.get("note"));

    const response = valueOrNull(formData.get("response"));

    const nextStep = valueOrNull(formData.get("next_step"));

    const followUpAt = valueOrNull(formData.get("follow_up_at"));

    let statusAfter = valueOrNull(formData.get("status_after"));

    if (activityType === "Absage") statusAfter = "Abgesagt";

    if (activityType === "Buchung") statusAfter = "Gebucht 🎉";

    const { error } = await supabaseAdmin

      .from("acquisition_activities")

      .update({

        activity_date: activityDate,

        activity_type: activityType,

        channel,

        subject,

        note,

        response,

        next_step: nextStep,

        follow_up_at: followUpAt,

        status_after: statusAfter,

      })

      .eq("id", activityId)

      .eq("acquisition_id", acquisitionId);

    if (error) {

      return { success: false, message: error.message };

    }

    await recomputeAcquisition(acquisitionId);

    revalidateOrganizer(id);

    revalidatePath("/admin/acquisition");
  revalidatePath(`/admin/acquisition/${acquisitionId}`);

    revalidatePath("/admin");

    return { success: true, message: "Akquise-Eintrag gespeichert." };

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

    const { data: ownedAcquisition, error: ownershipError } = await supabaseAdmin
    .from("acquisition")
    .select("id")
    .eq("id", acquisitionId)
    .eq("organizer_id", id)
    .maybeSingle();
  if (ownershipError || !ownedAcquisition) {
    return { success: false, message: "Akquise gehört nicht zu diesem Veranstalter." };
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

    revalidatePath(`/admin/acquisition/${acquisitionId}`);

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

      shows={

        shows || []

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

    mailingHistory={mailingHistory}

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

      addActivity={

        addActivity

      }

      updateActivity={

        updateActivity

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
