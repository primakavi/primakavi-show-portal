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
  | "archiv"
  | "alle";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "kommend", label: "Kommend" },
  { key: "handlung", label: "Handlung nötig" },
  { key: "portal", label: "Neue Infos" },
  { key: "abrechnung", label: "Abrechnung" },
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
        (filter === "archiv" && archived);

      return matchesSearch && matchesYear && matchesFilter;
    });
  }, [shows, query, filter, year, today]);

  const grouped = groupByMonth(rows);

  return (
    <div className="space-y-5 text-zinc-950 sm:space-y-6">
      <header className="relative overflow-hidden rounded-[2.4rem] bg-[#101014] p-10 text-white shadow-2xl shadow-black/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(255,105,180,0.38),transparent_28%),radial-gradient(circle_at_35%_25%,rgba(255,145,60,0.28),transparent_35%),radial-gradient(circle_at_70%_95%,rgba(190,255,90,0.13),transparent_28%)]" />
        <div className="absolute right-146 top-10 rotate-6 text-7xl text-pink-400">
          ♕
        </div>
        <div className="absolute right-20 top-18 text-5xl text-orange-300">
          ✨
        </div>

        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-white/50">
              primakavi · show admin
            </p>
            <h1 className="mt-4 text-5xl font-black tracking-tight">
              Alle Shows
            </h1>
            <p className="mt-4 max-w-xl text-white/70">
              Alle Shows im Überblick – alle Infos an einem Ort.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateConfirm(true)}
            className="rounded-3xl bg-gradient-to-r from-pink-400 to-orange-400 px-6 py-4 font-black text-white shadow-xl transition hover:scale-[1.02]"
          >
            Neue Show-Akte erstellen
          </button>
        </div>
      </header>

      <section className="rounded-[2rem] bg-white p-5 shadow-xl shadow-black/5 ring-1 ring-black/5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Suche nach Location, Stadt, Programm, Kontakt..."
            className="h-14 rounded-2xl border border-zinc-200 bg-[#fbf7ef] px-5 text-sm font-semibold outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
          />

          <select
            value={year}
            onChange={(event) => setYear(event.target.value)}
            className="h-14 rounded-2xl border border-zinc-200 bg-[#fbf7ef] px-5 text-sm font-black outline-none"
          >
            <option value="alle">Alle Jahre</option>
            {years.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          {FILTERS.map((item) => {
            const isActive = filter === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className={[
                  "flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-xs font-black transition sm:px-4 sm:text-sm",
                  isActive
                    ? "bg-zinc-950 text-white shadow-md ring-2 ring-zinc-950/10"
                    : "bg-[#fbf7ef] text-zinc-700 hover:bg-[#f5ead9]",
                ].join(" ")}
              >
                {isActive && <span className="h-2 w-2 rounded-full bg-white" />}
                <span>{item.label}</span>
              </button>
            );
          })}
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
            <div
              key={month}
              className="rounded-[2rem] bg-white p-5 shadow-xl shadow-black/5 ring-1 ring-black/5"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-black">{month}</h2>
                <span className="rounded-full bg-[#fbf7ef] px-3 py-1 text-xs font-black text-zinc-500">
                  {monthShows.length} Show
                  {monthShows.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="space-y-3">
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
  const status = getStatus(show);
  const actions = getActionItems(show);
  const missing = getMissingFields(show);
  const isPast = isPastDate(show.show_date);
  const newPortalInfo = hasNewPortalInfo(show);

  return (
    <article className="relative overflow-hidden rounded-3xl bg-[#fbf7ef] p-5 transition hover:-translate-y-0.5 hover:bg-[#f5ead9]">
      <div className="grid gap-4 md:grid-cols-[130px_1fr_160px_190px] md:items-start">
        <div>
          <p className="text-lg font-black">{formatDate(show.show_date)}</p>
          <p className="mt-1 text-xs font-bold text-zinc-500">
            {show.start_time || "Uhrzeit offen"}
          </p>
          {isPast && (
            <p className="mt-2 inline-flex rounded-full bg-white px-2 py-1 text-[11px] font-black text-zinc-500">
              vergangen
            </p>
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate text-xl font-black">
            {show.venue || "Location offen"}
          </p>

          <p className="text-sm font-semibold text-zinc-500">
            {show.city || "Ort offen"} · {show.program || "Programm offen"}
            {show.markus_included && " · 🎹 Markus"}
          </p>

          {(newPortalInfo || actions.length > 0 || missing.length > 0) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {newPortalInfo && <Badge tone="pink">✨ Neue Infos</Badge>}

              {actions.slice(0, 2).map((item) => (
                <Badge key={item} tone="red">
                  {item}
                </Badge>
              ))}

              {actions.length === 0 && missing.length > 0 && (
                <Badge tone="zinc">
                  {missing.length} Info
                  {missing.length === 1 ? "" : "s"} fehlen
                </Badge>
              )}
            </div>
          )}
        </div>

        <div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-black ${status.className}`}
          >
            {status.label}
          </span>

          {show.billing_status && (
            <p className="mt-2 text-xs font-bold text-zinc-500">
              Abrechnung: {billingLabel(show.billing_status)}
            </p>
          )}
        </div>

        <div className="relative z-10 flex flex-wrap justify-start gap-2 md:justify-end">
          <ActionLink href={`/admin/shows/${show.id}`} label="Akte öffnen">
            ✏️
          </ActionLink>

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
    </article>
  );
}

function Badge({
  tone,
  children,
}: {
  tone: "pink" | "red" | "zinc";
  children: React.ReactNode;
}) {
  const className = {
    pink: "bg-pink-100 text-pink-700",
    red: "bg-red-100 text-red-700",
    zinc: "bg-white text-zinc-600",
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
      className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-sm font-black text-white shadow-lg shadow-black/10 transition hover:scale-105"
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
      ? "bg-purple-100 text-purple-700"
      : "bg-red-100 text-red-700";

  return (
    <button
      type="submit"
      title={label}
      aria-label={label}
      className={[
        "flex h-10 w-10 items-center justify-center rounded-full text-sm font-black transition hover:scale-105",
        className,
      ].join(" ")}
    >
      {children}
    </button>
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

  if (hasNewPortalInfo(show)) items.push("Neue Infos prüfen");

  if (!isContractDone(show.contract_status)) {
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

  if (
    isPast &&
    show.billing_status !== "bezahlt" &&
    show.billing_status !== "nicht_relevant"
  ) {
    items.push("Abrechnung offen");
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

  if (isArchivedShow(show)) {
    return {
      key: "archiv",
      label: "📦 Archiv",
      className: "bg-zinc-200 text-zinc-700",
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
      label: "🟢 Fertig",
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
    show.internal_status === "archiviert"
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