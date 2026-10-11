/** Gemeinsame Anzeige-Logik für Location- und Veranstalterübersichten.
 * Import in Next.js: @/app/lib/bookingStatus
 * Keine Datenbank-Schreiboperationen.
 */
export type BookingAcquisition = {
  id: string;
  status: string | null;
  archived_at: string | null;
  last_contact_at?: string | null;
};

export type BookingStatus =
  | "Gebucht"
  | "Interesse vorhanden"
  | "Rückmeldung offen"
  | "Alle abgesagt"
  | "Noch nicht kontaktiert"
  | "Bereits gespielt / Bestandskunde"
  | "Keine Akquise geplant"
  | "Kontakt vorhanden, noch keine Akquise"
  | "Noch keine Akquise";

export function getBookingStatus(
  acquisitions: BookingAcquisition[],
  relationshipStatus: string | null | undefined,
  playedBefore = false
): BookingStatus {
  const relation = (relationshipStatus || "").toLowerCase();
  const existing = acquisitions;
  const active = existing.filter((item) => !item.archived_at);
  const norm = (status: string | null) => (status || "").toLowerCase().trim();
  const booked = (s: string) => s.includes("gebucht") || s.includes("buchung");
  const rejected = (s: string) => s.includes("abgesagt") || s.includes("absage") || s.includes("kein interesse") || s.includes("abgelehnt");
  const interested = (s: string) => !rejected(s) && (s.includes("interess") || s.includes("positiv") || s.includes("zusage"));
  const contacted = (a: BookingAcquisition) => {
    const s = norm(a.status);
    return !!a.last_contact_at || s.includes("kontaktier") || s.includes("angeschrieb") || s.includes("rückmeldung") || s.includes("warte");
  };

  if (active.some((a) => booked(norm(a.status)))) return "Gebucht";
  if (active.some((a) => interested(norm(a.status)))) return "Interesse vorhanden";
  if (active.some((a) => !rejected(norm(a.status)) && contacted(a))) return "Rückmeldung offen";
  if (existing.length && existing.every((a) => rejected(norm(a.status)))) return "Alle abgesagt";
  if (active.length && active.every((a) => rejected(norm(a.status)))) return "Alle abgesagt";
  if (active.length && !relation.includes("nicht relevant")) return "Noch nicht kontaktiert";

  // Bestehende Kunden und frühere Auftritte sind nicht automatisch neu gebucht.
  if (relation.includes("bestands") || playedBefore || existing.some((a) => booked(norm(a.status))))
    return "Bereits gespielt / Bestandskunde";
  if (relation.includes("nicht relevant")) return "Keine Akquise geplant";
  if (relation.includes("kontakt") || relation.includes("angeschrieben"))
    return "Kontakt vorhanden, noch keine Akquise";
  return "Noch keine Akquise";
}
