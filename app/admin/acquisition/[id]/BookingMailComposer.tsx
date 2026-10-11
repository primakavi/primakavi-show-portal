"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import type { Mail } from "./AcquisitionMailHistory";

type Props = { acquisitionId: string; initialTo?: string; replyTo?: Mail | null; onClose: () => void };
type Template = { id: string; title: string; shortcut: string | null; category: string; subject: string | null; body: string; sort_order: number };
type ArtistFile = { id: string; title: string; file_name: string; file_size: number; mime_type: string; category: string };
const SIGNATURE_PREVIEW = "Virena Prior · ARTIST BOOKING · booking@primakavi.de · www.primakavi.de · Instagram · YouTube · #gerneperdu";
const splitEmails = (value: string) => value.split(/[,;\n]+/).map(v => v.trim()).filter(Boolean);
const replySubject = (value: string) => /^re\s*:/i.test(value) ? value : `Re: ${value}`;
const input = "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-lime-500";
const emptyEditor = { id: "", title: "", shortcut: "", category: "Sonstiges", subject: "", body: "" };

export default function BookingMailComposer({ acquisitionId, initialTo = "", replyTo, onClose }: Props) {
  const [to, setTo] = useState(replyTo ? (replyTo.direction === "incoming" ? replyTo.from_email : replyTo.to_emails.join(", ")) : initialTo);
  const [cc, setCc] = useState(replyTo?.cc_emails?.join(", ") || "");
  const [subject, setSubject] = useState(replyTo ? replySubject(replyTo.subject || "(Ohne Betreff)") : "");
  const [message, setMessage] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [quotePrevious, setQuotePrevious] = useState(!!replyTo);
  const [sending, setSending] = useState(false);
  const sendStarted = useRef(false);
  const [result, setResult] = useState<{ sent?: boolean; warning?: string | null; error?: string } | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [files, setFiles] = useState<ArtistFile[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [libraryError, setLibraryError] = useState("");
  const [showManager, setShowManager] = useState(false);
  const [editor, setEditor] = useState(emptyEditor);
  const [managerError, setManagerError] = useState("");
  const [saving, setSaving] = useState(false);
  const [slash, setSlash] = useState<{ start: number; end: number; search: string } | null>(null);
  const [highlight, setHighlight] = useState(0);
  const textarea = useRef<HTMLTextAreaElement>(null);

  async function reload() {
    const [t, f] = await Promise.all([
      fetch("/api/booking-mail/templates", { cache: "no-store" }),
      fetch("/api/booking-mail/library", { cache: "no-store" }),
    ]);
    const td = await t.json(); const fd = await f.json();
    if (!t.ok || !f.ok) throw new Error(td.error || fd.error || "Bibliothek nicht erreichbar.");
    setTemplates(td.templates || []); setFiles(fd.files || []);
  }
  useEffect(() => { void reload().catch(e => setLibraryError(e instanceof Error ? e.message : "Laden fehlgeschlagen.")); }, []);

  function detectSlash(value: string, caret: number) {
    const prefix = value.slice(0, caret);
    const match = prefix.match(/(?:^|\s)\/([a-z0-9_-]*)$/i);
    if (!match) { setSlash(null); return; }
    setSlash({ start: caret - match[1].length - 1, end: caret, search: match[1].toLowerCase() });
    setHighlight(0);
  }
  const suggestions = slash ? templates.filter(t => (t.shortcut || "").includes(slash.search) || t.title.toLowerCase().includes(slash.search)).slice(0, 8) : [];
  function insertTemplate(template: Template, replaceSlash = !!slash) {
    const area = textarea.current;
    const start = replaceSlash && slash ? slash.start : (area?.selectionStart ?? message.length);
    const end = replaceSlash && slash ? slash.end : (area?.selectionEnd ?? message.length);
    const body = template.body;
    const newMessage = message.slice(0, start) + body + message.slice(end);
    setMessage(newMessage); setSlash(null);
    if (template.subject && !replyTo && !subject.trim()) setSubject(template.subject);
    window.requestAnimationFrame(() => { area?.focus(); area?.setSelectionRange(start + body.length, start + body.length); });
  }
  function onMessageKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (!slash || !suggestions.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlight(v => (v + 1) % suggestions.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlight(v => (v - 1 + suggestions.length) % suggestions.length); }
    else if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); insertTemplate(suggestions[highlight] || suggestions[0]); }
    else if (e.key === "Escape") { e.preventDefault(); setSlash(null); }
  }
  async function saveTemplate() {
    setSaving(true); setManagerError("");
    try {
      const response = await fetch("/api/booking-mail/templates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editor) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Speichern fehlgeschlagen.");
      await reload(); setEditor(emptyEditor);
    } catch (e) { setManagerError(e instanceof Error ? e.message : "Speichern fehlgeschlagen."); }
    finally { setSaving(false); }
  }
  async function deleteTemplate(id: string) {
    if (!window.confirm("Diesen Textbaustein deaktivieren?")) return;
    try {
      const response = await fetch("/api/booking-mail/templates", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Löschen fehlgeschlagen.");
      await reload(); if (editor.id === id) setEditor(emptyEditor);
    } catch (e) { setManagerError(e instanceof Error ? e.message : "Löschen fehlgeschlagen."); }
  }
  const quote = replyTo && quotePrevious ? `\n\n--- Ursprüngliche Nachricht ---\nVon: ${replyTo.from_email}\nDatum: ${new Date(replyTo.sent_at || replyTo.received_at || replyTo.created_at).toLocaleString("de-DE")}\nAn: ${replyTo.to_emails.join(", ")}\nBetreff: ${replyTo.subject || "(Ohne Betreff)"}\n\n${(replyTo.body_text || "").split("\n").map(line => `> ${line}`).join("\n")}` : "";
  const fullText = message.trim() + quote;
  const locked = sending || !!result?.sent || sendStarted.current;
  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sendStarted.current || sending || result?.sent) return;
    if (!window.confirm(`Diese E-Mail mit ${selectedIds.length} Anhang/Anhängen wirklich über booking@primakavi.de versenden?`)) return;
    sendStarted.current = true; setSending(true); setResult(null);
    try {
      const response = await fetch("/api/booking-mail/send", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acquisitionId, to: splitEmails(to), cc: splitEmails(cc), subject, text: fullText, quote: quote || undefined,
          nextStep: nextStep.trim() || undefined, followUpDate: followUpDate || undefined, attachmentIds: selectedIds,
          inReplyTo: replyTo?.message_id || undefined,
          references: replyTo?.message_id ? [...(replyTo.email_references || []), replyTo.message_id].slice(-30) : [] }),
      });
      const data = await response.json(); setResult(data);
      if (data.sent) { onClose(); return; }
      if (response.status >= 400 && response.status < 500 && response.status !== 403) sendStarted.current = false;
    } catch { setResult({ error: "Verbindung unterbrochen. Bitte zuerst STRATO/Outlook prüfen – nicht einfach erneut senden." }); }
    finally { setSending(false); }
  }
  return <div role="dialog" aria-modal="true" aria-label={replyTo ? "Follow-up schreiben" : "E-Mail schreiben"} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
    <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-[#fbf7ef] p-6 shadow-2xl md:p-8">
      <div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-zinc-500">primakavi · Booking-Mail</p><h2 className="mt-2 text-2xl font-black">{replyTo ? "↩ Antworten / Follow-up" : "Neue E-Mail"}</h2></div><button type="button" onClick={onClose} className="rounded-xl border bg-white px-3 py-2">✕</button></div>
      {replyTo && <p className="mb-4 rounded-xl bg-lime-100 p-3 text-xs text-zinc-700">Antwort auf: <strong>{replyTo.subject}</strong> · Die technische Thread-Verknüpfung wird automatisch gesetzt.</p>}
      <form onSubmit={send} className="space-y-4">
        <label className="block text-sm font-bold">An<input className={input} required value={to} onChange={e => setTo(e.target.value)} disabled={locked} placeholder="name@theater.de" /></label>
        <label className="block text-sm font-bold">CC (optional)<input className={input} value={cc} onChange={e => setCc(e.target.value)} disabled={locked} /></label>
        <label className="block text-sm font-bold">Betreff<input className={input} required maxLength={500} value={subject} onChange={e => setSubject(e.target.value)} disabled={locked} /></label>
        <div className="flex items-center justify-between gap-2"><span className="text-sm font-bold">Nachricht</span><button type="button" onClick={() => setShowManager(v => !v)} className="rounded-lg bg-white px-3 py-2 text-xs font-black ring-1 ring-black/10">📋 Textbausteine verwalten</button></div>
        <div className="relative">
          <textarea ref={textarea} className={input} required rows={9} maxLength={180000} value={message} disabled={locked}
            onChange={e => { setMessage(e.target.value); detectSlash(e.target.value, e.target.selectionStart); }}
            onClick={e => detectSlash(e.currentTarget.value, e.currentTarget.selectionStart)} onKeyDown={onMessageKeyDown}
            placeholder="Nachricht schreiben … mit / Textbausteine suchen" />
          {!!slash && suggestions.length > 0 && <div className="absolute left-2 right-2 top-full z-20 max-h-56 overflow-auto rounded-xl border bg-white p-1 shadow-xl">
            {suggestions.map((t, i) => <button type="button" key={t.id} onMouseDown={e => e.preventDefault()} onClick={() => insertTemplate(t)}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${i === highlight ? "bg-lime-100" : "hover:bg-zinc-100"}`}>
              <strong>/{t.shortcut}</strong> · {t.title}
            </button>)}
          </div>}
        </div>
        <p className="text-xs text-zinc-500">Tipp: / eingeben, Kürzel suchen, mit Enter einfügen. Die Nachricht bleibt frei bearbeitbar.</p>
        {showManager && <div className="space-y-3 rounded-xl border bg-white p-4">
          <div className="flex items-center justify-between"><strong>Textbausteine · Sonja</strong><button type="button" onClick={() => setEditor(emptyEditor)} className="text-xs font-bold underline">+ Neu</button></div>
          <div className="max-h-40 space-y-1 overflow-y-auto">{templates.map(t => <div key={t.id} className="flex items-center justify-between gap-2 text-xs"><button type="button" className="truncate text-left hover:underline" onClick={() => setEditor({ id: t.id, title: t.title, shortcut: t.shortcut || "", category: t.category, subject: t.subject || "", body: t.body })}>/{t.shortcut} · {t.title}</button><button type="button" className="text-red-600" onClick={() => void deleteTemplate(t.id)}>Löschen</button></div>)}</div>
          <input className={input} placeholder="Name" value={editor.title} onChange={e => setEditor(v => ({ ...v, title: e.target.value }))} />
          <div className="grid grid-cols-2 gap-2"><input className={input} placeholder="Kürzel ohne /" value={editor.shortcut} onChange={e => setEditor(v => ({ ...v, shortcut: e.target.value.toLowerCase().replace(/^\//, "") }))} /><input className={input} placeholder="Kategorie" value={editor.category} onChange={e => setEditor(v => ({ ...v, category: e.target.value }))} /></div>
          <input className={input} placeholder="Betreff (optional)" value={editor.subject} onChange={e => setEditor(v => ({ ...v, subject: e.target.value }))} />
          <textarea className={input} rows={5} placeholder="Textbaustein" value={editor.body} onChange={e => setEditor(v => ({ ...v, body: e.target.value }))} />
          {managerError && <p className="text-xs text-red-700">{managerError}</p>}
          <button type="button" disabled={saving} onClick={() => void saveTemplate()} className="rounded-lg bg-lime-200 px-4 py-2 text-sm font-black disabled:opacity-50">{saving ? "Speichern …" : "Textbaustein speichern"}</button>
        </div>}
        <div className="space-y-2 rounded-xl border border-black/10 bg-white p-4">
          <p className="text-sm font-black">📎 Bookingprofile anhängen (optional)</p>
          {libraryError && <p className="text-xs text-red-700">{libraryError}</p>}
          {!libraryError && files.length === 0 && <p className="text-xs text-zinc-500">Keine Dateien verfügbar.</p>}
          {files.map(file => <label key={file.id} className="flex cursor-pointer items-center gap-3 text-sm">
            <input type="checkbox" disabled={locked} checked={selectedIds.includes(file.id)} onChange={e => setSelectedIds(v => e.target.checked ? [...v, file.id] : v.filter(id => id !== file.id))} />
            <span className="min-w-0 flex-1"><strong>{file.title}</strong><span className="block truncate text-xs text-zinc-500">{file.file_name} · {(file.file_size / 1024 / 1024).toFixed(1)} MB</span></span>
          </label>)}
          <p className="text-xs text-zinc-500">Nur angehakte Dateien werden mitgeschickt. Maximal 5 Dateien, zusammen 20 MB.</p>
        </div>
        <div className="rounded-xl border border-black/10 bg-white p-3"><p className="text-sm font-black">✍ Automatische primakavi-Signatur</p><p className="mt-2 text-xs text-zinc-600">{SIGNATURE_PREVIEW}</p><p className="mt-1 text-xs text-zinc-500">Wird beim Versand mit dem hellen Logo automatisch angehängt.</p></div>
        <div className="space-y-3 rounded-xl border border-black/10 bg-white p-4"><p className="text-sm font-black">📅 Nächster Schritt & Wiedervorlage (optional)</p>
          <label className="block text-sm font-bold">Nächster Schritt<input className={input} value={nextStep} onChange={e => setNextStep(e.target.value)} disabled={locked} placeholder="z. B. telefonisch nachfassen" maxLength={500} /></label>
          <label className="block text-sm font-bold">Wiedervorlage am<input type="date" className={input} value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} disabled={locked} /></label>
          <p className="text-xs text-zinc-500">Bei gesetztem Datum wird eine Aufgabe erstellt. Ohne Datum bleibt eine bestehende Wiedervorlage unverändert.</p>
        </div>
        {replyTo && <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={quotePrevious} onChange={e => setQuotePrevious(e.target.checked)} disabled={locked} /> Vorherige Nachricht zitieren</label>}
        {replyTo && quotePrevious && <details className="rounded-xl border border-black/10 bg-white p-3 text-xs"><summary className="cursor-pointer font-bold">Zitat-Vorschau</summary><pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap">{quote}</pre></details>}
        <p className="text-xs text-zinc-500">Absender: booking@primakavi.de · Versand wird automatisch der Akquise zugeordnet.</p>
        {result?.sent && <p role="status" className="rounded-xl bg-lime-100 p-3 text-sm font-bold">✓ Versendet. {result.warning || "In Outlook Gesendet gespeichert."}</p>}
        {result?.error && <p role="alert" className="rounded-xl bg-amber-100 p-3 text-sm font-bold">{result.error} Bitte vor einem erneuten Versuch STRATO/Outlook prüfen.</p>}
        <div className="flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-xl border bg-white px-5 py-3 text-sm font-black">Schließen</button><button type="submit" disabled={locked || !!libraryError} className="rounded-xl bg-lime-300 px-5 py-3 text-sm font-black disabled:opacity-50">{sending ? "Wird versendet …" : result?.sent ? "Versendet ✓" : "✉ E-Mail senden"}</button></div>
      </form>
    </div>
  </div>;
}
