"use client";

export default function CopyLink({ token }: { token: string }) {
  return (
    <button
      type="button"
      onClick={() =>
        navigator.clipboard.writeText(`${window.location.origin}/show/${token}`)
      }
      className="rounded-full bg-purple-100 px-4 py-2 text-sm font-black text-purple-700"
    >
      Link kopieren
    </button>
  );
}