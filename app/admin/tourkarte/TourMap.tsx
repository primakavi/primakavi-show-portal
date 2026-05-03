"use client";

import Link from "next/link";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";

type Show = {
  id: string;
  artist: string | null;
  program: string | null;
  show_date: string | null;
  venue: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
};

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function TourMap({ shows }: { shows: Show[] }) {
  const mapShows = shows.filter(
    (show) => show.latitude !== null && show.longitude !== null
  );

  const positions = mapShows.map(
    (show) => [show.latitude!, show.longitude!] as [number, number]
  );

  const center =
    positions.length > 0
      ? positions[0]
      : ([51.1657, 10.4515] as [number, number]);

  return (
    <div className="h-[720px] overflow-hidden rounded-[1.5rem]">
      <MapContainer
        center={center}
        zoom={positions.length > 0 ? 7 : 6}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds shows={mapShows} />

        {positions.length > 1 && (
          <Polyline
            positions={positions}
            pathOptions={{
              weight: 4,
              opacity: 0.75,
              dashArray: "8 10",
            }}
          />
        )}

        {mapShows.map((show, index) => (
          <Marker
            key={show.id}
            position={[show.latitude!, show.longitude!]}
            icon={markerIcon}
          >
            <Tooltip direction="top" offset={[0, -36]} permanent>
              <span className="font-black">{index + 1}</span>
            </Tooltip>

            <Popup>
              <div className="min-w-[220px]">
                <p className="text-xs font-bold text-zinc-500">
                  Stop {index + 1} · {formatDate(show.show_date)}
                </p>
                <p className="mt-1 text-base font-black text-zinc-950">
                  {show.venue || "Ohne Venue"}
                </p>
                <p className="mt-1 text-sm font-bold text-zinc-600">
                  {show.city || "Ohne Stadt"}
                </p>
                {show.program && (
                  <p className="mt-2 text-xs font-bold text-pink-500">
                    {show.program}
                  </p>
                )}
                <Link
                  href={`/admin/shows/${show.id}`}
                  className="mt-3 inline-flex rounded-xl bg-zinc-950 px-3 py-2 text-xs font-black text-white"
                >
                  Akte öffnen
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

function FitBounds({ shows }: { shows: Show[] }) {
  const map = useMap();

  useEffect(() => {
    if (!shows.length) return;

    const bounds = L.latLngBounds(
      shows.map((show) => [show.latitude!, show.longitude!])
    );

    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 9,
    });
  }, [shows, map]);

  return null;
}

function formatDate(date: string | null) {
  if (!date) return "Ohne Datum";

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}