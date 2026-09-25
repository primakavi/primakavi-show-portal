"use client";
import { useMemo, useState } from "react";

type Payment = { id?: string; payment_date: string; amount: number | string; payment_method?: string | null; note?: string | null };
function todayIso() { const now = new Date(); const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000); return local.toISOString().slice(0, 10); }

export default function PaymentEditor({ initialPayments, invoiceAmount, settlementAmount }: { initialPayments: Payment[]; invoiceAmount?: number | string | null; settlementAmount?: number | string | null }) {
  const [rows, setRows] = useState<Payment[]>(initialPayments);
  const paid = useMemo(() => rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0), [rows]);
  const targetRaw = invoiceAmount !== null && invoiceAmount !== undefined && String(invoiceAmount).trim() !== "" ? invoiceAmount : settlementAmount;
  const hasTarget = targetRaw !== null && targetRaw !== undefined && String(targetRaw).trim() !== "";
  const target = hasTarget ? Number(targetRaw) || 0 : 0;
  const rest = hasTarget ? Math.max(0, target - paid) : null;
  const status = !hasTarget ? "—" : target > 0 && paid >= target ? "Vollständig bezahlt" : paid > 0 ? "Teilbezahlt" : "Offen";
  function update(index: number, patch: Partial<Payment>) { setRows((prev) => prev.map((item, i) => i === index ? { ...item, ...patch } : item)); }
  return <div className="space-y-3">
    <input type="hidden" name="payments_json" value={JSON.stringify(rows)} />
    <div className="grid gap-2 sm:grid-cols-3"><Summary label="Bezahlt" value={`${paid.toFixed(2)} €`} /><Summary label="Restbetrag" value={rest === null ? "—" : `${rest.toFixed(2)} €`} /><Summary label="Status" value={status} /></div>
    {rows.map((row,index)=><div key={row.id || index} className="grid gap-2 md:grid-cols-[150px_140px_150px_1fr_auto]">
      <input type="date" value={row.payment_date || ""} onChange={(e)=>update(index,{payment_date:e.target.value})} className="h-10 rounded-xl border border-zinc-300 px-3 text-sm font-bold" />
      <input type="number" step="0.01" min="0" value={row.amount ?? ""} onChange={(e)=>update(index,{amount:e.target.value})} placeholder="Betrag €" className="h-10 rounded-xl border border-zinc-300 px-3 text-sm font-bold" />
      <select value={row.payment_method || "bank"} onChange={(e)=>update(index,{payment_method:e.target.value})} className="h-10 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold"><option value="bank">Überweisung</option><option value="cash">Bar</option><option value="other">Sonstiges</option></select>
      <input value={row.note || ""} onChange={(e)=>update(index,{note:e.target.value})} placeholder="Notiz optional" className="h-10 rounded-xl border border-zinc-300 px-3 text-sm font-bold" />
      <button type="button" onClick={()=>setRows((prev)=>prev.filter((_,i)=>i!==index))} aria-label="Zahlung löschen" className="h-10 rounded-xl px-3 text-xs font-black text-rose-600 ring-1 ring-rose-100 hover:bg-rose-50">×</button>
    </div>)}
    <button type="button" onClick={()=>setRows((prev)=>[...prev,{payment_date:todayIso(),amount:"",payment_method:"bank",note:""}])} className="rounded-full bg-white px-3 py-2 text-xs font-black ring-1 ring-black/10">+ Zahlung hinzufügen</button>
    <div className="text-[11px] font-semibold text-zinc-400">Eine vollständig leere Zahlungszeile wird beim Speichern ignoriert. Barzahlung verändert den Umsatz nicht – sie markiert nur den Zahlungseingang.</div>
  </div>;
}
function Summary({label,value}:{label:string;value:string}) { return <div className="rounded-xl bg-[#fbf7ef] px-4 py-3 ring-1 ring-black/5"><p className="text-[10px] font-black uppercase tracking-[.12em] text-zinc-400">{label}</p><p className="mt-1 text-sm font-black text-zinc-900">{value}</p></div>; }
