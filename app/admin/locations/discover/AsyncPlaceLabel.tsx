"use client";

import { useEffect, useState } from "react";

type Props = {
  city: string | null;
  lat: number;
  lng: number;
};

export default function AsyncPlaceLabel({ city, lat, lng }: Props) {
  const [resolvedCity, setResolvedCity] = useState<string | null>(city);
  const [loading, setLoading] = useState(!city);

  useEffect(() => {
    if (city) {
      setResolvedCity(city);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadPlace() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/discover/reverse?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`,
          { signal: controller.signal }
        );

        if (!response.ok) return;

        const data = await response.json();
        if (data?.city) setResolvedCity(String(data.city));
      } catch (error) {
        if ((error as Error)?.name !== "AbortError") {
          console.error("Ort konnte nicht nachgeladen werden:", error);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadPlace();
    return () => controller.abort();
  }, [city, lat, lng]);

  return (
    <p className="truncate text-sm font-bold text-zinc-700">
      {resolvedCity || (loading ? "Ort wird ermittelt …" : "📍 auf Karte")}
    </p>
  );
}
