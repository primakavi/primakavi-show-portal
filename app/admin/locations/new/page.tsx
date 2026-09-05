import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import LocationClient from "../[id]/LocationClient";

export default async function NewLocationPage({
  searchParams,
}: {
  searchParams: Promise<{
    returnTo?: string;
  }>;
}) {
  const params = await searchParams;
  const returnTo = params.returnTo || "";

  const emptyVenue = {
    id: "",
    legacy_id: null,

    name: "",

    street: null,
    postal_code: null,
    city: null,
    state: null,
    country: "DE",

    website: null,

    capacity: null,
    venue_type: null,
    audience_notes: null,

    contact_name: null,
    contact_role: null,
    contact_email: null,
    contact_phone: null,

    contact_name_2: null,
    contact_role_2: null,
    contact_email_2: null,
    contact_phone_2: null,

    booking_email: null,

    relationship_status: "⚪ Neu",

    lat: null,
    lng: null,

    internal_notes: null,
    special_notes: null,

    played_before: false,

    season_notes: null,
    program_focus: [],

    instagram_url: null,
    facebook_url: null,
    logo_url: null,
  };

  async function createLocation(
    formData: FormData
  ) {
    "use server";

    const name = String(
      formData.get("name") || ""
    ).trim();

    if (!name) {
      return {
        success: false,
        message:
          "Bitte einen Namen für die Location eintragen.",
      };
    }

    // ------------------------------------------------------------
    // NÄCHSTE LEGACY-ID ERMITTELN
    // ------------------------------------------------------------

    const {
      data: existingVenues,
      error: idError,
    } = await supabaseAdmin
      .from("venues")
      .select("legacy_id")
      .not("legacy_id", "is", null);

    if (idError) {
      return {
        success: false,
        message: idError.message,
      };
    }

    const highestNumber = (
      existingVenues || []
    ).reduce((highest, venue) => {
      const match =
        venue.legacy_id?.match(
          /^LOC-(\d+)$/
        );

      if (!match) {
        return highest;
      }

      return Math.max(
        highest,
        Number(match[1])
      );
    }, 0);

    const nextLegacyId = `LOC-${String(
      highestNumber + 1
    ).padStart(3, "0")}`;

    // ------------------------------------------------------------
    // FORMULARDATEN
    // ------------------------------------------------------------

    const capacityValue = String(
      formData.get("capacity") || ""
    ).trim();

    const programFocusRaw = String(
      formData.get("program_focus") || ""
    ).trim();

    const payload = {
      legacy_id: nextLegacyId,

      name,

      street: clean(
        formData.get("street")
      ),

      postal_code: clean(
        formData.get("postal_code")
      ),

      city: clean(
        formData.get("city")
      ),

      state: clean(
        formData.get("state")
      ),

      country:
        clean(
          formData.get("country")
        ) || "DE",

      website: clean(
        formData.get("website")
      ),

      capacity: capacityValue
        ? Number(capacityValue)
        : null,

      venue_type: clean(
        formData.get("venue_type")
      ),

      audience_notes: clean(
        formData.get(
          "audience_notes"
        )
      ),

      contact_name: clean(
        formData.get(
          "contact_name"
        )
      ),

      contact_role: clean(
        formData.get(
          "contact_role"
        )
      ),

      contact_email: clean(
        formData.get(
          "contact_email"
        )
      ),

      contact_phone: clean(
        formData.get(
          "contact_phone"
        )
      ),

      contact_name_2: clean(
        formData.get(
          "contact_name_2"
        )
      ),

      contact_role_2: clean(
        formData.get(
          "contact_role_2"
        )
      ),

      contact_email_2: clean(
        formData.get(
          "contact_email_2"
        )
      ),

      contact_phone_2: clean(
        formData.get(
          "contact_phone_2"
        )
      ),

      booking_email: clean(
        formData.get(
          "booking_email"
        )
      ),

      relationship_status:
        clean(
          formData.get(
            "relationship_status"
          )
        ) || "⚪ Neu",

      internal_notes: clean(
        formData.get(
          "internal_notes"
        )
      ),

      special_notes: clean(
        formData.get(
          "special_notes"
        )
      ),

      played_before:
        formData.get(
          "played_before"
        ) === "on",

      season_notes: clean(
        formData.get(
          "season_notes"
        )
      ),

      program_focus:
        programFocusRaw
          ? programFocusRaw
              .split(",")
              .map((item) =>
                item.trim()
              )
              .filter(Boolean)
          : [],

      instagram_url: clean(
        formData.get(
          "instagram_url"
        )
      ),

      facebook_url: clean(
        formData.get(
          "facebook_url"
        )
      ),

      logo_url: clean(
        formData.get(
          "logo_url"
        )
      ),

      lat: null,
      lng: null,
    };

    // ------------------------------------------------------------
    // LOCATION ANLEGEN
    // ------------------------------------------------------------

    const { data: created, error } =
      await supabaseAdmin
        .from("venues")
        .insert(payload)
        .select("id")
        .single();

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    // ------------------------------------------------------------
    // RÜCKSPRUNG
    // ------------------------------------------------------------

    if (returnTo === "acquisition") {
      redirect(
        `/admin/acquisition/new?venue=${encodeURIComponent(
          created.id
        )}`
      );
    }

    redirect(
      `/admin/locations/${created.id}`
    );
  }

  return (
    <LocationClient
      venue={emptyVenue}
      shows={[]}
      saveLocation={createLocation}
      isNew
    />
  );
}

function clean(
  value: FormDataEntryValue | null
) {
  const stringValue = String(
    value || ""
  ).trim();

  return stringValue || null;
}