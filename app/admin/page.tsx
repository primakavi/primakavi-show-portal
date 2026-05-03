import Link from "next/link";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export default async function AdminDashboardPage() {
  const { data: shows, error } = await supabaseAdmin
    .schema("booking")
    .from("shows")
    .select(`
      id,
      token,
      artist,
      program,
      show_date,
      weekday,
      venue,
      city,
      start_time,
      entry_time,
      created_at,

      contact_name,
      contact_email,
      contact_phone,
      emergency_phone,
      venue_address,

      soundcheck_time,
      schedule,

      sound_system,
      lights,
      piano,
      epiano,
      piano_notes,
      tech_contact,
      technik,

      anreise,
      unterkunft,
      travel_details,
      accommodation_type,
      accommodation_notes,
      travel_options,

      promotion,
      flyers_needed,
      flyer_amount,
      posters_needed,
      poster_details,

      internal_status,
      billing_status,
      contract_status,
      markus_included,
      checklist,

      last_portal_update,
      last_reviewed_at,

      show_portal_submissions (
        id,
        submitted_at,
        reviewed_at
      )
    `)
    .order("show_date", { ascending: true });

  if (error) {
    return (
      <div className="rounded-[2rem] bg-white p-6 text-sm font-bold text-red-600 shadow-xl sm:p-8">
        Fehler beim Laden der Shows: {error.message}
      </div>
    );
  }

  const allShows = shows || [];
  const today = startOfToday();

  const enrichedShows = allShows.map((show: any) => {
    const latestSubmission = getLatestSubmission(show);
    const hasNewPortalInfo = hasUnreviewedPortalInfo(show, latestSubmission);

    const formComplete = show.checklist?.["Formular vollständig"] === true;
    const contractDone =
      show.checklist?.["Vertrag geklärt"] === true ||
      isContractCleared(show.contract_status);
    const isPast = isPastDate(show.show_date);
    const billingOpen =
      isPast &&
      show.billing_status !== "bezahlt" &&
      show.billing_status !== "nicht_relevant";

    const daysUntil = getDaysUntil(show.show_date);

    const flags: string[] = [];

    if (hasNewPortalInfo) flags.push("Neue Veranstalterinfos");
    if (!formComplete) flags.push("Formular offen");
    if (!contractDone) flags.push("Vertrag offen");
    if (billingOpen) flags.push("Abrechnung offen");
    if (daysUntil !== null && daysUntil >= 0 && daysUntil <= 21) {
      flags.push(daysUntil === 0 ? "heute" : `in ${daysUntil} Tagen`);
    }

    return {
      ...show,
      flags,
      latestSubmission,
      hasNewPortalInfo,
    };
  });

  const upcoming = enrichedShows.filter((show: any) => {
    const showDate = parseDate(show.show_date);
    return showDate ? showDate >= today : false;
  });

  const openDrafts = enrichedShows.filter((show: any) => !show.show_date);
  const actionNeeded = enrichedShows.filter((show: any) => show.flags.length > 0);

  const urgentShows = actionNeeded.filter((show: any) => {
    const daysUntil = getDaysUntil(show.show_date);
    const isPast = isPastDate(show.show_date);

    return (
      !show.show_date ||
      isPast ||
      show.hasNewPortalInfo ||
      (daysUntil !== null && daysUntil <= 21) ||
      show.flags.includes("Formular offen") ||
      show.flags.includes("Vertrag offen")
    );
  });

  return (
    <div className="space-y-5 text-[#171717] sm:space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#101014] px-6 py-8 text-white shadow-2xl sm:px-10 sm:py-11 lg:px-12 lg:py-12">
        <div className="pointer-events-none absolute right-5 top-5 text-4xl text-pink-400 sm:right-10 sm:top-8 sm:text-6xl">
          ♕
        </div>
        <div className="pointer-events-none absolute -left-20 bottom-8 text-4xl text-orange-300 sm:left-8 sm:text-5xl">
          ★
        </div>
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-pink-500/20 blur-3xl sm:h-64 sm:w-64" />
        <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-orange-400/20 blur-3xl sm:h-64 sm:w-64" />

        <div className="relative max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/60 sm:text-sm">
            Admin · Booking · Shows
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight sm:mt-5 sm:text-5xl lg:text-6xl">
            Arbeitscockpit
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/75 sm:mt-5 sm:text-lg">
            Dein Überblick über Shows, offene Punkte und nächste Termine.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard number={allShows.length} label="Shows gesamt" color="bg-pink-200" />
        <StatCard number={upcoming.length} label="Kommende Shows" color="bg-orange-200" />
        <StatCard number={openDrafts.length} label="Offene Entwürfe" color="bg-purple-200" />
        <StatCard number={urgentShows.length} label="Handlung nötig" color="bg-red-200" />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)] xl:gap-6">
        <div className="rounded-[2rem] bg-white p-5 shadow-xl shadow-black/5 sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-black sm:text-2xl">🔥 Handlung nötig</h2>
              <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                Neue Veranstalterinfos, offene Formulare, Verträge oder Abrechnung.
              </p>
            </div>
            <span className="w-fit rounded-full bg-red-100 px-4 py-2 text-sm font-black text-red-700">
              {urgentShows.length}
            </span>
          </div>

          {urgentShows.length === 0 ? (
            <EmptyState text="Alles sauber. Keine dringenden offenen Punkte." />
          ) : (
            <div className="space-y-3">
              {urgentShows.slice(0, 6).map((show: any) => (
                <ShowMiniCard key={show.id} show={show} />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-xl shadow-black/5 sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-black sm:text-2xl">Nächste Shows</h2>
              <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                Schnell in die Akte springen und weiterarbeiten.
              </p>
            </div>
            <span className="hidden text-4xl text-pink-400 sm:block">☆</span>
          </div>

          {upcoming.length === 0 ? (
            <EmptyState text="Noch keine kommenden Shows vorhanden." />
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 6).map((show: any) => (
                <Link
                  key={show.id}
                  href={`/admin/shows/${show.id}`}
                  className="block rounded-2xl bg-[#fbf7ef] p-4 transition hover:-translate-y-0.5 hover:bg-[#f5ead9] sm:rounded-3xl sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-black sm:text-lg">
                        {show.venue || "Ohne Venue"}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                        {formatDate(show.show_date)} · {show.city || "—"} ·{" "}
                        {show.program || "—"}
                      </p>

                      {show.hasNewPortalInfo && (
                        <p className="mt-2 text-xs font-black text-pink-600">
                          ✨ Neue Veranstalterinfos
                        </p>
                      )}
                    </div>

                  <div className="w-fit shrink-0 rounded-full bg-black px-3 py-1.5 text-xs font-bold text-white sm:px-4 sm:py-2 sm:text-sm">
                    Akte →
                  </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ShowMiniCard({ show }: { show: any }) {
  return (
    <Link
      href={`/admin/shows/${show.id}`}
      className="block rounded-2xl bg-[#fbf7ef] p-4 transition hover:-translate-y-0.5 hover:bg-[#f5ead9] sm:rounded-3xl sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-black">
            {show.venue || "Ohne Venue"}
          </p>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-500 sm:text-sm">
            {formatDate(show.show_date)} · {show.city || "—"} ·{" "}
            {show.program || "—"}
          </p>
        </div>

        <div className="shrink-0 rounded-full bg-black px-3 py-1.5 text-xs font-bold text-white sm:px-4 sm:py-2 sm:text-sm">
          Akte →
        </div>
      </div>

      {show.flags?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
          {show.flags.slice(0, 4).map((item: string) => (
            <span
              key={item}
              className={`rounded-full px-2.5 py-1 text-[11px] font-black shadow-sm sm:px-3 sm:text-xs ${
                item === "Neue Veranstalterinfos"
                  ? "bg-pink-100 text-pink-700"
                  : "bg-white text-neutral-700"
              }`}
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

function StatCard({
  number,
  label,
  color,
}: {
  number: number;
  label: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-lg shadow-black/5 sm:block sm:rounded-[2rem] sm:p-6">
      
      {/* Kreis */}
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-black ${color}
        sm:mb-4 sm:h-14 sm:w-14 sm:text-xl`}
      >
        {number}
      </div>

      {/* Text */}
      <div className="min-w-0">
        <p className="text-sm font-semibold text-neutral-600 sm:text-sm sm:font-bold">
          {label}
        </p>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-neutral-300 bg-[#fbf7ef] p-6 text-center text-sm leading-relaxed text-neutral-500 sm:p-10">
      {text}
    </div>
  );
}

function getLatestSubmission(show: any) {
  const submissions = show.show_portal_submissions || [];

  return [...submissions].sort((a: any, b: any) => {
    return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
  })[0];
}

function hasUnreviewedPortalInfo(show: any, latestSubmission: any) {
  if (!latestSubmission) return false;
  if (!latestSubmission.submitted_at) return false;
  if (!show.last_reviewed_at) return true;

  return (
    new Date(latestSubmission.submitted_at).getTime() >
    new Date(show.last_reviewed_at).getTime()
  );
}

function isContractCleared(contractStatus?: string | null) {
  const status = String(contractStatus || "").toLowerCase();

  return (
    status.includes("vertrag liegt vor") ||
    status.includes("erstellt") ||
    status.includes("unterschrieben")
  );
}

function formatDate(date?: string | null) {
  if (!date) return "ohne Datum";

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function parseDate(date?: string | null) {
  if (!date) return null;

  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function isPastDate(date?: string | null) {
  const parsed = parseDate(date);
  if (!parsed) return false;

  return parsed < startOfToday();
}

function getDaysUntil(date?: string | null) {
  const parsed = parseDate(date);
  if (!parsed) return null;

  return Math.ceil(
    (parsed.getTime() - startOfToday().getTime()) / (1000 * 60 * 60 * 24)
  );
}