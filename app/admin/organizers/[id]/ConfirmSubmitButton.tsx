"use client";

export default function ConfirmSubmitButton({
  label,
  message,
  danger = false,
}: {
  label: string;
  message: string;
  danger?: boolean;
}) {
  return (
    <button
      type="submit"
      onClick={(
        event
      ) => {
        if (
          !window.confirm(
            message
          )
        ) {
          event.preventDefault();
        }
      }}
      className={
        danger
          ? "rounded-full bg-red-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-red-700"
          : "px-2 py-1 text-xs font-black text-red-500 transition hover:text-red-700"
      }
    >
      {label}
    </button>
  );
}