"use client";

import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

type MoneyItem = {
  label: string;
  amount: string | number;
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
};

type Benchmark = {
  avgRevenue?: number;
  avgCosts?: number;
  avgProfit?: number;
  avgMargin?: number;
};

export default function EconomicsTab({
  showId,
  initialData,
  show,
  benchmark,
}: {
  showId: string;
  initialData?: EconomicsData;
  show?: ShowContext;
  benchmark?: Benchmark;
}) {
  const [data, setData] = useState<EconomicsData>(initialData || {});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
const [saveError, setSaveError] = useState<string | null>(null);

  const [revenueItems, setRevenueItems] = useState<MoneyItem[]>(
    initialData?.revenue_items?.length
      ? initialData.revenue_items
      : [
          { label: "Gage", amount: "" },
          { label: "Beteiligung", amount: "" },
          { label: "Merch", amount: "" },
        ]
  );

  const [costItems, setCostItems] = useState<MoneyItem[]>(
    initialData?.cost_items?.length
      ? initialData.cost_items
      : [
          { label: "Reise", amount: "" },
          { label: "Hotel", amount: "" },
          { label: "Technik", amount: "" },
          { label: "Sonstiges", amount: "" },
        ]
  );

  function update(field: keyof EconomicsData, value: string) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  const revenue = sumMoneyItems(revenueItems);
  const totalCosts = sumMoneyItems(costItems);
  const profit = revenue - totalCosts;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
  const hasData = revenue > 0 || totalCosts > 0;

  const resultVariant =
    !hasData ? "open" : profit > 0 ? "positive" : profit < 0 ? "negative" : "neutral";

  const resultLabel =
    !hasData ? "Noch offen" : profit > 0 ? "Lohnt sich" : profit < 0 ? "Minusgeschäft" : "Break-even";

  const verdict = useMemo(() => {
    if (!hasData) {
      return {
        label: "Noch keine Daten",
        text: "Trage Einnahmen und Kosten ein, dann entsteht hier die Auswertung.",
        className: "bg-zinc-100 text-zinc-700",
      };
    }

    if (profit > 0) {
      return {
        label: "Lohnt sich",
        text: "💡 Fazit: Diese Show lohnt sich wirtschaftlich.",
        className: "bg-emerald-100 text-emerald-700",
      };
    }

    if (profit === 0) {
      return {
        label: "Break-even",
        text: "💡 Fazit: Diese Show liegt ungefähr bei null. Strategischen Wert prüfen.",
        className: "bg-zinc-100 text-zinc-700",
      };
    }

    return {
      label: "Minusgeschäft",
      text: "💡 Fazit: Diese Show lohnt sich wirtschaftlich nicht – außer sie hat strategischen Wert.",
      className: "bg-rose-100 text-rose-700",
    };
  }, [hasData, profit]);

  const insights = buildInsights({
    hasData,
    profit,
    margin,
    revenue,
    totalCosts,
    effort: data.effort_rating,
    audience: data.audience_rating,
    venue: data.venue_rating,
    organization: data.organization_rating,
    tech: data.tech_rating,
    wouldBookAgain: data.would_book_again,
    strategicValue: data.strategic_value,
  });

  const chartData = [
    { name: "Kosten", value: totalCosts },
    { name: profit >= 0 ? "Gewinn" : "Verlust", value: Math.abs(profit) },
  ];

  const chartColors =
    profit >= 0
      ? ["#fb7185", "#4ade80"]
      : ["#fb7185", "#fb7185"];

async function save() {
  setSaving(true);
  setSaved(false);
  setSaveError(null);

  try {
    const res = await fetch(`/api/economics/${showId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        revenue_items: revenueItems,
        cost_items: costItems,
        revenue_total: revenue,
        profit,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      setSaveError(result.error || "Speichern fehlgeschlagen");
      return;
    }

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  } catch (error) {
    console.error("SAVE crash:", error);
    setSaveError("Speichern nicht möglich");
  } finally {
    setSaving(false);
  }
}
  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] bg-white p-5 shadow-xl shadow-black/5 ring-1 ring-black/5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
          {formatShowReference(show)}
        </p>

        <h2 className="mt-2 text-2xl font-black tracking-tight text-zinc-950">
          Wirtschaftlichkeit erfassen
        </h2>

        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-zinc-500">
          Erst Einnahmen und Kosten eintragen – die Auswertung entsteht direkt darunter.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <MoneyItemsCard
          title="Einnahmen"
          eyebrow="Was kam rein?"
          items={revenueItems}
          setItems={setRevenueItems}
          total={revenue}
          addLabel="+ Einnahme hinzufügen"
        />

        <MoneyItemsCard
          title="Kosten"
          eyebrow="Was hat es gekostet?"
          items={costItems}
          setItems={setCostItems}
          total={totalCosts}
          addLabel="+ Kosten hinzufügen"
        />
      </section>

      <section className="rounded-[2rem] bg-white p-5 shadow-xl shadow-black/5 ring-1 ring-black/5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
              Auswertung
            </p>
            <h3 className="mt-2 text-xl font-black text-zinc-950">
              Was bleibt übrig?
            </h3>
          </div>

          <span
            className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-black ${verdict.className}`}
          >
            {verdict.label}
          </span>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_340px]">
          <div className="grid gap-3 md:grid-cols-2">
            <Metric label="Einnahmen" value={formatEuro(revenue)} />
            <Metric label="Kosten" value={formatEuro(totalCosts)} />

            <Metric
              label={resultLabel}
              value={hasData ? formatEuro(profit) : "–"}
              highlight
              variant={resultVariant}
            />

            <Metric label="Marge" value={`${margin.toFixed(0)} %`} />

            <div className="flex min-h-[86px] items-center rounded-2xl bg-[#fbf7ef] px-6 py-4 ring-1 ring-black/5 md:col-span-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <span
                  className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-black ${verdict.className}`}
                >
                  {verdict.label}
                </span>

                <p className="text-base font-bold leading-7 text-zinc-800">
                  {verdict.text}
                </p>
              </div>
            </div>
          </div>

          <div className="flex min-h-[360px] flex-col justify-between rounded-[1.75rem] bg-[#fbf7ef] p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
              Verhältnis
            </p>

            <div className="relative mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    innerRadius={64}
                    outerRadius={100}
                    paddingAngle={3}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={entry.name} fill={chartColors[index]} />
                    ))}
                  </Pie>

                  <text
                    x="50%"
                    y="47%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-zinc-950 text-xl font-black"
                  >
                    {hasData ? formatEuro(profit) : "–"}
                  </text>

                  <text
                    x="50%"
                    y="60%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-zinc-400 text-[10px] font-black uppercase tracking-widest"
                  >
                    Ergebnis
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 flex justify-between text-xs font-black text-zinc-500">
              <span>Kosten</span>
              <span>{profit >= 0 ? "Gewinn" : "Verlust"}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <BusinessCard title="Einordnung" eyebrow="Bewertung & Strategie">
          <div className="space-y-3">
            <DecisionInputRow label="Wirtschaftlich">
              <Select
                label=""
                value={data.economic_rating}
                onChange={(v) => update("economic_rating", v)}
                options={["Sehr gut", "Gut", "Grenzwertig", "Schlecht"]}
              />
            </DecisionInputRow>

            <DecisionInputRow label="Wieder buchen?">
              <Select
                label=""
                value={data.would_book_again}
                onChange={(v) => update("would_book_again", v)}
                options={["Ja", "Vielleicht", "Nein"]}
              />
            </DecisionInputRow>

            <DecisionInputRow label="Strategischer Wert">
              <Select
                label=""
                value={data.strategic_value}
                onChange={(v) => update("strategic_value", v)}
                options={["Hoch", "Mittel", "Niedrig"]}
              />
            </DecisionInputRow>

            <DecisionInputRow label="Ziel der Show">
              <Select
                label=""
                value={data.show_goal}
                onChange={(v) => update("show_goal", v)}
                options={["Geld", "Netzwerk", "Sichtbarkeit", "Test", "Tour-Logik"]}
              />
            </DecisionInputRow>

            <div className="my-5 border-t border-black/5" />

            <DecisionInputRow label="Tickets verkauft">
              <Input
                label=""
                value={data.tickets_sold}
                onChange={(v) => update("tickets_sold", v)}
              />
            </DecisionInputRow>

            <DecisionInputRow label="Ø Ticketpreis">
              <Input
                label=""
                value={data.ticket_price_avg}
                onChange={(v) => update("ticket_price_avg", v)}
              />
            </DecisionInputRow>
          </div>
        </BusinessCard>

        <BusinessCard title="Learnings" eyebrow="Nachbereitung">
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <ChipGroup
                label="Publikum"
                value={data.audience_rating}
                onChange={(v) => update("audience_rating", v)}
                options={[
                  { value: "stark", label: "🔥 Stark" },
                  { value: "okay", label: "🙂 Okay" },
                  { value: "schwach", label: "😐 Schwach" },
                ]}
              />

              <ChipGroup
                label="Location"
                value={data.venue_rating}
                onChange={(v) => update("venue_rating", v)}
                options={[
                  { value: "top", label: "🟢 Top" },
                  { value: "okay", label: "🟡 Okay" },
                  { value: "schwierig", label: "🔴 Schwierig" },
                ]}
              />

              <ChipGroup
                label="Organisation"
                value={data.organization_rating}
                onChange={(v) => update("organization_rating", v)}
                options={[
                  { value: "easy", label: "🟢 Easy" },
                  { value: "normal", label: "🟡 Normal" },
                  { value: "chaotisch", label: "🔴 Chaotisch" },
                ]}
              />

              <ChipGroup
                label="Aufwand"
                value={data.effort_rating}
                onChange={(v) => update("effort_rating", v)}
                options={[
                  { value: "gering", label: "🟢 Gering" },
                  { value: "mittel", label: "🟡 Mittel" },
                  { value: "hoch", label: "🔴 Hoch" },
                ]}
              />

              <ChipGroup
                label="Technik"
                value={data.tech_rating}
                onChange={(v) => update("tech_rating", v)}
                options={[
                  { value: "smooth", label: "🟢 Smooth" },
                  { value: "okay", label: "🟡 Okay" },
                  { value: "problematisch", label: "🔴 Problematisch" },
                ]}
              />
            </div>

            <label className="grid gap-2 text-xs font-black text-zinc-700">
              Was lernen wir aus dieser Show?
              <textarea
                value={data.notes || ""}
                onChange={(e) => update("notes", e.target.value)}
                rows={10}
                className="min-h-[260px] rounded-2xl border border-zinc-200 bg-[#fbf7ef] px-4 py-3 text-sm font-semibold text-zinc-900 outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
                placeholder="Publikum, Location, Aufwand, Wiederbuchung, Besonderheiten..."
              />
            </label>
          </div>
        </BusinessCard>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <BusinessCard title="Vergleich" eyebrow="Show vs. Durchschnitt">
          <div className="space-y-3">
            <CompareRow label="Einnahmen" value={revenue} average={benchmark?.avgRevenue} />
            <CompareRow label="Kosten" value={totalCosts} average={benchmark?.avgCosts} invert />
            <CompareRow label="Gewinn" value={profit} average={benchmark?.avgProfit} />
            <CompareRow label="Marge" value={margin} average={benchmark?.avgMargin} suffix="%" />
          </div>
        </BusinessCard>

        <BusinessCard title="Smart Hinweise" eyebrow="Intelligence Layer">
          <div className="space-y-3">
            {insights.length ? (
              insights.map((insight) => (
                <div
                  key={insight}
                  className="rounded-2xl bg-[#fbf7ef] px-4 py-3 text-sm font-bold leading-6 text-zinc-700"
                >
                  {insight}
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-[#fbf7ef] px-4 py-3 text-sm font-bold text-zinc-500">
                Noch keine Hinweise. Trage Zahlen und Bewertungen ein.
              </p>
            )}
          </div>
        </BusinessCard>
      </section>

<div className="sticky bottom-5 z-20 mt-8 rounded-[1.75rem] bg-zinc-950 p-4 text-white shadow-2xl">
  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div>
      <p className="font-black">
        {saved ? "✓ Nachbereitung gespeichert" : "💗 Nachbereitung"}
      </p>

      <p
        className={`text-sm ${
          saveError
            ? "text-rose-300"
            : saved
              ? "text-emerald-300"
              : "text-zinc-300"
        }`}
      >
        {saveError
          ? saveError
          : saving
            ? "Speichert…"
            : saved
              ? "Deine Änderungen wurden übernommen."
              : "Änderungen speichern"}
      </p>
    </div>

    <button
      type="button"
      onClick={save}
      disabled={saving}
      className="rounded-full bg-gradient-to-r from-pink-400 to-orange-400 px-8 py-4 font-black text-white shadow-lg transition hover:scale-[1.02] disabled:opacity-60"
    >
      {saving
        ? "Speichert…"
        : saved
          ? "Gespeichert ✓"
          : "Speichern →"}
    </button>
  </div>
</div>    </div>
  );
}

function CompareRow({
  label,
  value,
  average,
  suffix = "€",
  invert = false,
}: {
  label: string;
  value: number;
  average?: number;
  suffix?: "€" | "%";
  invert?: boolean;
}) {
  const hasAverage = typeof average === "number";
  const diff = hasAverage ? value - average : 0;
  const isBetter = invert ? diff < 0 : diff > 0;

  return (
    <div className="rounded-2xl bg-[#fbf7ef] px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-black text-zinc-700">{label}</p>
        <span
          className={[
            "rounded-full px-3 py-1 text-xs font-black",
            !hasAverage
              ? "bg-zinc-100 text-zinc-500"
              : isBetter
                ? "bg-emerald-100 text-emerald-700"
                : diff === 0
                  ? "bg-zinc-100 text-zinc-600"
                  : "bg-rose-100 text-rose-700",
          ].join(" ")}
        >
          {!hasAverage
            ? "noch kein Ø"
            : `${diff > 0 ? "+" : ""}${formatValue(diff, suffix)} vs Ø`}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs font-bold text-zinc-500">
        <span>Diese Show: {formatValue(value, suffix)}</span>
        <span>Ø: {hasAverage ? formatValue(average, suffix) : "–"}</span>
      </div>
    </div>
  );
}

function buildInsights({
  hasData,
  profit,
  margin,
  revenue,
  totalCosts,
  effort,
  audience,
  venue,
  organization,
  tech,
  wouldBookAgain,
  strategicValue,
}: {
  hasData: boolean;
  profit: number;
  margin: number;
  revenue: number;
  totalCosts: number;
  effort?: string;
  audience?: string;
  venue?: string;
  organization?: string;
  tech?: string;
  wouldBookAgain?: string;
  strategicValue?: string;
}) {
  const items: string[] = [];

  if (!hasData) return items;

  if (profit > 0 && effort !== "hoch") {
    items.push("✅ Wirtschaftlich sinnvoll: Gewinn positiv und Aufwand nicht hoch.");
  }

  if (profit < 0 && strategicValue === "Hoch") {
    items.push("💡 Trotz Minus strategisch interessant – Folgegeschäft oder Sichtbarkeit prüfen.");
  }

  if (profit < 0 && strategicValue !== "Hoch") {
    items.push("⚠️ Minusgeschäft ohne hohen strategischen Wert – Wiederholung kritisch prüfen.");
  }

  if (effort === "hoch" && profit <= 0) {
    items.push("🚧 Hoher Aufwand bei schwachem Ergebnis – Prozess oder Preis prüfen.");
  }

  if (audience === "stark" && profit <= 0) {
    items.push("🔥 Starkes Publikum, aber wirtschaftlich schwach – Preismodell oder Kostenstruktur prüfen.");
  }

  if (venue === "schwierig" || organization === "chaotisch" || tech === "problematisch") {
    items.push("🧯 Operative Risiken vorhanden – bei Wiederbuchung klare Bedingungen festlegen.");
  }

  if (wouldBookAgain === "Nein" && profit > 0) {
    items.push("🤔 Trotz Gewinn nicht wieder buchen? Grund in den Learnings festhalten.");
  }

  if (margin > 40) {
    items.push("🚀 Sehr starke Marge – ähnliche Shows/Locations gezielt suchen.");
  }

  if (revenue > 0 && totalCosts / revenue > 0.7) {
    items.push("📉 Kostenquote hoch – Einsparpotenzial prüfen.");
  }

  return items;
}

function DecisionInputRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-3 rounded-2xl bg-[#fbf7ef] p-3 md:grid-cols-[170px_1fr] md:items-center">
      <p className="text-sm font-black text-zinc-700">{label}</p>
      <div>{children}</div>
    </div>
  );
}

function MoneyItemsCard({
  title,
  eyebrow,
  items,
  setItems,
  total,
  addLabel,
}: {
  title: string;
  eyebrow: string;
  items: MoneyItem[];
  setItems: React.Dispatch<React.SetStateAction<MoneyItem[]>>;
  total: number;
  addLabel: string;
}) {
  return (
    <section className="rounded-[2rem] bg-white p-5 shadow-xl shadow-black/5 ring-1 ring-black/5">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
        {eyebrow}
      </p>

      <div className="mt-2 flex items-end justify-between gap-4">
        <h3 className="text-xl font-black text-zinc-950">{title}</h3>
        <p className="text-2xl font-black text-zinc-950">{formatEuro(total)}</p>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-[1fr_130px_36px] gap-2">
            <input
              value={item.label}
              onChange={(e) =>
                updateMoneyItem(items, setItems, index, "label", e.target.value)
              }
              placeholder="Position"
              className="h-12 rounded-2xl border border-zinc-200 bg-[#fbf7ef] px-4 text-sm font-semibold outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
            />

<div className="relative">
  <input
    value={item.amount ?? ""}
    onChange={(e) =>
      updateMoneyItem(items, setItems, index, "amount", e.target.value)
    }
    placeholder="0,00"
    inputMode="decimal"
    className="h-12 w-full rounded-2xl border border-zinc-200 bg-[#fbf7ef] px-4 pr-9 text-sm font-semibold outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
  />
  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-zinc-400">
    €
  </span>
</div>
            <button
              type="button"
              onClick={() => removeMoneyItem(setItems, index)}
              className="flex h-12 items-center justify-center rounded-2xl bg-zinc-100 text-sm font-black text-zinc-500 transition hover:bg-rose-100 hover:text-rose-600"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => addMoneyItem(setItems)}
        className="mt-4 rounded-full bg-[#fbf7ef] px-4 py-2 text-xs font-black text-zinc-700 transition hover:bg-[#f5ead9]"
      >
        {addLabel}
      </button>
    </section>
  );
}

function BusinessCard({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] bg-white p-5 shadow-xl shadow-black/5 ring-1 ring-black/5">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-xl font-black text-zinc-950">{title}</h3>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ChipGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-black text-zinc-700">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(active ? "" : option.value)}
              className={[
                "rounded-full px-3 py-2 text-xs font-black transition",
                active
                  ? "bg-zinc-950 text-white shadow-md shadow-black/10"
                  : "bg-[#fbf7ef] text-zinc-600 hover:bg-[#f5ead9]",
              ].join(" ")}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  highlight = false,
  variant = "open",
}: {
  label: string;
  value: string;
  highlight?: boolean;
  variant?: "open" | "positive" | "neutral" | "negative";
}) {
  const highlightClass =
    variant === "positive"
      ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20"
      : variant === "negative"
        ? "bg-rose-500 text-white shadow-xl shadow-rose-500/20"
        : variant === "neutral"
          ? "bg-zinc-300 text-zinc-900"
          : "bg-zinc-200 text-zinc-600";

  return (
    <div
      className={[
        "rounded-2xl px-5 py-5 ring-1 ring-black/5",
        highlight ? highlightClass : "bg-[#fbf7ef] text-zinc-950",
      ].join(" ")}
    >
      <p
        className={[
          "text-[10px] font-black uppercase tracking-[0.18em]",
          highlight ? "text-current opacity-70" : "text-zinc-400",
        ].join(" ")}
      >
        {label}
      </p>

      <p className="mt-3 text-3xl font-black">{value}</p>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string | number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-xs font-black text-zinc-700">
      {label && <span>{label}</span>}
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        inputMode="decimal"
        className="h-12 rounded-2xl border border-zinc-200 bg-[#fbf7ef] px-4 text-sm font-semibold text-zinc-900 outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="grid gap-2 text-xs font-black text-zinc-700">
      {label && <span>{label}</span>}
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 rounded-2xl border border-zinc-200 bg-[#fbf7ef] px-4 text-sm font-semibold text-zinc-900 outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
      >
        <option value="">Bitte wählen</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
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

function addMoneyItem(setItems: React.Dispatch<React.SetStateAction<MoneyItem[]>>) {
  setItems((prev) => [...prev, { label: "", amount: "" }]);
}

function removeMoneyItem(
  setItems: React.Dispatch<React.SetStateAction<MoneyItem[]>>,
  index: number
) {
  setItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
}

function toNumber(value?: string | number) {
  if (value === undefined || value === null || value === "") return 0;

  const normalized = String(value).replace(",", ".");
  const parsed = Number(normalized);

  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatEuro(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatValue(value: number, suffix: "€" | "%") {
  if (suffix === "%") return `${value.toFixed(0)} %`;
  return formatEuro(value);
}

function formatShowReference(show?: ShowContext) {
  const venue = show?.venue || "Location offen";
  const city = show?.city || "Ort offen";
  const date = formatDate(show?.show_date);

  return `${venue} · ${city} · ${date}`;
}

function formatDate(date?: string | null) {
  if (!date) return "Datum offen";

  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "Datum offen";

  return parsed.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}