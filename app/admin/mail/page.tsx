import { redirect } from "next/navigation";
import { requireBookingMailAdmin } from "@/app/lib/requireBookingMailAdmin";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import MailCenterClient from "./MailCenterClient";

export const dynamic = "force-dynamic";

type MatchSource = "Ansprechpartner" | "Veranstalterkontakt" | "Veranstalter";
type Suggestion = { acquisitionId: string; source: MatchSource };

const normalizeEmail = (value: string | null | undefined) => (value ?? "").trim().toLowerCase();

export default async function MailCenterPage() {
  try { await requireBookingMailAdmin(); } catch { redirect("/admin"); }

  const [mailResult, acquisitionsResult, organizersResult, contactsResult, organizerContactsResult] = await Promise.all([
    supabaseAdmin.from("crm_emails")
      .select("id,acquisition_id,direction,status,from_email,to_emails,subject,body_text,received_at,sent_at,created_at")
      .order("created_at", { ascending: false }).limit(200),
    supabaseAdmin.from("acquisition")
      .select("id,organizer_id,venue_id,primary_contact_id,program,status")
      .is("archived_at", null).limit(1000),
    supabaseAdmin.from("organizers").select("id,name,email").limit(2000),
    supabaseAdmin.from("contacts").select("id,venue_id,organizer_id,email").limit(3000),
    supabaseAdmin.from("organizer_contacts").select("id,organizer_id,email").limit(3000),
  ]);

  if (mailResult.error || acquisitionsResult.error || organizersResult.error || contactsResult.error || organizerContactsResult.error) {
    console.error("Mail center data load failed", {
      mail: mailResult.error, acquisitions: acquisitionsResult.error,
      organizers: organizersResult.error, contacts: contactsResult.error,
      organizerContacts: organizerContactsResult.error,
    });
    return <main style={{ padding: 32 }}>Mail-Zentrale konnte nicht geladen werden. Bitte Server-Logs prüfen.</main>;
  }

  const organizers = organizersResult.data ?? [];
  const acquisitionRows = acquisitionsResult.data ?? [];
  const names = new Map(organizers.map(o => [o.id, o.name]));
  const acquisitions = acquisitionRows.map(a => ({
    id: a.id,
    label: `${names.get(a.organizer_id) || "Ohne Veranstalter"} · ${a.program || "Akquise"} · ${a.id.slice(0, 8)}`,
  }));

  // A matching venue alone is NEVER enough: two independent organizers can use the same venue.
  const organizerEmails = new Map<string, Set<string>>();
  for (const organizer of organizers) {
    const email = normalizeEmail(organizer.email);
    if (!email) continue;
    if (!organizerEmails.has(email)) organizerEmails.set(email, new Set());
    organizerEmails.get(email)!.add(organizer.id);
  }

  const contactsByEmail = new Map<string, typeof contactsResult.data>();
  for (const contact of contactsResult.data ?? []) {
    const email = normalizeEmail(contact.email);
    if (!email) continue;
    const matches = contactsByEmail.get(email) ?? [];
    matches.push(contact);
    contactsByEmail.set(email, matches);
  }

  const organizerContactsByEmail = new Map<string, Set<string>>();
  for (const contact of organizerContactsResult.data ?? []) {
    const email = normalizeEmail(contact.email);
    if (!email || !contact.organizer_id) continue;
    if (!organizerContactsByEmail.has(email)) organizerContactsByEmail.set(email, new Set());
    organizerContactsByEmail.get(email)!.add(contact.organizer_id);
  }

  const suggestions: Record<string, Suggestion[]> = {};
  for (const mail of mailResult.data ?? []) {
    if (mail.direction !== "incoming" || mail.acquisition_id) continue;
    const email = normalizeEmail(mail.from_email);
    if (!email) continue;
    const matchingContacts = contactsByEmail.get(email) ?? [];
    const matchingOrganizerContacts = organizerContactsByEmail.get(email) ?? new Set<string>();
    const matchingOrganizers = organizerEmails.get(email) ?? new Set<string>();
    const matches = new Map<string, MatchSource>();

    for (const acquisition of acquisitionRows) {
      const contactMatch = matchingContacts.some(contact =>
        (acquisition.primary_contact_id != null && contact.id === acquisition.primary_contact_id) ||
        (acquisition.organizer_id != null && contact.organizer_id === acquisition.organizer_id) ||
        // Venue-only contacts are used only for acquisitions without an organizer,
        // otherwise the same venue could mix different organizers.
        (!acquisition.organizer_id && acquisition.venue_id != null && contact.venue_id === acquisition.venue_id)
      );
      if (contactMatch) matches.set(acquisition.id, "Ansprechpartner");
      else if (acquisition.organizer_id && matchingOrganizerContacts.has(acquisition.organizer_id))
        matches.set(acquisition.id, "Veranstalterkontakt");
      else if (acquisition.organizer_id && matchingOrganizers.has(acquisition.organizer_id))
        matches.set(acquisition.id, "Veranstalter");
    }
    suggestions[mail.id] = [...matches.entries()].map(([acquisitionId, source]) => ({ acquisitionId, source }));
  }

  return <MailCenterClient initialMails={mailResult.data ?? []} acquisitions={acquisitions} suggestions={suggestions} />;
}
