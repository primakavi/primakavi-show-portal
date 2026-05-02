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
    <>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(subject);
          alert("Betreff kopiert ✓");
        }}
        className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-black text-zinc-950"
      >
        Betreff kopieren
      </button>

      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(text);
          alert("Mailtext kopiert ✓");
        }}
        className="rounded-2xl bg-gradient-to-r from-pink-400 to-orange-400 px-5 py-3 text-center text-sm font-black text-white"
      >
        📋 Mailtext kopieren
      </button>
    </>
  );
}