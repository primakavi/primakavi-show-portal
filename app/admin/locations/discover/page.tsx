import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import SearchSubmitButton from "./SearchSubmitButton";
import DiscoverMap from "./DiscoverMap";
import AsyncPlaceLabel from "./AsyncPlaceLabel";

type SearchParams = {
  mode?: "area" | "tour";
  place?: string;
  radius?: string;
  minCapacity?: string;
  startShow?: string;
  endShow?: string;
  maxDetour?: string;
  showIgnored?: string;
  imported?: string;
};

type OSMVenue = {
  osmId: string;
  name: string;
  lat: number;
  lng: number;
  street: string | null;
  postalCode: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  website: string | null;
  capacity: number | null;
  venueType: string | null;
  distanceKm: number;
  routeDistanceKm?: number | null;
  routeProgressKm?: number | null;
  estimatedDetourKm?: number | null;
};

type KnownVenue = {
  id: string;
  name: string | null;
  city: string | null;
  lat: number | string | null;
  lng: number | string | null;
  played_before: boolean | null;
};

type AcquisitionSummary = {
  id: string;
  venue_id: string;
  program: string | null;
  status: string | null;
  last_contact_at: string | null;
  created_at: string | null;
  archived_at: string | null;
};

type IgnoredVenue = {
  osm_id: string;
  name: string | null;
  city: string | null;
  reason: string | null;
};

type ResultRow = OSMVenue & {
  knownVenue: KnownVenue | null;
  acquisitionCount: number;
  latestAcquisition: AcquisitionSummary | null;
  ignored: boolean;
};

type ShowRow = {
  id: string;
  venue_id: string | null;
  show_date: string | null;
  venue: string | null;
  city: string | null;
};

type TourShow = ShowRow & {
  lat: number;
  lng: number;
};

type RoutePoint = {
  lat: number;
  lng: number;
};

type OsmSearchCacheEntry = {
  expiresAt: number;
  rows: OSMVenue[];
  error: string | null;
};

const osmSearchCache = new Map<string, OsmSearchCacheEntry>();
const OSM_SEARCH_CACHE_TTL = 15 * 60 * 1000;

const reversePlaceCache = new Map<
  string,
  { expiresAt: number; city: string | null; postalCode: string | null }
>();
const REVERSE_PLACE_CACHE_TTL = 24 * 60 * 60 * 1000;

export default async function DiscoverLocationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const mode = params.mode === "tour" ? "tour" : "area";
  const place = String(params.place || "").trim();
  const radiusKm = clampNumber(params.radius, 75, 5, 100);
  const minCapacity = clampNumber(params.minCapacity, 100, 0, 5000);
  const maxDetourKm = clampNumber(params.maxDetour, 50, 10, 150);
  const startShowId = String(params.startShow || "");
  const endShowId = String(params.endShow || "");
  const showIgnored = params.showIgnored === "1";
  const importedCount = Math.max(0, Number(params.imported || 0));

  const [
    { data: knownVenues },
    { data: acquisition },
    { data: shows },
    ignoredResult,
  ] = await Promise.all([
    supabaseAdmin
      .from("venues")
      .select("id, name, city, lat, lng, played_before"),
    supabaseAdmin
      .from("acquisition")
      .select("id, venue_id, program, status, last_contact_at, created_at, archived_at")
      .order("last_contact_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .schema("booking")
      .from("shows")
      .select("id, venue_id, show_date, venue, city")
      .not("show_date", "is", null)
      .order("show_date", { ascending: true }),
    supabaseAdmin
      .from("discover_ignored_venues")
      .select("osm_id, name, city, reason"),
  ]);

  const ignoredVenues =
    ignoredResult.error && ignoredResult.error.code !== "42P01"
      ? []
      : ((ignoredResult.data || []) as IgnoredVenue[]);

  const knownVenueRows = (knownVenues || []) as KnownVenue[];
  const acquisitionRows = (acquisition || []) as AcquisitionSummary[];
  const showRows = (shows || []) as ShowRow[];

  const venueById = new Map(
    knownVenueRows.map((venue) => [venue.id, venue])
  );

  const tourShows: TourShow[] = showRows
    .map((show) => {
      if (!show.venue_id) return null;

      const venue = venueById.get(show.venue_id);
      const lat = Number(venue?.lat);
      const lng = Number(venue?.lng);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
      }

      return {
        ...show,
        lat,
        lng,
      };
    })
    .filter(Boolean) as TourShow[];

  let rows: ResultRow[] = [];
  let searchError: string | null = null;
  let centerLabel: string | null = null;
  let mapCenter: { lat: number; lng: number } | null = null;
  let routePoints: RoutePoint[] = [];
  let routeKm: number | null = null;
  const searchTimings: string[] = [];

  const startShow = tourShows.find((show) => show.id === startShowId) || null;
  const endShow = tourShows.find((show) => show.id === endShowId) || null;

  const hasAreaSearch = mode === "area" && Boolean(place);
  const hasTourSearch =
    mode === "tour" && Boolean(startShowId) && Boolean(endShowId);

  if (hasAreaSearch) {
    try {
      const geocodeStartedAt = Date.now();
      const center = await geocodePlace(place);
      searchTimings.push(`Geocoding ${formatTiming(Date.now() - geocodeStartedAt)}`);

      if (!center) {
        searchError = `„${place}“ konnte nicht gefunden werden.`;
      } else {
        centerLabel = center.displayName;
        mapCenter = { lat: center.lat, lng: center.lng };

        const osmStartedAt = Date.now();
        const osmResult = await searchOsmVenues(
          center.lat,
          center.lng,
          radiusKm,
          minCapacity
        );
        searchTimings.push(`OSM ${formatTiming(Date.now() - osmStartedAt)}`);

        if (osmResult.error) {
          searchError = osmResult.error;
        }

        const hydrateStartedAt = Date.now();
        rows = hydrateResults(
          osmResult.rows,
          knownVenueRows,
          acquisitionRows,
          ignoredVenues
        );
        searchTimings.push(`CRM-Abgleich ${formatTiming(Date.now() - hydrateStartedAt)}`);
      }
    } catch (error) {
      console.error("Locations entdecken:", error);
      const message =
        error instanceof Error ? error.message : String(error);

      searchError = message.startsWith("Die OpenStreetMap-Suche")
        ? message
        : "Die externe Location-Suche konnte gerade nicht geladen werden.";
    }
  }

  if (hasTourSearch) {
    if (!startShow || !endShow) {
      searchError =
        "Start oder Ziel konnte nicht geladen werden. Bitte wähle zwei Shows mit verknüpfter Location und Koordinaten.";
    } else if (
      startShow.show_date &&
      endShow.show_date &&
      startShow.show_date > endShow.show_date
    ) {
      searchError =
        "Das Ziel liegt zeitlich vor dem Start. Bitte wähle die Shows in Tour-Reihenfolge.";
    } else {
      try {
        const routeStartedAt = Date.now();
        const route = await fetchDrivingRoute(
          startShow.lat,
          startShow.lng,
          endShow.lat,
          endShow.lng
        );
        searchTimings.push(`Route ${formatTiming(Date.now() - routeStartedAt)}`);

        routePoints = route.points;
        routeKm = route.distanceKm;
        mapCenter = {
          lat: (startShow.lat + endShow.lat) / 2,
          lng: (startShow.lng + endShow.lng) / 2,
        };

        const osmStartedAt = Date.now();
        const osmResult = await searchOsmVenuesAlongRoute(
          route.points,
          maxDetourKm,
          minCapacity
        );
        searchTimings.push(`OSM ${formatTiming(Date.now() - osmStartedAt)}`);

        if (osmResult.error) {
          searchError = osmResult.error;
        }

        // Erst grob auf den Tour-Korridor und weg vom direkten Start-/Zielumfeld
        // filtern. Danach berechnen wir für die verbleibenden Kandidaten den
        // echten Straßen-Mehrweg via OSRM:
        // Start -> Location -> Ziel minus Start -> Ziel.
        const endpointBufferKm = 15;

        const prepareStartedAt = Date.now();
        const hydrated = hydrateResults(
          osmResult.rows,
          knownVenueRows,
          acquisitionRows,
          ignoredVenues
        )
          .filter((row) => {
            // Die bereits ausgewählten Start-/Ziel-Locations selbst brauchen
            // wir in Discover nicht noch einmal als Treffer.
            if (
              row.knownVenue?.id &&
              (row.knownVenue.id === startShow.venue_id ||
                row.knownVenue.id === endShow.venue_id)
            ) {
              return false;
            }

            const fromStart = haversineKm(
              row.lat,
              row.lng,
              startShow.lat,
              startShow.lng
            );

            const fromEnd = haversineKm(
              row.lat,
              row.lng,
              endShow.lat,
              endShow.lng
            );

            return (
              fromStart >= endpointBufferKm &&
              fromEnd >= endpointBufferKm
            );
          })
          .map((row) => ({
            ...row,
            routeDistanceKm: distanceToRouteKm(
              row.lat,
              row.lng,
              route.points
            ),
            routeProgressKm: routePositionKm(
              row.lat,
              row.lng,
              route.points
            ),
          }))
          .sort(
            (a, b) =>
              (a.routeDistanceKm ?? 9999) -
              (b.routeDistanceKm ?? 9999)
          )
          .slice(0, 40);
        searchTimings.push(`Vorauswahl ${formatTiming(Date.now() - prepareStartedAt)}`);

        const detourStartedAt = Date.now();
        const withDetours = await addRoadDetours(
          hydrated,
          startShow,
          endShow,
          route.distanceKm
        );
        searchTimings.push(`Abstecher ${formatTiming(Date.now() - detourStartedAt)}`);

        rows = withDetours
          .filter((row) => {
            const detour = row.estimatedDetourKm;
            return detour != null && detour <= maxDetourKm;
          })
          .sort((a, b) => {
            const progressA = a.routeProgressKm ?? 999999;
            const progressB = b.routeProgressKm ?? 999999;

            if (Math.abs(progressA - progressB) > 8) {
              return progressA - progressB;
            }

            return (
              (a.estimatedDetourKm ?? 9999) -
              (b.estimatedDetourKm ?? 9999)
            );
          })
          .slice(0, 50);
      } catch (error) {
        console.error("Tour entdecken:", error);
        searchError =
          "Die Tour-Route konnte gerade nicht berechnet werden. Bitte später erneut versuchen.";
      }
    }
  }

  if (!showIgnored) {
    rows = rows.filter((row) => !row.ignored);
  }

  async function importVenue(formData: FormData) {
    "use server";

    const osmId = String(formData.get("osm_id") || "");
    const name = nullable(formData.get("name"));

    if (!osmId || !name) {
      throw new Error("Location-Daten fehlen.");
    }

    const lat = numberOrNull(formData.get("lat"));
    const lng = numberOrNull(formData.get("lng"));

    if (lat !== null && lng !== null) {
      const { data: nearbyCandidates } = await supabaseAdmin
        .from("venues")
        .select("id, name, city, lat, lng")
        .not("lat", "is", null)
        .not("lng", "is", null);

      const nearby = (nearbyCandidates || []).find((candidate: any) => {
        const candidateLat = Number(candidate.lat);
        const candidateLng = Number(candidate.lng);

        if (!Number.isFinite(candidateLat) || !Number.isFinite(candidateLng)) {
          return false;
        }

        return haversineKm(lat, lng, candidateLat, candidateLng) <= 0.15;
      });

      if (nearby?.id) {
        redirect(`/admin/locations/${nearby.id}`);
      }
    }

    let city = nullable(formData.get("city"));
    let postalCode = nullable(formData.get("postal_code"));

    if (!city && lat !== null && lng !== null) {
      try {
        const place = await reversePlace(lat, lng);
        city = place.city || city;
        postalCode = postalCode || place.postalCode;
      } catch {
        // Import nicht blockieren, falls der Reverse-Geocoder gerade nicht antwortet.
      }
    }

    const { data: sameNameCandidates } = await supabaseAdmin
      .from("venues")
      .select("id, name, city")
      .ilike("name", name)
      .limit(10);

    const sameName = (sameNameCandidates || []).find((candidate: any) => {
      if (!city) return normalize(candidate.name) === normalize(name);

      return (
        normalize(candidate.name) === normalize(name) &&
        normalize(candidate.city) === normalize(city)
      );
    });

    if (sameName?.id) {
      redirect(`/admin/locations/${sameName.id}`);
    }

    const { data: inserted, error } = await supabaseAdmin
      .from("venues")
      .insert({
        name,
        street: nullable(formData.get("street")),
        postal_code: postalCode,
        city,
        state: nullable(formData.get("state")),
        country: nullable(formData.get("country")),
        website: nullable(formData.get("website")),
        capacity: numberOrNull(formData.get("capacity")),
        venue_type: nullable(formData.get("venue_type")),
        lat,
        lng,
      })
      .select("id")
      .single();

    if (error || !inserted) {
      throw new Error(error?.message || "Location konnte nicht angelegt werden.");
    }

    revalidatePath("/admin/locations");
    revalidatePath("/admin/locations/discover");

    redirect(`/admin/locations/${inserted.id}?imported=1`);
  }

  async function importSelectedVenues(formData: FormData) {
    "use server";

    const selectedIds = formData
      .getAll("selected_osm_id")
      .map((value) => String(value))
      .filter(Boolean);

    if (selectedIds.length === 0) {
      redirect(returnTo);
    }

    const selectedRows = rows.filter(
      (row) =>
        selectedIds.includes(row.osmId) &&
        !row.knownVenue &&
        !row.ignored
    );

    if (selectedRows.length === 0) {
      redirect(returnTo);
    }

    const { data: existingCandidates } = await supabaseAdmin
      .from("venues")
      .select("id, name, city, lat, lng")
      .not("lat", "is", null)
      .not("lng", "is", null);

    const existingVenues = existingCandidates || [];
    let importedCount = 0;

    for (const row of selectedRows) {
      let city = row.city;
      let postalCode = row.postalCode;

      const nearby = existingVenues.find((candidate: any) => {
        const candidateLat = Number(candidate.lat);
        const candidateLng = Number(candidate.lng);

        if (!Number.isFinite(candidateLat) || !Number.isFinite(candidateLng)) {
          return false;
        }

        return haversineKm(
          row.lat,
          row.lng,
          candidateLat,
          candidateLng
        ) <= 0.15;
      });

      if (nearby?.id) {
        continue;
      }

      if (!city) {
        try {
          const place = await reversePlace(row.lat, row.lng);
          city = place.city || city;
          postalCode = postalCode || place.postalCode;
        } catch {
          // Import nicht blockieren, falls Reverse-Geocoding gerade nicht antwortet.
        }
      }

      const { data: sameNameCandidates } = await supabaseAdmin
        .from("venues")
        .select("id, name, city")
        .ilike("name", row.name)
        .limit(10);

      const sameName = (sameNameCandidates || []).find((candidate: any) => {
        if (!city) {
          return normalize(candidate.name) === normalize(row.name);
        }

        return (
          normalize(candidate.name) === normalize(row.name) &&
          normalize(candidate.city) === normalize(city)
        );
      });

      if (sameName?.id) {
        continue;
      }

      const { data: inserted, error } = await supabaseAdmin
        .from("venues")
        .insert({
          name: row.name,
          street: row.street,
          postal_code: postalCode,
          city,
          state: row.state,
          country: row.country || "Deutschland",
          website: row.website,
          capacity: row.capacity,
          venue_type: row.venueType,
          lat: row.lat,
          lng: row.lng,
        })
        .select("id, name, city, lat, lng")
        .single();

      if (error || !inserted) {
        console.error(`Discover Bulk-Import: ${row.name}`, error);
        continue;
      }

      existingVenues.push(inserted);
      importedCount += 1;
    }

    revalidatePath("/admin/locations");
    revalidatePath("/admin/locations/discover");

    const url = new URL(returnTo, "https://local.invalid");
    url.searchParams.set("imported", String(importedCount));

    redirect(`${url.pathname}?${url.searchParams.toString()}`);
  }

  async function ignoreVenue(formData: FormData) {
    "use server";

    const osmId = String(formData.get("osm_id") || "");
    const returnTo = safeReturnTo(formData.get("return_to"));

    if (!osmId) {
      throw new Error("OSM-ID fehlt.");
    }

    const { error } = await supabaseAdmin
      .from("discover_ignored_venues")
      .upsert(
        {
          osm_id: osmId,
          name: nullable(formData.get("name")),
          city: nullable(formData.get("city")),
          reason: "ungeeignet",
        },
        { onConflict: "osm_id" }
      );

    if (error) {
      if (error.code === "42P01") {
        throw new Error(
          "Die Tabelle discover_ignored_venues fehlt noch. Bitte zuerst die mitgelieferte SQL-Migration ausführen."
        );
      }

      throw new Error(error.message);
    }

    revalidatePath("/admin/locations/discover");
    redirect(returnTo);
  }

  async function restoreVenue(formData: FormData) {
    "use server";

    const osmId = String(formData.get("osm_id") || "");
    const returnTo = safeReturnTo(formData.get("return_to"));

    if (!osmId) {
      throw new Error("OSM-ID fehlt.");
    }

    const { error } = await supabaseAdmin
      .from("discover_ignored_venues")
      .delete()
      .eq("osm_id", osmId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/locations/discover");
    redirect(returnTo);
  }

  const knownCount = rows.filter((row) => row.knownVenue).length;
  const newCount = rows.length - knownCount;
  const acquisitionKnownCount = rows.filter(
    (row) => row.acquisitionCount > 0
  ).length;
  const ignoredCount = ignoredVenues.length;

  const returnTo = buildReturnUrl({
    mode,
    place,
    radiusKm,
    minCapacity,
    startShowId,
    endShowId,
    maxDetourKm,
    showIgnored,
  });

 const mapMarkers = rows.map((row) => ({
  id: row.osmId,
  name: row.name,
  city: row.city,
  lat: row.lat,
  lng: row.lng,
  capacity: row.capacity,
  status: (
    row.ignored
      ? "ignored"
      : row.knownVenue?.played_before
        ? "played"
        : row.acquisitionCount > 0
          ? "acquisition"
          : row.knownVenue
            ? "known"
            : "new"
  ) as "new" | "known" | "acquisition" | "played" | "ignored",
  detourKm: row.estimatedDetourKm ?? null,
}));

  const hasResultsSearch = hasAreaSearch || hasTourSearch;

  return (
    <main className="text-zinc-950">
      <div className="space-y-5">
        {/* HEADER */}
        <header className="flex flex-col gap-4 px-1 py-1 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
              PRIMAKAVI · BOOKING CRM
            </p>

            <h1 className="mt-1 text-4xl font-black tracking-tight md:text-5xl">
              Locations entdecken
            </h1>

            <p className="mt-1.5 text-sm text-zinc-500 md:text-base">
              Neue Spielstätten finden, Tourlücken clever nutzen und bekannte
              Locations sofort erkennen.
            </p>
          </div>

          <Link
            href="/admin/locations"
            className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-black text-zinc-600 shadow-sm ring-1 ring-black/5 transition hover:bg-[#f7f3eb] hover:text-zinc-950"
          >
            ← Alle Locations
          </Link>
        </header>

        {/* SUCHE */}
        <section className="rounded-[1.7rem] bg-white p-4 shadow-lg shadow-black/[0.03] ring-1 ring-black/5">
          <div className="mb-4 inline-flex rounded-xl bg-[#fbf7ef] p-1 ring-1 ring-black/5">
            <Link
              href="/admin/locations/discover?mode=area"
              className={`rounded-lg px-4 py-2 text-xs font-black transition ${
                mode === "area"
                  ? "bg-white text-zinc-950 shadow-sm ring-1 ring-black/5"
                  : "text-zinc-500 hover:text-zinc-950"
              }`}
            >
              🔎 Umgebung
            </Link>

            <Link
              href="/admin/locations/discover?mode=tour"
              className={`rounded-lg px-4 py-2 text-xs font-black transition ${
                mode === "tour"
                  ? "bg-lime-300 text-zinc-950 shadow-sm ring-1 ring-black/5"
                  : "text-zinc-500 hover:text-zinc-950"
              }`}
            >
              🚐 Tour
            </Link>
          </div>

          {mode === "area" ? (
            <form
              method="get"
              className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_160px_190px_auto]"
            >
              <input type="hidden" name="mode" value="area" />

              <label className="grid gap-1.5">
                <span className="px-1 text-[11px] font-black uppercase tracking-[0.1em] text-zinc-400">
                  Ausgangspunkt
                </span>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2">
                    🔎
                  </span>
                  <input
                    name="place"
                    defaultValue={place}
                    placeholder="z. B. Köln, Bonn, Düsseldorf …"
                    className="h-12 w-full rounded-xl bg-[#fbf7ef] pl-11 pr-4 text-sm font-semibold outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-black/10"
                  />
                </div>
              </label>

              <label className="grid gap-1.5">
                <span className="px-1 text-[11px] font-black uppercase tracking-[0.1em] text-zinc-400">
                  Radius
                </span>
                <select
                  name="radius"
                  defaultValue={String(radiusKm)}
                  className="h-12 rounded-xl bg-[#fbf7ef] px-4 text-sm font-bold outline-none"
                >
                  {[25, 50, 75, 100].map((value) => (
                    <option key={value} value={value}>
                      {value} km
                    </option>
                  ))}
                </select>
              </label>

              <CapacitySelect minCapacity={minCapacity} />

              <div className="flex items-end">
                <SearchSubmitButton
                  label="Locations finden"
                  loadingLabel="Locations werden gesucht …"
                />
              </div>
            </form>
          ) : (
            <form
              method="get"
              className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_minmax(260px,1fr)_160px_190px_auto]"
            >
              <input type="hidden" name="mode" value="tour" />

              <ShowSelect
                label="Von · Start-Show"
                name="startShow"
                value={startShowId}
                shows={tourShows}
              />

              <ShowSelect
                label="Bis · Ziel-Show"
                name="endShow"
                value={endShowId}
                shows={tourShows}
              />

              <label className="grid gap-1.5">
                <span className="px-1 text-[11px] font-black uppercase tracking-[0.1em] text-zinc-400">
                  Max. Abstecher
                </span>
                <select
                  name="maxDetour"
                  defaultValue={String(maxDetourKm)}
                  className="h-12 rounded-xl bg-[#fbf7ef] px-4 text-sm font-bold outline-none"
                >
                  {[20, 30, 50, 75, 100, 150].map((value) => (
                    <option key={value} value={value}>
                      ca. +{value} km
                    </option>
                  ))}
                </select>
              </label>

              <CapacitySelect minCapacity={minCapacity} />

              <div className="flex items-end">
                <SearchSubmitButton
                  label="Tour-Locations finden"
                  loadingLabel="Tour wird durchsucht …"
                />
              </div>
            </form>
          )}

          <div className="mt-3 flex flex-col gap-2 border-t border-black/5 px-1 pt-3">
            {hasResultsSearch && !searchError && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-black text-zinc-600">
                <span>✨ {rows.length} Treffer</span>
                <span className="text-zinc-300">·</span>
                <span>🟢 {newCount} neu</span>
                <span className="text-zinc-300">·</span>
                <span>✓ {knownCount} im CRM</span>
                <span className="text-zinc-300">·</span>
                <span>🎯 {acquisitionKnownCount} Akquise</span>

                {mode === "tour" && startShow && endShow && (
                  <>
                    <span className="hidden text-zinc-300 md:inline">·</span>
                    <span className="w-full text-zinc-500 md:w-auto">
                      {startShow.city || startShow.venue || "Start"} →{" "}
                      {endShow.city || endShow.venue || "Ziel"}
                      {routeKm !== null ? ` · ${Math.round(routeKm)} km` : ""}
                      {` · ${daysBetween(startShow.show_date, endShow.show_date)} Tage`}
                    </span>
                  </>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold text-zinc-400">
                  Quelle: OpenStreetMap + OSRM
                  {mode === "tour"
                    ? " · Abstecher = zusätzlicher Straßenweg gegenüber der direkten Route"
                    : ""}
                </p>
                {searchTimings.length > 0 && (
                  <p className="mt-1 text-[10px] font-semibold text-zinc-400">
                    ⚡ {searchTimings.join(" · ")}
                  </p>
                )}
              </div>

              {ignoredCount > 0 && (
                <Link
                  href={toggleIgnoredUrl(returnTo, showIgnored)}
                  className="text-[10px] font-black text-zinc-500 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-950"
                >
                  {showIgnored
                    ? "Ausgeblendete wieder verstecken"
                    : `${ignoredCount} ausgeblendete anzeigen`}
                </Link>
              )}
            </div>
          </div>
        </section>

        {hasResultsSearch && (
          <>
            {mode === "area" && centerLabel && !searchError && (
              <div className="px-1 text-xs font-semibold text-zinc-400">
                Suche rund um <span className="font-black">{centerLabel}</span>
              </div>
            )}

            {searchError ? (
              <section className="rounded-[1.7rem] bg-white p-6 text-sm font-bold text-rose-700 shadow-lg shadow-black/[0.03] ring-1 ring-rose-100">
                {searchError}
              </section>
            ) : rows.length === 0 ? (
              <section className="rounded-[1.7rem] bg-white p-8 text-center shadow-lg shadow-black/[0.03] ring-1 ring-black/5">
                <p className="text-lg font-black">Keine Treffer gefunden.</p>
                <p className="mt-2 text-sm text-zinc-500">
                  {mode === "tour"
                    ? "Im gewählten Tourkorridor wurden keine ausreichend passenden Spielstätten gefunden. Versuch einen größeren Abstecher oder eine kleinere Mindestgröße."
                    : "Im gewählten Radius wurden keine ausreichend passenden Spielstätten gefunden. Versuch einen größeren Radius oder eine andere Stadt."}
                </p>
              </section>
            ) : (
              <>
                {importedCount > 0 && (
                  <div className="rounded-[1.4rem] bg-lime-100 px-5 py-4 text-sm font-black text-lime-900 ring-1 ring-lime-200">
                    ✓ {importedCount}{" "}
                    {importedCount === 1
                      ? "Location wurde"
                      : "Locations wurden"}{" "}
                    ins CRM übernommen.
                  </div>
                )}

                {/* KARTE */}
                <section className="overflow-hidden rounded-[1.7rem] bg-white p-3 shadow-lg shadow-black/[0.03] ring-1 ring-black/5">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-2 pt-1">
                    <div>
                      <p className="text-sm font-black">
                        {mode === "tour" ? "Tour auf der Karte" : "Treffer auf der Karte"}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-zinc-400">
                        Karte zur schnellen Einordnung – die konkrete Arbeit bleibt in der Liste.
                      </p>
                    </div>

                    <MapLegend />
                  </div>

                  <DiscoverMap
                    mode={mode}
                    center={mapCenter}
                    radiusKm={mode === "area" ? radiusKm : null}
                    markers={mapMarkers}
                    routePoints={routePoints}
                    start={
                      startShow
                        ? {
                            lat: startShow.lat,
                            lng: startShow.lng,
                            label: showLabel(startShow),
                          }
                        : null
                    }
                    end={
                      endShow
                        ? {
                            lat: endShow.lat,
                            lng: endShow.lng,
                            label: showLabel(endShow),
                          }
                        : null
                    }
                  />
                </section>

                {/* TABELLE */}
                <section className="overflow-hidden rounded-[1.7rem] bg-white shadow-lg shadow-black/[0.03] ring-1 ring-black/5">
                  <form
                    id="bulk-import-form"
                    action={importSelectedVenues}
                    className="flex flex-col gap-3 border-b border-black/5 bg-[#fbf7ef] px-5 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-black text-zinc-950">
                        Mehrere Locations übernehmen
                      </p>
                      <p className="mt-0.5 text-[11px] font-semibold text-zinc-400">
                        Neue Locations auswählen und gemeinsam ins CRM übernehmen.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-xl bg-lime-300 px-4 py-2.5 text-xs font-black text-zinc-950 transition hover:bg-lime-200"
                    >
                      + Ausgewählte ins CRM
                    </button>
                  </form>

                  <div
                    className={`hidden gap-4 border-b border-black/5 px-5 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-400 md:grid ${
                      mode === "tour"
                        ? "grid-cols-[minmax(220px,1.2fr)_minmax(130px,.65fr)_100px_75px_minmax(170px,.9fr)_220px]"
                        : "grid-cols-[minmax(220px,1.25fr)_minmax(140px,.7fr)_95px_75px_minmax(180px,.95fr)_220px]"
                    }`}
                  >
                    <div>Location</div>
                    <div>Ort</div>
                    <div>{mode === "tour" ? "Abstecher" : "Entfernung"}</div>
                    <div>Plätze</div>
                    <div>CRM-Status</div>
                    <div className="text-right">Aktion</div>
                  </div>

                  <div className="divide-y divide-black/5">
                    {rows.map((row) => (
                      <div
                        key={row.osmId}
                        className={`grid gap-3 px-5 py-4 transition hover:bg-[#f7f3eb] md:items-center ${
                          mode === "tour"
                            ? "md:grid-cols-[minmax(220px,1.2fr)_minmax(130px,.65fr)_100px_75px_minmax(170px,.9fr)_220px]"
                            : "md:grid-cols-[minmax(220px,1.25fr)_minmax(140px,.7fr)_95px_75px_minmax(180px,.95fr)_220px]"
                        } ${row.ignored ? "opacity-55" : ""}`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          {!row.knownVenue && !row.ignored ? (
                            <input
                              type="checkbox"
                              name="selected_osm_id"
                              value={row.osmId}
                              form="bulk-import-form"
                              aria-label={`${row.name} auswählen`}
                              className="h-4 w-4 shrink-0 cursor-pointer accent-lime-400"
                            />
                          ) : (
                            <div className="h-4 w-4 shrink-0" />
                          )}

                          <div className="min-w-0">
                            <p className="truncate text-[15px] font-black text-zinc-950">
                              {row.name}
                            </p>
                            <p className="mt-1 truncate text-[11px] font-semibold text-zinc-400">
                              {row.venueType || "Spielstätte"}
                              {row.website ? " · Website vorhanden" : ""}
                            </p>
                          </div>
                        </div>

                        <div className="min-w-0">
                          <AsyncPlaceLabel
                            city={row.city}
                            lat={row.lat}
                            lng={row.lng}
                          />
                          <p className="mt-1 truncate text-[11px] font-semibold text-zinc-400">
                            {[row.postalCode, row.state]
                              .filter(Boolean)
                              .join(" · ") || "—"}
                          </p>
                        </div>

                        <div className="text-sm font-black text-zinc-700">
                          {mode === "tour"
                            ? row.estimatedDetourKm !== null &&
                              row.estimatedDetourKm !== undefined
                              ? `+${row.estimatedDetourKm} km`
                              : "—"
                            : formatDistance(row.distanceKm)}
                        </div>

                        <div className="text-sm font-black text-zinc-700">
                          {row.capacity ? row.capacity : "—"}
                        </div>

                        <div className="min-w-0">
                          <StatusCell row={row} />
                        </div>

                        <div className="flex items-center justify-start gap-2 md:justify-end">
                          {row.ignored ? (
                            <form action={restoreVenue}>
                              <input type="hidden" name="osm_id" value={row.osmId} />
                              <input type="hidden" name="return_to" value={returnTo} />
                              <button
                                type="submit"
                                title="Wieder anzeigen"
                                className="whitespace-nowrap rounded-lg bg-white px-3 py-2 text-[11px] font-black text-zinc-600 ring-1 ring-black/10 transition hover:bg-[#fbf7ef]"
                              >
                                ↩ Wieder anzeigen
                              </button>
                            </form>
                          ) : (
                            <>
                              {row.website && (
                                <a
                                  href={normalizeUrl(row.website)}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Website öffnen"
                                  aria-label={`Website von ${row.name} öffnen`}
                                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[15px] text-zinc-500 ring-1 ring-black/[0.07] transition hover:bg-[#fbf7ef] hover:text-zinc-950"
                                >
                                  🌐
                                </a>
                              )}

                              {row.knownVenue ? (
                                row.latestAcquisition ? (
                                  <Link
                                    href={`/admin/acquisition/${row.latestAcquisition.id}`}
                                    className="whitespace-nowrap rounded-lg bg-lime-300 px-3 py-2 text-[11px] font-black text-zinc-950 transition hover:bg-lime-200"
                                  >
                                    🎯 Akquise öffnen
                                  </Link>
                                ) : (
                                  <Link
                                    href={`/admin/locations/${row.knownVenue.id}`}
                                    className="whitespace-nowrap rounded-lg bg-[#fbf7ef] px-3 py-2 text-[11px] font-black text-zinc-600 ring-1 ring-black/5 transition hover:text-zinc-950"
                                  >
                                    Location öffnen →
                                  </Link>
                                )
                              ) : (
                                <form action={importVenue} className="flex">
                                  <ImportVenueFields row={row} />
                                  <button
                                    type="submit"
                                    className="whitespace-nowrap rounded-lg bg-lime-300 px-3 py-2 text-[11px] font-black text-zinc-950 transition hover:bg-lime-200"
                                  >
                                    + Ins CRM
                                  </button>
                                </form>
                              )}

                              <form action={ignoreVenue}>
                                <input type="hidden" name="osm_id" value={row.osmId} />
                                <input type="hidden" name="name" value={row.name} />
                                <input type="hidden" name="city" value={row.city || ""} />
                                <input type="hidden" name="return_to" value={returnTo} />
                                <button
                                  type="submit"
                                  title="Für Discover ausblenden"
                                  aria-label={`${row.name} als ungeeignet ausblenden`}
                                  className="grid h-8 w-8 place-items-center rounded-lg bg-white text-sm font-black text-zinc-400 ring-1 ring-black/[0.07] transition hover:bg-red-50 hover:text-red-600"
                                >
                                  ×
                                </button>
                              </form>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </>
        )}

        {!hasResultsSearch && (
          <section className="rounded-[1.7rem] bg-white p-8 shadow-lg shadow-black/[0.03] ring-1 ring-black/5">
            <div className="mx-auto max-w-2xl text-center">
              <div className="text-4xl">{mode === "tour" ? "🚐" : "✨"}</div>
              <h2 className="mt-4 text-xl font-black">
                {mode === "tour"
                  ? "Welche Tourlücke wollen wir clever nutzen?"
                  : "Wo möchtest du neue Locations finden?"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                {mode === "tour"
                  ? "Wähle zwei bestehende Shows. Discover sucht entlang der Strecke nach Häusern, die sich mit möglichst wenig Umweg in die Tour einbauen lassen."
                  : "Gib eine Stadt ein. Bekannte Locations werden direkt gegen eure Stammdaten geprüft; vorhandene Akquise wird ebenfalls markiert."}
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function StatusCell({ row }: { row: ResultRow }) {
  if (row.ignored) {
    return (
      <>
        <div className="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-black text-zinc-500 ring-1 ring-black/5">
          × Ausgeblendet
        </div>
        <p className="mt-1.5 text-[11px] font-semibold text-zinc-400">
          für Discover ignoriert
        </p>
      </>
    );
  }

  if (row.knownVenue?.played_before) {
    return (
      <>
        <div className="inline-flex rounded-full bg-lime-100 px-2.5 py-1 text-[10px] font-black text-zinc-800 ring-1 ring-lime-200">
          🎤 Schon gespielt
        </div>
        {row.acquisitionCount > 0 && (
          <p className="mt-1.5 truncate text-[11px] font-semibold text-zinc-500">
            zusätzlich {row.acquisitionCount}× Akquise-Historie
          </p>
        )}
      </>
    );
  }

  if (row.knownVenue && row.acquisitionCount > 0) {
    return (
      <>
        <div className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-800 ring-1 ring-amber-100">
          🎯 {row.acquisitionCount}× Akquise
        </div>
        <p className="mt-1.5 truncate text-[11px] font-semibold text-zinc-500">
          zuletzt{" "}
          {formatDate(
            row.latestAcquisition?.last_contact_at ||
              row.latestAcquisition?.created_at
          )}
          {row.latestAcquisition?.program
            ? ` · ${row.latestAcquisition.program}`
            : ""}
        </p>
      </>
    );
  }

  if (row.knownVenue) {
    return (
      <>
        <div className="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-black text-zinc-700 ring-1 ring-black/5">
          ✓ Bereits im CRM
        </div>
        <p className="mt-1.5 text-[11px] font-semibold text-zinc-400">
          noch keine Akquise
        </p>
      </>
    );
  }

  return (
    <div className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700 ring-1 ring-emerald-100">
      ● Neue Location
    </div>
  );
}

function ImportVenueFields({ row }: { row: ResultRow }) {
  return (
    <>
      <input type="hidden" name="osm_id" value={row.osmId} />
      <input type="hidden" name="name" value={row.name} />
      <input type="hidden" name="street" value={row.street || ""} />
      <input type="hidden" name="postal_code" value={row.postalCode || ""} />
      <input type="hidden" name="city" value={row.city || ""} />
      <input type="hidden" name="state" value={row.state || ""} />
      <input type="hidden" name="country" value={row.country || ""} />
      <input type="hidden" name="website" value={row.website || ""} />
      <input type="hidden" name="capacity" value={row.capacity || ""} />
      <input type="hidden" name="venue_type" value={row.venueType || ""} />
      <input type="hidden" name="lat" value={row.lat} />
      <input type="hidden" name="lng" value={row.lng} />
    </>
  );
}

function CapacitySelect({ minCapacity }: { minCapacity: number }) {
  return (
    <label className="grid gap-1.5">
      <span className="px-1 text-[11px] font-black uppercase tracking-[0.1em] text-zinc-400">
        Mindestgröße
      </span>
      <select
        name="minCapacity"
        defaultValue={String(minCapacity)}
        className="h-12 rounded-xl bg-[#fbf7ef] px-4 text-sm font-bold outline-none"
      >
        <option value="0">egal</option>
        <option value="80">ab 80 Plätze</option>
        <option value="100">ab 100 Plätze</option>
        <option value="150">ab 150 Plätze</option>
        <option value="200">ab 200 Plätze</option>
      </select>
    </label>
  );
}

function ShowSelect({
  label,
  name,
  value,
  shows,
}: {
  label: string;
  name: string;
  value: string;
  shows: TourShow[];
}) {
  return (
    <label className="grid gap-1.5">
      <span className="px-1 text-[11px] font-black uppercase tracking-[0.1em] text-zinc-400">
        {label}
      </span>
      <select
        name={name}
        defaultValue={value}
        className="h-12 min-w-0 rounded-xl bg-[#fbf7ef] px-4 text-sm font-bold outline-none"
      >
        <option value="">Show auswählen …</option>
        {shows.map((show) => (
          <option key={show.id} value={show.id}>
            {showLabel(show)}
          </option>
        ))}
      </select>
    </label>
  );
}

function MapLegend() {
  return (
    <div className="flex flex-wrap gap-2 text-[10px] font-black text-zinc-500">
      <LegendDot color="#84cc16" label="neu" />
      <LegendDot color="#f59e0b" label="Akquise" />
      <LegendDot color="#18181b" label="im CRM" />
      <LegendDot color="#d9ff00" label="gespielt" />
      <LegendDot color="#a1a1aa" label="ausgeblendet" />
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fbf7ef] px-2.5 py-1 ring-1 ring-black/5">
      <span
        className="h-2 w-2 rounded-full ring-1 ring-black/10"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

function hydrateResults(
  osmRows: OSMVenue[],
  knownVenues: KnownVenue[],
  acquisition: AcquisitionSummary[],
  ignoredVenues: IgnoredVenue[]
): ResultRow[] {
  const ignoredIds = new Set(ignoredVenues.map((item) => item.osm_id));

  return osmRows.map((venue) => {
    const knownVenue = findKnownVenue(venue, knownVenues);

    const venueAcquisition = knownVenue
      ? acquisition.filter((item) => item.venue_id === knownVenue.id)
      : [];

    return {
      ...venue,
      knownVenue,
      acquisitionCount: venueAcquisition.length,
      latestAcquisition: venueAcquisition[0] || null,
      ignored: ignoredIds.has(venue.osmId),
    };
  });
}

async function enrichMissingCities(
  rows: OSMVenue[]
): Promise<OSMVenue[]> {
  const missing = rows.filter((row) => !row.city);

  if (missing.length === 0) {
    return rows;
  }

  // Statt für jeden Treffer einzeln einen Reverse-Geocoder aufzurufen,
  // laden wir passende OSM-Orte für alle fehlenden Treffer gesammelt.
  // Das ist schneller und deutlich robuster bei vielen Ergebnissen.
  let placeCandidates: OsmPlaceCandidate[] = [];

  try {
    placeCandidates = await fetchNearbyOsmPlaces(missing);
  } catch (error) {
    console.error("OSM-Orte konnten nicht ergänzt werden:", error);
  }

  const withPlaces = rows.map((row) => {
    if (row.city) return row;

    const nearest = findNearestOsmPlace(row, placeCandidates);

    if (!nearest) {
      return row;
    }

    return {
      ...row,
      city: nearest.name,
      postalCode: row.postalCode || nearest.postalCode,
    };
  });

  // Nur die wenigen Treffer, für die selbst die OSM-Ortssuche nichts findet,
  // bekommen noch einen Reverse-Geocoding-Fallback.
  const stillMissing = withPlaces.filter((row) => !row.city).slice(0, 12);

  if (stillMissing.length === 0) {
    return withPlaces;
  }

  const enrichedById = new Map<string, OSMVenue>();
  const queue = [...stillMissing];

  // Bewusst nur 2 parallel, damit der externe Fallback nicht überfahren wird.
  const workers = Array.from(
    { length: Math.min(2, queue.length) },
    async () => {
      while (queue.length > 0) {
        const row = queue.shift();
        if (!row) break;

        try {
          const place = await reversePlace(row.lat, row.lng);

          enrichedById.set(row.osmId, {
            ...row,
            city: place.city || row.city,
            postalCode: row.postalCode || place.postalCode,
          });
        } catch {
          enrichedById.set(row.osmId, row);
        }
      }
    }
  );

  await Promise.all(workers);

  return withPlaces.map((row) => enrichedById.get(row.osmId) || row);
}

type OsmPlaceCandidate = {
  id: string;
  name: string;
  placeType: string;
  lat: number;
  lng: number;
  postalCode: string | null;
};

async function fetchNearbyOsmPlaces(
  rows: OSMVenue[]
): Promise<OsmPlaceCandidate[]> {
  // Die Treffer liegen ohnehin entlang einer Route/Region.
  // Pro Venue holen wir Ortsknoten im 12-km-Umfeld und deduplizieren anschließend.
  const blocks = rows
    .slice(0, 100)
    .map(
      (row) => `
      node
        ["place"~"^(city|town|village|municipality|hamlet)$"]
        (around:12000,${row.lat},${row.lng});
    `
    )
    .join("\n");

  const query = `
[out:json][timeout:50];
(
  ${blocks}
);
out body;
`;

  const endpoints = [
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
    "https://overpass-api.de/api/interpreter",
  ];

  let data: any = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          Accept: "application/json",
          "User-Agent": "primakavi-booking-crm/1.0",
        },
        body: new URLSearchParams({ data: query }).toString(),
        cache: "no-store",
      });

      if (!response.ok) continue;

      const candidate = await response.json();

      if (candidate?.remark || !Array.isArray(candidate?.elements)) {
        continue;
      }

      data = candidate;
      break;
    } catch {
      // Nächsten Mirror probieren.
    }
  }

  if (!data) {
    return [];
  }

  const dedupe = new Map<string, OsmPlaceCandidate>();

  for (const element of data.elements || []) {
    const tags = element.tags || {};
    const name = cleanString(tags.name);
    const placeType = cleanString(tags.place);
    const lat = Number(element.lat);
    const lng = Number(element.lon);

    if (
      !name ||
      !placeType ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      continue;
    }

    dedupe.set(String(element.id), {
      id: String(element.id),
      name,
      placeType,
      lat,
      lng,
      postalCode:
        cleanString(tags["addr:postcode"]) ||
        cleanString(tags.postal_code) ||
        null,
    });
  }

  return [...dedupe.values()];
}

function findNearestOsmPlace(
  row: OSMVenue,
  places: OsmPlaceCandidate[]
): OsmPlaceCandidate | null {
  if (places.length === 0) return null;

  const ranked = places
    .map((place) => ({
      place,
      distanceKm: haversineKm(
        row.lat,
        row.lng,
        place.lat,
        place.lng
      ),
      typeRank: placeTypeRank(place.placeType),
    }))
    .filter((item) => item.distanceKm <= 12)
    .sort((a, b) => {
      // Nähe ist wichtig, aber wir bevorzugen offizielle Orte gegenüber
      // einem winzigen Weiler, wenn beides fast gleich nah ist.
      const scoreA = a.distanceKm + a.typeRank;
      const scoreB = b.distanceKm + b.typeRank;
      return scoreA - scoreB;
    });

  return ranked[0]?.place || null;
}

function placeTypeRank(placeType: string) {
  switch (placeType) {
    case "city":
      return 0.2;
    case "town":
      return 0.1;
    case "municipality":
      return 0;
    case "village":
      return 0;
    case "hamlet":
      return 1.5;
    default:
      return 2;
  }
}

async function reversePlace(
  lat: number,
  lng: number
): Promise<{ city: string | null; postalCode: string | null }> {
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  const cached = reversePlaceCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return {
      city: cached.city,
      postalCode: cached.postalCode,
    };
  }

  // Fallback: Nominatim liefert für Deutschland zuverlässiger die
  // administrativen Ortsfelder als Photon.
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("zoom", "14");
  url.searchParams.set("addressdetails", "1");

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": "primakavi-booking-crm/1.0",
      Accept: "application/json",
    },
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!response.ok) {
    throw new Error(`Nominatim Reverse: ${response.status}`);
  }

  const data = await response.json();
  const address = data?.address || {};

  const city =
    cleanString(address.city) ||
    cleanString(address.town) ||
    cleanString(address.municipality) ||
    cleanString(address.village) ||
    cleanString(address.hamlet) ||
    cleanString(address.suburb) ||
    cleanString(address.city_district) ||
    cleanString(address.county) ||
    null;

  const postalCode = cleanString(address.postcode) || null;

  reversePlaceCache.set(cacheKey, {
    expiresAt: Date.now() + REVERSE_PLACE_CACHE_TTL,
    city,
    postalCode,
  });

  return { city, postalCode };
}

async function geocodePlace(place: string) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", place);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "de");
  url.searchParams.set("addressdetails", "1");

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": "primakavi-booking-crm/1.0",
      Accept: "application/json",
    },
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!response.ok) {
    throw new Error(`Nominatim: ${response.status}`);
  }

  const data = await response.json();
  const hit = data?.[0];

  if (!hit) return null;

  return {
    lat: Number(hit.lat),
    lng: Number(hit.lon),
    displayName: String(hit.display_name || place),
  };
}

async function fetchDrivingRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<{ points: RoutePoint[]; distanceKm: number }> {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${startLng},${startLat};${endLng},${endLat}` +
    `?overview=full&geometries=geojson`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "primakavi-booking-crm/1.0",
      Accept: "application/json",
    },
    next: { revalidate: 60 * 60 * 6 },
  });

  if (!response.ok) {
    throw new Error(`OSRM: ${response.status}`);
  }

  const data = await response.json();
  const route = data?.routes?.[0];
  const coordinates = route?.geometry?.coordinates;

  if (!route || !Array.isArray(coordinates) || coordinates.length < 2) {
    throw new Error("OSRM: keine Route");
  }

  return {
    points: coordinates.map((coord: [number, number]) => ({
      lat: Number(coord[1]),
      lng: Number(coord[0]),
    })),
    distanceKm: Number(route.distance || 0) / 1000,
  };
}

async function searchOsmVenuesAlongRoute(
  routePoints: RoutePoint[],
  maxDetourKm: number,
  minCapacity: number
): Promise<{ rows: OSMVenue[]; error: string | null }> {
  const sampleEveryKm = 60;
  const samples = sampleRoute(routePoints, sampleEveryKm, 12);

  // "Abstecher" wird als Hin-und-zurück zur Route angenähert.
  // Deshalb reicht für die Suche etwa die Hälfte des maximalen Abstechers.
  const corridorRadiusKm = Math.max(8, maxDetourKm / 2);

  return searchOsmVenuesAtPoints(samples, corridorRadiusKm, minCapacity);
}

async function searchOsmVenuesAtPoints(
  points: RoutePoint[],
  radiusKm: number,
  minCapacity: number
): Promise<{ rows: OSMVenue[]; error: string | null }> {
  const cacheKey = [
    "route",
    points.map((p) => `${p.lat.toFixed(3)},${p.lng.toFixed(3)}`).join(";"),
    radiusKm,
    minCapacity,
  ].join("|");

  const cached = osmSearchCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return {
      rows: cached.rows,
      error: cached.error,
    };
  }

  const radiusMeters = Math.round(radiusKm * 1000);

  const blocks = points
    .map(
      (point) => `
      nwr
        ["amenity"~"^(theatre|arts_centre|community_centre|events_venue)$"]
        (around:${radiusMeters},${point.lat},${point.lng});
    `
    )
    .join("\n");

  const query = `
[out:json][timeout:50];
(
  ${blocks}
);
out center tags;
`;

  const result = await runOverpassQuery(query, minCapacity);

  osmSearchCache.set(cacheKey, {
    expiresAt: Date.now() + (result.error ? 60 * 1000 : OSM_SEARCH_CACHE_TTL),
    ...result,
  });

  return result;
}

async function searchOsmVenues(
  lat: number,
  lng: number,
  radiusKm: number,
  minCapacity: number
): Promise<{ rows: OSMVenue[]; error: string | null }> {
  const cacheKey = [
    lat.toFixed(5),
    lng.toFixed(5),
    radiusKm,
    minCapacity,
  ].join("|");

  const cached = osmSearchCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return {
      rows: cached.rows,
      error: cached.error,
    };
  }

  if (cached) {
    osmSearchCache.delete(cacheKey);
  }

  const radiusMeters = Math.round(radiusKm * 1000);

  const query = `
[out:json][timeout:45];
nwr
  ["amenity"~"^(theatre|arts_centre|community_centre|events_venue)$"]
  (around:${radiusMeters},${lat},${lng});
out center tags;
`;

  const result = await runOverpassQuery(query, minCapacity, { lat, lng });

  osmSearchCache.set(cacheKey, {
    expiresAt: Date.now() + (result.error ? 60 * 1000 : OSM_SEARCH_CACHE_TTL),
    ...result,
  });

  return result;
}

async function runOverpassQuery(
  query: string,
  minCapacity: number,
  distanceCenter?: { lat: number; lng: number }
): Promise<{ rows: OSMVenue[]; error: string | null }> {
  const endpoints = [
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
    "https://overpass-api.de/api/interpreter",
  ];

  let data: any = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          Accept: "application/json",
          "User-Agent": "primakavi-booking-crm/1.0",
        },
        body: new URLSearchParams({ data: query }).toString(),
        cache: "no-store",
      });

      if (!response.ok) continue;

      const candidate = await response.json();

      if (candidate?.remark || !Array.isArray(candidate?.elements)) {
        continue;
      }

      data = candidate;
      break;
    } catch {
      // Nächsten Mirror probieren.
    }
  }

  if (!data) {
    return {
      rows: [],
      error:
        "Die OpenStreetMap-Suche ist gerade nicht erreichbar. Bitte später erneut versuchen.",
    };
  }

  const dedupe = new Map<string, OSMVenue>();

  for (const element of data.elements || []) {
    const tags = element.tags || {};
    const name = cleanString(tags.name);

    if (!name) continue;

    if (!isBookingRelevantVenue(tags, name)) {
      continue;
    }

    const elementLat = Number(element.lat ?? element.center?.lat);
    const elementLng = Number(element.lon ?? element.center?.lon);

    if (!Number.isFinite(elementLat) || !Number.isFinite(elementLng)) {
      continue;
    }

    const capacity = parseCapacity(tags.capacity);

    if (
      minCapacity > 0 &&
      capacity !== null &&
      capacity < minCapacity
    ) {
      continue;
    }

    const street =
      [
        cleanString(tags["addr:street"]),
        cleanString(tags["addr:housenumber"]),
      ]
        .filter(Boolean)
        .join(" ") || null;

    const osmId = `${element.type}-${element.id}`;

    dedupe.set(osmId, {
      osmId,
      name,
      lat: elementLat,
      lng: elementLng,
      street,
      postalCode: cleanString(tags["addr:postcode"]),
      city:
        cleanString(tags["addr:city"]) ||
        cleanString(tags["addr:place"]) ||
        null,
      state: cleanString(tags["addr:state"]),
      country: cleanString(tags["addr:country"]) || "Deutschland",
      website:
        cleanString(tags.website) ||
        cleanString(tags["contact:website"]) ||
        null,
      capacity,
      venueType: venueTypeLabel(tags.amenity),
      distanceKm: distanceCenter
        ? haversineKm(
            distanceCenter.lat,
            distanceCenter.lng,
            elementLat,
            elementLng
          )
        : 0,
    });
  }

  const rows = [...dedupe.values()]
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 100);

  return {
    rows,
    error: null,
  };
}

async function addRoadDetours(
  rows: ResultRow[],
  startShow: TourShow,
  endShow: TourShow,
  baseRouteKm: number
): Promise<ResultRow[]> {
  if (rows.length === 0) return rows;

  // OSRM public table service: 2 Endpunkte + max. 40 Kandidaten.
  // Das hält die Abstecher-Berechnung schnell, ohne die Tour-Suche zu stark auszudünnen.
  const candidates = rows.slice(0, 40);

  const coordinates = [
    [startShow.lng, startShow.lat],
    [endShow.lng, endShow.lat],
    ...candidates.map((row) => [row.lng, row.lat]),
  ]
    .map(([lng, lat]) => `${lng},${lat}`)
    .join(";");

  const url =
    `https://router.project-osrm.org/table/v1/driving/${coordinates}` +
    `?annotations=distance`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "primakavi-booking-crm/1.0",
      Accept: "application/json",
    },
    next: { revalidate: 60 * 60 * 6 },
  });

  if (!response.ok) {
    throw new Error(`OSRM Table: ${response.status}`);
  }

  const data = await response.json();
  const distances = data?.distances;

  if (!Array.isArray(distances)) {
    throw new Error("OSRM Table: keine Distanzmatrix");
  }

  return candidates.map((row, index) => {
    const matrixIndex = index + 2;

    const startToCandidateMeters =
      distances?.[0]?.[matrixIndex];

    const candidateToEndMeters =
      distances?.[matrixIndex]?.[1];

    if (
      typeof startToCandidateMeters !== "number" ||
      typeof candidateToEndMeters !== "number"
    ) {
      return {
        ...row,
        estimatedDetourKm: null,
      };
    }

    const detourKm =
      startToCandidateMeters / 1000 +
      candidateToEndMeters / 1000 -
      baseRouteKm;

    return {
      ...row,
      // Kleine negative Rundungs-/Routingdifferenzen auf 0 begrenzen.
      estimatedDetourKm: Math.max(0, Math.round(detourKm)),
    };
  });
}


function sampleRoute(
  points: RoutePoint[],
  everyKm: number,
  maxPoints: number
): RoutePoint[] {
  if (points.length <= 2) return points;

  const result: RoutePoint[] = [points[0]];
  let accumulated = 0;

  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const current = points[i];

    accumulated += haversineKm(prev.lat, prev.lng, current.lat, current.lng);

    if (accumulated >= everyKm) {
      result.push(current);
      accumulated = 0;

      if (result.length >= maxPoints - 1) break;
    }
  }

  const last = points[points.length - 1];
  const currentLast = result[result.length - 1];

  if (
    currentLast.lat !== last.lat ||
    currentLast.lng !== last.lng
  ) {
    result.push(last);
  }

  return result.slice(0, maxPoints);
}

function routePositionKm(
  lat: number,
  lng: number,
  route: RoutePoint[]
) {
  if (!route.length) return 999999;

  let nearestIndex = 0;
  let nearestDistance = Infinity;

  for (let i = 0; i < route.length; i += 4) {
    const point = route[i];
    const distance = haversineKm(lat, lng, point.lat, point.lng);

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = i;
    }
  }

  const lastIndex = route.length - 1;
  const lastDistance = haversineKm(
    lat,
    lng,
    route[lastIndex].lat,
    route[lastIndex].lng
  );

  if (lastDistance < nearestDistance) {
    nearestIndex = lastIndex;
  }

  let km = 0;

  for (let i = 1; i <= nearestIndex; i += 1) {
    km += haversineKm(
      route[i - 1].lat,
      route[i - 1].lng,
      route[i].lat,
      route[i].lng
    );
  }

  return km;
}


function distanceToRouteKm(
  lat: number,
  lng: number,
  route: RoutePoint[]
) {
  if (!route.length) return 9999;

  // Für unser Booking-Radar reicht die Distanz zu den Route-Punkten als
  // robuste Näherung. Die Route ist dicht genug von OSRM geliefert.
  let min = Infinity;

  for (let i = 0; i < route.length; i += 6) {
    const point = route[i];
    const distance = haversineKm(lat, lng, point.lat, point.lng);
    if (distance < min) min = distance;
  }

  const last = route[route.length - 1];
  min = Math.min(min, haversineKm(lat, lng, last.lat, last.lng));

  return min;
}

function findKnownVenue(
  venue: OSMVenue,
  knownVenues: KnownVenue[]
): KnownVenue | null {
  const coordinateMatch = knownVenues.find((known) => {
    const lat = Number(known.lat);
    const lng = Number(known.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;

    return haversineKm(venue.lat, venue.lng, lat, lng) <= 0.15;
  });

  if (coordinateMatch) return coordinateMatch;

  return (
    knownVenues.find(
      (known) =>
        normalize(known.name) === normalize(venue.name) &&
        normalize(known.city) === normalize(venue.city)
    ) || null
  );
}

function buildReturnUrl({
  mode,
  place,
  radiusKm,
  minCapacity,
  startShowId,
  endShowId,
  maxDetourKm,
  showIgnored,
}: {
  mode: "area" | "tour";
  place: string;
  radiusKm: number;
  minCapacity: number;
  startShowId: string;
  endShowId: string;
  maxDetourKm: number;
  showIgnored: boolean;
}) {
  const search = new URLSearchParams();
  search.set("mode", mode);

  if (mode === "area") {
    if (place) search.set("place", place);
    search.set("radius", String(radiusKm));
  } else {
    if (startShowId) search.set("startShow", startShowId);
    if (endShowId) search.set("endShow", endShowId);
    search.set("maxDetour", String(maxDetourKm));
  }

  search.set("minCapacity", String(minCapacity));

  if (showIgnored) {
    search.set("showIgnored", "1");
  }

  return `/admin/locations/discover?${search.toString()}`;
}

function toggleIgnoredUrl(returnTo: string, showIgnored: boolean) {
  const url = new URL(returnTo, "https://local.invalid");

  if (showIgnored) {
    url.searchParams.delete("showIgnored");
  } else {
    url.searchParams.set("showIgnored", "1");
  }

  return `${url.pathname}?${url.searchParams.toString()}`;
}

function safeReturnTo(value: FormDataEntryValue | null) {
  const fallback = "/admin/locations/discover";
  const stringValue = String(value || "");

  return stringValue.startsWith("/admin/locations/discover")
    ? stringValue
    : fallback;
}

function showLabel(show: TourShow) {
  return `${formatDate(show.show_date)} · ${show.venue || "Location"}${
    show.city ? ` · ${show.city}` : ""
  }`;
}

function daysBetween(start?: string | null, end?: string | null) {
  if (!start || !end) return "—";

  const startDate = new Date(`${start}T12:00:00`);
  const endDate = new Date(`${end}T12:00:00`);
  const days = Math.max(
    0,
    Math.round((endDate.getTime() - startDate.getTime()) / 86400000)
  );

  return days;
}

function nullable(value: FormDataEntryValue | null) {
  const cleaned = String(value || "").trim();
  return cleaned || null;
}

function numberOrNull(value: FormDataEntryValue | null) {
  const cleaned = String(value || "").trim();
  if (!cleaned) return null;

  const number = Number(cleaned);
  return Number.isFinite(number) ? number : null;
}

function cleanString(value: unknown) {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  return cleaned || null;
}

function parseCapacity(value: unknown) {
  if (typeof value !== "string" && typeof value !== "number") return null;

  const match = String(value).replace(/[^\d]/g, "");
  if (!match) return null;

  const capacity = Number(match);
  return Number.isFinite(capacity) ? capacity : null;
}

function isBookingRelevantVenue(
  tags: Record<string, unknown>,
  name: string
) {
  const amenity = String(tags.amenity || "").toLowerCase();
  const normalizedName = normalizeLoose(name);

  // Eindeutig unpassende Treffer konsequent raus.
  const negativePatterns = [
    "kindergarten",
    "kita",
    "kindertages",
    "kinderkrippe",
    "krippe",
    "grundschule",
    "schule",
    "gymnasium",
    "hochschule",
    "universitat",
    "university",
    "jugendzentrum",
    "jugendhaus",
    "hausderjugend",
    "jugendtreff",
    "youth",
    "senioren",
    "pflegeheim",
    "wohnheim",
    "sporthalle",
    "turnhalle",
    "fitness",
    "feuerwehr",
    "rettungswache",
    "schutzenheim",
    "schuetzenheim",
  ];

  if (
    negativePatterns.some((pattern) =>
      normalizedName.includes(pattern)
    )
  ) {
    return false;
  }

  // Theater und echte Kulturzentren sind immer interessant.
  if (amenity === "theatre" || amenity === "arts_centre") {
    return true;
  }

  const capacity = parseCapacity(tags.capacity);

  // Namen, die sehr klar auf eine bespielbare Kultur-/Veranstaltungsstätte
  // hindeuten. Hier bewusst großzügig genug für Bürgerhäuser und Scheunen,
  // aber nicht mehr für beliebige soziale Einrichtungen.
  const positivePatterns = [
    "theater",
    "theatre",
    "buhne",
    "buehne",
    "freilichtbuhne",
    "freilichtbuehne",
    "kabarett",
    "kleinkunst",
    "kultur",
    "stadthalle",
    "burgerhaus",
    "buergerhaus",
    "festhalle",
    "veranstaltung",
    "eventhalle",
    "eventlocation",
    "kursaal",
    "kurhaus",
    "forum",
    "saal",
    "scheune",
    "schlachthof",
    "kulturbahnhof",
    "kulturwerk",
    "kulturhaus",
    "kulturzentrum",
    "kulturzentrum",
    "dorfgemeinschaftshaus",
    "gemeinschaftshaus",
    "gemeindehaus",
  ];

  const hasPositiveName = positivePatterns.some((pattern) =>
    normalizedName.includes(pattern)
  );

  if (hasPositiveName) {
    return true;
  }

  // events_venue ist als OSM-Tag grundsätzlich brauchbar, aber nur,
  // wenn es wenigstens einen belastbaren Hinweis auf eine echte
  // Veranstaltungslocation gibt.
  if (amenity === "events_venue") {
    return Boolean(
      capacity !== null ||
      cleanString(tags.website) ||
      cleanString(tags["contact:website"])
    );
  }

  // community_centre ist extrem breit und war die Hauptquelle für Müll.
  // Deshalb nur noch bei vernünftiger Kapazität oder klarer Kulturbezeichnung.
  if (amenity === "community_centre") {
    const communityType = String(
      tags.community_centre || ""
    ).toLowerCase();

    if (
      communityType === "cultural_centre" ||
      communityType === "cultural_center"
    ) {
      return true;
    }

    return capacity !== null && capacity >= 80;
  }

  return false;
}

function normalizeLoose(value: unknown) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]/g, "");
}


function venueTypeLabel(value: unknown) {
  switch (String(value || "")) {
    case "theatre":
      return "Theater";
    case "arts_centre":
      return "Kulturzentrum";
    case "community_centre":
      return "Bürger-/Kulturhaus";
    case "events_venue":
      return "Veranstaltungsort";
    default:
      return "Spielstätte";
  }
}

function normalize(value: unknown) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]/g, "");
}

function normalizeUrl(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function formatTiming(ms: number) {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

function clampNumber(
  value: string | undefined,
  fallback: number,
  min: number,
  max: number
) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;

  return Math.min(max, Math.max(min, number));
}

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const toRad = (degree: number) => (degree * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a));
}

function formatDistance(value: number) {
  if (value < 10) return `${value.toFixed(1)} km`;
  return `${Math.round(value)} km`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;

  return `${day}.${month}.${year}`;
}
