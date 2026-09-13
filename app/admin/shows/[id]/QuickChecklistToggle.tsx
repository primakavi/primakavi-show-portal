"use client";

import { useEffect, useState } from "react";

export default function QuickChecklistToggle({
  targetId,
  initialChecked,
  label,
}: {
  targetId: string;
  initialChecked: boolean;
  label: string;
}) {
  const [checked, setChecked] = useState(initialChecked);

  useEffect(() => {
    const target = document.getElementById(targetId) as HTMLInputElement | null;
    if (!target) return;

    const sync = () => setChecked(target.checked);
    target.addEventListener("change", sync);
    return () => target.removeEventListener("change", sync);
  }, [targetId]);

  function toggle(next: boolean) {
    setChecked(next);
    const target = document.getElementById(targetId) as HTMLInputElement | null;
    if (target) {
      target.checked = next;
      target.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-zinc-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => toggle(e.target.checked)}
        className="h-4 w-4 rounded accent-[#2867d8]"
      />
      <span className={checked ? "text-zinc-400 line-through" : ""}>{label}</span>
    </label>
  );
}
