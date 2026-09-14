"use client";

import { useMemo, useState } from "react";

type MoneyItem = {
  label: string;
  amount: string | number;
  category?: string;
};

type EconomicsData = {
  revenue_total?: string | number;
  revenue_type?: string;
  tickets_sold?: string | number;
  ticket_price_avg?: string | number;
  revenue_items?: MoneyItem[];
  cost_items?: MoneyItem[];
  economic_rating?: string;
  would_book_again?: string;
  strategic_value?: string;
  show_goal?: string;
  audience_rating?: string;
  venue_rating?: string;
  organization_rating?: string;
  effort_rating?: string;
  tech_rating?: string;
  notes?: string;
};

type ShowContext = {
  id?: string;
  artist?: string | null;
  program?: string | null;
  show_date?: string | null;
  venue?: string | null;
  city?: string | null;
  fee_model?: string | null;
  fee_base_amount?: string | number | null;
  fee_artist_share?: string | number | null;
  fee_organizer_share?: string | number | null;
  fee_tax_mode?: string | null;
  fee_notes?: string | null;
};

type TravelLeg = {
  id?: string;
  direction?: string | null;
  transport_type?: string | null;
  from_place?: string | null;
  to_place?: string | null;
  actual_cost?: string | number | null;
};

type Benchmark = {
  avgRevenue?: number;
  avgCosts?: number;
  avgProfit?: number;
  avgMargin?: number;
};

const COST_CATEGORIES = [
  { value: "travel", label: "Reisekosten" },
  { value: "accommodation", label: "Übernachtung" },
  { value: "musician", label: "Musiker / Begleitung" },
  { value: "tech", label: "Technik" },
  { value: "catering", label: "Verpflegung" },
  { value: "shipping", label: "Versand / Porto" },
  { value: "other", label: "Sonstige direkte Kosten" },
] as const;

export default function EconomicsTab({
  showId,
  initialData,
  show,
  travelLegs = [],
  benchmark,
}: {
  showId: string;
  initialData?: EconomicsData;
  show?: ShowContext;
  travelLegs?: TravelLeg[];
  benchmark?: Benchmark;
}) {
  const [data, setData] = useState<EconomicsData>(initialData || {});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const showRevenue = useMemo(() => getShowRevenue(show), [show]);

  const [revenueItems, setRevenueItems] = useState<MoneyItem[]>(
    getInitialExtraRevenueItems(initialData?.revenue_items || [], showRevenue.amount)
  );

  const automaticTravelItems = useMemo(
    () => getAutomaticTravelItems(travelLegs),
    [travelLegs]
  );

  const [costItems, setCostItems] = useState<MoneyItem[]>(
    getInitialManualCostItems(
      initialData?.cost_items || [],
      automaticTravelItems
    )
  );

  function update(field: keyof EconomicsData, value: string) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  const revenue = showRevenue.amount + sumMoneyItems(revenueItems);
  const automaticTravelCosts = sumMoneyItems(automaticTravelItems);
  const manualCosts = sumMoneyItems(costItems);
  const totalCosts = automaticTravelCosts + manualCosts;
  const contribution = revenue - totalCosts;
  const margin = revenue > 0 ? (contribution / revenue) * 100 : 0;
  const hasData = revenue > 0 || totalCosts > 0;

  const resultVariant =
    !hasData
      ? "open"
      : contribution > 0
        ? "positive"
        : contribution < 0
          ? "negative"
          : "neutral";

  const verdict =
    !hasData
      ? { label: "Noch offen", text: "Noch keine Wirtschaftsdaten vorhanden." }
      : contribution < 0
        ? { label: "Negativer DB", text: "Die Show deckt ihre direkten Kosten nicht." }
        : contribution === 0
          ? { label: "DB = 0", text: "Umsatz und direkte Show-Kosten gleichen sich aus." }
          : margin < 20
            ? { label: "Wirtschaftlich knapp", text: `${formatEuro(contribution)} Deckungsbeitrag vor Fixkosten · nur ${margin.toFixed(0)} % DB-Marge.` }
            : { label: "Positiver DB", text: `${formatEuro(contribution)} Deckungsbeitrag vor Fixkosten.` };

  async function save() {
    setSaving(true);
    setSaved(false);
    setSaveError(null);

    try {
      const res = await fetch(`/api/economics/${showId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          revenue_items: revenueItems,
          cost_items: costItems,
          revenue_total: revenue,
          profit: contribution,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setSaveError(result.error || "Speichern fehlgeschlagen");
        return;
      }

      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      console.error("SAVE crash:", error);
      setSaveError("Speichern nicht möglich");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[24px] border border-[#e2ddd1] bg-white shadow-[0_8px_20px_rgba(45,40,28,.04)]">
        <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-[#eee9df]">
          <div className="p-6">
            <div className="flex items-start justify-between gap-5">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[.12em] text-[#9a978f]">
                  Einnahmen
                </div>
                <h2 className="mt-1 text-xl font-black text-[#191917]">Was kam rein?</h2>
              </div>
              <div className="text-right text-2xl font-black text-[#191917]">
                {formatEuro(revenue)}
              </div>
            </div>

            <div className="mt-5">
              {showRevenue.automatic ? (
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#faf8f2] px-4 py-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#dfe99a] px-2.5 py-1 text-[10px] font-black uppercase tracking-[.08em] text-[#425300]">
                        aus Show-Akte
                      </span>
                      <span className="font-black text-[#25231f]">{showRevenue.label}</span>
                    </div>
                    {showRevenue.detail && (
                      <div className="mt-1 text-xs font-semibold text-[#88857d]">
                        {showRevenue.detail}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 font-black">{formatEuro(showRevenue.amount)}</div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#d8d2c4] bg-[#fffdf7] px-4 py-3 text-xs font-semibold leading-5 text-[#77746c]">
                  {showRevenue.detail}
                </div>
              )}
            </div>

            {revenueItems.length > 0 && (
              <div className="mt-4 space-y-2">
                {revenueItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-[1fr_120px_34px] gap-2">
                    <input
                      value={item.label}
                      onChange={(e) =>
                        updateMoneyItem(revenueItems, setRevenueItems, index, "label", e.target.value)
                      }
                      placeholder="z. B. Merch"
                      className={inputClass}
                    />
                    <MoneyInput
                      value={item.amount}
                      onChange={(value) =>
                        updateMoneyItem(revenueItems, setRevenueItems, index, "amount", value)
                      }
                    />
                    <RemoveButton onClick={() => removeMoneyItem(setRevenueItems, index)} />
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => addMoneyItem(setRevenueItems)}
              className="mt-4 rounded-full bg-[#f4f1e9] px-4 py-2 text-xs font-black text-[#5f5b54] transition hover:bg-[#ebe7dc]"
            >
              + Zusätzliche Einnahme
            </button>
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between gap-5">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[.12em] text-[#9a978f]">
                  Variable Kosten
                </div>
                <h2 className="mt-1 text-xl font-black text-[#191917]">Was hat die Show gekostet?</h2>
              </div>
              <div className="text-right text-2xl font-black text-[#191917]">
                {formatEuro(totalCosts)}
              </div>
            </div>

            {(automaticTravelItems.length > 0 || costItems.length > 0) && (
              <div className="mt-5 space-y-2">
                <div className="grid grid-cols-[165px_1fr_110px_34px] gap-2 px-1 text-[10px] font-black uppercase tracking-[.1em] text-[#9a978f]">
                  <div>Kostenart</div>
                  <div>Bezeichnung</div>
                  <div className="text-right">Betrag</div>
                  <div />
                </div>

                {automaticTravelItems.map((item, index) => (
                  <div
                    key={`travel-${index}-${item.label}-${item.amount}`}
                    className="grid grid-cols-[165px_1fr_110px_34px] gap-2"
                  >
                    <div className="flex h-11 min-w-0 items-center rounded-xl border border-[#dce4b4] bg-[#f6f9e8] px-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-black text-[#425300]">
                          Reisekosten
                        </div>
                        <div className="mt-0.5 truncate text-[9px] font-black uppercase tracking-[.08em] text-[#7d8c38]">
                          aus Show-Akte
                        </div>
                      </div>
                    </div>

                    <div className="flex h-11 min-w-0 items-center rounded-xl border border-[#e2ddd1] bg-[#faf8f2] px-3 text-sm font-semibold text-[#25231f]">
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex h-11 items-center justify-end rounded-xl border border-[#e2ddd1] bg-[#faf8f2] px-3 text-sm font-black text-[#25231f]">
                      {formatEuro(toNumber(item.amount))}
                    </div>

                    <div className="flex h-11 items-center justify-center text-xs font-black text-[#b0aca3]">
                      ✓
                    </div>
                  </div>
                ))}

                {costItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-[165px_1fr_110px_34px] gap-2">
                    <select
                      value={item.category || "other"}
                      onChange={(e) =>
                        updateMoneyItem(costItems, setCostItems, index, "category", e.target.value)
                      }
                      className={inputClass}
                    >
                      {COST_CATEGORIES.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>

                    <input
                      value={item.label}
                      onChange={(e) =>
                        updateMoneyItem(costItems, setCostItems, index, "label", e.target.value)
                      }
                      placeholder="z. B. Taxi Bahnhof → Theater"
                      className={inputClass}
                    />

                    <MoneyInput
                      value={item.amount}
                      onChange={(value) =>
                        updateMoneyItem(costItems, setCostItems, index, "amount", value)
                      }
                    />

                    <RemoveButton onClick={() => removeMoneyItem(setCostItems, index)} />
                  </div>
                ))}
              </div>
            )}

            {automaticTravelItems.length === 0 && costItems.length === 0 && (
              <div className="mt-5 rounded-2xl border border-dashed border-[#ddd7ca] bg-[#faf8f2] px-4 py-5 text-sm font-semibold text-[#88857d]">
                Noch keine direkten Show-Kosten erfasst.
              </div>
            )}

            <button
              type="button"
              onClick={() => addMoneyItem(setCostItems, { category: "travel" })}
              className="mt-4 rounded-full bg-[#f4f1e9] px-4 py-2 text-xs font-black text-[#5f5b54] transition hover:bg-[#ebe7dc]"
            >
              + Kostenposition
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-[#e2ddd1] bg-white p-6 shadow-[0_8px_20px_rgba(45,40,28,.04)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[.12em] text-[#9a978f]">
              Ergebnis
            </div>
            <h2 className="mt-1 text-xl font-black text-[#191917]">Was bleibt von der Show?</h2>
          </div>

          <span className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-black ${resultPillClass(resultVariant, margin)}`}>
            {verdict.label}
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Kpi label="Variable Kosten" value={formatEuro(totalCosts)} />
          <Kpi
            label="Deckungsbeitrag"
            value={hasData ? formatEuro(contribution) : "—"}
            tone={resultVariant}
          />
          <Kpi label="DB-Marge" value={hasData ? `${margin.toFixed(0)} %` : "—"} />
        </div>

        <div className="mt-4 rounded-2xl bg-[#faf8f2] px-4 py-3 text-sm font-bold text-[#56524b]">
          {verdict.text}
        </div>
      </section>



      <div className="flex flex-col gap-3 rounded-[22px] border border-[#e2ddd1] bg-white px-5 py-4 shadow-[0_8px_20px_rgba(45,40,28,.04)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-black text-[#20201d]">
            {saved ? "✓ Gespeichert" : "Wirtschaftlichkeit"}
          </div>
          <div className={`mt-1 text-xs font-semibold ${saveError ? "text-[#9d4949]" : saved ? "text-[#5d7100]" : "text-[#88857d]"}`}>
            {saveError
              ? saveError
              : saving
                ? "Speichert…"
                : saved
                  ? "Änderungen wurden übernommen."
                  : "Änderungen speichern"}
          </div>
        </div>

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-full bg-[#20201d] px-6 py-3 text-sm font-black text-white transition hover:bg-black disabled:opacity-60"
        >
          {saving ? "Speichert…" : saved ? "Gespeichert ✓" : "Speichern"}
        </button>
      </div>
    </div>
  );
}

const inputClass =
  "h-11 min-w-0 rounded-xl border border-[#ddd7ca] bg-[#faf8f2] px-3 text-sm font-semibold text-[#25231f] outline-none transition focus:border-[#c9d65c] focus:ring-4 focus:ring-[#dbe76e]/20";

function Kpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "open" | "positive" | "neutral" | "negative";
}) {
  const cls =
    tone === "positive"
      ? "bg-[#e7f1c8] text-[#425300]"
      : tone === "negative"
        ? "bg-[#f4dddd] text-[#8b3535]"
        : tone === "neutral"
          ? "bg-[#efede6] text-[#4f4b44]"
          : "bg-[#faf8f2] text-[#191917]";

  return (
    <div className={`rounded-2xl px-4 py-4 ${cls}`}>
      <div className="text-[10px] font-black uppercase tracking-[.1em] text-[#9a978f]">
        {label}
      </div>
      <div className="mt-2 text-2xl font-black">{value}</div>
    </div>
  );
}

function MoneyInput({
  value,
  onChange,
}: {
  value: string | number;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        inputMode="decimal"
        placeholder="0,00"
        className={`${inputClass} w-full pr-7 text-right`}
      />
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-[#9a978f]">
        €
      </span>
    </div>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 items-center justify-center rounded-xl bg-[#f4f1e9] text-sm font-black text-[#77746c] transition hover:bg-[#f4dddd] hover:text-[#8b3535]"
    >
      ×
    </button>
  );
}

function getShowRevenue(show?: ShowContext) {
  const model = String(show?.fee_model || "");
  const amount = toNumber(show?.fee_base_amount ?? undefined);
  const artistShare = toNumber(show?.fee_artist_share ?? undefined);
  const organizerShare = toNumber(show?.fee_organizer_share ?? undefined);
  const taxMode =
    show?.fee_tax_mode === "gross"
      ? "brutto"
      : show?.fee_tax_mode === "net"
        ? "netto"
        : "";

  if (model === "fixed" && amount > 0) {
    return {
      amount,
      label: "Festgage",
      detail: taxMode ? `laut Show-Akte · ${taxMode}` : "laut Show-Akte",
      automatic: true,
    };
  }

  if (model === "minimum_plus_share" && amount > 0) {
    const share =
      artistShare > 0 && organizerShare > 0
        ? ` · Beteiligung ${artistShare}/${organizerShare}`
        : "";

    return {
      amount,
      label: "Mindestgage",
      detail: `laut Show-Akte${taxMode ? ` · ${taxMode}` : ""}${share}`,
      automatic: true,
    };
  }

  if (model === "share") {
    const share =
      artistShare > 0 && organizerShare > 0
        ? `${artistShare}/${organizerShare}`
        : "vereinbarte Beteiligung";

    return {
      amount: 0,
      label: "Beteiligung",
      detail: `In der Show-Akte ist ${share} hinterlegt. Den tatsächlichen Erlös nach der Abrechnung hier ergänzen.`,
      automatic: false,
    };
  }

  if (model === "other") {
    return {
      amount: 0,
      label: "Honorarvereinbarung",
      detail: show?.fee_notes
        ? `Individuelle Vereinbarung: ${show.fee_notes}. Tatsächlichen Erlös hier ergänzen.`
        : "Individuelle Honorarvereinbarung. Tatsächlichen Erlös hier ergänzen.",
      automatic: false,
    };
  }

  return {
    amount: 0,
    label: "Show-Erlös",
    detail: "In der Show-Akte ist noch kein automatisch auswertbarer Show-Erlös hinterlegt.",
    automatic: false,
  };
}

function getInitialExtraRevenueItems(items: MoneyItem[], automaticRevenue: number) {
  if (!items.length) return [];

  const legacyBaseLabels = ["gage", "festgage", "mindestgage", "honorar"];

  return items.filter((item) => {
    const normalizedLabel = String(item.label || "").trim().toLowerCase();
    const amount = toNumber(item.amount);

    return !(
      automaticRevenue > 0 &&
      legacyBaseLabels.some((label) => normalizedLabel.includes(label)) &&
      Math.abs(amount - automaticRevenue) < 0.01
    );
  });
}

function getAutomaticTravelItems(travelLegs: TravelLeg[]): MoneyItem[] {
  return travelLegs
    .filter((leg) => toNumber(leg.actual_cost) !== 0)
    .map((leg) => {
      const direction =
        leg.direction === "return"
          ? "Rückfahrt"
          : leg.direction === "outbound"
            ? "Hinfahrt"
            : "Fahrt";

      const route = [leg.from_place, leg.to_place]
        .map((value) => String(value || "").trim())
        .filter(Boolean)
        .join(" → ");

      const transport = String(leg.transport_type || "").trim();

      const detail = [direction, transport, route]
        .filter(Boolean)
        .join(" · ");

      return {
        category: "travel",
        label: detail || direction,
        amount: leg.actual_cost || 0,
      };
    });
}

function getInitialManualCostItems(
  items: MoneyItem[],
  automaticTravelItems: MoneyItem[]
) {
  const normalizedItems = items.map((item) => ({
    ...item,
    category: item.category || inferLegacyCostCategory(item.label),
  }));

  if (!automaticTravelItems.length) return normalizedItems;

  const unusedAutomatic = automaticTravelItems.map((item) => ({
    ...item,
    used: false,
  }));

  return normalizedItems.filter((item) => {
    if ((item.category || inferLegacyCostCategory(item.label)) !== "travel") {
      return true;
    }

    const itemAmount = toNumber(item.amount);
    const itemLabel = normalizeCostLabel(item.label);

    const matchIndex = unusedAutomatic.findIndex((automatic) => {
      if (automatic.used) return false;

      const sameAmount =
        Math.abs(toNumber(automatic.amount) - itemAmount) < 0.01;

      if (!sameAmount) return false;

      const automaticLabel = normalizeCostLabel(automatic.label);

      const directionMatches =
        (itemLabel.includes("hinfahrt") &&
          automaticLabel.includes("hinfahrt")) ||
        (itemLabel.includes("rückfahrt") &&
          automaticLabel.includes("rückfahrt")) ||
        (itemLabel.includes("rueckfahrt") &&
          automaticLabel.includes("rückfahrt"));

      return directionMatches || itemLabel === automaticLabel;
    });

    if (matchIndex === -1) return true;

    unusedAutomatic[matchIndex].used = true;
    return false;
  });
}

function normalizeCostLabel(value: string) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/ue/g, "ü")
    .replace(/\s+/g, " ");
}

function inferLegacyCostCategory(label: string) {
  const value = String(label || "").toLowerCase();

  if (
    /(hinfahrt|rückfahrt|rueckfahrt|reise|bahn|zug|ice|fahrt|fahrkarte|kilometer|km|flug|mietwagen|taxi|uber|bolt)/.test(
      value
    )
  ) {
    return "travel";
  }

  if (/(hotel|übernacht|uebernacht|unterkunft|pension)/.test(value)) {
    return "accommodation";
  }

  if (/markus|musiker|begleitung/.test(value)) {
    return "musician";
  }

  if (/(technik|ton|licht|mikro|sound)/.test(value)) {
    return "tech";
  }

  if (/(essen|verpflegung|catering|meal|restaurant)/.test(value)) {
    return "catering";
  }

  if (/(porto|versand|post)/.test(value)) {
    return "shipping";
  }

  return "other";
}

function sumMoneyItems(items: MoneyItem[]) {
  return items.reduce((sum, item) => sum + toNumber(item.amount), 0);
}

function updateMoneyItem(
  items: MoneyItem[],
  setItems: React.Dispatch<React.SetStateAction<MoneyItem[]>>,
  index: number,
  field: keyof MoneyItem,
  value: string
) {
  setItems(
    items.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item
    )
  );
}

function addMoneyItem(
  setItems: React.Dispatch<React.SetStateAction<MoneyItem[]>>,
  defaults: Partial<MoneyItem> = {}
) {
  setItems((prev) => [...prev, { label: "", amount: "", ...defaults }]);
}

function removeMoneyItem(
  setItems: React.Dispatch<React.SetStateAction<MoneyItem[]>>,
  index: number
) {
  setItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
}

function toNumber(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return 0;

  const raw = String(value).trim();
  const normalized = raw.includes(",")
    ? raw.replace(/\./g, "").replace(",", ".")
    : raw;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatEuro(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function resultPillClass(
  variant: "open" | "positive" | "neutral" | "negative",
  margin = 0
) {
  if (variant === "positive" && margin < 20) return "bg-[#f2ead2] text-[#7a6322]";
  if (variant === "positive") return "bg-[#e7f1c8] text-[#425300]";
  if (variant === "negative") return "bg-[#f4dddd] text-[#8b3535]";
  return "bg-[#efede6] text-[#5f5b54]";
}
