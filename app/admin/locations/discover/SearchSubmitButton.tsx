"use client";

import { useState } from "react";

export default function SearchSubmitButton({
  label = "Locations finden",
  loadingLabel = "Locations werden gesucht …",
}: {
  label?: string;
  loadingLabel?: string;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="submit"
      onClick={() => setLoading(true)}
      aria-busy={loading}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-lime-300 px-5 text-sm font-black text-zinc-950 transition hover:bg-lime-200"
    >
      {loading ? (
        <>
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950/20 border-t-zinc-950"
          />
          <span>{loadingLabel}</span>
        </>
      ) : (
        label
      )}
    </button>
  );
}
