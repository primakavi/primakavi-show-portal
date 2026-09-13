"use client";

import { useState } from "react";

type Option = [string, string];

export default function StatusSelectCard({
  name,
  icon,
  tone,
  defaultValue,
  options,
}: {
  name: string;
  icon: string;
  tone: "green" | "blue" | "yellow" | "red";
  defaultValue?: string | null;
  options: Option[];
}) {
  const tones = {
    green: "bg-[#eefaf1] text-[#18834c] hover:bg-[#e8f7ed]",
    blue: "bg-[#eef5ff] text-[#2867d8] hover:bg-[#e8f1ff]",
    yellow: "bg-[#fff7df] text-[#9a6a00] hover:bg-[#fff3cf]",
    red: "bg-[#fff0f1] text-[#c1263e] hover:bg-[#ffe8eb]",
  };

  const [value, setValue] = useState(defaultValue || options[0]?.[0] || "");
  const selected = options.find(([optionValue]) => optionValue === value) || options[0];

  return (
    <label
      className={`relative flex min-h-[78px] cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition ${tones[tone]}`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/75 text-lg">
        {icon}
      </span>

      <span className="min-w-0 flex-1 pr-7 text-sm font-black uppercase leading-[1.15]">
        {selected?.[1]}
      </span>

      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base font-black opacity-75">
        ▾
      </span>

      <select
        name={name}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-label={selected?.[1] || name}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      >
        {options.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
