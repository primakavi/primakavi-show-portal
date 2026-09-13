"use client";

import { useMemo, useState } from "react";

type Payment = {
  id?: string;
  payment_date: string;
  amount: number | string;
  note?: string | null;
};

function todayIso() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export default function PaymentEditor({
  initialPayments,
  invoiceAmount,
}: {
  initialPayments: Payment[];
  invoiceAmount?: number | string | null;
}) {
  const [rows, setRows] = useState<Payment[]>(initialPayments);

  const paid = useMemo(
    () => rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0),
    [rows]
  );

  const hasInvoiceAmount =
    invoiceAmount !== null &&
    invoiceAmount !== undefined &&
    String(invoiceAmount).trim() !== "";

  const invoice = hasInvoiceAmount ? Number(invoiceAmount) || 0 : 0;
  const rest = hasInvoiceAmount ? Math.max(0, invoice - paid) : null;

  const status = !hasInvoiceAmount
    ? "—"
    : invoice > 0 && paid >= invoice
      ? "Vollständig bezahlt"
      : paid > 0
        ? "Teilbezahlt"
        : "Offen";

  return (
    <div className="space-y-3">
      <input type="hidden" name="payments_json" value={JSON.stringify(rows)} />

      <div className="grid gap-2 sm:grid-cols-3">
        <Summary label="Bezahlt" value={`${paid.toFixed(2)} €`} />
        <Summary
          label="Restbetrag"
          value={rest === null ? "—" : `${rest.toFixed(2)} €`}
        />
        <Summary label="Status" value={status} />
      </div>

      {rows.map((row, index) => (
        <div
          key={row.id || index}
          className="grid gap-2 md:grid-cols-[160px_150px_1fr_auto]"
        >
          <input
            type="date"
            required
            value={row.payment_date || ""}
            onChange={(event) =>
              setRows((prev) =>
                prev.map((item, i) =>
                  i === index
                    ? { ...item, payment_date: event.target.value }
                    : item
                )
              )
            }
            className="h-10 rounded-xl border border-zinc-300 px-3 text-sm font-bold"
          />

          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={row.amount ?? ""}
            onChange={(event) =>
              setRows((prev) =>
                prev.map((item, i) =>
                  i === index
                    ? { ...item, amount: event.target.value }
                    : item
                )
              )
            }
            placeholder="Betrag €"
            className="h-10 rounded-xl border border-zinc-300 px-3 text-sm font-bold"
          />

          <input
            value={row.note || ""}
            onChange={(event) =>
              setRows((prev) =>
                prev.map((item, i) =>
                  i === index
                    ? { ...item, note: event.target.value }
                    : item
                )
              )
            }
            placeholder="Notiz optional"
            className="h-10 rounded-xl border border-zinc-300 px-3 text-sm font-bold"
          />

          <button
            type="button"
            onClick={() =>
              setRows((prev) => prev.filter((_, i) => i !== index))
            }
            aria-label="Zahlung löschen"
            className="h-10 rounded-xl px-3 text-xs font-black text-rose-600 ring-1 ring-rose-100 transition hover:bg-rose-50"
          >
            ×
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          setRows((prev) => [
            ...prev,
            { payment_date: todayIso(), amount: "", note: "" },
          ])
        }
        className="rounded-full bg-white px-3 py-2 text-xs font-black ring-1 ring-black/10"
      >
        + Zahlung hinzufügen
      </button>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#fbf7ef] px-4 py-3 ring-1 ring-black/5">
      <p className="text-[10px] font-black uppercase tracking-[.12em] text-zinc-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-zinc-900">{value}</p>
    </div>
  );
}
