import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createClient } from "@/app/lib/supabase/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;

  if (user?.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    role = profile?.role || null;
  }

  const isAdmin = role === "admin";
  const today = dateOnly(new Date());

  const [
    { data: showsRaw, error: showsError },
    { data: acquisitionRaw, error: acquisitionError },
    { data: venuesRaw, error: venuesError },
  ] = await Promise.all([
    supabaseAdmin
      .schema("booking")
      .from("shows")
      .select(`
        id,
        venue_id,
        venue,
        city,
        program,
        show_date,
        internal_status,
        billing_status,
        follow_up_date
      `)
      .order("show_date", { ascending: true, nullsFirst: false }),

    supabaseAdmin
      .from("acquisition")
      .select(`
        id,
        venue_id,
        program,
        status,
        priority,
        last_contact_at,
        next_follow_up_at,
        next_step,
        archived_at
      `)
      .order("next_follow_up_at", { ascending: true, nullsFirst: false }),

    supabaseAdmin
      .from("venues")
      .select(`
        id,
        name,
        city
      `)
      .order("name", { ascending: true }),
  ]);

  if (showsError) throw new Error(showsError.message);
  if (acquisitionError) throw new Error(acquisitionError.message);
  if (venuesError) throw new Error(venuesError.message);

  const shows = showsRaw || [];
  const acquisition = acquisitionRaw || [];
  const venues = venuesRaw || [];

  const venueMap = new Map(
    venues.map((venue: any) => [venue.id, venue])
  );

  const activeAcquisition = acquisition.filter(
    (item: any) => !item.archived_at
  );

  const dueAcquisition = activeAcquisition.filter((item: any) => {
    if (!item.next_follow_up_at) return false;
    return item.next_follow_up_at <= today;
  });

  const unlinkedShows = shows.filter((show: any) => !show.venue_id);

  const upcomingShows = shows
    .filter((show: any) => show.show_date && show.show_date >= today)
    .slice(0, 5);

  const nextAcquisition = [...activeAcquisition]
    .sort((a: any, b: any) => {
      const aDate = a.next_follow_up_at || "9999-12-31";
      const bDate = b.next_follow_up_at || "9999-12-31";
      return aDate.localeCompare(bDate);
    })
    .slice(0, 5);

  const attentionItems = buildAttentionItems(shows, activeAcquisition, today).slice(0, 5);

  return (
    <div className="space-y-5 text-zinc-950 sm:space-y-6">
      <header className="flex flex-col gap-5 px-1 py-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
            primakavi · booking crm
          </p>

          <h1 className="mt-2 text-5xl font-black tracking-tight">
            Dashboard
          </h1>

          <p className="mt-2 text-zinc-500">
            Was steht als Nächstes an?
          </p>
        </div>

        <div className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-black text-zinc-600">
          {formatLongDate(new Date())}
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="🎭"
          value={shows.length}
          label="Shows"
          subline="insgesamt"
        />
        <StatCard
          icon="🎯"
          value={activeAcquisition.length}
          label="aktive Akquise"
          subline={`${dueAcquisition.length} heute fällig`}
        />
        <StatCard
          icon="⏰"
          value={dueAcquisition.length}
          label="Wiedervorlagen"
          subline={
            dueAcquisition.length
              ? `${dueAcquisition.filter((item: any) => item.next_follow_up_at < today).length} davon überfällig`
              : "nichts fällig"
          }
          alert={dueAcquisition.length > 0}
        />
        <StatCard
          icon="🔗"
          value={unlinkedShows.length}
          label="Shows ohne Location"
          subline={`von ${shows.length} Shows`}
          alert={unlinkedShows.length > 0}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <DashboardCard
          title="Nächste Shows"
          icon="📅"
          action={
            <Link
              href="/admin/shows"
              className="text-sm font-black text-zinc-700 underline underline-offset-4"
            >
              Alle Shows →
            </Link>
          }
        >
          {upcomingShows.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="border-b border-black/5 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
                  <tr>
                    <th className="pb-3 pr-4">Datum</th>
                    <th className="pb-3 pr-4">Location</th>
                    <th className="pb-3 pr-4">Programm</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100">
                  {upcomingShows.map((show: any) => (
                    <tr key={show.id}>
                      <td className="py-3 pr-4 font-bold text-zinc-700">
                        {formatDate(show.show_date)}
                      </td>

                      <td className="py-3 pr-4">
                        <Link
                          href={`/admin/shows/${show.id}`}
                          className="font-black text-zinc-950 hover:underline"
                        >
                          {show.venue || "Location offen"}
                        </Link>
                        {show.city && (
                          <p className="mt-0.5 text-xs font-semibold text-zinc-400">
                            {show.city}
                          </p>
                        )}
                      </td>

                      <td className="py-3 pr-4 font-semibold text-zinc-700">
                        {show.program || "–"}
                      </td>

                      <td className="py-3">
                        <ShowStatusBadge status={show.internal_status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState text="Keine kommenden Shows eingetragen." />
          )}
        </DashboardCard>

        {isAdmin ? (
          <DashboardCard
            title="Location-Zuordnung"
            icon="🔗"
            badge="🔒 Nur für Admins"
          >
            <p className="mb-4 text-sm font-semibold text-zinc-600">
              {unlinkedShows.length === 0
                ? `Alle ${shows.length} Shows sind mit einer Location verknüpft.`
                : `${unlinkedShows.length} ${
                    unlinkedShows.length === 1 ? "Show" : "Shows"
                  } ohne Location-Verknüpfung`}
            </p>

            {unlinkedShows.length ? (
              <div className="space-y-3">
                {unlinkedShows.slice(0, 6).map((show: any) => (
                  <form
                    key={show.id}
                    action={linkShowToVenueAction}
                    className="grid gap-3 rounded-[1.3rem] bg-[#fbf7ef] p-4 ring-1 ring-black/5 lg:grid-cols-[1fr_1.25fr_auto] lg:items-center"
                  >
                    <input type="hidden" name="show_id" value={show.id} />

                    <div>
                      <p className="text-xs font-black text-zinc-400">
                        {formatDate(show.show_date)}
                      </p>
                      <p className="mt-1 font-black text-zinc-950">
                        {show.venue || "Location offen"}
                      </p>
                      {show.city && (
                        <p className="mt-0.5 text-xs font-bold text-zinc-500">
                          {show.city}
                        </p>
                      )}
                    </div>

                    <select
                      name="venue_id"
                      required
                      defaultValue=""
                      className="h-12 min-w-0 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-bold text-zinc-700 outline-none transition focus:border-lime-400 focus:ring-4 focus:ring-lime-100"
                    >
                      <option value="" disabled>
                        Location auswählen …
                      </option>

                      {venues.map((venue: any) => (
                        <option key={venue.id} value={venue.id}>
                          {venue.name}
                          {venue.city ? ` · ${venue.city}` : ""}
                        </option>
                      ))}
                    </select>

                    <button
                      type="submit"
                      className="h-12 rounded-xl bg-zinc-950 px-5 text-sm font-black text-white transition hover:-translate-y-0.5"
                    >
                      Verknüpfen
                    </button>
                  </form>
                ))}

                <p className="pt-1 text-xs font-semibold leading-5 text-zinc-400">
                  💡 Beim Verknüpfen wird nur die interne <code>venue_id</code> gesetzt.
                  Sonjas eingetragene Showdaten bleiben unverändert.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl bg-emerald-50 px-5 py-4 text-sm font-black text-emerald-700">
                ✓ Alles sauber verknüpft.
              </div>
            )}
          </DashboardCard>
        ) : null}
      </section>

      <section className={`grid gap-6 ${isAdmin ? "xl:grid-cols-2" : ""}`}>
        <DashboardCard
          title="Akquise – als Nächstes"
          icon="🎯"
          action={
            <Link
              href="/admin/acquisition"
              className="text-sm font-black text-zinc-700 underline underline-offset-4"
            >
              Alle Akquise →
            </Link>
          }
        >
          {nextAcquisition.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="border-b border-black/5 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
                  <tr>
                    <th className="pb-3 pr-4">Location</th>
                    <th className="pb-3 pr-4">Letzte Aktivität</th>
                    <th className="pb-3 pr-4">Wiedervorlage</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100">
                  {nextAcquisition.map((item: any) => {
                    const venue = venueMap.get(item.venue_id);

                    return (
                      <tr key={item.id}>
                        <td className="py-3 pr-4">
                          <Link
                            href={`/admin/acquisition/${item.id}`}
                            className="font-black text-zinc-950 hover:underline"
                          >
                            {venue?.name || "Location"}
                          </Link>
                          {venue?.city && (
                            <p className="mt-0.5 text-xs font-semibold text-zinc-400">
                              {venue.city}
                            </p>
                          )}
                        </td>

                        <td className="py-3 pr-4 font-semibold text-zinc-600">
                          {formatDate(item.last_contact_at)}
                        </td>

                        <td
                          className={`py-3 pr-4 font-black ${
                            item.next_follow_up_at &&
                            item.next_follow_up_at <= today
                              ? "text-red-500"
                              : "text-zinc-700"
                          }`}
                        >
                          {formatDate(item.next_follow_up_at)}
                        </td>

                        <td className="py-3">
                          <AcquisitionStatusBadge status={item.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState text="Aktuell keine offene Akquise." />
          )}
        </DashboardCard>

        <DashboardCard
          title="Aufmerksamkeit"
          icon="⚠️"
        >
          {attentionItems.length ? (
            <div className="divide-y divide-zinc-100">
              {attentionItems.map((item, index) => (
                <Link
                  key={`${item.href}-${index}`}
                  href={item.href}
                  className="flex items-center justify-between gap-4 py-3 text-sm transition hover:opacity-70"
                >
                  <span className="font-bold text-zinc-800">
                    {item.label}
                  </span>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${
                      item.critical
                        ? "bg-red-50 text-red-500"
                        : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {item.meta}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-emerald-50 px-5 py-4 text-sm font-black text-emerald-700">
              ✓ Gerade nichts Dringendes.
            </div>
          )}
        </DashboardCard>
      </section>
    </div>
  );
}

async function linkShowToVenueAction(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    throw new Error("Nicht angemeldet.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    throw new Error("Keine Berechtigung für die Location-Zuordnung.");
  }

  const showId = String(formData.get("show_id") || "");
  const venueId = String(formData.get("venue_id") || "");

  if (!showId || !venueId) {
    throw new Error("Show oder Location fehlt.");
  }

  const { error } = await supabaseAdmin
    .schema("booking")
    .from("shows")
    .update({
      venue_id: venueId,
    })
    .eq("id", showId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/shows");
  revalidatePath(`/admin/shows/${showId}`);
}

function StatCard({
  icon,
  value,
  label,
  subline,
  alert = false,
}: {
  icon: string;
  value: number;
  label: string;
  subline: string;
  alert?: boolean;
}) {
  return (
    <div className="h-[70px] rounded-[20px] bg-white px-[18px] shadow-lg shadow-black/[0.03] ring-1 ring-black/5">
      <div className="flex h-full items-center gap-3">
        <div className="shrink-0 text-[24px] leading-none">
          {icon}
        </div>

        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <p className="text-[20px] font-black leading-none text-zinc-950">
              {value}
            </p>
            <p className="truncate text-[11px] font-black leading-none text-zinc-800">
              {label}
            </p>
          </div>

          <p
            className={`mt-1 truncate text-[11px] font-semibold leading-none ${
              alert ? "text-red-500" : "text-zinc-400"
            }`}
          >
            {subline}
          </p>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  icon,
  action,
  badge,
  children,
}: {
  title: string;
  icon: string;
  action?: React.ReactNode;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.7rem] bg-white p-6 shadow-lg shadow-black/[0.03] ring-1 ring-black/5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <h2 className="text-xl font-black tracking-tight text-zinc-950">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {badge && (
            <span className="rounded-full bg-[#fbf7ef] px-3 py-1.5 text-xs font-black text-zinc-600 ring-1 ring-black/5">
              {badge}
            </span>
          )}
          {action}
        </div>
      </div>

      {children}
    </section>
  );
}

function ShowStatusBadge({ status }: { status?: string | null }) {
  const normalized = String(status || "").toLowerCase();

  if (
    normalized === "fertig" ||
    normalized === "abgeschlossen"
  ) {
    return (
      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
        bestätigt
      </span>
    );
  }

  if (normalized === "option" || normalized === "in_arbeit") {
    return (
      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
        in Planung
      </span>
    );
  }

  if (normalized === "abgesagt") {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-600">
        abgesagt
      </span>
    );
  }

  return (
    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-black text-zinc-600">
      {status || "offen"}
    </span>
  );
}

function AcquisitionStatusBadge({ status }: { status?: string | null }) {
  const normalized = String(status || "").toLowerCase();

  if (normalized.includes("neu")) {
    return (
      <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-700">
        neu
      </span>
    );
  }

  if (
    normalized.includes("interesse") ||
    normalized.includes("positiv")
  ) {
    return (
      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
        {status}
      </span>
    );
  }

  return (
    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
      {status || "offen"}
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[1.3rem] bg-[#fbf7ef] px-5 py-5 text-sm font-bold text-zinc-500 ring-1 ring-black/5">
      {text}
    </div>
  );
}

function buildAttentionItems(
  shows: any[],
  acquisition: any[],
  today: string
) {
  const items: {
    label: string;
    meta: string;
    href: string;
    critical?: boolean;
  }[] = [];

  for (const show of shows) {
    if (
      show.follow_up_date &&
      show.follow_up_date <= today &&
      !["fertig", "abgeschlossen", "archiv", "archiviert", "abgesagt"].includes(
        String(show.internal_status || "").toLowerCase()
      )
    ) {
      items.push({
        label: `Wiedervorlage: ${show.venue || "Show"}`,
        meta:
          show.follow_up_date < today
            ? "überfällig"
            : "heute",
        href: `/admin/shows/${show.id}`,
        critical: show.follow_up_date < today,
      });
    }

    if (
      show.show_date &&
      show.show_date < today &&
      !["bezahlt", "nicht_relevant"].includes(
        String(show.billing_status || "").toLowerCase()
      )
    ) {
      items.push({
        label: `Nachbereitung: ${show.venue || "Show"}`,
        meta: "Abrechnung offen",
        href: `/admin/shows/${show.id}`,
        critical: true,
      });
    }
  }

  for (const item of acquisition) {
    if (item.next_follow_up_at && item.next_follow_up_at <= today) {
      items.push({
        label: `Akquise nachfassen`,
        meta:
          item.next_follow_up_at < today
            ? "überfällig"
            : "heute",
        href: `/admin/acquisition/${item.id}`,
        critical: item.next_follow_up_at < today,
      });
    }
  }

  return items.sort((a, b) => Number(Boolean(b.critical)) - Number(Boolean(a.critical)));
}

function dateOnly(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(date?: string | null) {
  if (!date) return "–";

  const clean = String(date).slice(0, 10);
  const [year, month, day] = clean.split("-");

  if (!year || !month || !day) return date;

  return `${day}.${month}.${year}`;
}

function formatLongDate(date: Date) {
  return date.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
