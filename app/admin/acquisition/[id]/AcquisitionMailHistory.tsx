"use client";

import { useCallback, useEffect, useState } from "react";

export type Mail = {
  id: string;
  direction: string;
  status: string;
  from_email: string;
  to_emails: string[];
  cc_emails: string[];
  subject: string | null;
  body_text: string | null;
  sent_at: string | null;
  received_at: string | null;
  created_at: string;
  message_id: string | null;
  in_reply_to?: string | null;
  email_references?: string[];
};

export default function AcquisitionMailHistory({ acquisitionId, refreshKey, onReply }: { acquisitionId: string; refreshKey: number; onReply?: (mail: Mail) => void }) {
  const [emails, setEmails] = useState<Mail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/booking-mail/acquisition/${encodeURIComponent(acquisitionId)}`, { cache: "no-store" });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Laden fehlgeschlagen");
      setEmails(payload.emails || []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Laden fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  }, [acquisitionId]);
  useEffect(() => { void load(); }, [load, refreshKey]);

  return <section className="mt-5 rounded-2xl border border-black/10 bg-[#fffdf8] p-4">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <div><h3 className="text-sm font-black text-zinc-900">✉ E-Mail-Verlauf</h3><p className="text-xs text-zinc-500">Aus primakavi versendete Nachrichten dieser Akquise</p></div>
      <button type="button" onClick={() => void load()} className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs font-bold">↻ Aktualisieren</button>
    </div>
    {loading && <p className="text-sm text-zinc-500">E-Mails werden geladen …</p>}
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    {!loading && !error && emails.length === 0 && <p className="text-sm text-zinc-500">Noch keine versendeten E-Mails vorhanden.</p>}
    <div className="space-y-2">
      {emails.map(mail => <div key={mail.id} className="rounded-xl border border-black/10 bg-white p-3">
        <button type="button" onClick={() => setExpanded(v => v === mail.id ? null : mail.id)} className="w-full text-left">
          <div className="flex items-center justify-between gap-3"><span className="text-sm font-black">↗ {mail.subject || "(Ohne Betreff)"}</span><span className="shrink-0 text-xs text-zinc-500">{new Date(mail.sent_at || mail.created_at).toLocaleString("de-DE")}</span></div>
          <div className="mt-1 text-xs text-zinc-600">An: {(mail.to_emails || []).join(", ")}</div>
          <div className="mt-1 text-xs font-bold text-zinc-500">{mail.status === "sent" ? "✓ Versendet" : mail.status === "sending" ? "⚠ Versandstatus prüfen" : `Status: ${mail.status}`} · {expanded === mail.id ? "Weniger anzeigen ↑" : "Nachricht anzeigen ↓"}</div>
        </button>
        {expanded === mail.id && <div className="mt-3 border-t border-black/10 pt-3">
          <p className="whitespace-pre-wrap break-words text-sm text-zinc-800">{mail.body_text || "(Kein Nachrichtentext gespeichert)"}</p>
          {onReply && mail.status === "sent" && <div className="mt-3 flex flex-col items-end gap-1">
            <button type="button" disabled={!mail.message_id} onClick={() => onReply(mail)} className="rounded-xl bg-lime-300 px-4 py-2 text-sm font-black disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500">↩ Antworten / Follow-up</button>
            {!mail.message_id && <p className="text-xs text-amber-700">Für diese Nachricht fehlt die technische Message-ID. Ein echtes Thread-Follow-up ist erst nach Prüfung möglich.</p>}
          </div>}
        </div>}
      </div>)}
    </div>
  </section>;
}
