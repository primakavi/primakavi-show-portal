"use client";







import { useCallback, useEffect, useMemo, useRef, useState } from "react";



import { useRouter } from "next/navigation";











const SONJA_FORWARD_TEXT = "Moin Sonja,\n\nhier gibt's Interesse! 😊\n\nLiebe Grüße!";



type Mail = {



  id: string; acquisition_id: string | null; show_id: string | null; venue_id: string | null;



  organizer_id: string | null; inbox_state: string; direction: string; status: string;



  from_email: string; to_emails: string[]; subject: string | null;



  body_text: string | null; received_at: string | null; sent_at: string | null; created_at: string;



};



type Option = { id: string; title: string; detail: string; archived?: boolean };



type Suggestion = { acquisitionId: string; source: "Ansprechpartner" | "Veranstalterkontakt" | "Veranstalter" };



type TargetType = "acquisition" | "show" | "venue" | "organizer";



type Props = { initialMails: Mail[]; acquisitions: Option[]; shows: Option[]; venues: Option[]; organizers: Option[]; suggestions: Record<string, Suggestion[]> };







const dateLabel = (mail: Mail) => new Intl.DateTimeFormat("de-DE", {

  day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",

}).format(new Date(mail.received_at || mail.sent_at || mail.created_at));

const shortDateLabel = (mail: Mail) => new Intl.DateTimeFormat("de-DE", {

  day: "2-digit", month: "2-digit", year: "numeric",

}).format(new Date(mail.received_at || mail.sent_at || mail.created_at));







export default function MailCenterClient({ initialMails, acquisitions, shows, venues, organizers, suggestions }: Props) {



  const router = useRouter();



  const [filter, setFilter] = useState<"inbox" | "done" | "sent">("inbox");



  const [selectedId, setSelectedId] = useState<string | null>(null);



  const [search, setSearch] = useState("");



  const [targetType, setTargetType] = useState<TargetType>("acquisition");



  const [targetId, setTargetId] = useState("");



  const [targetSearch, setTargetSearch] = useState("");

  const [editingAssignment, setEditingAssignment] = useState(false);

  const [forwardOpen, setForwardOpen] = useState(false);

  const [forwardText, setForwardText] = useState(SONJA_FORWARD_TEXT);



  const [busy, setBusy] = useState(false);



  const [notice, setNotice] = useState("");



  const [lastSync, setLastSync] = useState<Date | null>(null);



  const autoStarted = useRef(false);



  const running = useRef(false);







  const syncInbox = useCallback(async (automatic = false) => {



    if (running.current) return;



    running.current = true; setBusy(true);



    setNotice(automatic ? "Posteingang wird synchronisiert …" : "Aktualisiere Posteingang …");



    try {



      const res = await fetch("/api/booking-mail/inbox/import", { method: "POST", cache: "no-store" });



      const json = await res.json();



      if (!res.ok) throw new Error(json.error || "Synchronisierung fehlgeschlagen");



      setLastSync(new Date());



      setNotice(`${json.imported} neue Nachrichten, ${json.skipped} bereits vorhanden, ${json.failed} Fehler.${json.truncated ? " Achtung: Suchergebnis begrenzt." : ""}`);



      router.refresh();



    } catch (error) { setNotice(error instanceof Error ? error.message : "Synchronisierung fehlgeschlagen"); }



    finally { running.current = false; setBusy(false); }



  }, [router]);



  useEffect(() => { if (autoStarted.current) return; autoStarted.current = true; void syncInbox(true); }, [syncInbox]);







  const visible = useMemo(() => initialMails.filter(m => {



    const matches = filter === "sent" ? m.direction === "outgoing" :



      filter === "done" ? m.direction === "incoming" && m.inbox_state === "done" :



      m.direction === "incoming" && m.inbox_state === "open" && !m.acquisition_id && !m.show_id && !m.venue_id && !m.organizer_id;



    return matches && `${m.subject ?? ""} ${m.from_email} ${m.body_text ?? ""}`.toLowerCase().includes(search.trim().toLowerCase());



  }).sort((a, b) =>

    new Date(b.received_at || b.sent_at || b.created_at).getTime() -

    new Date(a.received_at || a.sent_at || a.created_at).getTime()

  ), [initialMails, filter, search]);



  const selected = visible.find(m => m.id === selectedId) ?? visible[0];



  const options = targetType === "acquisition" ? acquisitions : targetType === "show" ? shows : targetType === "venue" ? venues : organizers;



  const suggestedIds = new Set((selected ? suggestions[selected.id] ?? [] : []).map(s => s.acquisitionId));



  const matchingOptions = useMemo(() => options.filter(o => `${o.title} ${o.detail}`.toLowerCase().includes(targetSearch.trim().toLowerCase()))



    .sort((a, b) => Number(suggestedIds.has(b.id)) - Number(suggestedIds.has(a.id)) || Number(Boolean(a.archived)) - Number(Boolean(b.archived)))



    .slice(0, 60), [options, targetSearch, selected?.id, targetType, suggestions]);



  const selectedTarget = options.find(o => o.id === targetId);

  const assigned = selected ? (

    selected.acquisition_id ? { type: "Akquise", id: selected.acquisition_id, href: `/admin/acquisition/${selected.acquisition_id}`, option: acquisitions.find(o => o.id === selected.acquisition_id) } :

    selected.show_id ? { type: "Show", id: selected.show_id, href: `/admin/shows/${selected.show_id}`, option: shows.find(o => o.id === selected.show_id) } :

    selected.venue_id ? { type: "Location", id: selected.venue_id, href: `/admin/locations/${selected.venue_id}`, option: venues.find(o => o.id === selected.venue_id) } :

    selected.organizer_id ? { type: "Veranstalter", id: selected.organizer_id, href: `/admin/organizers/${selected.organizer_id}`, option: organizers.find(o => o.id === selected.organizer_id) } :

    null

  ) : null;







  function resetTarget() { setTargetId(""); setTargetSearch(""); setTargetType("acquisition"); setEditingAssignment(false); setForwardOpen(false); setForwardText(SONJA_FORWARD_TEXT); }



  async function action(actionName: "assign" | "done" | "delete") {



    if (!selected || busy) return;



    if (actionName === "assign" && !targetId) return;



    if (actionName === "delete" && !window.confirm("Diese E-Mail im CRM löschen? Der Mailinhalt wird entfernt. Bei STRATO bleibt die Nachricht erhalten.")) return;



    setBusy(true); setNotice("");



    try {



      const res = await fetch("/api/booking-mail/inbox/action", {



        method: "POST", headers: { "Content-Type": "application/json" },



        body: JSON.stringify({ emailId: selected.id, action: actionName, ...(actionName === "assign" ? { targetType, targetId } : {}) }),



      });



      const json = await res.json();



      if (!res.ok) throw new Error(json.error || "Aktion fehlgeschlagen");



      setNotice(actionName === "assign" ? "Nachricht zugeordnet." : actionName === "done" ? "Nachricht erledigt." : "Nachricht aus dem CRM gelöscht.");



      setSelectedId(null); resetTarget(); router.refresh();



    } catch (error) { setNotice(error instanceof Error ? error.message : "Aktion fehlgeschlagen"); }



    finally { setBusy(false); }



  }







  async function forwardToSonja() {

    if (!selected || busy || !forwardText.trim()) return;

    setBusy(true); setNotice("");

    try {

      const res = await fetch("/api/booking-mail/inbox/forward", {

        method: "POST", headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ emailId: selected.id, message: forwardText }),

      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Weiterleitung fehlgeschlagen.");

      setNotice(json.warning || "E-Mail an Sonja weitergeleitet und im CRM dokumentiert.");

      setForwardOpen(false); router.refresh();

    } catch (error) { setNotice(error instanceof Error ? error.message : "Weiterleitung fehlgeschlagen."); }

    finally { setBusy(false); }

  }



  const tabs = [

    { key: "inbox" as const, label: "Posteingang", icon: "📥", count: initialMails.filter(m => m.direction === "incoming" && m.inbox_state === "open" && !m.acquisition_id && !m.show_id && !m.venue_id && !m.organizer_id).length },

    { key: "done" as const, label: "Erledigt", icon: "✓", count: initialMails.filter(m => m.direction === "incoming" && m.inbox_state === "done").length },

    { key: "sent" as const, label: "Gesendet", icon: "↗", count: initialMails.filter(m => m.direction === "outgoing").length },

  ];

  const activeTab = tabs.find(t => t.key === filter)!;

  return (

    <main className="mx-auto max-w-[1750px] px-5 py-8 text-zinc-950 md:px-8 lg:px-10">

      <header className="mb-7 flex flex-wrap items-end justify-between gap-5">

        <div>

          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-zinc-400">PRIMAKAVI · BOOKING CRM</p>

          <h1 className="text-4xl font-black tracking-tight md:text-[42px]">Mail-Zentrale</h1>

          <p className="mt-1 text-sm font-medium text-zinc-500">booking@primakavi.de</p>

          <p className="mt-2 text-xs font-medium text-zinc-400">{lastSync ? `Zuletzt synchronisiert: ${lastSync.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr` : busy ? "Synchronisierung läuft …" : "Noch kein Abgleich in dieser Ansicht"}</p>

        </div>

        <button type="button" disabled={busy} onClick={() => void syncInbox()} className="rounded-full bg-lime-300 px-6 py-3 text-sm font-black text-zinc-950 shadow-sm transition hover:bg-lime-400 disabled:opacity-50">{busy ? "↻ Synchronisiere …" : "↻ Aktualisieren"}</button>

      </header>

      {notice && <div role="status" className="mb-5 rounded-2xl border border-black/5 bg-white px-5 py-3 text-sm font-semibold text-zinc-600">{notice}</div>}

      <div className="mb-5 flex flex-wrap gap-2">

        {tabs.map(tab => <button key={tab.key} type="button" onClick={() => { setFilter(tab.key); setSelectedId(null); resetTarget(); }} className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black transition ${filter === tab.key ? "bg-zinc-950 text-white" : "border border-black/5 bg-white text-zinc-600 hover:bg-zinc-50"}`}><span>{tab.icon}</span>{tab.label}<span className={`rounded-full px-2 py-0.5 text-xs ${filter === tab.key ? "bg-white/20 text-white" : "bg-[#f5f1e9] text-zinc-500"}`}>{tab.count}</span></button>)}

      </div>

      <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.7fr)]">

        <section className="flex min-w-0 h-[740px] min-h-0 flex-col overflow-hidden rounded-[1.7rem] border border-black/5 bg-white shadow-lg shadow-black/[0.025]">

          <div className="border-b border-black/5 p-4">

            <div className="relative"><span className="pointer-events-none absolute left-4 top-3 text-zinc-400">⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nachrichten durchsuchen …" aria-label="Nachrichten durchsuchen" className="w-full rounded-xl bg-[#fbf7ef] py-3 pl-10 pr-4 text-sm font-semibold outline-none ring-1 ring-transparent placeholder:text-zinc-400 focus:bg-white focus:ring-black/10" /></div>

            <div className="mt-3 flex items-center justify-between"><span className="text-xs font-black uppercase tracking-wider text-zinc-400">{activeTab.label}</span><span className="text-xs font-bold text-zinc-400">{visible.length} Nachrichten</span></div>

          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2">

            {visible.length === 0 && <div className="px-5 py-14 text-center"><div className="mb-3 text-4xl">{filter === "inbox" ? "📭" : "✉️"}</div><p className="font-black">{filter === "inbox" ? "Alles erledigt!" : "Keine Nachrichten"}</p><p className="mt-2 text-sm text-zinc-400">{search ? "Keine Treffer für deine Suche." : filter === "inbox" ? "Dein Posteingang ist leer." : "In dieser Ansicht gibt es noch keine Nachrichten."}</p></div>}

            {visible.map(m => <button key={m.id} type="button" onClick={() => { setSelectedId(m.id); resetTarget(); }} className={`mb-1 w-full rounded-2xl border p-4 text-left transition ${selected?.id === m.id ? "border-lime-300 bg-lime-50/70" : "border-transparent bg-white hover:bg-[#fbf7ef]"}`}>

              <div className="flex items-start justify-between gap-2"><span className="min-w-0 truncate text-sm font-black">{m.direction === "outgoing" ? (m.to_emails || []).join(", ") || "Gesendet" : m.from_email}</span><span className="shrink-0 text-[11px] font-semibold text-zinc-400">{shortDateLabel(m)}</span></div>

              <p className="mt-1 truncate text-sm font-bold text-zinc-700">{m.subject || "(ohne Betreff)"}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-400">{m.body_text || "Kein Vorschautext"}</p>

              {filter === "inbox" && (suggestions[m.id] ?? []).length > 0 && <span className="mt-2 inline-block rounded-full bg-lime-100 px-2.5 py-1 text-[11px] font-bold text-lime-900">✦ {suggestions[m.id].length} Akquise-Vorschläge</span>}

            </button>)}

          </div>

        </section>

        <section className="flex min-w-0 h-[740px] min-h-0 flex-col overflow-y-auto rounded-[1.7rem] border border-black/5 bg-white p-5 shadow-lg shadow-black/[0.025] md:p-7">

          {selected ? <>

            <div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><span className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400">{selected.direction === "incoming" ? "Empfangene Nachricht" : "Gesendete Nachricht"}</span><h2 className="mt-2 break-words text-2xl font-black tracking-tight">{selected.subject || "(ohne Betreff)"}</h2></div><span className="rounded-full bg-[#fbf7ef] px-3 py-2 text-xs font-bold text-zinc-500">{dateLabel(selected)}</span></div>

            <div className="space-y-2 rounded-2xl bg-[#fbf7ef] p-4 text-sm text-zinc-600"><p className="break-all"><strong className="text-zinc-900">Von:</strong> {selected.from_email}</p><p className="break-all"><strong className="text-zinc-900">An:</strong> {(selected.to_emails || []).join(", ")}</p></div>

            <div className={`my-4 min-h-[140px] max-h-[320px] shrink-0 overflow-y-auto whitespace-pre-wrap break-words text-sm leading-7 text-zinc-700`}>{selected.body_text || "(Kein Textinhalt verfügbar)"}</div>

            {selected.direction === "incoming" && <div className="mb-3 shrink-0">

              {!forwardOpen ? <button type="button" disabled={busy} onClick={() => setForwardOpen(true)} className="rounded-full bg-lime-300 px-5 py-2.5 text-sm font-black text-zinc-950 hover:bg-lime-400 disabled:opacity-40">↗ An Sonja weiterleiten</button> :

                <div className="rounded-2xl border border-lime-200 bg-lime-50 p-4">

                  <p className="text-xs font-black text-zinc-800">Weiterleitung an kontakt@sonja-gruendemann.de</p>

                  <p className="mt-1 text-xs text-zinc-500">Betreff: WG: {selected.subject || "(ohne Betreff)"} · Originalnachricht wird zitiert.</p>

                  <textarea value={forwardText} onChange={e => setForwardText(e.target.value)} rows={4} maxLength={5000} aria-label="Weiterleitungstext" className="mt-3 w-full resize-y rounded-xl border border-black/10 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-lime-300" />

                  <div className="mt-3 flex flex-wrap gap-2">

                    <button type="button" disabled={busy || !forwardText.trim()} onClick={() => void forwardToSonja()} className="rounded-full bg-lime-300 px-4 py-2 text-xs font-black disabled:opacity-40">Jetzt weiterleiten</button>

                    <button type="button" disabled={busy} onClick={() => setForwardOpen(false)} className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-black">Abbrechen</button>

                  </div>

                </div>}

            </div>}

            {selected.direction === "incoming" && (filter === "inbox" || (filter === "done" && editingAssignment)) && <div className="min-h-[310px] shrink-0 overflow-y-auto rounded-[1.4rem] border border-black/5 bg-[#fbf7ef] p-5">

              <div className="mb-4"><h3 className="text-lg font-black">Nachricht zuordnen</h3><p className="mt-1 text-xs font-medium text-zinc-500">Wähle den passenden CRM-Vorgang aus.</p></div>

              <div className="mb-4 flex flex-wrap gap-2">{([ ["acquisition", "Akquise"], ["show", "Show"], ["venue", "Location"], ["organizer", "Veranstalter"] ] as const).map(([key,label]) => <button key={key} type="button" onClick={() => { setTargetType(key); setTargetId(""); setTargetSearch(""); }} className={`rounded-full px-4 py-2 text-xs font-black transition ${targetType === key ? "bg-zinc-950 text-white" : "border border-black/10 bg-white text-zinc-600 hover:bg-zinc-50"}`}>{label}</button>)}</div>

              <input aria-label="Zuordnungsziel suchen" value={targetSearch} onChange={e => setTargetSearch(e.target.value)} placeholder="Name, Stadt, Programm oder Datum suchen …" className="mb-3 w-full rounded-xl border border-black/5 bg-white px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-lime-300" />

              <div className="grid max-h-[260px] gap-2 overflow-y-auto">{matchingOptions.map(o => <button key={o.id} type="button" onClick={() => setTargetId(o.id)} className={`rounded-xl border p-3 text-left transition ${targetId === o.id ? "border-lime-400 bg-lime-100/70" : "border-black/5 bg-white hover:border-black/20"}`}><span className="text-sm font-black text-zinc-900">{o.title}</span>{o.archived && <span className="ml-2 text-xs font-bold text-amber-700">Archiviert</span>}{targetType === "acquisition" && suggestedIds.has(o.id) && <span className="ml-2 text-xs font-black text-lime-800">✦ Absender-Treffer</span>}<p className="mt-1 text-xs text-zinc-500">{o.detail}</p></button>)}{!matchingOptions.length && <p className="py-3 text-sm text-zinc-500">Kein passender Eintrag gefunden.</p>}</div>

              {selectedTarget && <p className="mt-3 text-xs text-zinc-600">Ausgewählt: <strong>{selectedTarget.title}</strong> · {selectedTarget.detail}</p>}

              <button type="button" disabled={!targetId || busy} onClick={() => void action("assign")} className="mt-4 rounded-full bg-lime-300 px-5 py-3 text-sm font-black text-zinc-950 transition hover:bg-lime-400 disabled:cursor-not-allowed disabled:opacity-40">✓ Zuordnung bestätigen</button>

              {filter === "inbox" && <div className="mt-5 flex flex-wrap gap-2 border-t border-black/10 pt-4"><button type="button" disabled={busy} onClick={() => void action("done")} className="rounded-full border border-black/10 bg-white px-4 py-2.5 text-xs font-black text-zinc-700 hover:bg-zinc-50 disabled:opacity-40">✓ Ohne Zuordnung erledigen</button><button type="button" disabled={busy} onClick={() => void action("delete")} className="rounded-full border border-red-200 bg-white px-4 py-2.5 text-xs font-black text-red-600 hover:bg-red-50 disabled:opacity-40">🗑 Aus CRM löschen</button></div>}

            </div>}

            {filter === "done" && selected.direction === "incoming" && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-3">

              <div className="min-w-0 text-xs font-semibold text-zinc-500">

                <span className="mr-2">✓ Erledigt</span>

                {assigned ? <a href={assigned.href} className="font-black text-zinc-800 underline underline-offset-2 hover:text-zinc-950">{assigned.type}: {assigned.option?.title || "Akte öffnen"} ↗</a> : <span>Ohne Zuordnung</span>}

              </div>

              <button type="button" onClick={() => { if (editingAssignment) resetTarget(); else setEditingAssignment(true); }} className="rounded-full border border-black/10 bg-[#fbf7ef] px-4 py-2 text-xs font-black hover:bg-lime-100">

                {editingAssignment ? "Schließen" : assigned ? "Zuordnung ändern" : "Nachträglich zuordnen"}

              </button>

            </div>}

          </> : <div className="py-20 text-center"><div className="mb-3 text-4xl">✉️</div><p className="font-black">Keine Nachricht ausgewählt</p><p className="mt-2 text-sm text-zinc-400">Wähle links eine Nachricht aus.</p></div>}

        </section>

      </div>

    </main>

  );

}
