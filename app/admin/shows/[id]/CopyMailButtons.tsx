"use client";

function formatDate(date?: string | null) {
  if (!date) return "Datum offen";

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;

  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function CopyMailButtons({
  show,
  portalUrl,
}: {
  show: any;
  portalUrl: string;
}) {
  const subject = `Veranstalterinfos Sonja Gründemann – ${formatDate(
    show.show_date
  )} ${show.venue || ""}`;

  const text = `Hallo${show.contact_name ? ` ${show.contact_name}` : ""},

hier ist der Link zum Veranstalter-Portal für den Auftritt von Sonja Gründemann:

${portalUrl}

Die bekannten Rahmendaten:
- Datum: ${formatDate(show.show_date)}
- Location: ${show.venue || "offen"}
- Stadt: ${show.city || "offen"}
- Programm: ${show.program || "offen"}
- Beginn: ${show.start_time || "offen"}

Bitte ergänzt dort die noch offenen Infos zu Ablauf, Technik, Anreise und Organisation.

Vielen Dank und herzliche Grüße
primakavi Booking`;

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(subject);
          alert("Betreff kopiert ✓");
        }}
        className="min-h-10 rounded-xl bg-[#fbf7ef] px-4 py-2.5 text-center text-xs font-black text-zinc-700 ring-1 ring-black/5 transition hover:bg-[#f5efe4]"
      >
        Betreff kopieren
      </button>

      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(text);
          alert("Mailtext kopiert ✓");
        }}
        className="min-h-10 rounded-xl bg-[#fbf7ef] px-4 py-2.5 text-center text-xs font-black text-zinc-700 ring-1 ring-black/5 transition hover:bg-[#f5efe4]"
      >
        📋 Mailtext kopieren
      </button>
    </div>
  );
}