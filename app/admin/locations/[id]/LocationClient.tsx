"use client";

import Link from "next/link";
import {
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";

type Venue = {
  id: string;
  legacy_id: string | null;

  name: string;

  street: string | null;
  postal_code: string | null;
  city: string | null;
  state: string | null;
  country: string | null;

  website: string | null;

  capacity: number | null;
  venue_type: string | null;
  audience_notes: string | null;

  contact_name: string | null;
  contact_role: string | null;
  contact_email: string | null;
  contact_phone: string | null;

  contact_name_2: string | null;
  contact_role_2: string | null;
  contact_email_2: string | null;
  contact_phone_2: string | null;

  booking_email: string | null;

  relationship_status: string | null;

  lat: number | string | null;
  lng: number | string | null;

  internal_notes: string | null;
  special_notes: string | null;

  played_before: boolean | null;

  season_notes: string | null;
  program_focus: string[] | null;

  instagram_url: string | null;
  facebook_url: string | null;
  logo_url: string | null;
};

type LocationShow = {
  id: string;
  show_date: string | null;
  program: string | null;
  internal_status: string | null;
  start_time: string | null;
  venue_submitted: string | null;
};

type SaveResult = {
  success: boolean;
  message: string;
};

const RELATIONSHIP_OPTIONS = [
  "",
  "⚪ Neu",
  "🟠 Kontakt",
  "🟢 Gespielt",
  "🔴 Nicht relevant",
];

const STATES = [
  "",
  "Baden-Württemberg",
  "Bayern",
  "Berlin",
  "Brandenburg",
  "Bremen",
  "Hamburg",
  "Hessen",
  "Mecklenburg-Vorpommern",
  "Niedersachsen",
  "Nordrhein-Westfalen",
  "Rheinland-Pfalz",
  "Saarland",
  "Sachsen",
  "Sachsen-Anhalt",
  "Schleswig-Holstein",
  "Thüringen",
];

export default function LocationClient({
  venue,
  shows,
  saveLocation,
  isNew = false,
}: {
  venue: Venue;
  shows: LocationShow[];
  saveLocation: (formData: FormData) => Promise<SaveResult>;
  isNew?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const formData = new FormData(
      event.currentTarget
    );

    setMessage(null);

    startTransition(async () => {
      const result =
        await saveLocation(formData);

      setSuccess(result.success);
      setMessage(result.message);
    });
  }

  const locationSubtitle = [
    venue.postal_code,
    venue.city,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main className="min-h-screen bg-[#fbf7ef] px-8 py-8 text-zinc-950">
      <div className="mx-auto max-w-7xl space-y-5">

        {/* HEADER */}

        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/admin/locations"
              className="text-sm font-bold text-zinc-400 transition hover:text-zinc-950"
            >
              ← Locations
            </Link>

            <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
              primakavi · location-akte
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight">
              {isNew
                ? "Neue Location"
                : venue.name}
            </h1>

            <p className="mt-2 text-zinc-500">
              {isNew
                ? "Neue Spielstätte anlegen."
                : locationSubtitle}
            </p>
          </div>

          {!isNew && (
            <div className="flex flex-wrap gap-2">
              {venue.website && (
                <a
                  href={venue.website}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-black transition hover:bg-zinc-50"
                >
                  Website ↗
                </a>
              )}

              {venue.lat &&
                venue.lng && (
                  <a
                    href={`https://www.google.com/maps?q=${venue.lat},${venue.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-black transition hover:bg-zinc-50"
                  >
                    📍 Karte
                  </a>
                )}
            </div>
          )}
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* BASIS */}

<Card
  title="Stammdaten"
  icon="🏛️"
  description="Grunddaten der Spielstätte."
>
  <div className="grid gap-4 md:grid-cols-12">

    <Field
      label="Location"
      name="name"
      defaultValue={venue.name}
      className="md:col-span-8"
    />

    <SelectField
      label="Beziehungsstatus"
      name="relationship_status"
      defaultValue={
        venue.relationship_status ||
        (isNew ? "🆕 Neu" : "")
      }
      options={RELATIONSHIP_OPTIONS}
      className="md:col-span-4"
    />

    <Field
      label="Straße"
      name="street"
      defaultValue={venue.street}
      className="md:col-span-6"
    />

    <Field
      label="PLZ"
      name="postal_code"
      defaultValue={venue.postal_code}
      className="md:col-span-2"
    />

    <Field
      label="Ort"
      name="city"
      defaultValue={venue.city}
      className="md:col-span-4"
    />

    <SelectField
      label="Bundesland"
      name="state"
      defaultValue={venue.state || ""}
      options={STATES}
      className="md:col-span-4"
    />

    <Field
      label="Land"
      name="country"
      defaultValue={venue.country || "DE"}
      className="md:col-span-2"
    />

    <Field
      label="Website"
      name="website"
      defaultValue={venue.website}
      className="md:col-span-6"
    />

  </div>
</Card>

          {/* KONTAKTE */}

          <div className="grid gap-5 xl:grid-cols-2">

            <Card
              title="Ansprechpartner 1"
              icon="👤"
            >
              <div className="grid gap-4 md:grid-cols-2">

                <Field
                  label="Name"
                  name="contact_name"
                  defaultValue={
                    venue.contact_name
                  }
                  className="md:col-span-2"
                />

                <Field
                  label="Funktion"
                  name="contact_role"
                  defaultValue={
                    venue.contact_role
                  }
                  className="md:col-span-2"
                />

                <Field
                  label="E-Mail"
                  name="contact_email"
                  type="email"
                  defaultValue={
                    venue.contact_email
                  }
                />

                <Field
                  label="Telefon"
                  name="contact_phone"
                  defaultValue={
                    venue.contact_phone
                  }
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
                  defaultValue={
                    venue.contact_name_2
                  }
                  className="md:col-span-2"
                />

                <Field
                  label="Funktion"
                  name="contact_role_2"
                  defaultValue={
                    venue.contact_role_2
                  }
                  className="md:col-span-2"
                />

                <Field
                  label="E-Mail"
                  name="contact_email_2"
                  type="email"
                  defaultValue={
                    venue.contact_email_2
                  }
                />

                <Field
                  label="Telefon"
                  name="contact_phone_2"
                  defaultValue={
                    venue.contact_phone_2
                  }
                />
              </div>
            </Card>

          </div>

          {/* BOOKING */}

<Card
  title="Booking & Bühne"
  icon="🎭"
>
  <div className="grid gap-4 md:grid-cols-12">

    <Field
      label="Booking-E-Mail"
      name="booking_email"
      type="email"
      defaultValue={venue.booking_email}
      className="md:col-span-6"
    />

    <Field
      label="Kapazität"
      name="capacity"
      type="number"
      defaultValue={venue.capacity}
      className="md:col-span-3"
    />

    <Field
      label="Location-Typ"
      name="venue_type"
      defaultValue={venue.venue_type}
      className="md:col-span-3"
    />

    <Field
      label="Programmfokus"
      name="program_focus"
      defaultValue={venue.program_focus?.join(", ") || ""}
      placeholder="Comedy, Kabarett, Musik"
      className="md:col-span-6"
    />

    <Field
      label="Spielzeit / Saison"
      name="season_notes"
      defaultValue={venue.season_notes}
      className="md:col-span-6"
    />

    <Textarea
      label="Publikum / Zielgruppe"
      name="audience_notes"
      defaultValue={venue.audience_notes}
      className="md:col-span-8"
    />

    <label className="md:col-span-4">
      <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-400">
        Historie
      </span>

      <div className="flex min-h-[96px] items-center rounded-xl bg-[#fbf7ef] px-5">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="played_before"
            defaultChecked={venue.played_before === true}
            className="h-5 w-5"
          />

          <span className="text-sm font-bold">
            Schon gespielt
          </span>
        </div>
      </div>
    </label>

  </div>
</Card>

          {/* SHOWS */}

          {!isNew && (
            <Card
              title="Shows an dieser Location"
              icon="🎟️"
              description={
                shows.length === 0
                  ? "Noch keine Show mit dieser Location verknüpft."
                  : `${shows.length} ${
                      shows.length === 1
                        ? "Show"
                        : "Shows"
                    } mit dieser Location verknüpft.`
              }
            >
              {shows.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-black/10 bg-[#fbf7ef] px-5 py-8 text-center text-sm font-semibold text-zinc-400">
                  Für diese Location gibt
                  es aktuell keine
                  verknüpfte Show.
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-black/10">
                  <div className="divide-y divide-black/5">

                    {shows.map((show) => {
                      const submittedDiffers =
                        show.venue_submitted &&
                        show.venue_submitted
                          .trim()
                          .toLowerCase() !==
                          venue.name
                            .trim()
                            .toLowerCase();

                      return (
                        <div
                          key={show.id}
                          className="flex flex-col gap-3 bg-white px-5 py-4 transition hover:bg-zinc-50 md:flex-row md:items-center md:justify-between"
                        >
                          <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-black text-zinc-950">
                                {formatShowDate(
                                  show.show_date
                                )}
                              </span>

                              {show.start_time && (
                                <span className="text-sm font-semibold text-zinc-400">
                                  ·{" "}
                                  {formatShowTime(
                                    show.start_time
                                  )}
                                </span>
                              )}

                              <ShowStatus
                                status={
                                  show.internal_status
                                }
                              />
                            </div>

                            {show.program && (
                              <div className="mt-1 text-sm font-semibold text-zinc-600">
                                {show.program}
                              </div>
                            )}

                            {submittedDiffers && (
                              <div className="mt-2 text-xs font-semibold text-zinc-400">
                                Ursprüngliche
                                Angabe: „
                                {
                                  show.venue_submitted
                                }
                                “
                              </div>
                            )}
                          </div>

                          <Link
                            href={`/admin/shows?show=${show.id}`}
                            className="shrink-0 text-sm font-black text-zinc-400 transition hover:text-zinc-950"
                          >
                            Show öffnen →
                          </Link>
                        </div>
                      );
                    })}

                  </div>
                </div>
              )}
            </Card>
          )}

          {/* KOORDINATEN */}

          {!isNew && (
            <Card
              title="Standort"
              icon="📍"
            >
              <div className="grid gap-4 md:grid-cols-2">

                <Field
                  label="Latitude"
                  name="lat"
                  defaultValue={venue.lat}
                />

                <Field
                  label="Longitude"
                  name="lng"
                  defaultValue={venue.lng}
                />

              </div>
            </Card>
          )}

          {/* NOTIZEN */}

          <Card
            title="Notizen"
            icon="📝"
          >
            <div className="grid gap-4 xl:grid-cols-2">

              <Textarea
                label="Interne Notiz"
                name="internal_notes"
                defaultValue={
                  venue.internal_notes
                }
              />

              <Textarea
                label="Besonderheiten"
                name="special_notes"
                defaultValue={
                  venue.special_notes
                }
              />

            </div>
          </Card>

          {/* SOCIAL */}

          <Card
            title="Online"
            icon="🌐"
          >
            <div className="grid gap-4 md:grid-cols-2">

              <Field
                label="Instagram"
                name="instagram_url"
                defaultValue={
                  venue.instagram_url
                }
              />

              <Field
                label="Facebook"
                name="facebook_url"
                defaultValue={
                  venue.facebook_url
                }
              />

              <Field
                label="Logo URL"
                name="logo_url"
                defaultValue={
                  venue.logo_url
                }
                className="md:col-span-2"
              />

            </div>
          </Card>

          {/* SAVE BAR */}

          <div className="sticky bottom-5 z-20 flex flex-col gap-3 rounded-[1.5rem] bg-zinc-950 px-5 py-4 text-white shadow-2xl sm:flex-row sm:items-center sm:justify-between">

            <div>
              {message ? (
                <p
                  className={[
                    "text-sm font-bold",
                    success
                      ? "text-lime-300"
                      : "text-red-300",
                  ].join(" ")}
                >
                  {success ? "✓ " : "⚠️ "}
                  {message}
                </p>
              ) : (
                <p className="text-sm text-white/50">
                  {isNew
                    ? "Die neue Location wird in den Stammdaten angelegt."
                    : "Änderungen werden erst mit Speichern übernommen."}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-lime-300 px-6 py-3 text-sm font-black text-zinc-950 transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-50"
            >
              {isPending
                ? "Speichert …"
                : isNew
                  ? "Location anlegen"
                  : "Änderungen speichern"}
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
    <section className="rounded-[1.7rem] bg-white p-6 shadow-lg shadow-black/[0.03] ring-1 ring-black/5">

      <div className="mb-5 flex items-start gap-3">

        <div className="text-2xl">
          {icon}
        </div>

        <div>
          <h2 className="text-lg font-black">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-sm text-zinc-400">
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
  defaultValue,
  type = "text",
  placeholder,
  className = "",
}: {
  label: string;
  name: string;
  defaultValue?:
    | string
    | number
    | null;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={className}>

      <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-400">
        {label}
      </span>

      <input
        name={name}
        type={type}
        defaultValue={
          defaultValue ?? ""
        }
        placeholder={placeholder}
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
  defaultValue: string;
  options: string[];
  className?: string;
}) {
  const safeOptions =
    defaultValue &&
    !options.includes(defaultValue)
      ? [defaultValue, ...options]
      : options;

  return (
    <label className={className}>

      <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-400">
        {label}
      </span>

      <select
        name={name}
        defaultValue={defaultValue}
        className="h-12 w-full rounded-xl bg-[#fbf7ef] px-4 text-sm font-bold outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-black/10"
      >
        {safeOptions.map(
          (option) => (
            <option
              key={
                option || "empty"
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
  defaultValue,
  className = "",
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  className?: string;
}) {
  return (
    <label className={className}>

      <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-400">
        {label}
      </span>

      <textarea
        name={name}
        defaultValue={
          defaultValue ?? ""
        }
        rows={4}
        className="w-full resize-y rounded-xl bg-[#fbf7ef] px-4 py-3 text-sm font-semibold outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-black/10"
      />

    </label>
  );
}


// ============================================================
// SHOW DATUM
// ============================================================

function formatShowDate(
  date: string | null
) {
  if (!date) return "Datum offen";

  return new Intl.DateTimeFormat(
    "de-DE",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(
    new Date(`${date}T12:00:00`)
  );
}


// ============================================================
// SHOW UHRZEIT
// ============================================================

function formatShowTime(
  time: string | null
) {
  if (!time) return "";

  return `${time.slice(0, 5)} Uhr`;
}


// ============================================================
// SHOW STATUS
// ============================================================

function ShowStatus({
  status,
}: {
  status: string | null;
}) {
  const label =
    status || "ohne Status";

  let classes =
    "bg-zinc-100 text-zinc-600";

  if (status === "neu") {
    classes =
      "bg-blue-50 text-blue-700";
  } else if (
    status === "in_arbeit"
  ) {
    classes =
      "bg-amber-50 text-amber-700";
  } else if (
    status === "option"
  ) {
    classes =
      "bg-violet-50 text-violet-700";
  } else if (
    status === "bestätigt" ||
    status === "bestaetigt" ||
    status === "confirmed"
  ) {
    classes =
      "bg-emerald-50 text-emerald-700";
  } else if (
    status === "abgesagt" ||
    status === "cancelled"
  ) {
    classes =
      "bg-red-50 text-red-700";
  }

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-black ${classes}`}
    >
      {label.replaceAll("_", " ")}
    </span>
  );
}