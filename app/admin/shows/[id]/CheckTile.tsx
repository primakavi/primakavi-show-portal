"use client";

import { useState } from "react";

export default function CheckTile({
  name,
  label,
  defaultChecked = false,
  disabled = false,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
  disabled?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <label
      className={`flex h-11 items-center gap-3 rounded-xl px-4 text-sm font-black ring-1 transition ${
        disabled
          ? "cursor-not-allowed bg-white text-zinc-400 ring-black/5 opacity-45"
          : checked
            ? "cursor-pointer bg-emerald-50 text-emerald-700 ring-emerald-100"
            : "cursor-pointer bg-white text-zinc-700 ring-black/5 hover:bg-[#fbfaf7]"
      }`}
    >
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(event) => setChecked(event.target.checked)}
        disabled={disabled}
        className="sr-only"
      />

      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-black transition ${
          checked
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-zinc-300 bg-white text-transparent"
        }`}
      >
        ✓
      </span>

      <span>{label}</span>
    </label>
  );
}
