import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ReactNode } from "react";
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
  // LOCATIONS FÜR VERKNÜPFUNG
  // ------------------------------------------------------------

  const { data: venues, error: venuesError } = await supabaseAdmin
    .from("venues")
    .select(`
      id,
      name,
      city
    `)
    .order("name", { ascending: true });

  if (venuesError) {
    throw new Error(venuesError.message);
  }

  // ------------------------------------------------------------
  // VERANSTALTER ANLEGEN
  // ------------------------------------------------------------

  async function createOrganizer(formData: FormData) {
    "use server";

    const name = clean(formData.get("name"));

    if (!name) {
      throw new Error(
        "Bitte einen Namen für den Veranstalter eingeben."
      );
    }

    const venueIds = Array.from(
      new Set(
        formData
          .getAll("venue_ids")
          .map((value) => String(value || "").trim())
          .filter(Boolean)
      )
    );

    const venueOnlyIds = new Set(
      formData
        .getAll("venue_only_ids")
        .map((value) => String(value || "").trim())
        .filter(Boolean)
    );

    // ----------------------------------------------------------
    // VERANSTALTER
    // ----------------------------------------------------------

    const { data: created, error: organizerError } = await supabaseAdmin
      .from("organizers")
      .insert({
        name,

        organizer_type: clean(
          formData.get("organizer_type")
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

        street: clean(
          formData.get("street")
        ),

        postal_code: clean(
          formData.get("postal_code")
        ),

        city: clean(
          formData.get("city")
        ),

        country:
          clean(formData.get("country")) ||
          "Deutschland",

        relationship_status:
          clean(
            formData.get("relationship_status")
          ) || "⚪ Neu",

        notes: clean(
          formData.get("notes")
        ),
      })
      .select("id")
      .single();

    if (organizerError || !created) {
      throw new Error(
        organizerError?.message ||
          "Veranstalter konnte nicht angelegt werden."
      );
    }

    // ----------------------------------------------------------
    // ANSPRECHPARTNER 1
    // ----------------------------------------------------------

    const contact1Name = clean(
      formData.get("contact_name")
    );

    if (contact1Name) {
      const { error } = await supabaseAdmin
        .from("organizer_contacts")
        .insert({
          organizer_id: created.id,

          name: contact1Name,

          role: clean(
            formData.get("contact_role")
          ),

          email: clean(
            formData.get("contact_email")
          ),

          phone: clean(
            formData.get("contact_phone")
          ),

          notes: clean(
            formData.get("contact_notes")
          ),

          is_primary: true,
        });

      if (error) {
        throw new Error(error.message);
      }
    }

    // ----------------------------------------------------------
    // ANSPRECHPARTNER 2
    // ----------------------------------------------------------

    const contact2Name = clean(
      formData.get("contact_name_2")
    );

    if (contact2Name) {
      const { error } = await supabaseAdmin
        .from("organizer_contacts")
        .insert({
          organizer_id: created.id,

          name: contact2Name,

          role: clean(
            formData.get("contact_role_2")
          ),

          email: clean(
            formData.get("contact_email_2")
          ),

          phone: clean(
            formData.get("contact_phone_2")
          ),

          notes: clean(
            formData.get("contact_notes_2")
          ),

          is_primary: false,
        });

      if (error) {
        throw new Error(error.message);
      }
    }

    // ----------------------------------------------------------
    // SPIELSTÄTTEN VERKNÜPFEN
    // ----------------------------------------------------------

    if (venueIds.length > 0) {
      const rows = venueIds.map((venueId) => ({
        organizer_id: created.id,
        venue_id: venueId,
      }));

      const { error } = await supabaseAdmin
        .from("organizer_venues")
        .insert(rows);

      if (error) {
        throw new Error(error.message);
      }

      const markedVenueIds =
        venueIds.filter((venueId) =>
          venueOnlyIds.has(venueId)
        );

      if (markedVenueIds.length > 0) {
        const { error: venueStatusError } =
          await supabaseAdmin
            .from("venues")
            .update({
              acquisition_relevant: false,
              relationship_status: "🔴 Nicht relevant",
            })
            .in("id", markedVenueIds);

        if (venueStatusError) {
          throw new Error(venueStatusError.message);
        }
      }
    }

    revalidatePath("/admin/organizers");
    revalidatePath("/admin/locations");

    redirect(`/admin/organizers/${created.id}`);
  }

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------

  return (
    <main className="min-h-screen bg-[#fbf7ef] px-8 py-8 text-zinc-950">
      <div className="mx-auto max-w-7xl space-y-5">
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
              Veranstalter
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
                options={RELATIONSHIP_OPTIONS}
                className="md:col-span-4"
              />

              <SelectField
                label="Typ"
                name="organizer_type"
                options={ORGANIZER_TYPES}
                className="md:col-span-4"
              />

              <Field
                label="Straße / Hausnummer"
                name="street"
                autoComplete="street-address"
                className="md:col-span-8"
              />

              <Field
                label="PLZ"
                name="postal_code"
                autoComplete="postal-code"
                className="md:col-span-3"
              />

              <Field
                label="Ort / Sitz"
                name="city"
                autoComplete="address-level2"
                className="md:col-span-5"
              />

              <Field
                label="Land"
                name="country"
                defaultValue="Deutschland"
                autoComplete="country-name"
                className="md:col-span-4"
              />


              <Field
                label="Website"
                name="website"
                autoComplete="url"
                className="md:col-span-6"
              />

              <Field
                label="Allgemeine E-Mail"
                name="email"
                type="email"
                autoComplete="email"
                className="md:col-span-3"
              />

              <Field
                label="Telefon"
                name="phone"
                autoComplete="tel"
                className="md:col-span-3"
              />
            </div>
          </Card>

          {/* ANSPRECHPARTNER */}

          <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <Card
              title="Ansprechpartner 1"
              icon="👤"
            >
              <div className="grid min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
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
              <div className="grid min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
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

          {/* SPIELSTÄTTEN */}

          <Card
            title="Spielstätten"
            icon="🏛️"
            description="Locations, an denen Veranstaltungen dieses Veranstalters stattfinden."
          >
            <LocationPicker venues={venues || []} />

            <div className="mt-4 rounded-xl bg-[#fbf7ef] px-4 py-3 text-xs font-semibold leading-5 text-zinc-500">
              Beispiel: Hamburger Comedy Pokal → Die Motte + Schmidt Theater.
              Der Veranstalter bleibt Vertragspartner, die Locations sind die
              jeweiligen Spielstätten.
            </div>
          </Card>

          {/* NOTIZ */}

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
              Neuen Veranstalter mit Kontakten und Spielstätten anlegen.
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
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-[1.7rem] bg-white p-6 shadow-lg shadow-black/[0.03] ring-1 ring-black/5">
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
  autoComplete,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | null;
  required?: boolean;
  autoComplete?: string;
  className?: string;
}) {
  return (
    <label
      className={[
        "block min-w-0 max-w-full",
        className,
      ].join(" ")}
    >
      <span className="mb-2 block truncate text-xs font-black uppercase tracking-wider text-zinc-400">
        {label}
      </span>

      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        defaultValue={defaultValue || ""}
        className="h-12 w-full min-w-0 max-w-full truncate rounded-xl bg-[#fbf7ef] px-4 text-sm font-semibold outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-black/10"
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
        "block min-w-0",
        className,
      ].join(" ")}
    >
      <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-400">
        {label}
      </span>

      <select
        name={name}
        defaultValue={defaultValue || ""}
        className="h-12 w-full min-w-0 max-w-full truncate rounded-xl bg-[#fbf7ef] px-4 text-sm font-bold outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-black/10"
      >
        {options.map((option) => (
          <option
            key={option || "__empty"}
            value={option}
          >
            {option || "—"}
          </option>
        ))}
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
        className="w-full min-w-0 max-w-full break-words rounded-xl bg-[#fbf7ef] px-4 py-3 text-sm font-semibold outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-black/10"
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
  const text = String(value ?? "").trim();
  return text || null;
}
