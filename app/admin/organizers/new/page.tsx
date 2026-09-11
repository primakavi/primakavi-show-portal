import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import LocationPicker from "./LocationPicker";

const RELATIONSHIP_OPTIONS = [
  "",
  "⚪ Neu",
  "🟠 Kontakt",
  "🟢 Bestandskontakt",
  "🔴 Nicht relevant",
];

const ORGANIZER_TYPES = [
  "",
  "Comedy-Format",
  "Comedy Club",
  "TV / Redaktion",
  "Produktionsfirma",
  "Veranstalter",
  "Festival",
  "Netzwerk / Initiative",
  "Sonstiges",
];

export default async function NewOrganizerPage() {
  // ------------------------------------------------------------
  // LOCATIONS FÜR SUCHE
  // ------------------------------------------------------------

  const { data: venues, error: venuesError } =
    await supabaseAdmin
      .from("venues")
      .select(`
        id,
        name,
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

  // ------------------------------------------------------------
  // VERANSTALTER ANLEGEN
  // ------------------------------------------------------------

  async function createOrganizer(
    formData: FormData
  ) {
    "use server";

    const name = clean(
      formData.get("name")
    );

    if (!name) {
      throw new Error(
        "Bitte einen Namen für den Veranstalter eingeben."
      );
    }

    const venueMode = clean(
      formData.get("venue_mode")
    );

    const existingVenueId =
      clean(
        formData.get("venue_id")
      );

    const newVenueName =
      clean(
        formData.get(
          "new_venue_name"
        )
      );

    const newVenueCity =
      clean(
        formData.get(
          "new_venue_city"
        )
      );

    const newVenueWebsite =
      clean(
        formData.get(
          "new_venue_website"
        )
      );

    const venueOnly =
      formData.get(
        "venue_only"
      ) === "on";

    // ------------------------------------------------------------
    // 1. VERANSTALTER
    // ------------------------------------------------------------

    const {
      data: created,
      error: organizerError,
    } = await supabaseAdmin
      .from("organizers")
      .insert({
        name,

        organizer_type: clean(
          formData.get(
            "organizer_type"
          )
        ),

        website: clean(
          formData.get("website")
        ),

        email: clean(
          formData.get("email")
        ),

        phone: clean(
          formData.get("phone")
        ),

        city: clean(
          formData.get("city")
        ),

        country:
          clean(
            formData.get("country")
          ) || "Deutschland",

        relationship_status:
          clean(
            formData.get(
              "relationship_status"
            )
          ) || "⚪ Neu",

        notes: clean(
          formData.get("notes")
        ),
      })
      .select("id")
      .single();

    if (
      organizerError ||
      !created
    ) {
      throw new Error(
        organizerError?.message ||
          "Veranstalter konnte nicht angelegt werden."
      );
    }

    // ------------------------------------------------------------
    // 2. ANSPRECHPARTNER 1
    // ------------------------------------------------------------

    const contact1Name =
      clean(
        formData.get(
          "contact_name"
        )
      );

    if (contact1Name) {
      const { error } =
        await supabaseAdmin
          .from(
            "organizer_contacts"
          )
          .insert({
            organizer_id:
              created.id,

            name: contact1Name,

            role: clean(
              formData.get(
                "contact_role"
              )
            ),

            email: clean(
              formData.get(
                "contact_email"
              )
            ),

            phone: clean(
              formData.get(
                "contact_phone"
              )
            ),

            is_primary: true,
          });

      if (error) {
        throw new Error(
          error.message
        );
      }
    }

    // ------------------------------------------------------------
    // 3. ANSPRECHPARTNER 2
    // ------------------------------------------------------------

    const contact2Name =
      clean(
        formData.get(
          "contact_name_2"
        )
      );

    if (contact2Name) {
      const { error } =
        await supabaseAdmin
          .from(
            "organizer_contacts"
          )
          .insert({
            organizer_id:
              created.id,

            name: contact2Name,

            role: clean(
              formData.get(
                "contact_role_2"
              )
            ),

            email: clean(
              formData.get(
                "contact_email_2"
              )
            ),

            phone: clean(
              formData.get(
                "contact_phone_2"
              )
            ),

            is_primary: false,
          });

      if (error) {
        throw new Error(
          error.message
        );
      }
    }

    // ------------------------------------------------------------
    // 4. LOCATION BESTIMMEN
    // ------------------------------------------------------------

    let venueId:
      | string
      | null = null;

    // ------------------------------------------------------------
    // BESTEHENDE LOCATION
    // ------------------------------------------------------------

    if (
      venueMode === "existing" &&
      existingVenueId
    ) {
      venueId =
        existingVenueId;

      const {
        error: venueUpdateError,
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
            existingVenueId
          );

      if (
        venueUpdateError
      ) {
        throw new Error(
          venueUpdateError.message
        );
      }
    }

    // ------------------------------------------------------------
    // NEUE LOCATION
    // ------------------------------------------------------------

    if (
      venueMode === "new" &&
      newVenueName
    ) {
      const {
        data: newVenue,
        error: newVenueError,
      } =
        await supabaseAdmin
          .from("venues")
          .insert({
            name:
              newVenueName,

            city:
              newVenueCity,

            website:
              newVenueWebsite,

            acquisition_relevant:
              !venueOnly,

            relationship_status:
              venueOnly
                ? "🔴 Nicht relevant"
                : "⚪ Neu",
          })
          .select("id")
          .single();

      if (
        newVenueError ||
        !newVenue
      ) {
        throw new Error(
          newVenueError
            ?.message ||
            "Location konnte nicht angelegt werden."
        );
      }

      venueId =
        newVenue.id;
    }

    // ------------------------------------------------------------
    // 5. VERANSTALTER ↔ LOCATION VERKNÜPFEN
    // ------------------------------------------------------------

    if (venueId) {
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
                created.id,

              venue_id:
                venueId,

              is_primary:
                true,
            },
            {
              onConflict:
                "organizer_id,venue_id",
            }
          );

      if (linkError) {
        throw new Error(
          linkError.message
        );
      }
    }

    // ------------------------------------------------------------
    // FERTIG
    // ------------------------------------------------------------

    redirect(
      `/admin/organizers/${created.id}`
    );
  }

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------

  return (
    <main className="min-h-screen bg-[#fbf7ef] px-8 py-8 text-zinc-950">
      <div className="mx-auto max-w-7xl space-y-5">

        {/* HEADER */}

        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/admin/organizers"
              className="text-sm font-bold text-zinc-400 transition hover:text-zinc-950"
            >
              ← Veranstalter
            </Link>

            <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
              primakavi · veranstalter-akte
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight">
              Neuer Veranstalter
            </h1>

            <p className="mt-2 text-zinc-500">
              Neuen Veranstalter anlegen.
            </p>
          </div>
        </header>

        <form
          action={createOrganizer}
          className="space-y-5"
        >

          {/* STAMMDATEN */}

          <Card
            title="Stammdaten"
            icon="🏢"
            description="Grunddaten des Veranstalters."
          >
            <div className="grid gap-4 md:grid-cols-12">

              <Field
                label="Veranstalter"
                name="name"
                required
                className="md:col-span-8"
              />

              <SelectField
                label="Beziehungsstatus"
                name="relationship_status"
                defaultValue="⚪ Neu"
                options={
                  RELATIONSHIP_OPTIONS
                }
                className="md:col-span-4"
              />

              <SelectField
                label="Typ"
                name="organizer_type"
                options={
                  ORGANIZER_TYPES
                }
                className="md:col-span-4"
              />

              <Field
                label="Ort / Sitz"
                name="city"
                className="md:col-span-4"
              />

              <Field
                label="Land"
                name="country"
                defaultValue="Deutschland"
                className="md:col-span-4"
              />

              <Field
                label="Website"
                name="website"
                className="md:col-span-6"
              />

              <Field
                label="Allgemeine E-Mail"
                name="email"
                type="email"
                className="md:col-span-3"
              />

              <Field
                label="Telefon"
                name="phone"
                className="md:col-span-3"
              />

            </div>
          </Card>

          {/* ANSPRECHPARTNER */}

          <div className="grid gap-5 xl:grid-cols-2">

            <Card
              title="Ansprechpartner 1"
              icon="👤"
            >
              <div className="grid gap-4 md:grid-cols-2">

                <Field
                  label="Name"
                  name="contact_name"
                  className="md:col-span-2"
                />

                <Field
                  label="Funktion"
                  name="contact_role"
                  className="md:col-span-2"
                />

                <Field
                  label="E-Mail"
                  name="contact_email"
                  type="email"
                />

                <Field
                  label="Telefon"
                  name="contact_phone"
                />

              </div>
            </Card>

            <Card
              title="Ansprechpartner 2"
              icon="👥"
            >
              <div className="grid gap-4 md:grid-cols-2">

                <Field
                  label="Name"
                  name="contact_name_2"
                  className="md:col-span-2"
                />

                <Field
                  label="Funktion"
                  name="contact_role_2"
                  className="md:col-span-2"
                />

                <Field
                  label="E-Mail"
                  name="contact_email_2"
                  type="email"
                />

                <Field
                  label="Telefon"
                  name="contact_phone_2"
                />

              </div>
            </Card>

          </div>

          {/* SPIELORT */}

          <Card
            title="Spielort"
            icon="🏛️"
            description="Optional: Location auswählen oder direkt neu anlegen."
          >
            <LocationPicker
              venues={
                venues || []
              }
            />
          </Card>

          {/* NOTIZEN */}

          <Card
            title="Notizen"
            icon="📝"
          >
            <Textarea
              label="Interne Notiz"
              name="notes"
            />
          </Card>

          {/* SAVE BAR */}

          <div className="sticky bottom-5 z-20 flex flex-col gap-3 rounded-[1.5rem] bg-zinc-950 px-5 py-4 text-white shadow-2xl sm:flex-row sm:items-center sm:justify-between">

            <p className="text-sm text-white/50">
              Der neue Veranstalter wird in den Stammdaten angelegt.
            </p>

            <button
              type="submit"
              className="rounded-full bg-lime-300 px-6 py-3 text-sm font-black text-zinc-950 transition hover:-translate-y-0.5"
            >
              Veranstalter anlegen
            </button>

          </div>

        </form>
      </div>
    </main>
  );
}


// ============================================================
// CARD
// ============================================================

function Card({
  title,
  icon,
  description,
  children,
}: {
  title: string;
  icon: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.7rem] bg-white p-6 shadow-lg shadow-black/[0.03] ring-1 ring-black/5">

      <div className="mb-5 flex items-start gap-3">
        <div className="text-2xl">
          {icon}
        </div>

        <div>
          <h2 className="text-xl font-black">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-sm font-medium text-zinc-400">
              {description}
            </p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}


// ============================================================
// FIELD
// ============================================================

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required = false,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | null;
  required?: boolean;
  className?: string;
}) {
  return (
    <label
      className={[
        "block",
        className,
      ].join(" ")}
    >
      <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-400">
        {label}
      </span>

      <input
        name={name}
        type={type}
        required={required}
        defaultValue={
          defaultValue || ""
        }
        className="h-12 w-full rounded-xl bg-[#fbf7ef] px-4 text-sm font-semibold outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-black/10"
      />
    </label>
  );
}


// ============================================================
// SELECT
// ============================================================

function SelectField({
  label,
  name,
  defaultValue,
  options,
  className = "",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: string[];
  className?: string;
}) {
  return (
    <label
      className={[
        "block",
        className,
      ].join(" ")}
    >
      <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-400">
        {label}
      </span>

      <select
        name={name}
        defaultValue={
          defaultValue || ""
        }
        className="h-12 w-full rounded-xl bg-[#fbf7ef] px-4 text-sm font-bold outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-black/10"
      >
        {options.map(
          (option) => (
            <option
              key={
                option ||
                "__empty"
              }
              value={option}
            >
              {option || "—"}
            </option>
          )
        )}
      </select>
    </label>
  );
}


// ============================================================
// TEXTAREA
// ============================================================

function Textarea({
  label,
  name,
}: {
  label: string;
  name: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-400">
        {label}
      </span>

      <textarea
        name={name}
        rows={4}
        className="w-full rounded-xl bg-[#fbf7ef] px-4 py-3 text-sm font-semibold outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-black/10"
      />
    </label>
  );
}


// ============================================================
// CLEAN
// ============================================================

function clean(
  value: FormDataEntryValue | null
) {
  const text = String(
    value ?? ""
  ).trim();

  return text || null;
}