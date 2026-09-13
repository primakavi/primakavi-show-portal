"use client";

import { useState } from "react";

type Props = {
  defaultSource?: string | null;
  contractPartnerSummary: string;
  venueSummary: string;
  values: Record<string, any>;
};

export default function InvoiceRecipientEditor({
  defaultSource,
  contractPartnerSummary,
  venueSummary,
  values,
}: Props) {
  const [source, setSource] = useState(defaultSource || "contract_partner");

  return (
    <div className="space-y-3">
      <label className="grid gap-1.5 text-[11px] font-semibold text-zinc-500">
        Quelle
        <select
          name="invoice_recipient_source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold text-zinc-900"
        >
          <option value="contract_partner">wie Vertragspartner</option>
          <option value="venue">wie Spielstätte</option>
          <option value="custom">abweichend</option>
        </select>
      </label>

      {source !== "custom" ? (
        <div className="rounded-xl bg-[#fbf7ef] px-4 py-3 text-sm font-bold text-zinc-700 ring-1 ring-black/5">
          {source === "venue" ? venueSummary : contractPartnerSummary}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <Field name="invoice_recipient_company" label="Firma / Rechnungsempfänger" value={values.invoice_recipient_company} />
          <Field name="invoice_recipient_contact" label="Ansprechpartner:in" value={values.invoice_recipient_contact} />
          <Field name="invoice_recipient_street" label="Straße + Hausnummer" value={values.invoice_recipient_street} />
          <Field name="invoice_recipient_postal_code" label="PLZ" value={values.invoice_recipient_postal_code} />
          <Field name="invoice_recipient_city" label="Ort" value={values.invoice_recipient_city} />
          <Field name="invoice_recipient_country" label="Land" value={values.invoice_recipient_country || "Deutschland"} />
          <Field name="invoice_email" label="Rechnungs-E-Mail" value={values.invoice_email} />
          <Field name="po_number" label="Bestellnummer / PO-Nummer" value={values.po_number} />
        </div>
      )}

      {source !== "custom" && (
        <>
          <input type="hidden" name="invoice_recipient_company" value={values.invoice_recipient_company || ""} />
          <input type="hidden" name="invoice_recipient_contact" value={values.invoice_recipient_contact || ""} />
          <input type="hidden" name="invoice_recipient_street" value={values.invoice_recipient_street || ""} />
          <input type="hidden" name="invoice_recipient_postal_code" value={values.invoice_recipient_postal_code || ""} />
          <input type="hidden" name="invoice_recipient_city" value={values.invoice_recipient_city || ""} />
          <input type="hidden" name="invoice_recipient_country" value={values.invoice_recipient_country || ""} />
          <input type="hidden" name="invoice_email" value={values.invoice_email || ""} />
          <input type="hidden" name="po_number" value={values.po_number || ""} />
        </>
      )}
    </div>
  );
}

function Field({ name, label, value }: { name: string; label: string; value?: any }) {
  return (
    <label className="grid gap-1.5 text-[11px] font-semibold text-zinc-500">
      {label}
      <input
        name={name}
        defaultValue={value ?? ""}
        className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold text-zinc-900"
      />
    </label>
  );
}
