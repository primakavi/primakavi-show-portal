"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Mail = {
  id: string; acquisition_id: string | null; direction: string; status: string;
  from_email: string; to_emails: string[]; subject: string | null;
  body_text: string | null; received_at: string | null; sent_at: string | null; created_at: string;
};
type Acquisition = { id: string; label: string };
export default function MailCenterClient({ initialMails, acquisitions }: { initialMails: Mail[]; acquisitions: Acquisition[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"inbox" | "unassigned" | "sent">("inbox");
  const [selectedId, setSelectedId] = useState<string | null>(initialMails[0]?.id ?? null);
  const [search, setSearch] = useState("");
  const [targetId, setTargetId] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const visible = useMemo(() => initialMails.filter(m => {
    const matchesFilter = filter === "sent" ? m.direction === "outgoing"
      : filter === "unassigned" ? m.direction === "incoming" && !m.acquisition_id
      : m.direction === "incoming";
    return matchesFilter && `${m.subject} ${m.from_email} ${m.body_text || ""}`.toLowerCase().includes(search.toLowerCase());
  }), [initialMails, filter, search]);
  const selected = visible.find(m => m.id === selectedId) || visible[0];
  async function importInbox() {
    if (!window.confirm("Die letzten 7 Tage aus booking@primakavi.de importieren? Keine Akquisen oder Wiedervorlagen werden geändert.")) return;
    setBusy(true); setNotice("");
    try {
      const res = await fetch("/api/booking-mail/inbox/import", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Import fehlgeschlagen");
      setNotice(`${json.imported} importiert, ${json.skipped} übersprungen, ${json.failed} Fehler.`);
      router.refresh();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Import fehlgeschlagen"); }
    finally { setBusy(false); }
  }
  async function assign() {
    if (!selected || !targetId) return;
    setBusy(true); setNotice("");
    try {
      const res = await fetch("/api/booking-mail/inbox/assign", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailId: selected.id, acquisitionId: targetId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Zuordnung fehlgeschlagen");
      setNotice("Nachricht zugeordnet."); setTargetId(""); router.refresh();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Zuordnung fehlgeschlagen"); }
    finally { setBusy(false); }
  }
  return <main style={{ padding: "24px", maxWidth: 1400, margin: "auto", color: "#17385f" }}>
    <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
      <div><h1 style={{ fontSize: 30, fontWeight: 750, margin: 0 }}>Mail-Zentrale</h1><p style={{ marginTop: 6 }}>booking@primakavi.de · Testbetrieb</p></div>
      <button disabled={busy} onClick={importInbox} style={buttonStyle}>{busy ? "Bitte warten …" : "Letzte 7 Tage importieren"}</button>
    </header>
    {notice && <p role="status" style={{ background: "#eef3f8", padding: 12, borderRadius: 8 }}>{notice}</p>}
    <nav style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
      {([ ["inbox", "Posteingang"], ["unassigned", "Nicht zugeordnet"], ["sent", "Gesendet"] ] as const).map(([key, label]) =>
        <button key={key} onClick={() => { setFilter(key); setSelectedId(null); }} style={{ ...buttonStyle, background: filter === key ? "#17385f" : "#e8edf3", color: filter === key ? "white" : "#17385f" }}>{label}</button>)}
    </nav>
    <div style={{ display: "grid", gridTemplateColumns: "minmax(260px, 1fr) minmax(320px, 2fr)", gap: 16 }}>
      <section style={panelStyle}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nachrichten durchsuchen …" aria-label="Nachrichten durchsuchen" style={{ width: "100%", boxSizing: "border-box", padding: 10, border: "1px solid #cdd5df", borderRadius: 8, marginBottom: 12 }} />
        <p style={{ fontSize: 13 }}>{visible.length} Nachrichten</p>
        {visible.map(m => <button key={m.id} onClick={() => { setSelectedId(m.id); setTargetId(""); }} style={{ display: "block", width: "100%", textAlign: "left", border: selected?.id === m.id ? "2px solid #c2185b" : "1px solid #ddd", background: "white", padding: 12, borderRadius: 8, marginBottom: 8, cursor: "pointer" }}>
          <strong>{m.subject || "(ohne Betreff)"}</strong><div style={{ fontSize: 13, marginTop: 4 }}>{m.from_email}</div>
          <small>{new Date(m.received_at || m.sent_at || m.created_at).toLocaleString("de-DE")}</small>
          {!m.acquisition_id && m.direction === "incoming" && <div style={{ color: "#c2185b", fontSize: 12 }}>Nicht zugeordnet</div>}
        </button>)}
      </section>
      <section style={panelStyle}>
        {selected ? <>
          <h2 style={{ fontSize: 21 }}>{selected.subject || "(ohne Betreff)"}</h2>
          <p><strong>Von:</strong> {selected.from_email}</p>
          <p><strong>An:</strong> {(selected.to_emails || []).join(", ")}</p>
          <p><strong>Datum:</strong> {new Date(selected.received_at || selected.sent_at || selected.created_at).toLocaleString("de-DE")}</p>
          {selected.acquisition_id ? <p><a href={`/admin/acquisition/${selected.acquisition_id}`}>Zur Akquise öffnen →</a></p> : selected.direction === "incoming" ? <div style={{ padding: 12, background: "#f6f0e6", borderRadius: 8 }}>
            <label htmlFor="acquisitionSelect"><strong>Manuell einer Akquise zuordnen</strong></label>
            <select id="acquisitionSelect" value={targetId} onChange={e => setTargetId(e.target.value)} style={{ display: "block", width: "100%", padding: 10, margin: "10px 0" }}>
              <option value="">Akquise auswählen …</option>
              {acquisitions.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select>
            <button disabled={!targetId || busy} onClick={assign} style={buttonStyle}>Zuordnung bestätigen</button>
          </div> : null}
          <hr style={{ margin: "20px 0", border: 0, borderTop: "1px solid #ddd" }}/>
          <div style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", lineHeight: 1.6 }}>{selected.body_text || "(Kein Textinhalt verfügbar)"}</div>
        </> : <p>Keine Nachrichten in dieser Ansicht.</p>}
      </section>
    </div>
  </main>;
}
const buttonStyle: React.CSSProperties = { padding: "10px 14px", border: 0, borderRadius: 8, background: "#17385f", color: "white", cursor: "pointer", fontWeight: 600 };
const panelStyle: React.CSSProperties = { background: "white", border: "1px solid #e0e4ea", borderRadius: 12, padding: 16, minHeight: 350, color: "#1c1c1c" };
