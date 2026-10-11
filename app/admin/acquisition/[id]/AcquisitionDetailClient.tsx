"use client";
import Link from "next/link";
import BookingMailComposer from "./BookingMailComposer";
import type { Mail as BookingMail } from "./AcquisitionMailHistory";
import { useCallback, useEffect, useState, type ReactNode } from "react";
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
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_name_2: string | null;
  contact_email_2: string | null;
  contact_phone_2: string | null;
  booking_email: string | null;
  relationship_status: string | null;
};
type LinkedVenue = { id: string; name: string; city: string | null; is_primary: boolean };
type OrganizerContact = { id: string; name: string; role: string | null; email: string | null; phone: string | null; notes: string | null; is_primary: boolean; };
type Organizer = { id: string; name: string; organizer_type: string | null; website: string | null; email: string | null; phone: string | null; street: string | null; postal_code: string | null; city: string | null; country: string | null; relationship_status: string | null; notes: string | null; organizer_contacts?: OrganizerContact[] | null; };
type CrmContact = { id: string; name: string; role: string | null; email: string | null; phone: string | null; notes: string | null; is_primary: boolean; };
type CrmTask = { id: string; title: string; description: string | null; task_type: string; due_at: string | null; completed_at: string | null; priority: string; created_at: string; };
type AcquisitionActivity = {
  id: string;
  acquisition_id: string;
  activity_date: string;
  activity_type: string | null;
  channel: string | null;
  subject: string | null;
  note: string | null;
  response: string | null;
  next_step: string | null;
  follow_up_at: string | null;
  status_after: string | null;
  interest_after: string | null;
  created_at: string | null;
  follow_up_status_override?: "open" | "done" | null;
};
type NewsletterEvent = {
  id: string;
  acquisition_id: string | null;
  venue_id: string | null;
  organizer_id: string | null;
  email: string | null;
  sent_at: string | null;
  scheduled_at: string | null;
  created_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  last_clicked_url: string | null;
  bounced_at: string | null;
  unsubscribed_at: string | null;
};
type Acquisition = {
  id: string;
  venue_id: string | null;
  organizer_id: string | null;
  program: string | null;
  status: string | null;
  priority: string | null;
  last_contact_at: string | null;
  next_follow_up_at: string | null;
  contact_channel: string | null;
  contact_note: string | null;
  response: string | null;
  next_step: string | null;
  rejection_reason: string | null;
  interest: string | null;
  notes: string | null;
  action_type: string | null;
  context: string | null;
  converted_to_show: boolean;
  show_date: string | null;
  archived_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};
const STATUS_OPTIONS = [
  "Neu", "Vorqualifiziert", "Insta", "Kontaktiert", "Follow-up 1",
  "Follow-up 2", "Rückmeldung", "Interesse", "Verhandlung", "Gebucht 🎉", "Abgesagt",
];
const PRIORITY_OPTIONS = ["Niedrig", "Normal", "Hoch"];
const PROGRAM_OPTIONS = [
  "Jetzt mal Tacheles",
  "Süßer die Glocken nie hingen",
  "TYPisch FRAU?!",
  "Volljährig",
];
const INTEREST_OPTIONS = [
  "", "Kein Interesse", "Offen", "Grundsätzliches Interesse",
  "Konkretes Interesse", "Sehr interessiert",
];
/** Gemeinsame Eingabemaske für neue und bestehende Akquise-Aktivitäten. */
function ActivityFields({ acquisitionId, activity }: { acquisitionId: string; activity?: AcquisitionActivity }) {
  return (
    <>
      <input type="hidden" name="acquisition_id" value={acquisitionId} />
      {activity && <input type="hidden" name="activity_id" value={activity.id} />}
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Datum">
          <input type="date" name="activity_date" defaultValue={activity?.activity_date || today()} className={inputClass} />
        </Field>
        <Field label="Art des Eintrags">
          <select name="activity_type" defaultValue={activity?.activity_type || "Notiz"} className={inputClass}>
            {["Kontaktversuch", "Automatische Antwort", "Rückmeldung", "Telefonat", "Persönlicher Kontakt", "Notiz", "Absage", "Buchung"].map((value) => <option key={value}>{value}</option>)}
          </select>
        </Field>
        <Field label="Kontaktweg">
          <select name="activity_channel" defaultValue={activity?.channel || ""} className={inputClass}>
            <option value="">Bitte wählen …</option>
            {["E-Mail", "Telefon", "Schriftlich", "Instagram", "Persönlich", "Notiz"].map((value) => <option key={value}>{value}</option>)}
          </select>
        </Field>
        <Field label="Betreff">
          <input name="activity_subject" defaultValue={activity?.subject || ""} placeholder="z. B. Gastspielanfrage Spielzeit 2027/28" className={inputClass} />
        </Field>
      </div>
      <div className="mt-3 space-y-3">
        <Field label="Was ist passiert?">
          <textarea name="activity_note" rows={3} defaultValue={activity?.note || ""} placeholder="Programm vorgestellt, Rückruf erhalten …" className={textareaClass} />
        </Field>
        <Field label="Rückmeldung">
          <textarea name="activity_response" rows={3} defaultValue={activity?.response || ""} placeholder="Grundsätzliches Interesse, noch offen …" className={textareaClass} />
        </Field>
        <Field label="Nächster Schritt">
          <textarea name="activity_next_step" rows={3} defaultValue={activity?.next_step || ""} placeholder="In zwei Wochen nachfassen …" className={textareaClass} />
        </Field>
        <div className="max-w-xs">
          <Field label="Wiedervorlage">
            <input type="date" name="activity_follow_up_at" defaultValue={activity?.follow_up_at || ""} className={inputClass} />
          </Field>
        </div>
      </div>
    </>
  );
}
export default function AcquisitionDetailClient({
  acquisition,
  venue,
  organizer,
  linkedVenues = [],
  linkedShowId,
  wasSaved,
  activityWasSaved,
  activities = [],
  newsletterEvents = [],
  crmContacts = [],
  crmTasks = [],
  addTask,
  toggleTask,
  setActivityFollowUpStatus,
  setEmailFollowUpStatus,
  addActivity,
  updateActivity,
  deleteActivity,
  deleteAcquisition,
  saveAcquisition,
  archiveAcquisition,
  createShowFromAcquisition,
}: {
  acquisition: Acquisition;
  venue: Venue | null;
  organizer: Organizer | null;
  linkedVenues?: LinkedVenue[];
  linkedShowId: string | null;
  wasSaved: boolean;
  activityWasSaved: boolean;
  activities: AcquisitionActivity[];
  newsletterEvents?: NewsletterEvent[];
  crmContacts: CrmContact[];
  crmTasks: CrmTask[];
  addTask: (formData: FormData) => Promise<void>;
  toggleTask: (formData: FormData) => Promise<void>;
  setActivityFollowUpStatus: (formData: FormData) => Promise<void>;
  setEmailFollowUpStatus: (formData: FormData) => Promise<void>;
  addActivity: (formData: FormData) => Promise<void>;
  updateActivity: (formData: FormData) => Promise<void>;
  deleteActivity: (formData: FormData) => Promise<void>;
  deleteAcquisition: (formData: FormData) => Promise<void>;
  saveAcquisition: (formData: FormData) => Promise<void>;
  archiveAcquisition: (formData: FormData) => Promise<void>;
  createShowFromAcquisition: (formData: FormData) => Promise<void>;
}) {
  const [showMailComposer, setShowMailComposer] = useState(false);
  const [mailRefreshKey, setMailRefreshKey] = useState(0);
  const [replyMail, setReplyMail] = useState<BookingMail | null>(null);
  const [timelineEmails, setTimelineEmails] = useState<(BookingMail & { follow_up_at?: string | null; follow_up_status_override?: "open" | "done" | null })[]>([]);
  const [mailLoadError, setMailLoadError] = useState("");
  const [expandedMailId, setExpandedMailId] = useState<string | null>(null);
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);
  const [expandedNewsletterId, setExpandedNewsletterId] = useState<string | null>(null);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const refreshTimelineEmails = useCallback(async () => {
    try {
      const response = await fetch(`/api/booking-mail/acquisition/${encodeURIComponent(acquisition.id)}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "E-Mails konnten nicht geladen werden.");
      setTimelineEmails(payload.emails || []);
      setMailLoadError("");
    } catch (error) { setMailLoadError(error instanceof Error ? error.message : "E-Mails konnten nicht geladen werden."); }
  }, [acquisition.id]);
  useEffect(() => { void refreshTimelineEmails(); }, [refreshTimelineEmails, mailRefreshKey]);
  const timelineItems = [
    ...activities.map(activity => ({ kind: "activity" as const, activity, date: activity.activity_date, time: activity.created_at || activity.activity_date, id: `a-${activity.id}` })),
    ...timelineEmails.map(mail => ({ kind: "email" as const, mail, date: mail.sent_at || mail.received_at || mail.created_at, time: mail.sent_at || mail.received_at || mail.created_at, id: `m-${mail.id}` })),
  ...newsletterEvents.map(newsletter => ({ kind: "newsletter" as const, newsletter, date: newsletter.sent_at || newsletter.scheduled_at || newsletter.created_at || newsletter.opened_at || newsletter.clicked_at || "1970-01-01", time: newsletter.sent_at || newsletter.scheduled_at || newsletter.created_at || newsletter.opened_at || newsletter.clicked_at || "1970-01-01", id: `n-${newsletter.id}` })),
  ].sort((a, b) => {
    const day = b.date.slice(0, 10).localeCompare(a.date.slice(0, 10));
    return day || b.time.localeCompare(a.time);
  });
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [pipelineStatus, setPipelineStatus] = useState(acquisition.status || "Neu");
  const [rejectionReason, setRejectionReason] = useState(acquisition.rejection_reason || "");
  const isArchived = Boolean(acquisition.archived_at);
  const isOrganizerAcquisition = Boolean(organizer);
  const primaryOrganizerContact = organizer?.organizer_contacts?.find((contact) => contact.is_primary) || organizer?.organizer_contacts?.[0] || null;
  const primaryCrmContact = crmContacts.find((contact) => contact.is_primary) || crmContacts[0] || null;
  // Contact-related reminders are shown only in the contact timeline.
  // Explicitly created CRM tasks remain in the right sidebar.
  const contactEvents = [
    ...activities.filter(a => ["Kontakt", "Rückmeldung", "Telefonat", "Persönlicher Kontakt", "Absage", "Buchung"].includes(a.activity_type || ""))
      .map(a => ({ date: a.activity_date, timestamp: a.created_at || `${a.activity_date}T00:00:00` })),
    ...timelineEmails.filter(m => m.status === "sent" || m.direction === "incoming")
      .map(m => ({ date: (m.sent_at || m.received_at || m.created_at || "").slice(0,10), timestamp: m.sent_at || m.received_at || m.created_at || "" })),
  ].filter(e => e.date);
  const getLaterContactDate = (date: string, timestamp: string) => {
    const next = contactEvents.filter(e => e.date > date || (e.date === date && e.timestamp > timestamp))
      .sort((a,b) => a.timestamp.localeCompare(b.timestamp))[0];
    return next?.date || null;
  };
  const activityFollowUps = activities.filter(a => Boolean(a.follow_up_at) && !a.id.startsWith("legacy-"))
    .map(a => {
      const nextDate = getLaterContactDate(a.activity_date, a.created_at || `${a.activity_date}T23:59:59`);
      const done = a.follow_up_status_override === "done" || (a.follow_up_status_override !== "open" && Boolean(nextDate));
      return { activity: a, done, completedDate: nextDate };
    });
  const activityWvlStatus = new Map(activityFollowUps.map(x => [x.activity.id, x]));
  const emailFollowUps = timelineEmails.filter(m => m.status === "sent" && Boolean(m.follow_up_at))
    .map(m => {
      const stamp = m.sent_at || m.created_at;
      const nextDate = getLaterContactDate(stamp.slice(0,10), stamp);
      const done = m.follow_up_status_override === "done" || (m.follow_up_status_override !== "open" && Boolean(nextDate));
      return { mail: m, done, completedDate: nextDate };
    });
  const emailWvlStatus = new Map(emailFollowUps.map(x => [x.mail.id, x]));
  // Old automatically generated email reminders are tagged contact_follow_up.
  // Historical ambiguous follow_up tasks are NOT silently hidden or deleted.
  const displayedCrmTasks = crmTasks.filter(t => t.task_type !== "contact_follow_up");
  const openTasks = displayedCrmTasks.filter(t => !t.completed_at).slice().sort((a,b) => (a.due_at || "9999").localeCompare(b.due_at || "9999"));
  const completedTasks = displayedCrmTasks.filter(t => Boolean(t.completed_at));
  const nextTask = openTasks[0] || null;
  const title = organizer?.name || venue?.name || "Akquise";
  const locationLine = organizer ? [organizer.city, organizer.country].filter(Boolean).join(", ") : [venue?.city, venue?.state].filter(Boolean).join(", ");
  const address = organizer ? [organizer.street, [organizer.postal_code, organizer.city].filter(Boolean).join(" "), organizer.country].filter(Boolean) : [venue?.street, [venue?.postal_code, venue?.city].filter(Boolean).join(" "), venue?.country].filter(Boolean);
  return (
    <main className="min-h-screen bg-[#fbf7ef] px-5 py-6 pb-20 text-zinc-950 md:px-8">
      <div className="mx-auto max-w-[1500px]">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-zinc-500">
          primakavi · booking crm
        </p>
        <div className="mt-5">
          <Link
            href="/admin/acquisition"
            onClick={(event) => {
              try {
                if (sessionStorage.getItem("primakavi-acquisition-list")) {
                  event.preventDefault();
                  window.history.back();
                }
              } catch { /* Normalen Link verwenden. */ }
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-black shadow-sm transition hover:bg-zinc-50"
          >
            ← Zur Akquise
          </Link>
        </div>
        <header className="mt-4 overflow-hidden rounded-[28px] border border-black/[0.07] bg-white shadow-sm">
          <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
                <span>Opportunity</span><span>·</span><span>{acquisition.program || "Programm offen"}</span>
              </div>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 md:text-5xl">{title}</h1>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-black/[0.06] bg-[#f7f4ed] px-3 py-1.5 text-xs font-black text-zinc-600">⌖ {locationLine || "Ort offen"}</span>
                <span className="rounded-full border border-black/[0.06] bg-[#f7f4ed] px-3 py-1.5 text-xs font-black text-zinc-600">Priorität: {acquisition.priority || "Normal"}</span>
                {acquisition.interest && <span className="rounded-full border border-lime-200 bg-lime-50 px-3 py-1.5 text-xs font-black text-zinc-700">♥ {acquisition.interest}</span>}
                {isArchived && <span className="rounded-full border border-black/[0.06] bg-zinc-100 px-3 py-1.5 text-xs font-black text-zinc-600">📦 abgeschlossen</span>}
              </div>
            </div>
            <div className="border-t border-black/[0.06] bg-[#f7f4ed] p-6 xl:border-l xl:border-t-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Nächste Aktion</p>
              <p className="mt-2 text-xl font-black text-zinc-950">{nextTask?.title || acquisition.next_step || "Noch keine Aufgabe"}</p>
              <p className="mt-1 text-sm font-semibold text-zinc-500">{nextTask?.due_at ? `Fällig ${new Date(nextTask.due_at).toLocaleDateString("de-DE")}` : acquisition.next_follow_up_at ? `Follow-up ${formatDate(acquisition.next_follow_up_at)}` : "Wiedervorlage offen"}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {linkedShowId ? <Link href={`/admin/shows/${linkedShowId}`} className="rounded-xl bg-lime-300 px-4 py-2.5 text-sm font-black text-zinc-950 shadow-sm">🎉 Show öffnen</Link> : <form action={createShowFromAcquisition}><input type="hidden" name="acquisition_id" value={acquisition.id} /><button type="submit" className="rounded-xl bg-lime-300 px-4 py-2.5 text-sm font-black text-zinc-950 shadow-sm">🎉 Show anlegen</button></form>}
                <Link href={organizer ? `/admin/organizers/${organizer.id}` : `/admin/locations/${venue?.id}`} className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-black text-zinc-700 shadow-sm">{organizer ? "Veranstalter" : "Location"} ↗</Link>
              </div>
            </div>
          </div>
        </header>
        <div className="mt-5 rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Pipeline</p>
            <p className="text-xs font-bold text-zinc-500">Stand: {pipelineStatus === "Follow-up 1" || pipelineStatus === "Follow-up 2" ? "Kontaktiert" : pipelineStatus}</p>
          </div>
          {(() => {
            const steps = ["Neu", "Kontaktiert", "Rückmeldung", "Interesse", "Verhandlung"];
            const normalized = pipelineStatus.startsWith("Follow-up") ? "Kontaktiert"
              : ["Vorqualifiziert", "Insta"].includes(pipelineStatus) ? "Neu"
              : pipelineStatus === "Antwort" ? "Rückmeldung" : pipelineStatus;
            const closedWon = pipelineStatus === "Gebucht 🎉";
            const closedLost = pipelineStatus === "Abgesagt";
            const currentIndex = steps.indexOf(normalized);
            return (
              <>
                <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">
                  {steps.map((step, index) => {
                    const active = !closedWon && !closedLost && currentIndex >= index;
                    const current = !closedWon && !closedLost && currentIndex === index;
                    return <div key={step} className={`rounded-xl border px-3 py-3 text-center text-xs font-black ${current ? "border-lime-300 bg-lime-300 text-zinc-950" : active ? "border-lime-200 bg-lime-50 text-zinc-700" : "border-black/5 bg-zinc-50 text-zinc-400"}`}>{index + 1} {step}</div>;
                  })}
                </div>
                {(closedWon || closedLost) && (
                  <div className={`mt-3 rounded-xl border px-4 py-3 text-sm font-black ${closedWon ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>
                    {closedWon ? "✓ Erfolgreich abgeschlossen · Gebucht" : "✕ Abgeschlossen · Abgesagt"}
                    {closedLost && rejectionReason && <p className="mt-1 text-xs font-semibold">Grund: {rejectionReason}</p>}
                  </div>
                )}
              </>
            );
          })()}
        </div>
        <form action={saveAcquisition} className="mt-5 space-y-5">
          <input type="hidden" name="id" value={acquisition.id} />
          {/* Sprint 3: Verlauf im Fokus, Kontakte und Aufgaben rechts. */}
<div className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,0.85fr)]">
<div className="flex min-w-0 flex-col">
<Card className="flex min-w-0 flex-1 flex-col">
            <div className="flex shrink-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle icon="◌">Akquise-Verlauf</CardTitle>
                <p className="mt-1 text-sm font-semibold text-zinc-500">
                  Alle Kontakte, Gespräche und wichtigen Schritte auf einen Blick.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {!isArchived && <button type="button" onClick={() => { setReplyMail(null); setShowMailComposer(true); }} className="inline-flex items-center gap-2 rounded-lg bg-lime-300 px-3 py-2 text-xs font-black text-zinc-950 shadow-sm"><TimelineIcon kind="email" /> E-Mail schreiben</button>}
              {!isArchived && (
                <button
                  type="button"
                  onClick={() => setShowActivityForm((open) => !open)}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-black shadow-sm transition hover:bg-zinc-50"
                >
                  {showActivityForm ? "× Eingabe schließen" : "＋ Eintrag hinzufügen"}
                </button>
              )}
              </div>
            </div>
            <div className="mt-5 max-h-[560px] min-h-[180px] overflow-y-auto bg-white pr-1">
              {mailLoadError && <p role="alert" className="mb-3 text-sm text-red-700">{mailLoadError} <button type="button" className="underline" onClick={() => void refreshTimelineEmails()}>Erneut laden</button></p>}
              {timelineItems.length === 0 ? (
                <div className="py-5 text-sm font-semibold text-zinc-400">
                  Noch keine Kontakte in der Historie.
                </div>
              ) : (
                timelineItems.map((item, index) => {
                  if (item.kind === "newsletter") {
                  const n = item.newsletter;
                  const expanded = expandedNewsletterId === n.id;
                  const relatedOnly = n.acquisition_id !== acquisition.id;
                  return (
                    <div key={item.id} className="grid grid-cols-[18px_minmax(0,1fr)] gap-3">
                      <div className="flex flex-col items-center pt-[19px]">
                        <span className="h-3 w-3 shrink-0 rounded-full bg-fuchsia-500 ring-2 ring-white" />
                        {index < timelineItems.length - 1 && <span className="mt-2 min-h-5 w-px flex-1 border-l border-dashed border-zinc-300" />}
                      </div>
                      <div className="min-w-0 border-b border-zinc-200 py-4">
                        <button type="button" onClick={() => setExpandedNewsletterId(expanded ? null : n.id)} className="flex w-full min-w-0 items-center gap-3 rounded-lg py-1 text-left hover:bg-zinc-50">
                          <span className="w-[82px] shrink-0 text-xs font-bold text-zinc-700">{formatDate((n.sent_at || n.scheduled_at || n.created_at)?.slice(0, 10))}</span>
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-fuchsia-50 text-fuchsia-700">✉</span>
                          <span className="min-w-0 flex-1 truncate text-sm font-bold text-zinc-900">Veranstalter-Newsletter</span>
                          <span className="hidden shrink-0 text-xs font-semibold text-zinc-500 sm:inline">{n.clicked_at ? "✓ Geklickt" : n.opened_at ? "✓ Geöffnet" : "Versendet"}</span>
                          <span className="shrink-0 text-zinc-500">{expanded ? "⌃" : "⌄"}</span>
                        </button>
                        {expanded && <div className="mt-3 space-y-2 rounded-xl bg-[#fffdf8] p-4 text-sm text-zinc-700">
                          {relatedOnly && <p className="font-semibold text-amber-800">Newsletter für denselben Standort/Veranstalter – nicht direkt mit dieser Akquise verknüpft.</p>}
                          {n.email && <p>Empfänger: {n.email}</p>}
                          <p>{n.sent_at ? "Versendet" : n.scheduled_at ? "Geplant" : "Erfasst"}: {formatDateTime(n.sent_at || n.scheduled_at || n.created_at)}</p>
                          {n.opened_at && <p>Geöffnet: {formatDateTime(n.opened_at)}</p>}
                          {n.clicked_at && <p>Geklickt: {formatDateTime(n.clicked_at)}</p>}
                          {n.last_clicked_url && <p className="break-all">Link: <a href={normalizeUrl(n.last_clicked_url)} target="_blank" rel="noreferrer" className="text-blue-700 underline">{n.last_clicked_url}</a></p>}
                          {n.bounced_at && <p className="font-semibold text-red-700">Bounce: {formatDateTime(n.bounced_at)}</p>}
                          {n.unsubscribed_at && <p>Abgemeldet: {formatDateTime(n.unsubscribed_at)}</p>}
                        </div>}
                      </div>
                    </div>
                  );
                }
                if (item.kind === "email") {
                    const mail = item.mail;
                    const expanded = expandedMailId === mail.id;
                    return <div key={item.id} className="grid grid-cols-[18px_minmax(0,1fr)] gap-3">
                      <div className="flex flex-col items-center pt-[19px]">
                        <span className="h-3 w-3 shrink-0 rounded-full bg-lime-400 ring-2 ring-white" />
                        {index < timelineItems.length - 1 && <span className="mt-2 min-h-5 w-px flex-1 border-l border-dashed border-zinc-300" />}
                      </div>
                      <div className="min-w-0 border-b border-zinc-200 py-4">
                        <button type="button" onClick={() => setExpandedMailId(expanded ? null : mail.id)} className="flex w-full min-w-0 items-center gap-3 rounded-lg py-1 text-left hover:bg-zinc-50">
                          <span className="w-[82px] shrink-0 text-xs font-bold text-zinc-700">{new Date(item.date).toLocaleDateString("de-DE")}<span className="mt-1 block font-medium text-zinc-400">{new Date(item.date).toLocaleTimeString("de-DE", {hour:"2-digit",minute:"2-digit"})}</span></span>
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700"><TimelineIcon kind="email" /></span>
                          <span className="min-w-0 flex-1 truncate text-sm font-bold text-zinc-900">{mail.subject || "(Ohne Betreff)"}</span>
                          {emailWvlStatus.has(mail.id) && <span className={`hidden shrink-0 rounded-md px-2 py-1 text-[11px] font-bold sm:inline ${emailWvlStatus.get(mail.id)?.done ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-800"}`}>{emailWvlStatus.get(mail.id)?.done ? `✓ Erledigt${mail.follow_up_status_override === "done" ? " (manuell)" : emailWvlStatus.get(mail.id)?.completedDate ? ` am ${formatDate(emailWvlStatus.get(mail.id)?.completedDate)}` : ""}` : `WVL ${formatDate(mail.follow_up_at)}`}</span>}
<span className="hidden shrink-0 text-xs font-semibold text-zinc-500 sm:inline">{mail.status === "sent" ? "✓ Versendet" : mail.status === "sending" ? "Versand prüfen" : mail.status}</span>
                          <span className="shrink-0 text-zinc-500">{expanded ? "⌃" : "⌄"}</span>
                        </button>
                        {expanded && <div className="mt-3 rounded-xl bg-[#fffdf8] p-4"><p className="whitespace-pre-wrap break-words text-sm text-zinc-800">{mail.body_text || "(Kein Nachrichtentext gespeichert)"}</p>{mail.follow_up_at && <div className="mt-3 flex items-center gap-3"><span className="text-xs font-semibold">Wiedervorlage: {formatDate(mail.follow_up_at)}</span><button type="submit" form={`toggle-email-wvl-${mail.id}`} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-bold">{emailWvlStatus.get(mail.id)?.done ? "↺ WVL wieder öffnen" : "✓ WVL erledigen"}</button></div>}{mail.status === "sent" && <button type="button" disabled={!mail.message_id} onClick={() => { setReplyMail(mail); setShowMailComposer(true); }} className="mt-3 rounded-xl bg-lime-300 px-4 py-2 text-sm font-black disabled:opacity-50">↩ Antworten / Follow-up</button>}</div>}
                      </div>
                    </div>;
                  }
                  const activity = item.activity;
                  const isEditing = editingActivityId === activity.id;
                  const isExpanded = expandedActivityId === activity.id;
                  return (
                    <div key={activity.id} className="grid grid-cols-[18px_minmax(0,1fr)] gap-3">
                      <div className="flex flex-col items-center pt-[19px]">
                        <span className={`h-3 w-3 shrink-0 rounded-full ring-2 ring-white ${dotClass(index)}`} />
                        {index < timelineItems.length - 1 && <span className="mt-2 min-h-5 w-px flex-1 border-l border-dashed border-zinc-300" />}
                      </div>
                      {isEditing ? (
                        <div className="rounded-xl border border-lime-200 bg-[#fffdf8] p-4 shadow-sm">
                          <ActivityFields acquisitionId={acquisition.id} activity={activity} />
                          <div className="mt-3 flex justify-end gap-2 border-t border-black/[0.06] pt-3">
                            <button
                              type="button"
                              onClick={() => setEditingActivityId(null)}
                              className="rounded-xl border border-black/10 bg-white px-5 py-2.5 text-sm font-black text-zinc-500 transition hover:bg-zinc-50"
                            >
                              Abbrechen
                            </button>
                            <button
                              type="submit"
                              formAction={updateActivity}
                              className="rounded-xl bg-lime-300 px-6 py-2.5 text-sm font-black shadow-sm transition hover:-translate-y-0.5"
                            >
                              ✓ Änderungen speichern
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="min-w-0 border-b border-zinc-200 py-4">
                          <button type="button" onClick={() => setExpandedActivityId(isExpanded ? null : activity.id)} className="flex w-full min-w-0 items-center gap-3 rounded-lg py-1 text-left hover:bg-zinc-50">
                            <span className="w-[82px] shrink-0 text-xs font-bold text-zinc-700">{formatDate(activity.activity_date)}<span className="mt-1 block font-medium text-zinc-400">{formatCreatedTime(activity.created_at)}</span></span>
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-800"><TimelineIcon kind={activity.channel || activity.activity_type || "note"} /></span>
                            <span className="min-w-0 flex-1 truncate text-sm font-bold text-zinc-900">{activity.subject || activity.note || activity.activity_type || "Kontakt"}</span>
                            {activity.follow_up_at && <span className={`hidden shrink-0 rounded-md px-2 py-1 text-[11px] font-bold sm:inline ${activityWvlStatus.get(activity.id)?.done ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-800"}`}>{activityWvlStatus.get(activity.id)?.done ? `✓ Erledigt${activity.follow_up_status_override === "done" ? " (manuell)" : activityWvlStatus.get(activity.id)?.completedDate ? ` am ${formatDate(activityWvlStatus.get(activity.id)?.completedDate)}` : ""}` : `WVL ${formatDate(activity.follow_up_at)}`}</span>}
                            <span className="shrink-0 text-zinc-500">{isExpanded ? "⌃" : "⌄"}</span>
                          </button>
                          {isExpanded && <div className="mt-3 space-y-2 rounded-xl bg-[#fffdf8] p-4 text-sm text-zinc-700">
                            {activity.subject && <p className="font-bold">{activity.subject}</p>}
                            <p className="text-xs font-semibold text-zinc-500">{activity.channel || activity.activity_type || "Kontakt"}</p>
                            {activity.note && <p className="whitespace-pre-wrap break-words">{activity.note}</p>}
                            {activity.response && <p className="whitespace-pre-wrap break-words"><strong>Rückmeldung:</strong> {activity.response}</p>}
                            {activity.next_step && <p><strong>Nächster Schritt:</strong> {activity.next_step}</p>}
                            {activity.follow_up_at && <p><strong>Wiedervorlage:</strong> {formatDate(activity.follow_up_at)}</p>}
                          {activity.follow_up_at && !activity.id.startsWith("legacy-") && <button type="submit"
                            form={`toggle-activity-wvl-${activity.id}`}
                            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-bold">
                            {activityWvlStatus.get(activity.id)?.done ? "↺ WVL wieder öffnen" : "✓ WVL erledigen"}
                          </button>}
                          <div className="flex shrink-0 items-center justify-end gap-1">
                            {!activity.id.startsWith("legacy-") && <button
                              type="button"
                              title="Eintrag bearbeiten"
                              onClick={() => setEditingActivityId(activity.id)}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-[#fbf7ef] hover:text-zinc-950"
                            >
                              ✏️
                            </button>}
                            {!activity.id.startsWith("legacy-") && <button
                              type="button"
                              title="Eintrag löschen"
                              onClick={async () => {
                                const confirmed = window.confirm(
                                  "Diesen Akquise-Eintrag wirklich löschen?"
                                );
                                if (!confirmed) return;
                                const formData = new FormData();
                                formData.set("acquisition_id", acquisition.id);
                                formData.set("activity_id", activity.id);
                                await deleteActivity(formData);
                              }}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50"
                            >
                              🗑
                            </button>}
                          </div>
                          </div>}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            {!isArchived && showActivityForm ? (
              <div id="neuer-eintrag" className="mt-6 rounded-xl border border-black/[0.06] bg-[#fffdf8] p-5 shadow-inner shadow-black/[0.015]">
                <h3 className="text-lg font-black">Neuen Akquise-Eintrag hinzufügen</h3>
                <div className="mt-4">
                  <ActivityFields acquisitionId={acquisition.id} />
                  <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                    <button
                      type="submit"
                      formAction={addActivity}
                      className="rounded-xl bg-lime-300 px-6 py-3 text-sm font-black shadow-sm transition hover:-translate-y-0.5"
                    >
                      ＋ Eintrag speichern
                    </button>
                  </div>
                </div>
              </div>
            ) : isArchived ? (
              <div className="mt-6 rounded-xl bg-zinc-100 px-5 py-4 text-sm font-bold text-zinc-500">
                📦 Diese Akquise ist abgeschlossen. Neue Einträge sind nicht mehr möglich.
              </div>
            ) : null}
          </Card>
            </div>
          <aside className="min-w-0 space-y-5">
          <Card>
            <CardTitle icon="♙">Kontakte</CardTitle>
            <p className="mt-1 text-xs font-semibold text-zinc-500">Ansprechpartner für diesen Standort oder Veranstalter</p>
            <div className="mt-3 max-h-[235px] divide-y divide-zinc-100 overflow-y-auto pr-1">
              {crmContacts.length === 0 ? <p className="text-sm text-zinc-500">Noch keine Kontakte hinterlegt.</p> : [...crmContacts].sort((a, b) => Number(Boolean(b.is_primary)) - Number(Boolean(a.is_primary))).map((contact) => (
                <div key={contact.id} className="py-2.5 first:pt-0 last:pb-0">
                  <p className="text-sm font-black">{contact.name}{contact.is_primary ? " · Hauptkontakt" : ""}</p>
                  {contact.role && <p className="mt-1 text-xs text-zinc-500">{contact.role}</p>}
                  {contact.email && <a className="mt-2 block break-all text-xs font-bold text-blue-700 hover:underline" href={`mailto:${contact.email}`}>{contact.email}</a>}
                  {contact.phone && <a className="mt-1 block text-xs text-zinc-600" href={`tel:${contact.phone}`}>{contact.phone}</a>}
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div className="flex flex-col gap-3">
              <div className="min-w-0 flex-1">
                <CardTitle icon="✓">Aufgaben & Wiedervorlagen</CardTitle>
                <p className="mt-1 text-sm font-semibold text-zinc-500">{openTasks.length} offen · Nur unabhängig angelegte Aufgaben.</p>
                <div className="mt-3 space-y-3">
                  {displayedCrmTasks.length === 0 && <p className="rounded-xl bg-[#fbf7ef] px-4 py-4 text-sm text-zinc-400">Noch keine unabhängigen Aufgaben.</p>}
                  {openTasks.length > 0 && <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Offen</p>}
                  <div className="max-h-[220px] divide-y divide-zinc-100 overflow-y-auto">
                    {openTasks.map(task => <TaskRow key={task.id} task={task} acquisitionId={acquisition.id} />)}
                  </div>
                  {completedTasks.length > 0 && <>
                    <button type="button" onClick={() => setShowCompletedTasks(value => !value)} className="flex w-full items-center justify-between border-t border-zinc-100 py-3 text-left text-xs font-bold text-zinc-500">Erledigte Aufgaben ({completedTasks.length}) <span>{showCompletedTasks ? "⌃" : "⌄"}</span></button>
                    {showCompletedTasks && <div className="max-h-[180px] divide-y divide-zinc-100 overflow-y-auto">{completedTasks.map(task => <TaskRow key={task.id} task={task} acquisitionId={acquisition.id} />)}</div>}
                  </>}
                </div>
              </div>
              {!isArchived && <div className="w-full border-t border-zinc-100 pt-3">
                <input form="add-crm-task" type="hidden" name="acquisition_id" value={acquisition.id} />
                <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">Neue Aufgabe</p>
                <input form="add-crm-task" required name="task_title" placeholder="z. B. Follow-up senden" className={`${inputClass} mt-3`} />
                <div className="mt-3 grid grid-cols-2 gap-2"><select form="add-crm-task" name="task_type" className={inputClass}><option value="follow_up">Follow-up</option><option value="call">Anruf</option><option value="email">E-Mail</option><option value="reminder">Wiedervorlage</option><option value="task">Aufgabe</option></select><input form="add-crm-task" type="date" name="task_due_at" className={inputClass} /></div>
                <button form="add-crm-task" type="submit" className="mt-3 w-full rounded-xl bg-lime-300 px-4 py-2.5 text-sm font-black text-zinc-950 shadow-sm">＋ Aufgabe anlegen</button>
              </div>}
            </div>
          </Card>
          </aside>
        </div>
        {/* Stammdaten: Veranstalter mit Spielstätten oder einzelne Location. */}
        <div className="space-y-5">
          <Card>
            <CardTitle icon={isOrganizerAcquisition ? "🏛" : "▦"}>
              {isOrganizerAcquisition ? "Veranstalter & Spielstätten" : "Location"}
            </CardTitle>
            {isOrganizerAcquisition ? (
              <div className="mt-5 grid gap-6 lg:grid-cols-2">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Veranstalter</p>
                  <p className="mt-3 text-lg font-black">{title}</p>
                  <div className="mt-2 text-sm font-semibold leading-6 text-zinc-600">
                    {address.length ? address.map((line) => <div key={String(line)}>{line}</div>) : "Adresse nicht hinterlegt"}
                  </div>
                  {organizer?.website && (
                    <a href={normalizeUrl(organizer.website)} target="_blank" rel="noreferrer" className="mt-3 inline-block break-all text-sm font-bold text-blue-700 underline underline-offset-4">{organizer.website} ↗</a>
                  )}
                </div>
                <div className="min-w-0 lg:border-l lg:border-zinc-200 lg:pl-6">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Verknüpfte Spielstätten</p>
                  {linkedVenues.length > 0 ? (
                  <div className="mt-3 max-h-[174px] divide-y divide-zinc-200 overflow-y-auto pr-2">
                    {linkedVenues.map((linkedVenue) => (
                      <Link key={linkedVenue.id} href={`/admin/locations/${linkedVenue.id}`}
                        className="flex items-center justify-between gap-4 py-3 text-sm font-bold text-zinc-800 transition hover:text-blue-700">
                        <span className="min-w-0 break-words">
                          🎭 {linkedVenue.name}{linkedVenue.city ? ` · ${linkedVenue.city}` : ""}
                          {linkedVenue.is_primary ? " · Hauptspielstätte" : ""}
                        </span>
                        <span aria-hidden="true" className="shrink-0">↗</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-zinc-500">Noch keine Spielstätten mit diesem Veranstalter verknüpft.</p>
                )}
              </div>
              </div>
            ) : (
              <div className="mt-5 min-w-0">
                <p className="text-lg font-black">{title}</p>
                <div className="mt-2 text-sm font-semibold leading-6 text-zinc-600">
                  {address.length ? address.map((line) => <div key={String(line)}>{line}</div>) : "Adresse nicht hinterlegt"}
                </div>
                {venue?.website && (
                  <a href={normalizeUrl(venue.website)} target="_blank" rel="noreferrer" className="mt-3 inline-block break-all text-sm font-bold text-blue-700 underline underline-offset-4">{venue.website} ↗</a>
                )}
              </div>
            )}
          </Card>
          <Card>
            <CardTitle icon="◎">Opportunity-Einstellungen</CardTitle>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <Field label="Programm">
                  <select name="program" defaultValue={acquisition.program || ""} className={inputClass}>
                    <option value="">Mehrere Programme / Allgemein</option>
                    {!PROGRAM_OPTIONS.includes(acquisition.program || "") && acquisition.program && <option value={acquisition.program}>{acquisition.program}</option>}
                    {PROGRAM_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </Field>
                <Field label="Priorität">
                  <select name="priority" defaultValue={acquisition.priority || "Normal"} className={priorityClass}>
                    {PRIORITY_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </Field>
                <Field label="Akquise-Status">
                  <select name="status" value={pipelineStatus} onChange={(event) => setPipelineStatus(event.target.value)} className={statusClass}>
                    {STATUS_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </Field>
                {pipelineStatus === "Abgesagt" && (
                  <Field label="Absagegrund">
                    <select name="rejection_reason" value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} className={inputClass}>
                      <option value="">Bitte auswählen …</option>
                      {Array.from(new Set(["Kein Interesse am Programm", "Kein Budget", "Kein passender Termin", "Programm passt nicht zum Haus", "Aktuell kein Bedarf", "Sonstiges", rejectionReason].filter(Boolean))).map((reason) => <option key={reason}>{reason}</option>)}
                    </select>
                  </Field>
                )}
              </div>
              {pipelineStatus !== "Abgesagt" && <input type="hidden" name="rejection_reason" value="" />}
              {/* Hidden legacy/current summary fields kept so saving this compact form
                  does not accidentally wipe fields that are not shown in the top card. */}
              <input type="hidden" name="last_contact_at" value={acquisition.last_contact_at || ""} />
              <input type="hidden" name="contact_channel" value={acquisition.contact_channel || ""} />
              <input type="hidden" name="contact_note" value={acquisition.contact_note || ""} />
              <input type="hidden" name="response" value={acquisition.response || ""} />
              <input type="hidden" name="next_step" value={acquisition.next_step || ""} />
              <input type="hidden" name="action_type" value={acquisition.action_type || ""} />
              <input type="hidden" name="next_follow_up_at" value={acquisition.next_follow_up_at || ""} />
              <input type="hidden" name="interest" value={acquisition.interest || ""} />
              <input type="hidden" name="show_date" value={acquisition.show_date || ""} />
          </Card>
        </div>
        <div className="grid gap-5 xl:grid-cols-[1.7fr_0.9fr]">
            <Card>
              <CardTitle icon="▤">Interne Notizen / Kontext</CardTitle>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="Interne Notizen">
                  <textarea
                    name="notes"
                    rows={5}
                    defaultValue={acquisition.notes || ""}
                    placeholder="Besonderheiten, interne Absprachen, Hintergrundinfos …"
                    className={textareaClass}
                  />
                </Field>
                <Field label="Kontext">
                  <textarea
                    name="context"
                    rows={5}
                    defaultValue={acquisition.context || ""}
                    placeholder="Weitere Einordnung zur Akquise …"
                    className={textareaClass}
                  />
                </Field>
              </div>
            </Card>
            <Card>
              <CardTitle icon="⚙">Optionen</CardTitle>
              <div className="mt-5 space-y-3">
                {!isArchived ? (
                  <>
                    <input
                      type="hidden"
                      name="id"
                      value={acquisition.id}
                    />
                    <button
                      type="submit"
                      formAction={archiveAcquisition}
                      className="w-full rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-black text-red-700 transition hover:bg-red-100"
                    >
                      ✓ Akquise abschließen
                    </button>
                  </>
                ) : (
                  <div className="rounded-xl bg-zinc-100 px-5 py-3 text-center text-sm font-black text-zinc-500">
                    📦 Akquise abgeschlossen
                  </div>
                )}
                {!linkedShowId && (
                  <button
                    type="submit"
                    formAction={deleteAcquisition}
                    onClick={(event) => {
                      if (!window.confirm("Diese Akquise inklusive aller Kontakteinträge wirklich löschen?")) {
                        event.preventDefault();
                      }
                    }}
                    className="w-full rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-black text-zinc-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                  >
                    🗑 Akquise löschen
                  </button>
                )}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-zinc-950 px-5 py-3 text-sm font-black text-white"
                >
                  Änderungen speichern
                </button>
                {(wasSaved || activityWasSaved) && (
                  <div role="status" className="rounded-xl bg-lime-100 px-4 py-3 text-sm font-bold text-lime-800 ring-1 ring-lime-200">
                    ✓ {activityWasSaved ? "Akquise-Eintrag gespeichert" : "Änderungen gespeichert"}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </form>
        {showMailComposer && (
          <BookingMailComposer
            acquisitionId={acquisition.id}
            initialTo={primaryCrmContact?.email || primaryOrganizerContact?.email || organizer?.email || venue?.booking_email || venue?.contact_email || ""}
            replyTo={replyMail}
            onClose={() => { setShowMailComposer(false); setReplyMail(null); setMailRefreshKey(v => v + 1); window.location.reload(); }}
          />
        )}
        {/* These action forms intentionally live outside saveAcquisition.
            Controls above target them via the HTML form attribute, avoiding nested forms. */}
        {!isArchived && <form id="add-crm-task" action={addTask} className="hidden" />}
        {emailFollowUps.map(({mail,done}) => <form key={`email-wvl-${mail.id}`} id={`toggle-email-wvl-${mail.id}`} action={setEmailFollowUpStatus} className="hidden">
          <input type="hidden" name="acquisition_id" value={acquisition.id} />
          <input type="hidden" name="email_id" value={mail.id} />
          <input type="hidden" name="status" value={done ? "open" : "done"} />
        </form>)}
        {activityFollowUps.map(({activity,done}) => <form key={`activity-wvl-${activity.id}`} id={`toggle-activity-wvl-${activity.id}`} action={setActivityFollowUpStatus} className="hidden">
        <input type="hidden" name="acquisition_id" value={acquisition.id}/>
        <input type="hidden" name="activity_id" value={activity.id}/>
        <input type="hidden" name="status" value={done ? "open" : "done"}/>
      </form>)}
      {crmTasks.map((task) => (
          <form key={`toggle-form-${task.id}`} id={`toggle-task-${task.id}`} action={toggleTask} className="hidden" />
        ))}
        <footer className="mt-5 flex flex-wrap justify-between gap-3 text-xs font-semibold text-zinc-400">
          <span>
            Erstellt am {formatDate(acquisition.created_at?.slice(0, 10))} · Zuletzt aktualisiert am{" "}
            {formatDate(acquisition.updated_at?.slice(0, 10))}
          </span>
          <span className="font-medium italic text-zinc-600">Mehr Kultur auf die Bühne. ♡</span>
        </footer>
      </div>
    </main>
  );
}
function TimelineIcon({ kind }: { kind: string }) {
  const k = kind.toLowerCase();
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (k.includes("mail") || k.includes("e-mail")) return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>;
  if (k.includes("telefon") || k.includes("anruf")) return <svg {...common}><path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.7L7.1 10a16 16 0 0 0 6.9 6.9l1.6-1.9a2 2 0 0 1 1.7-.6l3 .5a2 2 0 0 1 1.7 2Z"/></svg>;
  if (k.includes("schrift") || k.includes("päckchen")) return <svg {...common}><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="M3 7v10l9 5 9-5V7M12 12v10"/></svg>;
  return <svg {...common}><path d="M4 5h16v12H8l-4 3V5Z"/><path d="M8 9h8M8 13h5"/></svg>;
}
function TaskRow({ task, acquisitionId }: { task: CrmTask; acquisitionId: string }) {
  return <div className={`flex items-center gap-3 py-3 ${task.completed_at ? "opacity-60" : ""}`}>
    <input form={`toggle-task-${task.id}`} type="hidden" name="acquisition_id" value={acquisitionId} />
    <input form={`toggle-task-${task.id}`} type="hidden" name="task_id" value={task.id} />
    <input form={`toggle-task-${task.id}`} type="hidden" name="complete" value={task.completed_at ? "0" : "1"} />
    <button form={`toggle-task-${task.id}`} type="submit" title={task.completed_at ? "Wieder öffnen" : "Erledigen"} className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-zinc-200 text-xs font-bold">{task.completed_at ? "↺" : "✓"}</button>
    <div className="min-w-0"><p className={`text-sm font-bold ${task.completed_at ? "line-through" : ""}`}>{task.title}</p><p className="mt-0.5 text-xs text-zinc-500">{task.task_type === "follow_up" ? "Follow-up" : task.task_type}{task.due_at ? ` · ${new Date(task.due_at).toLocaleDateString("de-DE")}` : ""}</p></div>
  </div>;
}
const inputClass =
  "h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm font-semibold outline-none transition focus:border-zinc-400";
const statusClass =
  "h-11 w-full rounded-lg border border-amber-200 bg-amber-50 px-3 text-sm font-semibold outline-none";
const priorityClass =
  "h-11 w-full rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-semibold outline-none";
const interestClass =
  "h-11 w-full rounded-lg border border-green-200 bg-green-50 px-3 text-sm font-semibold outline-none";
const textareaClass =
  "w-full resize-y rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm font-semibold leading-5 outline-none transition focus:border-zinc-400";
function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-black/5 bg-white p-5 shadow-sm md:p-6 ${className}`}>
      {children}
    </section>
  );
}
function CardTitle({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-3 text-xl font-black">
      <span className="text-2xl">{icon}</span>
      {children}
    </h2>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-black text-zinc-700">{label}</span>
      {children}
    </label>
  );
}
function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-black/5 bg-white/70 px-3 py-1.5 text-xs font-black text-zinc-600">
      {children}
    </span>
  );
}
function formatDate(value?: string | null) {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}.${month}.${year}`;
}
function formatDateTime(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
function formatCreatedTime(value?: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
function normalizeUrl(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}
function channelIcon(channel?: string | null) {
  const value = (channel || "").toLowerCase();
  if (value.includes("telefon")) return "📞";
  if (value.includes("mail")) return "✉️";
  if (value.includes("insta")) return "📸";
  if (value.includes("persön")) return "🤝";
  if (value.includes("schrift")) return "📬";
  return "▣";
}
function dotClass(index: number) {
  const classes = ["bg-lime-400", "bg-blue-700", "bg-red-500", "bg-zinc-400"];
  return classes[index % classes.length];
}
function today() {
  return new Date().toISOString().slice(0, 10);
}
