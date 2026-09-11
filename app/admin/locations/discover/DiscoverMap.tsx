"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

type MarkerStatus =
  | "new"
  | "known"
  | "acquisition"
  | "played"
  | "ignored";

type Marker = {
  id: string;
  name: string;
  city: string | null;
  lat: number;
  lng: number;
  capacity: number | null;
  status: MarkerStatus;
  detourKm: number | null;
};

type RoutePoint = {
  lat: number;
  lng: number;
};

type EndPoint = {
  lat: number;
  lng: number;
  label: string;
};

export default function DiscoverMap({
  mode,
  center,
  radiusKm,
  markers,
  routePoints,
  start,
  end,
}: {
  mode: "area" | "tour";
  center: { lat: number; lng: number } | null;
  radiusKm: number | null;
  markers: Marker[];
  routePoints: RoutePoint[];
  start: EndPoint | null;
  end: EndPoint | null;
}) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    async function renderMap() {
      if (!mapElementRef.current) return;

      const L = await import("leaflet");

      if (cancelled || !mapElementRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const fallbackCenter: [number, number] = center
        ? [center.lat, center.lng]
        : [51.1657, 10.4515];

      const map = L.map(mapElementRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView(fallbackCenter, mode === "tour" ? 6 : 9);

      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap-Mitwirkende",
        maxZoom: 18,
      }).addTo(map);

      const bounds: [number, number][] = [];

      if (mode === "area" && center && radiusKm) {
        L.circle([center.lat, center.lng], {
          radius: radiusKm * 1000,
          color: "#18181b",
          weight: 2,
          opacity: 0.65,
          fillColor: "#d9ff00",
          fillOpacity: 0.08,
          dashArray: "7 7",
        }).addTo(map);

        const centerIcon = L.divIcon({
          className: "",
          html: `
            <div style="
              width:30px;
              height:30px;
              border-radius:9999px;
              display:flex;
              align-items:center;
              justify-content:center;
              background:#d9ff00;
              color:#18181b;
              border:3px solid #ffffff;
              box-shadow:0 3px 12px rgba(0,0,0,.18);
              font:900 13px/1 system-ui,sans-serif;
            ">⌖</div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        L.marker([center.lat, center.lng], { icon: centerIcon })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:system-ui,sans-serif;font-weight:800;font-size:13px;">
              Suchzentrum · ${radiusKm} km Radius
            </div>`
          );

        const latDelta = radiusKm / 111;
        const lngDelta =
          radiusKm /
          (111 * Math.max(0.2, Math.cos((center.lat * Math.PI) / 180)));

        bounds.push(
          [center.lat + latDelta, center.lng],
          [center.lat - latDelta, center.lng],
          [center.lat, center.lng + lngDelta],
          [center.lat, center.lng - lngDelta]
        );
      }

      if (routePoints.length > 1) {
        const latLngs = routePoints.map(
          (point) => [point.lat, point.lng] as [number, number]
        );

        // Erst ein heller breiter Unterzug, darauf die eigentliche CRM-Route.
        L.polyline(latLngs, {
          color: "#d9ff00",
          weight: 9,
          opacity: 0.5,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(map);

        L.polyline(latLngs, {
          color: "#18181b",
          weight: 3,
          opacity: 0.88,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(map);

        bounds.push(...latLngs);
      }

      for (const marker of markers) {
        const icon = L.divIcon({
          className: "",
          html: markerHtml(marker.status),
          iconSize: [26, 26],
          iconAnchor: [13, 13],
          popupAnchor: [0, -14],
        });

        const item = L.marker([marker.lat, marker.lng], { icon }).addTo(map);

        item.bindPopup(
          `<div style="min-width:180px;font-family:system-ui,sans-serif;">
            <div style="font-weight:900;font-size:14px;line-height:1.25;">${escapeHtml(marker.name)}</div>
            <div style="margin-top:4px;color:#71717a;font-size:12px;font-weight:600;">
              ${escapeHtml(marker.city || "Ort offen")}
              ${marker.capacity ? ` · ${marker.capacity} Plätze` : ""}
            </div>
            ${
              marker.detourKm !== null
                ? `<div style="margin-top:7px;font-size:12px;font-weight:800;">+${marker.detourKm} km zusätzlicher Straßenweg</div>`
                : ""
            }
          </div>`
        );

        bounds.push([marker.lat, marker.lng]);
      }

      if (start) {
        addEndpoint(L, map, start, "S", "#d9ff00");
        bounds.push([start.lat, start.lng]);
      }

      if (end) {
        addEndpoint(L, map, end, "Z", "#18181b");
        bounds.push([end.lat, end.lng]);
      }

      if (bounds.length > 1) {
        map.fitBounds(bounds, {
          padding: [35, 35],
          maxZoom: mode === "tour" ? 8 : 12,
        });
      } else if (bounds.length === 1) {
        map.setView(bounds[0], 11);
      }

      window.setTimeout(() => {
        map.invalidateSize();
      }, 0);
    }

    renderMap();

    return () => {
      cancelled = true;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mode, center, radiusKm, markers, routePoints, start, end]);

  return (
    <>
      <style>{`
        .leaflet-container {
          font-family: inherit;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 14px;
          box-shadow: 0 12px 30px rgba(0,0,0,.12);
        }
        .leaflet-popup-tip {
          box-shadow: none;
        }
      `}</style>

      <div
        ref={mapElementRef}
        className="h-[360px] w-full overflow-hidden rounded-[1.3rem] bg-[#f4f1e9] ring-1 ring-black/5 md:h-[430px]"
      />
    </>
  );
}

function addEndpoint(
  L: any,
  map: any,
  point: EndPoint,
  letter: string,
  background: string
) {
  const icon = L.divIcon({
    className: "",
    html: `
      <div style="
        width:34px;
        height:34px;
        border-radius:9999px;
        display:flex;
        align-items:center;
        justify-content:center;
        background:${background};
        color:${background === "#18181b" ? "#ffffff" : "#18181b"};
        border:3px solid #ffffff;
        box-shadow:0 3px 12px rgba(0,0,0,.22);
        font:900 12px/1 system-ui,sans-serif;
      ">${letter}</div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });

  L.marker([point.lat, point.lng], { icon })
    .addTo(map)
    .bindPopup(
      `<div style="font-family:system-ui,sans-serif;font-weight:800;font-size:13px;">${escapeHtml(point.label)}</div>`
    );
}

function markerHtml(status: MarkerStatus) {
  const background = {
    new: "#84cc16",
    known: "#18181b",
    acquisition: "#f59e0b",
    played: "#d9ff00",
    ignored: "#a1a1aa",
  }[status];

  const symbol = {
    new: "+",
    known: "✓",
    acquisition: "◎",
    played: "♪",
    ignored: "×",
  }[status];

  const textColor =
    status === "known" ? "#ffffff" : "#18181b";

  return `
    <div style="
      width:26px;
      height:26px;
      border-radius:9999px;
      display:flex;
      align-items:center;
      justify-content:center;
      background:${background};
      color:${textColor};
      border:3px solid #ffffff;
      box-shadow:0 2px 9px rgba(0,0,0,.2);
      font:900 11px/1 system-ui,sans-serif;
    ">${symbol}</div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
