"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full bg-zinc-200 px-4 py-2 text-sm font-black transition hover:bg-zinc-300"
    >
      Drucken
    </button>
  );
}