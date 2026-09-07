import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import SearchSubmitButton from "./SearchSubmitButton";

type SearchParams = {
  place?: string;
  radius?: string;
  minCapacity?: string;
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
};

type KnownVenue = {
  id: string;
  name: string | null;
  city: string | null;
  lat: number | string | null;
  lng: number | string | null;
};

type AcquisitionSummary = {
  id: string;
  venue_id: string;
  program: string | null;
  status: string | null;
  last_contact_at: string | null;
  created_at: string | null;
};

type ResultRow = OSMVenue & {
  knownVenue: KnownVenue | null;
  acquisitionCount: number;
  latestAcquisition: AcquisitionSummary | null;
};

type OsmSearchCacheEntry = {
  expiresAt: number;
  rows: OSMVenue[];
  error: string | null;
};

const osmSearchCache = new Map<string, OsmSearchCacheEntry>();
const OSM_SEARCH_CACHE_TTL = 15 * 60 * 1000;

export default async function DiscoverLocationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const place = String(params.place || "").trim();
  const radiusKm = clampNumber(params.radius, 75, 5, 100);
  const minCapacity = clampNumber(params.minCapacity, 100, 0, 5000);

  const [{ data: knownVenues }, { data: acquisition }] = await Promise.all([
    supabaseAdmin
      .from("venues")
      .select("id, name, city, lat, lng"),
    supabaseAdmin
      .from("acquisition")
      .select("id, venue_id, program, status, last_contact_at, created_at")
      .order("last_contact_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false }),
  ]);

  let rows: ResultRow[] = [];
  let searchError: string | null = null;
  let centerLabel: string | null = null;

  if (place) {
    try {
      const center = await geocodePlace(place);

      if (!center) {
        searchError = `„${place}“ konnte nicht gefunden werden.`;
      } else {
        centerLabel = center.displayName;

        const osmResult = await searchOsmVenues(
          center.lat,
          center.lng,
          radiusKm,
          minCapacity
        );

        if (osmResult.error) {
          searchError = osmResult.error;
        }

        rows = osmResult.rows.map((venue) => {
          const knownVenue = findKnownVenue(
            venue,
            (knownVenues || []) as KnownVenue[]
          );

          const venueAcquisition = knownVenue
            ? ((acquisition || []) as AcquisitionSummary[]).filter(
                (item) => item.venue_id === knownVenue.id
              )
            : [];

          return {
            ...venue,
            knownVenue,
            acquisitionCount: venueAcquisition.length,
            latestAcquisition: venueAcquisition[0] || null,
          };
        });
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

  async function importVenue(formData: FormData) {
    "use server";

    const osmId = String(formData.get("osm_id") || "");
    const name = nullable(formData.get("name"));

    if (!osmId || !name) {
      throw new Error("Location-Daten fehlen.");
    }

    const lat = numberOrNull(formData.get("lat"));
    const lng = numberOrNull(formData.get("lng"));

    // Doppelte Übernahme verhindern:
    // zuerst über Koordinaten grob prüfen, dann über Name + Ort.
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

        return (
          haversineKm(lat, lng, candidateLat, candidateLng) <= 0.15
        );
      });

      if (nearby?.id) {
        redirect(`/admin/locations/${nearby.id}`);
      }
    }

    const city = nullable(formData.get("city"));

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
        postal_code: nullable(formData.get("postal_code")),
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

    redirect(`/admin/locations/${inserted.id}`);
  }

  const knownCount = rows.filter((row) => row.knownVenue).length;
  const newCount = rows.length - knownCount;
  const acquisitionKnownCount = rows.filter(
    (row) => row.acquisitionCount > 0
  ).length;

  return (
    <main className="text-zinc-950">
      <div className="space-y-5">
        {/* HEADER */}
        <header className="flex flex-col gap-5 px-1 py-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
              PRIMAKAVI · BOOKING CRM
            </p>

            <h1 className="mt-2 text-5xl font-black tracking-tight">
              Locations entdecken
            </h1>

            <p className="mt-2 text-zinc-500">
              Neue Spielstätten finden – bekannte Locations und Akquise-Historie
              sofort erkennen.
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
          <form
            method="get"
            className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_160px_190px_auto]"
          >
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

            <div className="flex items-end">
              <SearchSubmitButton />
            </div>
          </form>

          <p className="mt-3 px-1 text-[11px] font-semibold text-zinc-400">
            Quelle: OpenStreetMap. Maximal 100 km pro Suche, damit die Abfrage stabil bleibt. Die Platzanzahl ist dort nicht bei jeder Location hinterlegt – Treffer ohne Größenangabe bleiben deshalb sichtbar.
          </p>
        </section>

        {place && (
          <>
            {/* STATS */}
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard icon="✨" value={rows.length} label="Treffer" />
              <StatCard icon="🟢" value={newCount} label="neu fürs CRM" />
              <StatCard icon="✓" value={knownCount} label="bereits im CRM" />
              <StatCard
                icon="🎯"
                value={acquisitionKnownCount}
                label="mit Akquise-Historie"
              />
            </section>

            {centerLabel && !searchError && (
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
                  Versuch einen größeren Radius oder eine andere Stadt.
                </p>
              </section>
            ) : (
              <section className="overflow-hidden rounded-[1.7rem] bg-white shadow-lg shadow-black/[0.03] ring-1 ring-black/5">
                <div className="hidden grid-cols-[minmax(220px,1.35fr)_minmax(150px,.8fr)_100px_90px_minmax(210px,1fr)_150px] gap-4 border-b border-black/5 px-5 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-400 md:grid">
                  <div>Location</div>
                  <div>Ort</div>
                  <div>Entfernung</div>
                  <div>Plätze</div>
                  <div>CRM-Status</div>
                  <div className="text-right">Aktion</div>
                </div>

                <div className="divide-y divide-black/5">
                  {rows.map((row) => {
                    const rowContent = (
                      <>
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-black text-zinc-950">
                            {row.name}
                          </p>
                          <p className="mt-1 truncate text-[11px] font-semibold text-zinc-400">
                            {row.venueType || "Spielstätte"}
                            {row.website ? " · Website vorhanden" : ""}
                          </p>
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-zinc-700">
                            {row.city || "Ort offen"}
                          </p>
                          <p className="mt-1 truncate text-[11px] font-semibold text-zinc-400">
                            {[row.postalCode, row.state]
                              .filter(Boolean)
                              .join(" · ") || "—"}
                          </p>
                        </div>

                        <div className="text-sm font-black text-zinc-700">
                          {formatDistance(row.distanceKm)}
                        </div>

                        <div className="text-sm font-black text-zinc-700">
                          {row.capacity ? row.capacity : "—"}
                        </div>

                        <div className="min-w-0">
                          {row.knownVenue ? (
                            row.acquisitionCount > 0 ? (
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
                            ) : (
                              <>
                                <div className="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-black text-zinc-700 ring-1 ring-black/5">
                                  ✓ Bereits im CRM
                                </div>
                                <p className="mt-1.5 text-[11px] font-semibold text-zinc-400">
                                  noch keine Akquise
                                </p>
                              </>
                            )
                          ) : (
                            <div className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700 ring-1 ring-emerald-100">
                              ● Neue Location
                            </div>
                          )}
                        </div>
                      </>
                    );

                    return row.knownVenue ? (
                      <Link
                        key={row.osmId}
                        href={`/admin/locations/${row.knownVenue.id}`}
                        className="grid cursor-pointer gap-3 px-5 py-4 transition hover:bg-[#f7f3eb] md:grid-cols-[minmax(220px,1.35fr)_minmax(150px,.8fr)_100px_90px_minmax(210px,1fr)_150px] md:items-center"
                      >
                        {rowContent}
                        <div className="flex justify-start md:justify-end">
                          <span className="rounded-lg bg-[#fbf7ef] px-3 py-2 text-[11px] font-black text-zinc-600 ring-1 ring-black/5">
                            Location öffnen →
                          </span>
                        </div>
                      </Link>
                    ) : (
                      <div
                        key={row.osmId}
                        className="grid gap-3 px-5 py-4 transition hover:bg-[#f7f3eb] md:grid-cols-[minmax(220px,1.35fr)_minmax(150px,.8fr)_100px_90px_minmax(210px,1fr)_150px] md:items-center"
                      >
                        {rowContent}

                        <div className="flex items-center justify-start gap-2 md:justify-end">
                          {row.website && (
                            <a
                              href={row.website}
                              target="_blank"
                              rel="noreferrer"
                              title="Website öffnen"
                              aria-label={`Website von ${row.name} öffnen`}
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[15px] text-zinc-500 ring-1 ring-black/[0.07] transition hover:bg-[#fbf7ef] hover:text-zinc-950"
                            >
                              🌐
                            </a>
                          )}

                          <form
                            action={importVenue}
                            className="flex"
                          >
                          <input type="hidden" name="osm_id" value={row.osmId} />
                          <input type="hidden" name="name" value={row.name} />
                          <input
                            type="hidden"
                            name="street"
                            value={row.street || ""}
                          />
                          <input
                            type="hidden"
                            name="postal_code"
                            value={row.postalCode || ""}
                          />
                          <input
                            type="hidden"
                            name="city"
                            value={row.city || ""}
                          />
                          <input
                            type="hidden"
                            name="state"
                            value={row.state || ""}
                          />
                          <input
                            type="hidden"
                            name="country"
                            value={row.country || ""}
                          />
                          <input
                            type="hidden"
                            name="website"
                            value={row.website || ""}
                          />
                          <input
                            type="hidden"
                            name="capacity"
                            value={row.capacity || ""}
                          />
                          <input
                            type="hidden"
                            name="venue_type"
                            value={row.venueType || ""}
                          />
                          <input type="hidden" name="lat" value={row.lat} />
                          <input type="hidden" name="lng" value={row.lng} />

                            <button
                              type="submit"
                              className="rounded-lg bg-lime-300 px-3 py-2 text-[11px] font-black text-zinc-950 transition hover:bg-lime-200"
                            >
                              + Ins CRM
                            </button>
                          </form>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}

        {!place && (
          <section className="rounded-[1.7rem] bg-white p-8 shadow-lg shadow-black/[0.03] ring-1 ring-black/5">
            <div className="mx-auto max-w-xl text-center">
              <div className="text-4xl">✨</div>
              <h2 className="mt-4 text-xl font-black">
                Wo möchtest du neue Locations finden?
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Gib eine Stadt ein. Bekannte Locations werden direkt gegen eure
                Stammdaten geprüft; vorhandene Akquise wird ebenfalls markiert.
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: string;
  value: number | string;
  label: string;
}) {
  return (
    <div className="h-[70px] rounded-[20px] bg-white px-[18px] shadow-lg shadow-black/[0.03] ring-1 ring-black/5">
      <div className="flex h-full items-center gap-3">
        <div className="shrink-0 text-[24px] leading-none">{icon}</div>
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

  // Öffentliche Overpass-Instanzen sind leider nicht garantiert stabil.
  // Deshalb mehrere Mirrors. Wichtig: Fehler werden NICHT mehr geworfen,
  // damit Next.js im Dev-Modus keinen roten Console-Error erzeugt.
  const endpoints = [
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
    "https://overpass-api.de/api/interpreter",
  ];

  let data: any = null;
  let lastMessage = "keine Antwort";

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

      if (!response.ok) {
        lastMessage = `HTTP ${response.status}`;
        continue;
      }

      const candidate = await response.json();

      if (candidate?.remark) {
        lastMessage = String(candidate.remark);
        continue;
      }

      if (!Array.isArray(candidate?.elements)) {
        lastMessage = "ungültige Antwort";
        continue;
      }

      data = candidate;
      break;
    } catch (error) {
      lastMessage =
        error instanceof Error ? error.message : "unbekannter Fehler";
    }
  }

  if (!data) {
    const result = {
      rows: [] as OSMVenue[],
      error:
        "Die OpenStreetMap-Suche ist gerade nicht erreichbar. Die öffentlichen Overpass-Server antworten momentan nicht zuverlässig. Bitte später erneut versuchen.",
    };

    osmSearchCache.set(cacheKey, {
      expiresAt: Date.now() + 60 * 1000,
      ...result,
    });

    return result;
  }

  const elements = Array.isArray(data?.elements) ? data.elements : [];

  const rows = elements
    .map((element: any): OSMVenue | null => {
      const tags = element.tags || {};
      const name = cleanString(tags.name);

      if (!name) return null;

      const elementLat = Number(element.lat ?? element.center?.lat);
      const elementLng = Number(element.lon ?? element.center?.lon);

      if (!Number.isFinite(elementLat) || !Number.isFinite(elementLng)) {
        return null;
      }

      const capacity = parseCapacity(tags.capacity);
      const distanceKm = haversineKm(lat, lng, elementLat, elementLng);

      if (
        minCapacity > 0 &&
        capacity !== null &&
        capacity < minCapacity
      ) {
        return null;
      }

      const street =
        [
          cleanString(tags["addr:street"]),
          cleanString(tags["addr:housenumber"]),
        ]
          .filter(Boolean)
          .join(" ") || null;

      return {
        osmId: `${element.type}-${element.id}`,
        name,
        lat: elementLat,
        lng: elementLng,
        street,
        postalCode: cleanString(tags["addr:postcode"]),
        city:
          cleanString(tags["addr:city"]) ||
          cleanString(tags["addr:town"]) ||
          cleanString(tags["addr:village"]) ||
          null,
        state: cleanString(tags["addr:state"]),
        country: cleanString(tags["addr:country"]) || "Deutschland",
        website:
          cleanString(tags.website) ||
          cleanString(tags["contact:website"]) ||
          null,
        capacity,
        venueType: venueTypeLabel(tags.amenity),
        distanceKm,
      };
    })
    .filter(Boolean) as OSMVenue[];

  const deduped = new Map<string, OSMVenue>();

  for (const row of rows.sort((a, b) => a.distanceKm - b.distanceKm)) {
    const key = `${normalize(row.name)}|${normalize(row.city)}|${Math.round(
      row.lat * 1000
    )}|${Math.round(row.lng * 1000)}`;

    if (!deduped.has(key)) {
      deduped.set(key, row);
    }
  }

  const result = {
    rows: Array.from(deduped.values()).slice(0, 100),
    error: null,
  };

  osmSearchCache.set(cacheKey, {
    expiresAt: Date.now() + OSM_SEARCH_CACHE_TTL,
    ...result,
  });

  return result;
}

function findKnownVenue(
  osmVenue: OSMVenue,
  knownVenues: KnownVenue[]
): KnownVenue | null {
  // 1. Sehr nah = ziemlich sicher dieselbe Location.
  const nearby = knownVenues.find((venue) => {
    const venueLat = Number(venue.lat);
    const venueLng = Number(venue.lng);

    if (!Number.isFinite(venueLat) || !Number.isFinite(venueLng)) {
      return false;
    }

    return (
      haversineKm(osmVenue.lat, osmVenue.lng, venueLat, venueLng) <= 0.15
    );
  });

  if (nearby) return nearby;

  // 2. Name + Ort.
  const exactNameCity = knownVenues.find(
    (venue) =>
      normalize(venue.name) === normalize(osmVenue.name) &&
      normalize(venue.city) === normalize(osmVenue.city)
  );

  if (exactNameCity) return exactNameCity;

  // 3. Exakter Name, wenn einer der beiden Orte fehlt.
  return (
    knownVenues.find(
      (venue) =>
        normalize(venue.name) === normalize(osmVenue.name) &&
        (!venue.city || !osmVenue.city)
    ) || null
  );
}

function venueTypeLabel(amenity?: string) {
  const labels: Record<string, string> = {
    theatre: "Theater",
    arts_centre: "Kulturzentrum",
    community_centre: "Bürger-/Gemeinschaftshaus",
    events_venue: "Veranstaltungsort",
  };

  return labels[amenity || ""] || "Spielstätte";
}

function parseCapacity(value: unknown) {
  if (value === null || value === undefined) return null;

  const match = String(value).replace(/\./g, "").match(/\d+/);
  if (!match) return null;

  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function cleanString(value: unknown) {
  if (value === null || value === undefined) return null;
  const cleaned = String(value).trim();
  return cleaned || null;
}

function nullable(value: FormDataEntryValue | null) {
  if (value === null) return null;
  const cleaned = String(value).trim();
  return cleaned || null;
}

function numberOrNull(value: FormDataEntryValue | null) {
  if (value === null || String(value).trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalize(value: unknown) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "und")
    .replace(/[^a-z0-9]/g, "");
}

function clampNumber(
  raw: string | undefined,
  fallback: number,
  min: number,
  max: number
) {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const earthRadiusKm = 6371;
  const toRad = (value: number) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km: number) {
  if (km < 10) {
    return `${km.toLocaleString("de-DE", {
      maximumFractionDigits: 1,
    })} km`;
  }

  return `${Math.round(km)} km`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(date);
}
