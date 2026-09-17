"use client";

import type { MouseEvent } from "react";

type Props = {
  idleLabel: string;
  clickLabel?: string;
  className?: string;
  form?: string;
  formAction?: (formData: FormData) => void | Promise<void>;
};

export default function ClickFeedbackButton({
  idleLabel,
  clickLabel = "Speichert …",
  className = "",
  form,
  formAction,
}: Props) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    // Rein optische Klickreaktion:
    // kein State, kein disabled, kein Timer, kein Eingriff in den Submit.
    event.currentTarget.textContent = clickLabel;
  }

  return (
    <button
      type="submit"
      form={form}
      formAction={formAction}
      onClick={handleClick}
      className={className}
    >
      {idleLabel}
    </button>
  );
}
