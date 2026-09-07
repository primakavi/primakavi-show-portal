"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type ShowRow = {
  id: string;
  token: string;
  artist: string | null;
  program: string | null;
  show_date: string | null;
  weekday?: string | null;
  venue: string | null;
  city: string | null;
  start_time: string | null;
  entry_time: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  venue_address?: string | null;
  internal_status?: string | null;
  billing_status?: string | null;
  contract_status?: string | null;
  follow_up_date?: string | null;   // <-- NEU
  checklist?: Record<string, boolean> | null;
  markus_included?: boolean | null;
  last_portal_update?: string | null;
  last_reviewed_at?: string | null;
  show_portal_submissions?: {
    id: string;
    submitted_at?: string | null;
    reviewed_at?: string | null;
  }[] | null;
};

type FilterKey =
  | "kommend"
  | "handlung"
  | "portal"
  | "abrechnung"
  | "option"
  | "abgesagt"
  | "archiv"
  | "alle";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "kommend", label: "Kommend" },
  { key: "handlung", label: "Handlung nötig" },
  { key: "portal", label: "Neue Infos" },
  { key: "abrechnung", label: "Abrechnung" },
  { key: "option", label: "Optionen" },
  { key: "abgesagt", label: "Abgesagt" },
  { key: "archiv", label: "Archiv" },
  { key: "alle", label: "Alle" },
];

export default function AdminClient({
  shows,
  createShowAction,
  deleteShowAction,
  duplicateShowAction,
}: {
  shows: ShowRow[];
  createShowAction: () => Promise<{ id: string }>;
  deleteShowAction: (formData: FormData) => void | Promise<void>;
  duplicateShowAction: (formData: FormData) => void | Promise<void>;
}) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("kommend");
  const [year, setYear] = useState("alle");
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const today = startOfToday();
const currentYear = String(new Date().getFullYear());

const upcomingShows = shows.filter((show) => {
  const date = parseDate(show.show_date);

  return (
    date &&
    date >= today &&
    !isArchivedShow(show)
  );
});

const showsThisYear = shows.filter((show) => {
  return (
    show.show_date?.startsWith(currentYear) &&
    !isArchivedShow(show)
  );
});

const locationsThisYear = new Set(
  showsThisYear
    .map((show) => show.venue?.trim())
    .filter(Boolean)
).size;

const optionsCount = shows.filter((show) => {
  return show.internal_status === "option";
}).length;
  const years = Array.from(
    new Set(shows.map((show) => show.show_date?.slice(0, 4)).filter(Boolean))
  ).sort();

  const existingEmptyShow = useMemo(() => {
    return shows.find((show) => isEmptyShowAkte(show));
  }, [shows]);

  async function handleCreateShow() {
    if (existingEmptyShow) {
      setShowCreateConfirm(false);
      router.push(`/admin/shows/${existingEmptyShow.id}`);
      return;
    }

    setIsCreating(true);

    try {
      const result = await createShowAction();

      if (!result?.id) {
        throw new Error("Keine Show-ID zurückgegeben.");
      }

      setShowCreateConfirm(false);
      router.push(`/admin/shows/${result.id}`);
    } catch (error) {
      console.error("Fehler beim Anlegen der Show:", error);
      alert("Die Show konnte nicht angelegt werden.");
      setIsCreating(false);
      setShowCreateConfirm(false);
    }
  }

  const rows = useMemo(() => {
    return shows.filter((show) => {
      const date = parseDate(show.show_date);
      const isPast = date ? date < today : false;
      const isFuture = date ? date >= today : true;
      const archived = isArchivedShow(show);
      const actionNeeded = getActionItems(show).length > 0;
      const newPortalInfo = hasNewPortalInfo(show);
      const billingOpen =
        isPast &&
        show.billing_status !== "bezahlt" &&
        show.billing_status !== "nicht_relevant";

      const text = [
        show.artist,
        show.program,
        show.venue,
        show.city,
        show.token,
        show.contact_name,
        show.contact_email,
        show.venue_address,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = text.includes(query.toLowerCase());
      const matchesYear = year === "alle" || show.show_date?.startsWith(year);

      const matchesFilter =
        filter === "alle" ||
        (filter === "kommend" && isFuture && !archived) ||
        (filter === "handlung" && actionNeeded && !archived) ||
        (filter === "portal" && newPortalInfo && !archived) ||
        (filter === "abrechnung" && billingOpen && !archived) ||
        (filter === "option" && show.internal_status === "option") ||
        (filter === "abgesagt" && show.internal_status === "abgesagt") ||
        (filter === "archiv" && archived);

      return matchesSearch && matchesYear && matchesFilter;
    });
  }, [shows, query, filter, year, today]);

  const grouped = groupByMonth(rows);

  return (
    <div className="space-y-5 text-zinc-950 sm:space-y-6">
     <header className="flex flex-col gap-5 px-1 py-3 md:flex-row md:items-end md:justify-between">
  <div>
    <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
      PRIMAKAVI · BOOKING CRM
    </p>

    <h1 className="mt-2 text-5xl font-black tracking-tight text-zinc-950">
      Alle Shows
    </h1>

    <p className="mt-2 text-zinc-500">
      Termine, Optionen und gebuchte Shows im Überblick.
    </p>
  </div>

  <button
    type="button"
    onClick={() => setShowCreateConfirm(true)}
    className="inline-flex items-center justify-center rounded-full bg-lime-300 px-5 py-3 text-sm font-black text-zinc-950 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
  >
    + Neue Show-Akte
  </button>
</header>

<section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  <ShowStat
    icon="🎭"
    value={upcomingShows.length}
    label="Kommende Shows"
  />

  <ShowStat
    icon="📅"
    value={showsThisYear.length}
    label="Shows dieses Jahr"
  />

  <ShowStat
    icon="🏛️"
    value={locationsThisYear}
    label="Locations dieses Jahr"
  />

  <ShowStat
    icon="🟣"
    value={optionsCount}
    label="Optionen"
  />
</section>

      <section className="rounded-[1.7rem] bg-white p-4 shadow-lg shadow-black/[0.03] ring-1 ring-black/5">
        <div className="flex flex-col gap-3 xl:grid xl:grid-cols-[minmax(260px,360px)_minmax(0,1fr)_auto] xl:items-center">
          <div className="relative min-w-0">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
              🔎
            </span>

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Location, Stadt, Programm, Kontakt …"
              className="h-12 w-full rounded-xl bg-[#fbf7ef] pl-10 pr-4 text-sm font-semibold outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-black/10"
            />
          </div>

          <div className="flex min-w-0 items-center gap-2 overflow-x-auto px-0.5 pb-1 pr-4 xl:pb-0">
            {FILTERS.map((item) => {
              const isActive = filter === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  className={[
                    "flex h-10 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-xs font-black transition",
                    isActive
                      ? "bg-zinc-950 text-white shadow-sm"
                      : "bg-[#fbf7ef] text-zinc-600 ring-1 ring-black/[0.04] hover:bg-[#f5ead9] hover:text-zinc-950",
                  ].join(" ")}
                >
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <select
            value={year}
            onChange={(event) => setYear(event.target.value)}
            aria-label="Jahr auswählen"
            className="h-12 shrink-0 rounded-full bg-[#fbf7ef] px-4 text-xs font-black text-zinc-700 outline-none ring-1 ring-black/[0.05] transition hover:bg-[#f5ead9]"
          >
            <option value="alle">Alle Jahre</option>
            {years.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </section>

      {rows.length === 0 ? (
        <section className="rounded-[2rem] bg-white p-10 text-center shadow-xl shadow-black/5 ring-1 ring-black/5">
          <p className="font-black">Keine Shows gefunden.</p>
          <button
            type="button"
            onClick={() => setShowCreateConfirm(true)}
            className="mt-5 rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-black text-white"
          >
            Erste Show-Akte erstellen →
          </button>
        </section>
      ) : (
        <section className="space-y-5">
          {Object.entries(grouped).map(([month, monthShows]) => (
            <div key={month} className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xl font-black">{month}</h2>
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-zinc-500 ring-1 ring-black/5">
                  {monthShows.length} Show
                  {monthShows.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="overflow-hidden rounded-[1.7rem] bg-white shadow-lg shadow-black/[0.03] ring-1 ring-black/5">
                <div className="hidden gap-3 border-b border-black/5 px-5 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-400 md:grid md:grid-cols-[125px_minmax(220px,1.35fr)_minmax(210px,1fr)_145px_minmax(180px,1fr)_130px]">
                  <span>Datum</span>
                  <span>Location</span>
                  <span>Ort / Programm</span>
                  <span>Status</span>
                  <span>Offene Punkte</span>
                  <span className="text-right">Aktionen</span>
                </div>

                <div>
                  {monthShows.map((show) => (
                    <ShowCard
                      key={show.id}
                      show={show}
                      deleteShowAction={deleteShowAction}
                      duplicateShowAction={duplicateShowAction}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {showCreateConfirm && (
        <CreateShowConfirmModal
          existingEmptyShow={existingEmptyShow}
          isCreating={isCreating}
          onCancel={() => setShowCreateConfirm(false)}
          onConfirm={handleCreateShow}
        />
      )}
    </div>
  );
}

function CreateShowConfirmModal({
  existingEmptyShow,
  isCreating,
  onCancel,
  onConfirm,
}: {
  existingEmptyShow?: ShowRow;
  isCreating: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] bg-white p-6 shadow-2xl ring-1 ring-black/5">
        <div className="absolute right-6 top-5 text-4xl opacity-20">✨</div>

        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-pink-500">
          Sicherheitscheck
        </p>

        <h2 className="mt-3 text-2xl font-black tracking-tight text-zinc-950">
          Neue Show-Akte anlegen?
        </h2>

        {existingEmptyShow ? (
          <div className="mt-4 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-100">
            <p className="text-sm font-black text-amber-900">
              Es gibt bereits eine leere Show-Akte.
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-amber-800">
              Statt noch eine neue anzulegen, öffnen wir die vorhandene leere
              Akte. So bleibt die Liste sauber.
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm font-semibold leading-6 text-zinc-600">
            Dadurch wird eine neue leere Show-Akte erstellt. Bitte nur
            fortfahren, wenn wirklich ein neuer Termin erfasst werden soll.
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isCreating}
            className="rounded-2xl bg-zinc-100 px-5 py-3 text-sm font-black text-zinc-700 transition hover:bg-zinc-200 disabled:opacity-50"
          >
            Abbrechen
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isCreating}
            className="rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/15 disabled:translate-y-0 disabled:opacity-50"
          >
            {isCreating
              ? "Wird angelegt..."
              : existingEmptyShow
                ? "Leere Akte öffnen"
                : "Ja, Show-Akte anlegen"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ShowCard({
  show,
  deleteShowAction,
  duplicateShowAction,
}: {
  show: ShowRow;
  deleteShowAction: (formData: FormData) => void | Promise<void>;
  duplicateShowAction: (formData: FormData) => void | Promise<void>;
}) {
  const router = useRouter();
  const status = getStatus(show);
  const actions = getActionItems(show);
  const missing = getMissingFields(show);
  const isPast = isPastDate(show.show_date);
  const newPortalInfo = hasNewPortalInfo(show);

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/admin/shows/${show.id}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(`/admin/shows/${show.id}`);
        }
      }}
      className="grid cursor-pointer gap-3 border-t border-black/5 px-5 py-4 transition first:border-t-0 hover:bg-[#f7f3eb] focus:bg-[#f7f3eb] focus:outline-none md:grid-cols-[125px_minmax(220px,1.35fr)_minmax(210px,1fr)_145px_minmax(180px,1fr)_130px] md:items-center"
    >
      <div>
        <p className="text-sm font-black text-zinc-950">
          {formatDate(show.show_date)}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-zinc-400">
            {show.start_time || "Uhrzeit offen"}
          </span>
          {isPast && (
            <span className="rounded-full bg-[#fbf7ef] px-2 py-0.5 text-[10px] font-black text-zinc-500">
              vergangen
            </span>
          )}
        </div>
      </div>

      <div className="min-w-0">
        <p className="truncate text-[15px] font-black text-zinc-950">
          {show.venue || "Location offen"}
        </p>

        {newPortalInfo && (
          <div className="mt-1">
            <Badge tone="pink">✨ Neue Infos</Badge>
          </div>
        )}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-zinc-700">
          {show.city || "Ort offen"}
        </p>
        <p className="mt-1 truncate text-[11px] font-semibold text-zinc-400">
          {show.program || "Programm offen"}
          {show.markus_included && " · 🎹 Markus"}
        </p>
      </div>

      <div>
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-black ${status.className}`}
        >
          {status.label}
        </span>

        {isPast &&
          show.billing_status &&
          show.internal_status !== "abgesagt" &&
          show.internal_status !== "option" && (
            <p className="mt-1 text-[10px] font-bold text-zinc-400">
              Abrechnung: {billingLabel(show.billing_status)}
            </p>
          )}
      </div>

      <div className="flex min-w-0 flex-wrap gap-1.5">
        {actions.slice(0, 2).map((item) => {
          let tone: "red" | "green" | "blue" | "purple" | "zinc" = "red";

          if (item.includes("WVL")) tone = "blue";
          else if (item === "Spielbereit") tone = "green";
          else if (item === "Abgesagt") tone = "red";
          else if (item === "Abrechnung offen") tone = "purple";
          else if (item === "Offene Punkte vorhanden") tone = "zinc";

          return (
            <Badge key={item} tone={tone}>
              {item}
            </Badge>
          );
        })}

        {actions.length === 0 && missing.length > 0 && (
          <Badge tone="zinc">
            {missing.length} Info{missing.length === 1 ? "" : "s"} fehlen
          </Badge>
        )}
      </div>

      <div
        className="relative z-10 flex flex-wrap justify-start gap-1.5 md:justify-end"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <ActionLink href={`/show/${show.token}`} label="Formular öffnen">
          🔗
        </ActionLink>

        <form action={duplicateShowAction}>
          <input type="hidden" name="show_id" value={show.id} />
          <ActionButton label="Show duplizieren" tone="purple">
            ⧉
          </ActionButton>
        </form>

        <form
          action={deleteShowAction}
          onSubmit={(event) => {
            const ok = window.confirm(
              `Bist du sicher, dass du die Show "${
                show.venue || "ohne Location"
              }" löschen möchtest?`
            );

            if (!ok) event.preventDefault();
          }}
        >
          <input type="hidden" name="show_id" value={show.id} />
          <ActionButton label="Show löschen" tone="red">
            🗑️
          </ActionButton>
        </form>
      </div>
    </div>
  );
}

function Badge({
  tone,
  children,
}: {
  tone: "pink" | "red" | "zinc" | "green" | "blue" | "purple";
  children: React.ReactNode;
}) {
  const className = {
    pink: "bg-pink-100 text-pink-700",
    red: "bg-red-100 text-red-700",
    zinc: "bg-white text-zinc-600",
    green: "bg-emerald-100 text-emerald-700",
    blue: "bg-sky-100 text-sky-700",
    purple: "bg-purple-100 text-purple-700",
  }[tone];

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${className}`}>
      {children}
    </span>
  );
}

function ActionLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      target={href.startsWith("/show/") ? "_blank" : undefined}
      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[11px] font-black text-zinc-500 ring-1 ring-black/[0.07] transition hover:bg-[#fbf7ef] hover:text-zinc-950"
    >
      {children}
    </Link>
  );
}

function ActionButton({
  label,
  tone,
  children,
}: {
  label: string;
  tone: "purple" | "red";
  children: React.ReactNode;
}) {
  const className =
    tone === "purple"
      ? "bg-white text-zinc-500 ring-1 ring-black/[0.07] hover:bg-[#fbf7ef] hover:text-zinc-950"
      : "bg-white text-zinc-400 ring-1 ring-black/[0.07] hover:bg-red-50 hover:text-red-600 hover:ring-red-100";

  return (
    <button
      type="submit"
      title={label}
      aria-label={label}
      className={[
        "flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-black transition",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
function ShowStat({
  icon,
  value,
  label,
}: {
  icon: string;
  value: number;
  label: string;
}) {
  return (
    <div className="h-[70px] rounded-[20px] bg-white px-[18px] shadow-lg shadow-black/[0.03] ring-1 ring-black/5">
      <div className="flex h-full items-center gap-3">
        <div className="shrink-0 text-[24px] leading-none">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[20px] font-black leading-none text-zinc-950">
            {value}
          </p>

          <p className="mt-1 truncate text-[11px] font-semibold leading-none text-zinc-400">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

function isEmptyShowAkte(show: ShowRow) {
  if (isArchivedShow(show)) return false;

  return (
    !show.show_date &&
    !show.venue &&
    !show.city &&
    !show.program &&
    !show.start_time &&
    !show.contact_name &&
    !show.contact_email
  );
}

function getActionItems(show: ShowRow) {
  const items: string[] = [];
  const isPast = isPastDate(show.show_date);
  const isSoon = isWithinNextDays(show.show_date, 7);
  const hasFutureFollowUp = hasFollowUpInFuture(show.follow_up_date);

  if (show.internal_status === "abgesagt") {
    items.push("Abgesagt");
    return items;
  }

  if (
    show.internal_status === "archiv" ||
    show.internal_status === "archiviert" ||
    show.internal_status === "abgeschlossen" ||
    show.internal_status === "option"
  ) {
    return items;
  }

  if (
    isPast &&
    show.billing_status !== "bezahlt" &&
    show.billing_status !== "nicht_relevant"
  ) {
    items.push("Abrechnung offen");
    return items;
  }

  if (hasFutureFollowUp && !isSoon && !isPast) {
    items.push(`WVL ${formatDate(show.follow_up_date)}`);
    return items;
  }

  if (hasNewPortalInfo(show)) {
    items.push("Neue Infos prüfen");
  }

  if (
    !isContractDone(show.contract_status) &&
    !show.checklist?.["Vertrag geklärt"]
  ) {
    items.push("Vertrag offen");
  }

  if (!show.contact_name || !show.contact_email) {
    items.push("Kontakt fehlt");
  }

  if (!show.venue_address) {
    items.push("Adresse fehlt");
  }

  if (!show.start_time) {
    items.push("Beginn fehlt");
  }

  if (isSoon && show.internal_status !== "fertig") {
    items.push("Finalcheck");
  }

  if (items.length === 0 && show.internal_status === "fertig") {
    items.push("Spielbereit");
  }

  if (items.length === 0) {
    items.push("Offene Punkte vorhanden");
  }

  return items;
}

function getMissingFields(show: ShowRow) {
  const missing: string[] = [];

  if (!show.show_date) missing.push("Datum");
  if (!show.venue) missing.push("Location");
  if (!show.city) missing.push("Stadt");
  if (!show.start_time) missing.push("Beginn");
  if (!show.contact_name) missing.push("Kontakt");
  if (!show.contact_email) missing.push("E-Mail");
  if (!show.venue_address) missing.push("Adresse");

  return missing;
}

function getStatus(show: ShowRow) {
  if (show.internal_status === "abgeschlossen") {
    return {
      key: "fertig",
      label: "✅ Abgeschlossen",
      className: "bg-emerald-100 text-emerald-700",
    };
  }

  if (show.internal_status === "abgesagt") {
    return {
      key: "abgesagt",
      label: "❌ Abgesagt",
      className: "bg-red-100 text-red-700",
    };
  }

  if (show.internal_status === "option") {
    return {
      key: "option",
      label: "🟣 Option",
      className: "bg-purple-100 text-purple-700",
    };
  }

  if (isArchivedShow(show)) {
    return {
      key: "archiv",
      label: "📦 Archiv",
      className: "bg-zinc-200 text-zinc-700",
    };
  }

  if (
    isWithinNextDays(show.show_date, 7) &&
    !isPastDate(show.show_date)
  ) {
    return {
      key: "finalcheck",
      label: "🧭 Finalcheck",
      className: "bg-sky-100 text-sky-700",
    };
  }

  if (
    isPastDate(show.show_date) &&
    show.billing_status !== "bezahlt" &&
    show.billing_status !== "nicht_relevant"
  ) {
    return {
      key: "abrechnung",
      label: "💸 Abrechnung",
      className: "bg-orange-100 text-orange-700",
    };
  }

 if (show.internal_status === "fertig") {
  return {
    key: "fertig",
    label: "🎭 Spielbereit",
    className: "bg-emerald-100 text-emerald-700",
  };
}

  if (
    show.internal_status === "in_arbeit" ||
    show.internal_status === "wartet_auf_veranstalter" ||
    show.internal_status === "wartet_auf_sonja"
  ) {
    return {
      key: "arbeit",
      label: "🟠 In Arbeit",
      className: "bg-orange-100 text-orange-700",
    };
  }

  if (show.internal_status === "neu") {
    return {
      key: "neu",
      label: "🔴 Neu",
      className: "bg-red-100 text-red-700",
    };
  }

  return {
    key: "offen",
    label: "🔴 Offen",
    className: "bg-red-100 text-red-700",
  };
}

function hasNewPortalInfo(show: ShowRow) {
  const latestSubmission = getLatestSubmission(show);

  if (!latestSubmission?.submitted_at) return false;
  if (!show.last_reviewed_at) return true;

  return (
    new Date(latestSubmission.submitted_at).getTime() >
    new Date(show.last_reviewed_at).getTime()
  );
}

function getLatestSubmission(show: ShowRow) {
  const submissions = show.show_portal_submissions || [];

  return [...submissions].sort((a, b) => {
    return (
      new Date(b.submitted_at || "").getTime() -
      new Date(a.submitted_at || "").getTime()
    );
  })[0];
}

function isContractDone(value?: string | null) {
  const text = String(value || "").toLowerCase();

  return (
    text.includes("liegt vor") ||
    text.includes("unterschrieben") ||
    text.includes("erstellt")
  );
}

function isArchivedShow(show: ShowRow) {
  return (
    show.internal_status === "abgeschlossen" ||
    show.internal_status === "archiv" ||
    show.internal_status === "archiviert" ||
    show.internal_status === "abgesagt"
  );
}

function billingLabel(value?: string | null) {
  const labels: Record<string, string> = {
    offen: "offen",
    rechnung_zu_schreiben: "zu schreiben",
    rechnung_geschrieben: "geschrieben",
    rechnung_verschickt: "verschickt",
    bezahlt: "bezahlt",
    nicht_relevant: "nicht relevant",
  };

  return labels[value || ""] || value || "offen";
}

function groupByMonth(shows: ShowRow[]) {
  return shows.reduce<Record<string, ShowRow[]>>((acc, show) => {
    const label = monthLabel(show.show_date);
    acc[label] ||= [];
    acc[label].push(show);
    return acc;
  }, {});
}

function monthLabel(date?: string | null) {
  if (!date) return "Ohne Datum";

  const parsed = parseDate(date);
  if (!parsed) return "Ohne Datum";

  return parsed.toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric",
  });
}

function formatDate(date?: string | null) {
  if (!date) return "Datum offen";

  const parsed = parseDate(date);
  if (!parsed) return date;

  return parsed.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
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

function hasFollowUpInFuture(date?: string | null) {
  const parsed = parseDate(date);
  if (!parsed) return false;

  return parsed > startOfToday();
}

function isWithinNextDays(date?: string | null, days = 7) {
  const parsed = parseDate(date);
  if (!parsed) return false;
  const today = startOfToday();
  const limit = new Date(today);
  limit.setDate(limit.getDate() + days);

  return parsed >= today && parsed <= limit;
}
