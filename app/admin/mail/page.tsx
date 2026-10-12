import { redirect } from "next/navigation";
import { requireBookingMailAdmin } from "@/app/lib/requireBookingMailAdmin";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import MailCenterClient from "./MailCenterClient";

export const dynamic = "force-dynamic";
type MatchSource = "Ansprechpartner" | "Veranstalterkontakt" | "Veranstalter";
type Suggestion = { acquisitionId: string; source: MatchSource };
const norm = (v: string | null | undefined) => (v ?? "").trim().toLowerCase();

export default async function MailCenterPage() {
  try { await requireBookingMailAdmin(); } catch { redirect("/admin"); }
  const [mailR, acquisitionR, organizerR, contactR, organizerContactR, venueR, showR] = await Promise.all([
    supabaseAdmin.from("crm_emails").select("id,acquisition_id,show_id,venue_id,organizer_id,inbox_state,direction,status,from_email,to_emails,subject,body_text,received_at,sent_at,created_at").neq("inbox_state", "deleted").order("created_at", { ascending: false }).limit(500),
    supabaseAdmin.from("acquisition").select("id,organizer_id,venue_id,primary_contact_id,program,status,archived_at").limit(2000),
    supabaseAdmin.from("organizers").select("id,name,email,city").limit(3000),
    supabaseAdmin.from("contacts").select("id,venue_id,organizer_id,email").limit(4000),
    supabaseAdmin.from("organizer_contacts").select("id,organizer_id,email").limit(4000),
    supabaseAdmin.from("venues").select("id,name,city,organizer_id").limit(3000),
    supabaseAdmin.schema("booking").from("shows").select("id,show_date,venue,city,program,venue_id,contact_email").order("show_date", { ascending: false }).limit(1500),
  ]);
  const results = [mailR, acquisitionR, organizerR, contactR, organizerContactR, venueR, showR];
  if (results.some(r => r.error)) {
    console.error("Mail center load failed", results.map(r => r.error?.message));
    return <main style={{ padding: 32 }}>Mail-Zentrale konnte nicht geladen werden. Bitte Server-Logs prüfen.</main>;
  }
  const organizers = organizerR.data ?? [];
  const venues = venueR.data ?? [];
  const acquisitionRows = acquisitionR.data ?? [];
  const orgById = new Map(organizers.map(o => [o.id, o]));
  const venueById = new Map(venues.map(v => [v.id, v]));
  const acquisitions = acquisitionRows.map(a => {
    const v = a.venue_id ? venueById.get(a.venue_id) : null;
    const o = a.organizer_id ? orgById.get(a.organizer_id) : null;
    return {
      id: a.id,
      title: v?.name || o?.name || "Akquise ohne Location/Veranstalter",
      detail: [v?.city, o?.name && o.name !== v?.name ? o.name : null, a.program || "Programm offen", a.status || "Status offen"].filter(Boolean).join(" · "),
      archived: Boolean(a.archived_at),
    };
  });
  const shows = (showR.data ?? []).map(s => ({
    id: s.id,
    title: [s.venue_id ? venueById.get(s.venue_id)?.name : null, s.venue].filter(Boolean)[0] || "Show ohne Spielort",
    detail: [s.show_date ? new Date(`${s.show_date}T12:00:00`).toLocaleDateString("de-DE") : "Datum offen", s.city, s.program].filter(Boolean).join(" · "),
  }));
  const venueOptions = venues.map(v => ({ id: v.id, title: v.name || "Location ohne Namen", detail: [v.city, v.organizer_id ? orgById.get(v.organizer_id)?.name : null].filter(Boolean).join(" · ") }));
  const organizerOptions = organizers.map(o => ({ id: o.id, title: o.name || "Veranstalter ohne Namen", detail: [o.city, o.email].filter(Boolean).join(" · ") }));

  const organizerEmails = new Map<string, Set<string>>();
  for (const o of organizers) {
    const e = norm(o.email); if (!e) continue;
    if (!organizerEmails.has(e)) organizerEmails.set(e, new Set());
    organizerEmails.get(e)!.add(o.id);
  }
  const contactsByEmail = new Map<string, NonNullable<typeof contactR.data>>();
  for (const c of contactR.data ?? []) {
    const e = norm(c.email); if (!e) continue;
    const found = contactsByEmail.get(e) ?? []; found.push(c); contactsByEmail.set(e, found);
  }
  const organizerContactsByEmail = new Map<string, Set<string>>();
  for (const c of organizerContactR.data ?? []) {
    const e = norm(c.email); if (!e || !c.organizer_id) continue;
    if (!organizerContactsByEmail.has(e)) organizerContactsByEmail.set(e, new Set());
    organizerContactsByEmail.get(e)!.add(c.organizer_id);
  }
  const suggestions: Record<string, Suggestion[]> = {};
  for (const mail of mailR.data ?? []) {
    if (mail.direction !== "incoming" || mail.acquisition_id || mail.inbox_state !== "open") continue;
    const email = norm(mail.from_email); if (!email) continue;
    const matchingContacts = contactsByEmail.get(email) ?? [];
    const matchingOrganizerContacts = organizerContactsByEmail.get(email) ?? new Set<string>();
    const matchingOrganizers = organizerEmails.get(email) ?? new Set<string>();
    const matches = new Map<string, MatchSource>();
    for (const a of acquisitionRows) {
      const contactMatch = matchingContacts.some(c =>
        (a.primary_contact_id != null && c.id === a.primary_contact_id) ||
        (a.organizer_id != null && c.organizer_id === a.organizer_id) ||
        (!a.organizer_id && a.venue_id != null && c.venue_id === a.venue_id));
      if (contactMatch) matches.set(a.id, "Ansprechpartner");
      else if (a.organizer_id && matchingOrganizerContacts.has(a.organizer_id)) matches.set(a.id, "Veranstalterkontakt");
      else if (a.organizer_id && matchingOrganizers.has(a.organizer_id)) matches.set(a.id, "Veranstalter");
    }
    suggestions[mail.id] = [...matches.entries()].map(([acquisitionId, source]) => ({ acquisitionId, source }));
  }
  return <MailCenterClient initialMails={mailR.data ?? []} acquisitions={acquisitions} shows={shows} venues={venueOptions} organizers={organizerOptions} suggestions={suggestions} />;
}
