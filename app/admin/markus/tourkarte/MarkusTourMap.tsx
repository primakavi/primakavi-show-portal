"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";

type Show = {
  id: string;
  program: string | null;
  show_date: string | null;
  venue: string | null;
  city: string | null;
  venue_address: string | null;
  start_time: string | null;
  soundcheck_time: string | null;
  piano_type: string | null;
  epiano_available: boolean | null;
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

export default function MarkusTourMap({ shows }: { shows: Show[] }) {
  const mapShows = shows.filter(
    (show) => show.latitude !== null && show.longitude !== null
  );

  const center =
    mapShows.length > 0
      ? ([mapShows[0].latitude, mapShows[0].longitude] as [number, number])
      : ([51.1657, 10.4515] as [number, number]);

  return (
    <div className="h-[760px] overflow-hidden rounded-[1.5rem]">
      <MapContainer
        center={center}
        zoom={mapShows.length > 0 ? 7 : 6}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds shows={mapShows} />

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
                <p className="mt-2 text-xs font-bold text-pink-500">
                  Start: {show.start_time || "—"}
                </p>
                <p className="mt-1 text-xs font-bold text-zinc-500">
                  Soundcheck: {show.soundcheck_time || "—"}
                </p>
                <p className="mt-2 text-xs font-bold text-zinc-700">
                  🎹{" "}
                  {show.epiano_available === true
                    ? "E-Piano vorhanden"
                    : show.piano_type || "Piano prüfen"}
                </p>
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