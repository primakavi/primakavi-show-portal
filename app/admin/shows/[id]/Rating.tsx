"use client";

import { useState } from "react";

export default function Rating({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value?: string | null;
  options: [string, string][];
}) {
  const [selected, setSelected] = useState(value || "");

  return (
    <fieldset className="rounded-xl bg-white p-3 ring-1 ring-black/5">
      <legend className="px-1 text-[11px] font-semibold text-zinc-500">
        {label}
      </legend>

      <div className="mt-2 flex flex-wrap gap-2">
        {options.map(([optionValue, optionLabel]) => {
          const active = selected === optionValue;

          return (
            <label
              key={optionValue}
              className={`cursor-pointer rounded-full px-3 py-2 text-xs font-black ring-1 transition ${
                active
                  ? "bg-zinc-950 text-white ring-zinc-950"
                  : "bg-[#fbf7ef] text-zinc-700 ring-black/5 hover:bg-[#f4efe6]"
              }`}
            >
              <input
                className="sr-only"
                type="radio"
                name={name}
                value={optionValue}
                checked={active}
                onChange={() => setSelected(optionValue)}
              />
              {optionLabel}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
