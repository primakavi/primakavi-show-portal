import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import LocationsClient from "./LocationsClient";
import { getBookingStatus } from "@/app/lib/bookingStatus";

type Round = { id: string; name: string | null; type: string | null };
type Acquisition = {
  id: string;
  venue_id: string | null;
  organizer_id: string | null;
  round_id: string | null;
  status: string | null;
  last_contact_at: string | null;
  next_follow_up_at: string | null;
  archived_at: string | null;
};

function isNewsletterRound(round: Round) {
  return `${round.name || ""} ${round.type || ""}`.toLowerCase().includes("newsletter");
}
function isPackageRound(round: Round) {
  const text = `${round.name || ""} ${round.type || ""}`.toLowerCase();
  return text.includes("päck") || text.includes("paeck") || text.includes("paket");
}
export default async function LocationsPage() {
  const [venuesResult, acquisitionsResult, roundsResult, recipientsResult, linksResult] =
    await Promise.all([
      supabaseAdmin.from("venues").select(`
        id, legacy_id, name, street, postal_code, city, state, country,
        website, capacity, venue_type,
        contact_name, contact_email, contact_phone,
        contact_name_2, contact_email_2, contact_phone_2,
        booking_email, relationship_status,
        internal_notes, special_notes,
        lat, lng, played_before, season_notes, program_focus,
        instagram_url, facebook_url, logo_url,
        created_at, updated_at
      `).order("name", { ascending: true }),
      supabaseAdmin.from("acquisition")
        .select("id,venue_id,organizer_id,round_id,status,last_contact_at,next_follow_up_at,archived_at"),
      supabaseAdmin.from("acquisition_rounds").select("id,name,type,active,archived_at"),
      supabaseAdmin.from("mailing_recipients")
        .select("id,round_id,venue_id,sent_at,scheduled_at,acquisition_id")
        .not("venue_id", "is", null),
      supabaseAdmin.from("organizer_venues").select("venue_id,organizer_id"),
    ]);

  if (venuesResult.error) throw new Error(venuesResult.error.message);
  if (acquisitionsResult.error) throw new Error(acquisitionsResult.error.message);
  if (roundsResult.error) throw new Error(roundsResult.error.message);
  if (recipientsResult.error) throw new Error(recipientsResult.error.message);
  if (linksResult.error) throw new Error(linksResult.error.message);

  const venues = venuesResult.data || [];
  const acquisitions: Acquisition[] = acquisitionsResult.data || [];
  const rounds: Round[] = roundsResult.data || [];
  const recipients = recipientsResult.data || [];
  const links = linksResult.data || [];

  const organizerIds = [...new Set(links.map((link) => link.organizer_id).filter(Boolean))];
  const organizerNames = new Map<string, string>();
  if (organizerIds.length) {
    const { data, error } = await supabaseAdmin
      .from("organizers").select("id,name").in("id", organizerIds);
    if (error) throw new Error(error.message);
    for (const organizer of data || []) organizerNames.set(organizer.id, organizer.name || "Veranstalter");
  }

  const organizersByVenue = new Map<string, Set<string>>();
  for (const link of links) {
    if (!link.venue_id || !link.organizer_id) continue;
    const set = organizersByVenue.get(link.venue_id) || new Set<string>();
    set.add(link.organizer_id);
    organizersByVenue.set(link.venue_id, set);
  }

  const directByVenue = new Map<string, Acquisition[]>();
  const byOrganizer = new Map<string, Acquisition[]>();
  for (const item of acquisitions) {
    if (item.venue_id) {
      const list = directByVenue.get(item.venue_id) || [];
      list.push(item);
      directByVenue.set(item.venue_id, list);
    }
    if (item.organizer_id) {
      const list = byOrganizer.get(item.organizer_id) || [];
      list.push(item);
      byOrganizer.set(item.organizer_id, list);
    }
  }

  const newsletterRoundIds = new Set(rounds.filter(isNewsletterRound).map((round) => round.id));
  const packageRoundIds = new Set(rounds.filter(isPackageRound).map((round) => round.id));
  let latestNewsletterRoundId: string | null = null;
  let latestNewsletterSentAt = "";
  for (const recipient of recipients) {
    if (recipient.round_id && recipient.sent_at &&
        newsletterRoundIds.has(recipient.round_id) &&
        recipient.sent_at > latestNewsletterSentAt) {
      latestNewsletterSentAt = recipient.sent_at;
      latestNewsletterRoundId = recipient.round_id;
    }
  }
  const latestNewsletterVenueIds = new Set(
    recipients.filter((r) => !!latestNewsletterRoundId &&
      r.round_id === latestNewsletterRoundId && !!r.sent_at && !!r.venue_id)
      .map((r) => r.venue_id as string)
  );
  const packageVenueIds = new Set(
    recipients.filter((r) => !!r.round_id && packageRoundIds.has(r.round_id) &&
      !!r.sent_at && !!r.venue_id).map((r) => r.venue_id as string)
  );
  for (const item of acquisitions) {
    if (item.venue_id && item.round_id && packageRoundIds.has(item.round_id))
      packageVenueIds.add(item.venue_id);
  }

  const today = new Date().toISOString().slice(0, 10);
  const enrichedVenues = venues.map((venue) => {
    const unique = new Map<string, Acquisition>();
    for (const item of directByVenue.get(venue.id) || []) unique.set(item.id, item);
    const linkedIds = organizersByVenue.get(venue.id) || new Set<string>();
    for (const organizerId of linkedIds) {
      for (const item of byOrganizer.get(organizerId) || []) {
        // Eine Akquise, die ausdrücklich einer anderen Location zugeordnet ist,
        // nicht auf diese Spielstätte übertragen.
        if (item.venue_id && item.venue_id !== venue.id) continue;
        unique.set(item.id, item);
      }
    }
    const relevant = [...unique.values()];
    const followUps = relevant.filter((a) => !a.archived_at).map((a) => a.next_follow_up_at)
      .filter((date): date is string => !!date).sort();
    const future = followUps.filter((date) => date.slice(0, 10) > today);
    const overdue = followUps.some((date) => date.slice(0, 10) <= today);
    return {
      ...venue,
      acquisition_status: getBookingStatus(relevant, venue.relationship_status, !!venue.played_before),
      linked_organizer_names: [...linkedIds].map((id) => organizerNames.get(id) || "Veranstalter"),
      has_open_follow_up: followUps.length > 0,
      has_overdue_follow_up: overdue,
      next_follow_up_at: followUps[0] || null,
      received_latest_newsletter: latestNewsletterVenueIds.has(venue.id),
      received_package: packageVenueIds.has(venue.id),
    };
  });

  return <LocationsClient venues={enrichedVenues} />;
}
