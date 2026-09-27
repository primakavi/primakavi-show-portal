import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import LocationsClient from "./LocationsClient";

function isNewsletterRound(round: { name: string | null; type: string | null }) {
  const text = `${round.name || ""} ${round.type || ""}`.toLowerCase();
  return text.includes("newsletter");
}

function isPackageRound(round: { name: string | null; type: string | null }) {
  const text = `${round.name || ""} ${round.type || ""}`.toLowerCase();
  return (
    text.includes("päck") ||
    text.includes("paeck") ||
    text.includes("paket")
  );
}

export default async function LocationsPage() {
  const [
    venuesResult,
    acquisitionsResult,
    roundsResult,
    recipientsResult,
  ] = await Promise.all([
    supabaseAdmin
      .from("venues")
      .select(`
        id, legacy_id, name, street, postal_code, city, state, country,
        website, capacity, venue_type,
        contact_name, contact_email, contact_phone,
        contact_name_2, contact_email_2, contact_phone_2,
        booking_email, relationship_status,
        internal_notes, special_notes,
        lat, lng, played_before, season_notes, program_focus,
        instagram_url, facebook_url, logo_url,
        created_at, updated_at
      `)
      .order("name", { ascending: true }),

    supabaseAdmin
      .from("acquisition")
      .select("id,venue_id,round_id,next_follow_up_at,archived_at"),

    supabaseAdmin
      .from("acquisition_rounds")
      .select("id,name,type,active,archived_at"),

    supabaseAdmin
      .from("mailing_recipients")
      .select("id,round_id,venue_id,sent_at,scheduled_at,acquisition_id")
      .not("venue_id", "is", null),
  ]);

  if (venuesResult.error) throw new Error(venuesResult.error.message);
  if (acquisitionsResult.error) throw new Error(acquisitionsResult.error.message);
  if (roundsResult.error) throw new Error(roundsResult.error.message);
  if (recipientsResult.error) throw new Error(recipientsResult.error.message);

  const venues = venuesResult.data || [];
  const acquisitions = acquisitionsResult.data || [];
  const rounds = roundsResult.data || [];
  const recipients = recipientsResult.data || [];

  const roundById = new Map(rounds.map((round) => [round.id, round]));
  const newsletterRoundIds = new Set(
    rounds.filter(isNewsletterRound).map((round) => round.id)
  );
  const packageRoundIds = new Set(
    rounds.filter(isPackageRound).map((round) => round.id)
  );

  // "Letzter Newsletter" = die zuletzt tatsächlich versendete Newsletter-Runde.
  // Nicht bloß der zuletzt angelegte Datensatz.
  let latestNewsletterRoundId: string | null = null;
  let latestNewsletterSentAt = "";

  for (const recipient of recipients) {
    if (
      recipient.round_id &&
      recipient.sent_at &&
      newsletterRoundIds.has(recipient.round_id) &&
      recipient.sent_at > latestNewsletterSentAt
    ) {
      latestNewsletterSentAt = recipient.sent_at;
      latestNewsletterRoundId = recipient.round_id;
    }
  }

  const latestNewsletterVenueIds = new Set(
    recipients
      .filter(
        (recipient) =>
          !!latestNewsletterRoundId &&
          recipient.round_id === latestNewsletterRoundId &&
          !!recipient.sent_at &&
          !!recipient.venue_id
      )
      .map((recipient) => recipient.venue_id as string)
  );

  const packageVenueIds = new Set(
    recipients
      .filter(
        (recipient) =>
          !!recipient.round_id &&
          packageRoundIds.has(recipient.round_id) &&
          !!recipient.sent_at &&
          !!recipient.venue_id
      )
      .map((recipient) => recipient.venue_id as string)
  );

  // Falls eine Päckchen-Runde nicht über mailing_recipients gelaufen ist,
  // erkennen wir sie zusätzlich über die Akquise-Runde.
  for (const acquisition of acquisitions) {
    if (
      acquisition.venue_id &&
      acquisition.round_id &&
      packageRoundIds.has(acquisition.round_id)
    ) {
      packageVenueIds.add(acquisition.venue_id);
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const followUpsByVenue = new Map<string, string[]>();

  for (const acquisition of acquisitions) {
    if (
      !acquisition.venue_id ||
      acquisition.archived_at ||
      !acquisition.next_follow_up_at ||
      acquisition.next_follow_up_at <= today
    ) {
      continue;
    }

    const existing = followUpsByVenue.get(acquisition.venue_id) || [];
    existing.push(acquisition.next_follow_up_at);
    followUpsByVenue.set(acquisition.venue_id, existing);
  }

  const enrichedVenues = venues.map((venue) => {
    const followUps = (followUpsByVenue.get(venue.id) || []).sort();

    return {
      ...venue,
      has_open_follow_up: followUps.length > 0,
      next_follow_up_at: followUps[0] || null,
      received_latest_newsletter: latestNewsletterVenueIds.has(venue.id),
      received_package: packageVenueIds.has(venue.id),
    };
  });

  return <LocationsClient venues={enrichedVenues} />;
}
