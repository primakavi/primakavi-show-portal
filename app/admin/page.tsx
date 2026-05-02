import Link from "next/link";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export default async function AdminDashboardPage() {
  const { data: shows, error } = await supabaseAdmin
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
      venue_address,
      schedule,
      technik,
      anreise,
      unterkunft,
      promotion,
      internal_status,
      billing_status,
      contract_status,
      markus_included,
      portal_data,
      checklist
    `)
    .order("show_date", { ascending: true });

  if (error) {
    return (
      <main className="min-h-screen bg-[#fbf7ef] px-8 py-8 text-[#171717]">
        <div className="rounded-[2rem] bg-white p-8 font-bold text-red-600 shadow-xl">
          Fehler beim Laden der Shows: {error.message}
        </div>
      </main>
    );
  }

  const allShows = shows || [];
  const today = startOfToday();

  const upcoming = allShows.filter((show: any) => {
    const showDate = parseDate(show.show_date);
    return showDate ? showDate >= today : false;
  });

  const openDrafts = allShows.filter((show: any) => !show.show_date);

  const actionNeeded = allShows
    .map((show: any) => {
      const formComplete = show.checklist?.["Formular vollständig"] === true;
      const contractDone = show.checklist?.["Vertrag geklärt"] === true;
      const isPast = isPastDate(show.show_date);
      const billingOpen = isPast && show.billing_status !== "bezahlt";
      const daysUntil = getDaysUntil(show.show_date);

      const flags: string[] = [];

      if (!formComplete) flags.push("Formular offen");
      if (!contractDone) flags.push("Vertrag offen");
      if (billingOpen) flags.push("Abrechnung offen");
      if (daysUntil !== null && daysUntil >= 0 && daysUntil <= 21) {
        flags.push(`in ${daysUntil} Tagen`);
      }

      return {
        ...show,
        flags,
      };
    })
    .filter((show: any) => show.flags.length > 0);

  const urgentShows = actionNeeded.filter((show: any) => {
    const daysUntil = getDaysUntil(show.show_date);
    const isPast = isPastDate(show.show_date);

    return (
      !show.show_date ||
      isPast ||
      (daysUntil !== null && daysUntil <= 21) ||
      show.flags.includes("Formular offen") ||
      show.flags.includes("Vertrag offen")
    );
  });

  return (
    <main className="min-h-screen bg-[#fbf7ef] px-8 py-8 text-[#171717]">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="relative overflow-hidden rounded-[2rem] bg-[#101014] p-10 text-white shadow-2xl">
          <div className="absolute right-10 top-8 text-7xl text-pink-400">♕</div>
          <div className="absolute bottom-8 right-100 text-5xl text-orange-300">
            ★
          </div>
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-orange-400/20 blur-3xl" />

          <div className="relative max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-widest text-white/60">
              Admin · Booking · Shows
            </p>
            <h1 className="mt-5 text-5xl font-black leading-tight tracking-tight">
              Arbeitscockpit
            </h1>
            <p className="mt-5 text-lg text-white/75">
              Dein Überblick über Shows, offene Punkte und nächste Termine.
            </p>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-4">
          <StatCard number={allShows.length} label="Shows gesamt" color="bg-pink-200" />
          <StatCard number={upcoming.length} label="Kommende Shows" color="bg-orange-200" />
          <StatCard number={openDrafts.length} label="Offene Entwürfe" color="bg-purple-200" />
          <StatCard number={urgentShows.length} label="Handlung nötig" color="bg-red-200" />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-black/5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">🔥 Handlung nötig</h2>
                <p className="text-sm text-neutral-500">
                  Shows mit offenem Formular, offenem Vertrag oder Abrechnung.
                </p>
              </div>
              <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-black text-red-700">
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

          <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-black/5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">Nächste Shows</h2>
                <p className="text-sm text-neutral-500">
                  Schnell in die Akte springen und weiterarbeiten.
                </p>
              </div>
              <span className="text-4xl text-pink-400">☆</span>
            </div>

            {upcoming.length === 0 ? (
              <EmptyState text="Noch keine kommenden Shows vorhanden." />
            ) : (
              <div className="space-y-3">
                {upcoming.slice(0, 6).map((show: any) => (
                  <Link
                    key={show.id}
                    href={`/admin/shows/${show.id}`}
                    className="flex items-center justify-between rounded-3xl bg-[#fbf7ef] p-5 transition hover:-translate-y-0.5 hover:bg-[#f5ead9]"
                  >
                    <div>
                      <p className="text-lg font-black">
                        {show.venue || "Ohne Venue"}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {formatDate(show.show_date)} · {show.city || "—"} ·{" "}
                        {show.program || "—"}
                      </p>
                    </div>

                    <div className="rounded-full bg-black px-4 py-2 text-sm font-bold text-white">
                      Akte →
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function ShowMiniCard({ show }: { show: any }) {
  return (
    <Link
      href={`/admin/shows/${show.id}`}
      className="block rounded-3xl bg-[#fbf7ef] p-5 transition hover:-translate-y-0.5 hover:bg-[#f5ead9]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-black">{show.venue || "Ohne Venue"}</p>
          <p className="text-sm text-neutral-500">
            {formatDate(show.show_date)} · {show.city || "—"} ·{" "}
            {show.program || "—"}
          </p>
        </div>

        <div className="rounded-full bg-black px-4 py-2 text-sm font-bold text-white">
          Akte →
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {show.flags.slice(0, 5).map((item: string) => (
          <span
            key={item}
            className="rounded-full bg-white px-3 py-1 text-xs font-black text-neutral-700 shadow-sm"
          >
            {item}
          </span>
        ))}
      </div>
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
    <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-black/5">
      <div
        className={`mb-5 flex h-14 w-14 items-center justify-center rounded-full ${color}`}
      >
        <span className="text-xl font-black">{number}</span>
      </div>
      <p className="text-sm font-bold text-neutral-500">{label}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-neutral-300 bg-[#fbf7ef] p-10 text-center text-neutral-500">
      {text}
    </div>
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

  const diff = Math.ceil(
    (parsed.getTime() - startOfToday().getTime()) / (1000 * 60 * 60 * 24)
  );

  return diff;
}