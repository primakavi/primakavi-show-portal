import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

type ShowRow = {
  id: string;
  show_date: string | null;
  program: string | null;
  venue: string | null;
  city: string | null;
  internal_status: string | null;
};

type EconomicsRow = {
  show_id: string;
  revenue_total?: number | string | null;
  cost_travel?: number | string | null;
  cost_hotel?: number | string | null;
  cost_fee?: number | string | null;
  cost_misc?: number | string | null;
  profit?: number | string | null;
  revenue_items?: unknown;
  cost_items?: unknown;
};

type TravelLegRow = {
  show_id: string;
  direction: string | null;
  transport_type: string | null;
  from_place: string | null;
  to_place: string | null;
  actual_cost: number | string | null;
};

type FixedCostRow = {
  id: string;
  name: string;
  category: string | null;
  amount: number | string;
  amount_type: "net" | "gross";
  vat_rate: number | string;
  cadence: "monthly" | "yearly" | "one_off";
  valid_from: string | null;
  valid_to: string | null;
  notes: string | null;
};

const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; saved?: string; edit?: string; view?: string; showLimit?: string; locationLimit?: string; fixedCostLimit?: string }>;
}) {
  const params = await searchParams;
  const currentYear = new Date().getFullYear();
  const selectedYear = Number(params.year) || currentYear;
  const currentView = ["overview", "shows", "programmes", "locations", "variable-costs", "fixed-costs", "break-even"].includes(params.view || "")
    ? String(params.view)
    : "overview";
  const showLimit = Math.max(10, Number(params.showLimit) || 10);
  const locationLimit = Math.max(10, Number(params.locationLimit) || 10);
  const fixedCostLimit = Math.max(10, Number(params.fixedCostLimit) || 10);
  const start = `${selectedYear}-01-01`;
  const end = `${selectedYear}-12-31`;

  const [showsResult, economicsResult, fixedCostsResult, travelResult] = await Promise.all([
    supabaseAdmin
      .schema("booking")
      .from("shows")
      .select("id,show_date,program,venue,city,internal_status")
      .gte("show_date", start)
      .lte("show_date", end)
      .order("show_date", { ascending: true }),
    supabaseAdmin.schema("booking").from("show_economics").select("*"),
    supabaseAdmin.schema("booking").from("fixed_costs").select("*").order("name"),
    supabaseAdmin
      .schema("booking")
      .from("show_travel_legs")
      .select("show_id,direction,transport_type,from_place,to_place,actual_cost"),
  ]);

  const allShows = (showsResult.data || []) as ShowRow[];
  const playedShows = allShows.filter((show) => isPlayedStatus(show.internal_status));
  const cancelledShows = allShows.filter((show) => isCancelledStatus(show.internal_status));
  const shows = playedShows;
  const economics = (economicsResult.data || []) as EconomicsRow[];
  const travelLegs = (travelResult.data || []) as TravelLegRow[];

  const travelLegsByShow = new Map<string, TravelLegRow[]>();
  for (const leg of travelLegs) {
    const current = travelLegsByShow.get(leg.show_id) || [];
    current.push(leg);
    travelLegsByShow.set(leg.show_id, current);
  }

  const fixedCostsTableMissing = Boolean(fixedCostsResult.error);
  const fixedCosts = fixedCostsTableMissing
    ? []
    : ([...((fixedCostsResult.data || []) as FixedCostRow[])].sort((a, b) => {
        const aTime = a.valid_from ? new Date(`${a.valid_from}T12:00:00`).getTime() : 0;
        const bTime = b.valid_from ? new Date(`${b.valid_from}T12:00:00`).getTime() : 0;
        return bTime - aTime;
      }));
  const editingFixedCost = params.edit ? fixedCosts.find((item) => item.id === params.edit) || null : null;

  const showIds = new Set(shows.map((show) => show.id));
  const economicsRowsByShow = new Map(
    economics
      .filter((row) => showIds.has(row.show_id) && hasEconomicData(row))
      .map((row) => [row.show_id, row])
  );

  const economicsByShow = new Map(
    Array.from(economicsRowsByShow.entries()).map(([showId, row]) => {
      const automaticTravelItems = travelCostItems(travelLegsByShow.get(showId) || []);
      const manualCostItems = manualEconomicCostItems(row.cost_items, automaticTravelItems);

      return [
        showId,
        economicsValues(row, automaticTravelItems, manualCostItems),
      ];
    })
  );

  const totalRevenue = sum(shows.map((show) => economicsByShow.get(show.id)?.revenue || 0));
  const variableCosts = sum(shows.map((show) => economicsByShow.get(show.id)?.costs || 0));
  const contribution = totalRevenue - variableCosts;
  const fixedCostsForYear = fixedCosts.reduce(
    (total, item) => total + fixedCostForYear(item, selectedYear),
    0
  );

  const fixedCostCategoryMap = new Map<string, number>();
  for (const item of fixedCosts) {
    const amount = fixedCostForYear(item, selectedYear);
    if (amount <= 0) continue;
    const category = item.category?.trim() || "Sonstiges";
    fixedCostCategoryMap.set(category, (fixedCostCategoryMap.get(category) || 0) + amount);
  }

  const fixedCostCategories = Array.from(fixedCostCategoryMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      share: fixedCostsForYear > 0 ? amount / fixedCostsForYear : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const fixedCostCategoryMax = Math.max(
    1,
    ...fixedCostCategories.map((item) => item.amount)
  );
  const operatingResult = contribution - fixedCostsForYear;

  const showsWithEconomics = shows.filter((show) => economicsByShow.has(show.id));
  const avgContribution = showsWithEconomics.length ? contribution / showsWithEconomics.length : 0;
  const breakEvenShows = fixedCostsForYear > 0 && avgContribution > 0
    ? Math.ceil(fixedCostsForYear / avgContribution)
    : null;

  const monthly = MONTHS.map((label, monthIndex) => {
    const monthShows = shows.filter((show) => {
      if (!show.show_date) return false;
      return new Date(`${show.show_date}T12:00:00`).getMonth() === monthIndex;
    });
    const revenue = sum(monthShows.map((show) => economicsByShow.get(show.id)?.revenue || 0));
    const costs = sum(monthShows.map((show) => economicsByShow.get(show.id)?.costs || 0));
    const monthlyFixedCosts = sum(
      fixedCostsTableMissing
        ? []
        : fixedCosts.map((item) => fixedCostForMonth(item, selectedYear, monthIndex))
    );
    const result = revenue - costs - monthlyFixedCosts;
    return { label, revenue, costs, fixedCosts: monthlyFixedCosts, result };
  });
  const rawMaxMonthly = Math.max(1, ...monthly.flatMap((m) => [m.revenue, m.costs, m.fixedCosts]));
  const { max: maxMonthly, ticks: yAxisTicks } = chartScale(rawMaxMonthly);

  const showDetails = shows.map((show) => {
    const econ = economicsByShow.get(show.id);
    const rawEconomics = economicsRowsByShow.get(show.id);
    const automaticTravelItems = travelCostItems(travelLegsByShow.get(show.id) || []);
    const manualCostItems = manualEconomicCostItems(
      rawEconomics?.cost_items,
      automaticTravelItems
    );

    return {
      ...show,
      hasEconomics: Boolean(econ),
      revenue: econ?.revenue || 0,
      costs: econ?.costs || 0,
      contribution: (econ?.revenue || 0) - (econ?.costs || 0),
      revenueItems: economicItems(rawEconomics?.revenue_items),
      costItems: [...automaticTravelItems, ...manualCostItems],
    };
  });

  const variableCostCategoryLabels: Record<string, string> = {
    travel: "Reisekosten",
    accommodation: "Übernachtung",
    musician: "Musiker / Begleitung",
    tech: "Technik",
    catering: "Verpflegung",
    shipping: "Versand / Porto",
    other: "Sonstige direkte Kosten",
  };

  function legacyVariableCostCategory(label: string) {
    const value = label.toLowerCase().trim();

    if (
      /(hinfahrt|rückfahrt|rueckfahrt|reise|bahn|zug|ice|fahrt|fahrkarte|kilometer|km|flug|mietwagen|taxi|uber|bolt)/.test(
        value
      )
    ) {
      return "Reisekosten";
    }

    if (/(hotel|übernacht|uebernacht|unterkunft|pension)/.test(value)) {
      return "Übernachtung";
    }

    if (/(markus|musiker|begleitung|pianist)/.test(value)) {
      return "Musiker / Begleitung";
    }

    if (/(technik|ton|licht|mikro|sound)/.test(value)) {
      return "Technik";
    }

    if (/(essen|verpflegung|catering|meal|restaurant)/.test(value)) {
      return "Verpflegung";
    }

    if (/(porto|versand|post)/.test(value)) {
      return "Versand / Porto";
    }

    return "Sonstige direkte Kosten";
  }

  function variableCostCategory(item: {
    label: string;
    category?: string;
  }) {
    const storedCategory = String(item.category || "").trim();

    // Neue Wirtschaftsdaten:
    // Die in der Show-Akte gespeicherte Oberkategorie ist maßgeblich.
    if (storedCategory && variableCostCategoryLabels[storedCategory]) {
      return variableCostCategoryLabels[storedCategory];
    }

    // Zusätzliche Absicherung, falls einmal der sichtbare Kategoriename
    // statt des technischen Keys gespeichert wurde.
    const matchingLabel = Object.values(variableCostCategoryLabels).find(
      (label) => label.toLowerCase() === storedCategory.toLowerCase()
    );
    if (matchingLabel) {
      return matchingLabel;
    }

    // Historische Datensätze haben noch keine category.
    // Nur für diese alten Einträge wird aus der Bezeichnung abgeleitet.
    return legacyVariableCostCategory(item.label);
  }

  const variableCostMap = new Map<string, {
    category: string;
    amount: number;
    showIds: Set<string>;
    items: { showId: string; date: string | null | undefined; venue: string | null | undefined; label: string; amount: number }[];
  }>();

  for (const show of showDetails) {
    if (!show.hasEconomics) continue;
    for (const item of show.costItems) {
      if (!item.amount) continue;
      const category = variableCostCategory(item);
      const current = variableCostMap.get(category) || {
        category,
        amount: 0,
        showIds: new Set<string>(),
        items: [],
      };
      current.amount += item.amount;
      current.showIds.add(show.id);
      current.items.push({
        showId: show.id,
        date: show.show_date,
        venue: show.venue,
        label: item.label,
        amount: item.amount,
      });
      variableCostMap.set(category, current);
    }
  }

  const variableCostDetails = Array.from(variableCostMap.values())
    .map((item) => ({
      ...item,
      affectedShows: item.showIds.size,
      share: variableCosts > 0 ? item.amount / variableCosts : 0,
      avgPerAffectedShow: item.showIds.size ? item.amount / item.showIds.size : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const variableCostMax = Math.max(1, ...variableCostDetails.map((item) => item.amount));
  const contributionMargin = totalRevenue > 0 ? contribution / totalRevenue : 0;
  const breakEvenRevenue = contributionMargin > 0 ? fixedCostsForYear / contributionMargin : 0;
  const breakEvenProgress = fixedCostsForYear > 0 ? Math.max(0, contribution / fixedCostsForYear) : 0;
  const contributionGap = Math.max(0, fixedCostsForYear - contribution);
  const remainingBreakEvenShows = avgContribution > 0 ? Math.ceil(contributionGap / avgContribution) : 0;

  const programmeMap = new Map<string, {
    name: string;
    played: number;
    evaluated: number;
    revenue: number;
    costs: number;
    contribution: number;
    shows: typeof showDetails;
  }>();

  for (const show of showDetails) {
    const name = show.program?.trim() || "Ohne Programm";
    const current = programmeMap.get(name) || {
      name, played: 0, evaluated: 0, revenue: 0, costs: 0, contribution: 0, shows: [],
    };
    current.played += 1;
    current.shows.push(show);
    if (show.hasEconomics) {
      current.evaluated += 1;
      current.revenue += show.revenue;
      current.costs += show.costs;
      current.contribution += show.contribution;
    }
    programmeMap.set(name, current);
  }

  const programmeDetails = Array.from(programmeMap.values())
    .map((programme) => ({
      ...programme,
      avgRevenue: programme.evaluated ? programme.revenue / programme.evaluated : 0,
      avgContribution: programme.evaluated ? programme.contribution / programme.evaluated : 0,
    }))
    .sort((a, b) => b.contribution - a.contribution);

  const locationMap = new Map<string, {
    name: string;
    city: string;
    played: number;
    evaluated: number;
    revenue: number;
    costs: number;
    contribution: number;
    shows: typeof showDetails;
  }>();

  for (const show of showDetails) {
    const name = show.venue?.trim() || "Location offen";
    const city = show.city?.trim() || "";
    const key = `${name}__${city}`;
    const current = locationMap.get(key) || {
      name,
      city,
      played: 0,
      evaluated: 0,
      revenue: 0,
      costs: 0,
      contribution: 0,
      shows: [],
    };

    current.played += 1;
    current.shows.push(show);

    if (show.hasEconomics) {
      current.evaluated += 1;
      current.revenue += show.revenue;
      current.costs += show.costs;
      current.contribution += show.contribution;
    }

    locationMap.set(key, current);
  }

  const locationDetails = Array.from(locationMap.values())
    .map((location) => ({
      ...location,
      avgRevenue: location.evaluated ? location.revenue / location.evaluated : 0,
      avgContribution: location.evaluated ? location.contribution / location.evaluated : 0,
    }))
    .sort((a, b) => b.contribution - a.contribution);

  async function addFixedCost(formData: FormData) {
    "use server";
    const name = String(formData.get("name") || "").trim();
    const amount = parseGermanNumber(formData.get("amount"));
    if (!name || amount === null) return;

    const { error } = await supabaseAdmin.schema("booking").from("fixed_costs").insert({
      name,
      amount,
      amount_type: String(formData.get("amount_type") || "net"),
      vat_rate: Number(formData.get("vat_rate") || 0),
      category: nullable(formData.get("category")),
      cadence: String(formData.get("cadence") || "monthly"),
      valid_from: nullable(formData.get("valid_from")),
      valid_to: nullable(formData.get("valid_to")),
      notes: nullable(formData.get("notes")),
    });
    if (error) throw new Error(error.message);
    revalidatePath("/admin/analytics");
    redirect(`/admin/analytics?year=${selectedYear}&view=fixed-costs&saved=1`);
  }

  async function updateFixedCost(formData: FormData) {
    "use server";
    const id = String(formData.get("id") || "");
    const name = String(formData.get("name") || "").trim();
    const amount = parseGermanNumber(formData.get("amount"));
    if (!id || !name || amount === null) return;

    const { error } = await supabaseAdmin
      .schema("booking")
      .from("fixed_costs")
      .update({
        name,
        amount,
        amount_type: String(formData.get("amount_type") || "net"),
        vat_rate: Number(formData.get("vat_rate") || 0),
        category: nullable(formData.get("category")),
        cadence: String(formData.get("cadence") || "monthly"),
        valid_from: nullable(formData.get("valid_from")),
        notes: nullable(formData.get("notes")),
      })
      .eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/admin/analytics");
    redirect(`/admin/analytics?year=${selectedYear}&view=fixed-costs&saved=1`);
  }

  async function changeFixedCostFrom(formData: FormData) {
    "use server";
    const id = String(formData.get("id") || "");
    const effectiveFrom = String(formData.get("effective_from") || "");
    const amount = parseGermanNumber(formData.get("amount"));
    const amountType = String(formData.get("amount_type") || "net");
    const vatRate = Number(formData.get("vat_rate") || 0);

    if (!id || !effectiveFrom || amount === null) return;

    const { data: current, error: currentError } = await supabaseAdmin
      .schema("booking")
      .from("fixed_costs")
      .select("*")
      .eq("id", id)
      .single();

    if (currentError || !current) {
      throw new Error(currentError?.message || "Fixkosten-Eintrag nicht gefunden.");
    }

    const effectiveDate = new Date(`${effectiveFrom}T12:00:00`);
    const oldStart = current.valid_from ? new Date(`${current.valid_from}T12:00:00`) : null;
    if (oldStart && effectiveDate <= oldStart) {
      throw new Error("Das Änderungsdatum muss nach dem bisherigen Startdatum liegen.");
    }

    const previousDay = new Date(effectiveDate);
    previousDay.setDate(previousDay.getDate() - 1);
    const previousDayIso = [
      previousDay.getFullYear(),
      String(previousDay.getMonth() + 1).padStart(2, "0"),
      String(previousDay.getDate()).padStart(2, "0"),
    ].join("-");

    const { error: closeError } = await supabaseAdmin
      .schema("booking")
      .from("fixed_costs")
      .update({ valid_to: previousDayIso })
      .eq("id", id);

    if (closeError) throw new Error(closeError.message);

    const { error: insertError } = await supabaseAdmin
      .schema("booking")
      .from("fixed_costs")
      .insert({
        name: current.name,
        category: current.category,
        amount,
        amount_type: amountType,
        vat_rate: vatRate,
        cadence: current.cadence,
        valid_from: effectiveFrom,
        valid_to: null,
        notes: current.notes,
      });

    if (insertError) {
      // Best-effort rollback so the old row is not accidentally left closed.
      await supabaseAdmin
        .schema("booking")
        .from("fixed_costs")
        .update({ valid_to: current.valid_to ?? null })
        .eq("id", id);
      throw new Error(insertError.message);
    }

    revalidatePath("/admin/analytics");
    redirect(`/admin/analytics?year=${selectedYear}&view=fixed-costs&saved=1`);
  }

  async function deleteFixedCost(formData: FormData) {
    "use server";
    const id = String(formData.get("id") || "");
    if (!id) return;
    const { error } = await supabaseAdmin.schema("booking").from("fixed_costs").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin/analytics");
    redirect(`/admin/analytics?year=${selectedYear}&view=fixed-costs`);
  }

  return (
    <main className="text-zinc-950">
      <div className="space-y-5 text-zinc-950 sm:space-y-6">
        <header className="flex flex-col gap-5 px-1 py-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
              primakavi · booking crm
            </p>
            <h1 className="mt-2 text-5xl font-black tracking-tight">
              Auswertung
            </h1>
            <p className="mt-2 text-zinc-500">
              Wirtschaftlichkeit, Ergebnis und Planung im Überblick.
            </p>
          </div>

          <form className="flex items-center gap-2">
            <input type="hidden" name="view" value={currentView} />
            <select
              name="year"
              defaultValue={selectedYear}
              className="rounded-full border border-[#ded9cc] bg-white px-4 py-2.5 text-sm font-bold shadow-sm outline-none"
            >
              {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <button className="rounded-full bg-[#20201d] px-5 py-2.5 text-sm font-black text-white">
              Anzeigen
            </button>
          </form>
        </header>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Metric icon="↗" label="Umsatz" value={euro(totalRevenue)} note={`${showsWithEconomics.length} von ${shows.length} gespielten Shows mit Wirtschaftsdaten`} tone="green" />
          <Metric icon="↓" label="Direkte Show-Kosten" value={euro(variableCosts)} note="direkt den Shows zugeordnet" />
          <Metric icon="◎" label="Deckungsbeitrag" value={euro(contribution)} note="Umsatz − direkte Show-Kosten" tone="blue" />
          <Metric icon="⌂" label="Fixkosten" value={fixedCostsTableMissing ? "—" : euro(fixedCostsForYear)} note={fixedCostsTableMissing ? "Migration noch ausführen" : `${fixedCosts.length} Kostenpositionen`} />
          <Metric icon="★" label="Ergebnis" value={fixedCostsTableMissing ? "—" : euro(operatingResult)} note="Deckungsbeitrag − Fixkosten" tone={operatingResult >= 0 ? "pink" : "red"} />
        </section>

        <nav className="flex flex-wrap items-center gap-2 rounded-[24px] border border-[#e2ddd1] bg-white p-3 shadow-sm">
          <ViewTab href={`/admin/analytics?year=${selectedYear}&view=overview`} active={currentView === "overview"}>Übersicht</ViewTab>
          <ViewTab href={`/admin/analytics?year=${selectedYear}&view=shows`} active={currentView === "shows"}>Shows</ViewTab>
          <ViewTab href={`/admin/analytics?year=${selectedYear}&view=programmes`} active={currentView === "programmes"}>Programme</ViewTab>
          <ViewTab href={`/admin/analytics?year=${selectedYear}&view=locations`} active={currentView === "locations"}>Locations</ViewTab>
          <ViewTab href={`/admin/analytics?year=${selectedYear}&view=variable-costs`} active={currentView === "variable-costs"}>Variable Kosten</ViewTab>
          <ViewTab href={`/admin/analytics?year=${selectedYear}&view=fixed-costs`} active={currentView === "fixed-costs"}>Fixkosten</ViewTab>
          <ViewTab href={`/admin/analytics?year=${selectedYear}&view=break-even`} active={currentView === "break-even"}>Break-even</ViewTab>
          {params.saved === "1" && (
            <span className="ml-auto rounded-full bg-[#dff2b3] px-3 py-2 text-xs font-black text-[#547000]">
              ✓ Gespeichert
            </span>
          )}
        </nav>

        {currentView === "overview" && (
          <>
        <section id="break-even" className="grid gap-5 xl:grid-cols-[1.45fr_.85fr]">
          <Card>
            <SectionHeader eyebrow="Jahresverlauf" title={`Umsatz & Kosten ${selectedYear}`} note="Nur vorhandene Wirtschaftsdaten – keine Schätzwerte." />
            <div className="mt-8 grid grid-cols-[64px_1fr] gap-3">
              <div className="relative h-56">
                {yAxisTicks.map((tick, index) => (
                  <div
                    key={tick}
                    className="absolute right-0 -translate-y-1/2 pr-1 text-[11px] font-semibold tabular-nums text-[#8b887f]"
                    style={{ top: `${(index / (yAxisTicks.length - 1)) * 100}%` }}
                  >
                    {formatChartEuro(tick)}
                  </div>
                ))}
              </div>

              <div>
                <div className="relative h-56 border-l border-[#d8d3c8]">
                  {yAxisTicks.map((tick, index) => (
                    <div
                      key={tick}
                      className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-[#e8e3d9]"
                      style={{ top: `${(index / (yAxisTicks.length - 1)) * 100}%` }}
                    />
                  ))}

                  <div className="absolute inset-0 grid grid-cols-12 gap-2 px-2">
                    {monthly.map((item) => (
                      <div key={item.label} className="flex h-full items-end justify-center gap-1">
                        <Bar
                          height={(item.revenue / maxMonthly) * 100}
                          className="bg-[#dbe76e] hover:brightness-95 hover:ring-2 hover:ring-[#c9d65c]/40"
                          title={`Umsatz · ${item.label} ${selectedYear}: ${euro(item.revenue)}`}
                        />
                        <Bar
                          height={(item.costs / maxMonthly) * 100}
                          className="bg-[#d7d7d2] hover:brightness-95 hover:ring-2 hover:ring-[#b9b9b3]/50"
                          title={`Direkte Show-Kosten · ${item.label} ${selectedYear}: ${euro(item.costs)}`}
                        />
                        <Bar
                          height={(item.fixedCosts / maxMonthly) * 100}
                          className="bg-[#eadfc8] hover:brightness-95 hover:ring-2 hover:ring-[#d7c9ad]/50"
                          title={`Fixkosten · ${item.label} ${selectedYear}: ${euro(item.fixedCosts)} · anteilig für diesen Monat`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-12 gap-2 px-2">
                  {monthly.map((item) => (
                    <div key={item.label} className="text-center text-xs font-semibold text-[#77746c]">
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-5 flex gap-5 text-xs font-semibold text-[#6f6c65]">
              <Legend colorClass="bg-[#dbe76e]">Umsatz</Legend>
              <Legend colorClass="bg-[#d7d7d2]">direkte Kosten</Legend>
              <Legend colorClass="bg-[#eadfc8]">Fixkosten anteilig</Legend>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="bg-[#fffde9]">
              <SectionHeader
                eyebrow="Break-even"
                title={fixedCostsTableMissing ? "Fixkosten fehlen noch" : fixedCostsForYear <= 0 ? "Fixkosten erfassen" : contribution >= fixedCostsForYear ? "✓ Break-even erreicht" : "Noch nicht erreicht"}
                note="Vom Umsatz bis zur Deckung der Fixkosten."
              />
              {!fixedCostsTableMissing && fixedCostsForYear > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#e8e1cd] pb-2 text-sm">
                    <span className="text-[#77746c]">Umsatz</span>
                    <span className="font-black">{euro(totalRevenue)}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#e8e1cd] pb-2 text-sm">
                    <span className="text-[#77746c]">− variable Showkosten</span>
                    <span className="font-black">{euro(variableCosts)}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#d8d1bc] pb-3 text-sm">
                    <span className="font-bold">= Deckungsbeitrag</span>
                    <span className="font-black">{euro(contribution)}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#e8e1cd] pb-2 text-sm">
                    <span className="text-[#77746c]">− Fixkosten</span>
                    <span className="font-black">{euro(fixedCostsForYear)}</span>
                  </div>

                  <div className="rounded-2xl bg-white/80 p-4">
                    <div className="text-xs font-black uppercase tracking-[.08em] text-[#88857d]">
                      {contribution >= fixedCostsForYear ? "Über Break-even" : "Noch zu decken"}
                    </div>
                    <div className="mt-1 text-2xl font-black">
                      {euro(Math.abs(contribution - fixedCostsForYear))}
                    </div>
                    <div className="mt-2 text-xs font-semibold text-[#77746c]">
                      {fixedCostsForYear > 0 ? `${Math.max(0, (contribution / fixedCostsForYear) * 100).toLocaleString("de-DE", { maximumFractionDigits: 1 })} % der Fixkosten gedeckt` : "—"}
                      {avgContribution > 0 && contribution < fixedCostsForYear ? ` · rechnerisch noch ${Math.ceil((fixedCostsForYear - contribution) / avgContribution)} Shows` : ""}
                    </div>
                  </div>
                </div>
              )}
            </Card>

            <Card>
              <SectionHeader eyebrow="Datenbasis · IST" title={`${shows.length} gespielte Shows in ${selectedYear}`} note={`${showsWithEconomics.length} davon haben Wirtschaftsdaten.`} />
              {cancelledShows.length > 0 && (
                <div className="mt-4 inline-flex rounded-full bg-[#f4dddd] px-3 py-1.5 text-xs font-black text-[#8b3535]">
                  {cancelledShows.length} {cancelledShows.length === 1 ? "Show abgesagt" : "Shows abgesagt"} · nicht in der Auswertung
                </div>
              )}
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#ece8df]">
                <div className="h-full rounded-full bg-[#dbe76e]" style={{ width: `${shows.length ? (showsWithEconomics.length / shows.length) * 100 : 0}%` }} />
              </div>
            </Card>
          </div>
        </section>

          </>
        )}

        {currentView === "fixed-costs" && (
          <>
        <section id="fixed-costs">
          <Card>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <SectionHeader eyebrow="Fixkosten" title="Kosten, die auch ohne Show anfallen" note="Monatlich, jährlich oder einmalig. Jahreskosten werden für die BWL-Auswertung anteilig auf aktive Monate verteilt." />
              {!fixedCostsTableMissing && (
                <div className="rounded-2xl bg-[#f0eedf] px-5 py-4 text-right">
                  <div className="text-xs font-bold uppercase tracking-wide text-[#817f77]">Summe {selectedYear}</div>
                  <div className="text-2xl font-black">{euro(fixedCostsForYear)}</div>
                </div>
              )}
            </div>

            {fixedCostsTableMissing ? (
              <div className="mt-6 rounded-2xl border border-dashed border-[#cfc9bb] bg-[#faf8f2] p-6">
                <div className="font-black">Fixkosten-Tabelle noch nicht vorhanden</div>
                <p className="mt-2 text-sm leading-6 text-[#77746c]">Führe zuerst die mitgelieferte SQL-Migration aus.</p>
              </div>
            ) : (
              <>
                {fixedCostCategories.length > 0 && (
                  <div className="mt-6 rounded-2xl border border-[#e4dfd4] bg-[#faf8f2] px-5 py-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <div className="text-[11px] font-black uppercase tracking-[.12em] text-[#9a978f]">Fixkosten nach Kategorie</div>
                        <div className="mt-1 text-lg font-black">Wo entstehen die Fixkosten?</div>
                      </div>
                      <div className="text-xs font-semibold text-[#88857d]">
                        periodisiert · netto · {selectedYear}
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      {fixedCostCategories.map((item) => (
                        <div
                          key={item.category}
                          className="grid grid-cols-[170px_1fr_105px] items-center gap-4"
                          title={`${item.category}: ${euro(item.amount)} · ${(item.share * 100).toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} % der Fixkosten`}
                        >
                          <div className="truncate text-sm font-bold">{item.category}</div>
                          <div className="h-3 overflow-hidden rounded-full bg-[#ebe7dc]">
                            <div
                              className="h-full rounded-full bg-[#cfdc6a] transition-all duration-200 hover:brightness-95"
                              style={{ width: `${Math.max(4, (item.amount / fixedCostCategoryMax) * 100)}%` }}
                            />
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-black">{euro(item.amount)}</div>
                            <div className="text-[10px] font-bold text-[#9a978f]">
                              {(item.share * 100).toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}



                <form action={addFixedCost} className="mt-7 grid gap-3 rounded-2xl bg-[#f0eedf] p-4 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_.7fr_.65fr_.55fr_.8fr_.8fr_auto]">
                  <Input name="name" placeholder="z. B. Website" required />
                  <select name="category" className={inputClass} defaultValue="Software & Tools">
                    {['Software & Tools','Website & Hosting','Versicherungen','Marketing','Agentur / Verwaltung','Proberaum / Studio','Sonstiges'].map((v) => <option key={v}>{v}</option>)}
                  </select>
                  <Input name="amount" placeholder="Betrag" inputMode="decimal" required />
                  <select name="amount_type" className={inputClass} defaultValue="net">
                    <option value="net">netto</option>
                    <option value="gross">brutto</option>
                  </select>
                  <select name="vat_rate" className={inputClass} defaultValue="19">
                    <option value="0">0 % USt</option>
                    <option value="7">7 % USt</option>
                    <option value="19">19 % USt</option>
                  </select>
                  <select name="cadence" className={inputClass} defaultValue="monthly">
                    <option value="monthly">monatlich</option>
                    <option value="yearly">jährlich</option>
                    <option value="one_off">einmalig</option>
                  </select>
                  <Input name="valid_from" type="date" />
                  <button className="rounded-xl bg-[#20201d] px-5 py-3 text-sm font-black text-white">+ Fixkosten</button>
                </form>

                {editingFixedCost && (
                  <>
                  <form action={updateFixedCost} className="mt-4 rounded-2xl border border-[#d8d2c4] bg-[#fffdf7] p-4">
                    <input type="hidden" name="id" value={editingFixedCost.id} />
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-xs font-black uppercase tracking-[.12em] text-[#9a978f]">Fixkosten bearbeiten</div>
                        <div className="mt-1 text-lg font-black">{editingFixedCost.name}</div>
                      </div>
                      <Link
                        href={`/admin/analytics?year=${selectedYear}&view=fixed-costs`}
                        className="text-sm font-bold text-[#6f6c65] hover:underline"
                      >
                        Abbrechen
                      </Link>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.35fr_1fr_.7fr_.65fr_.55fr_.8fr_.8fr]">
                      <Input name="name" defaultValue={editingFixedCost.name} placeholder="Bezeichnung" required />
                      <select name="category" className={inputClass} defaultValue={editingFixedCost.category || "Sonstiges"}>
                        {['Software & Tools','Website & Hosting','Versicherungen','Marketing','Agentur / Verwaltung','Proberaum / Studio','Sonstiges'].map((v) => <option key={v}>{v}</option>)}
                      </select>
                      <Input
                        name="amount"
                        defaultValue={String(editingFixedCost.amount ?? "").replace(".", ",")}
                        placeholder="Betrag"
                        inputMode="decimal"
                        required
                      />
                      <select name="amount_type" className={inputClass} defaultValue={editingFixedCost.amount_type || "net"}>
                        <option value="net">netto</option>
                        <option value="gross">brutto</option>
                      </select>
                      <select name="vat_rate" className={inputClass} defaultValue={String(editingFixedCost.vat_rate ?? 0)}>
                        <option value="0">0 % USt</option>
                        <option value="7">7 % USt</option>
                        <option value="19">19 % USt</option>
                      </select>
                      <select name="cadence" className={inputClass} defaultValue={editingFixedCost.cadence}>
                        <option value="monthly">monatlich</option>
                        <option value="yearly">jährlich</option>
                        <option value="one_off">einmalig</option>
                      </select>
                      <Input name="valid_from" type="date" defaultValue={editingFixedCost.valid_from || ""} />
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
                      <Input name="notes" defaultValue={editingFixedCost.notes || ""} placeholder="Notiz (optional)" />
                      <button className="rounded-xl bg-[#20201d] px-5 py-3 text-sm font-black text-white">
                        Änderungen speichern
                      </button>
                    </div>

                    <p className="mt-3 text-xs leading-5 text-[#8b887f]">
                      Für Tippfehler und Korrekturen. Eine echte Preisänderung ab einem bestimmten Datum bilden wir separat ab.
                    </p>
                  </form>

                  <form action={changeFixedCostFrom} className="mt-3 rounded-2xl border border-[#e4dfd4] bg-white p-4">
                    <input type="hidden" name="id" value={editingFixedCost.id} />
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-black">Kostenänderung ab …</div>
                        <div className="mt-1 text-xs leading-5 text-[#77736b]">
                          Für echte Preisänderungen. Der bisherige Betrag bleibt für die Vergangenheit erhalten.
                        </div>
                      </div>

                      <label className="grid gap-1 text-xs font-bold text-[#77736b]">
                        Neuer Betrag
                        <Input
                          name="amount"
                          placeholder="Betrag"
                          inputMode="decimal"
                          required
                        />
                      </label>

                      <label className="grid gap-1 text-xs font-bold text-[#77736b]">
                        Eingabe
                        <select name="amount_type" className={inputClass} defaultValue={editingFixedCost.amount_type || "net"}>
                          <option value="net">netto</option>
                          <option value="gross">brutto</option>
                        </select>
                      </label>

                      <label className="grid gap-1 text-xs font-bold text-[#77736b]">
                        USt
                        <select name="vat_rate" className={inputClass} defaultValue={String(editingFixedCost.vat_rate ?? 0)}>
                          <option value="0">0 %</option>
                          <option value="7">7 %</option>
                          <option value="19">19 %</option>
                        </select>
                      </label>

                      <label className="grid gap-1 text-xs font-bold text-[#77736b]">
                        Gültig ab
                        <Input name="effective_from" type="date" required />
                      </label>

                      <div className="flex items-center gap-2">
                        <a
                          href={`/admin/analytics?year=${selectedYear}&view=fixed-costs`}
                          className="rounded-xl border border-[#d9d4c9] bg-white px-4 py-3 text-sm font-black text-[#555149] hover:bg-[#f7f5ef]"
                        >
                          Abbrechen
                        </a>
                        <button className="rounded-xl bg-[#20201d] px-5 py-3 text-sm font-black text-white">
                          Änderung übernehmen
                        </button>
                      </div>
                    </div>
                  </form>
                  </>
                )}

                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left">
                    <thead>
                      <tr className="border-b border-[#e4dfd4] text-[11px] uppercase tracking-wide text-[#88857d]">
                        <th className="px-3 py-2.5">Datum</th>
                        <th className="px-3 py-2.5">Bezeichnung</th>
                        <th className="px-3 py-2.5">Kategorie</th>
                        <th className="px-3 py-2.5">Rhythmus</th>
                        <th className="px-3 py-2.5 text-right">Eingabe</th>
                        <th className="px-3 py-2.5 text-right">Netto</th>
                        <th className="px-3 py-2.5 text-right">{selectedYear}</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {fixedCosts.slice(0, fixedCostLimit).map((item) => (
                        <tr key={item.id} className="border-b border-[#eee9df] last:border-0">
                          <td className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-[#6f6c65]">
                            {item.valid_from ? formatDate(item.valid_from) : "—"}
                          </td>
                          <td className="px-3 py-2.5 text-sm font-bold">{item.name}</td>
                          <td className="px-3 py-2.5 text-xs text-[#6f6c65]">{item.category || "—"}</td>
                          <td className="px-3 py-2.5 text-xs">{cadenceLabel(item.cadence)}</td>
                          <td className="px-3 py-2.5 text-right text-sm font-semibold">
                            <div>{euro(Number(item.amount || 0))}</div>
                            <div className="text-[10px] font-bold text-[#9a978f]">
                              {item.amount_type === "gross" ? "brutto" : "netto"} · {Number(item.vat_rate || 0)} % USt
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-right text-sm font-semibold">{euro(fixedCostNetAmount(item))}</td>
                          <td className="px-3 py-2.5 text-right text-sm font-black">{euro(fixedCostForYear(item, selectedYear))}</td>
                          <td className="px-3 py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link
                                href={`/admin/analytics?year=${selectedYear}&view=fixed-costs&edit=${item.id}&fixedCostLimit=${fixedCostLimit}`}
                                className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#4f5149] hover:bg-[#f2efe7]"
                              >
                                Bearbeiten
                              </Link>
                              <form action={deleteFixedCost}>
                                <input type="hidden" name="id" value={item.id} />
                                <button className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#9d4949] hover:bg-[#faeeee]">
                                  Löschen
                                </button>
                              </form>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!fixedCosts.length && (
                        <tr>
                          <td colSpan={8} className="px-3 py-8 text-center text-sm text-[#88857d]">
                            Noch keine Fixkosten erfasst.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {fixedCosts.length > 10 && (
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                      {fixedCostLimit < fixedCosts.length ? (
                        <Link
                          href={`/admin/analytics?year=${selectedYear}&view=fixed-costs&fixedCostLimit=${Math.min(fixedCostLimit + 10, fixedCosts.length)}`}
                          className="rounded-full border border-[#ddd7ca] bg-white px-5 py-2.5 text-sm font-black transition hover:border-[#c9d65c] hover:bg-[#faf8f2]"
                        >
                          Weitere Fixkosten anzeigen ({fixedCosts.length - fixedCostLimit})
                        </Link>
                      ) : (
                        <Link
                          href={`/admin/analytics?year=${selectedYear}&view=fixed-costs`}
                          className="rounded-full border border-[#ddd7ca] bg-white px-5 py-2.5 text-sm font-black transition hover:border-[#c9d65c] hover:bg-[#faf8f2]"
                        >
                          Weniger anzeigen
                        </Link>
                      )}
                      <span className="text-xs font-semibold text-[#9a978f]">
                        {Math.min(fixedCostLimit, fixedCosts.length)} von {fixedCosts.length} Fixkosten
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </Card>
        </section>

          </>
        )}

        {currentView === "variable-costs" && (
          <Card>
            <SectionHeader
              eyebrow="Variable Kosten · IST"
              title="Was kosten die gespielten Shows?"
              note="Automatisch aus den erfassten Wirtschaftsdaten der Shows. Originalbezeichnungen bleiben in den Show-Akten unverändert."
            />

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-[#faf8f2] p-5">
                <div className="text-[11px] font-black uppercase tracking-[.12em] text-[#9a978f]">Variable Kosten gesamt</div>
                <div className="mt-2 text-2xl font-black">{euro(variableCosts)}</div>
                <div className="mt-2 text-xs text-[#88857d]">{showsWithEconomics.length} Shows mit Wirtschaftsdaten</div>
              </div>
              <div className="rounded-2xl bg-[#faf8f2] p-5">
                <div className="text-[11px] font-black uppercase tracking-[.12em] text-[#9a978f]">Kostenquote</div>
                <div className="mt-2 text-2xl font-black">{totalRevenue ? `${((variableCosts / totalRevenue) * 100).toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %` : "—"}</div>
                <div className="mt-2 text-xs text-[#88857d]">Anteil der direkten Kosten am Umsatz</div>
              </div>
              <div className="rounded-2xl bg-[#faf8f2] p-5">
                <div className="text-[11px] font-black uppercase tracking-[.12em] text-[#9a978f]">Ø je ausgewerteter Show</div>
                <div className="mt-2 text-2xl font-black">{showsWithEconomics.length ? euro(variableCosts / showsWithEconomics.length) : "—"}</div>
                <div className="mt-2 text-xs text-[#88857d]">über alle Shows mit Wirtschaftsdaten</div>
              </div>
            </div>

            {variableCostDetails.length ? (
              <>
                <div className="mt-6 rounded-2xl border border-[#e4dfd4] bg-[#faf8f2] px-5 py-5">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-[.12em] text-[#9a978f]">Kosten nach Art</div>
                      <div className="mt-1 text-lg font-black">Wofür geht das Geld bei Shows drauf?</div>
                    </div>
                    <div className="text-xs font-semibold text-[#88857d]">IST · {selectedYear}</div>
                  </div>
                  <div className="mt-5 space-y-3">
                    {variableCostDetails.map((item) => (
                      <div key={item.category} className="grid grid-cols-[150px_1fr_105px] items-center gap-4" title={`${item.category}: ${euro(item.amount)} · ${(item.share * 100).toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} % der variablen Kosten`}>
                        <div className="truncate text-sm font-bold">{item.category}</div>
                        <div className="h-3 overflow-hidden rounded-full bg-[#ebe7dc]">
                          <div className="h-full rounded-full bg-[#cfdc6a]" style={{ width: `${Math.max(4, (item.amount / variableCostMax) * 100)}%` }} />
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black">{euro(item.amount)}</div>
                          <div className="text-[10px] font-bold text-[#9a978f]">{(item.share * 100).toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 overflow-x-auto">
                  <div className="min-w-[820px]">
                    <div className="grid grid-cols-[1.3fr_140px_150px_170px_42px] border-b border-[#e4dfd4] px-3 text-[11px] font-black uppercase tracking-wide text-[#88857d]">
                      <div className="py-2.5">Kostenart</div><div className="py-2.5 text-right">Gesamt</div>
                      <div className="py-2.5 text-right">Anteil</div><div className="py-2.5 text-right">Ø je betroffener Show</div><div />
                    </div>
                    {variableCostDetails.map((item) => (
                      <details key={item.category} className="group border-b border-[#eee9df] last:border-0">
                        <summary className="grid cursor-pointer list-none grid-cols-[1.3fr_140px_150px_170px_42px] items-center px-3 hover:bg-[#faf8f2] [&::-webkit-details-marker]:hidden">
                          <div className="py-3.5"><div className="font-black">{item.category}</div><div className="mt-1 text-xs text-[#88857d]">{item.affectedShows} {item.affectedShows === 1 ? "Show" : "Shows"} betroffen</div></div>
                          <div className="py-3.5 text-right font-black">{euro(item.amount)}</div>
                          <div className="py-3.5 text-right font-semibold">{(item.share * 100).toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %</div>
                          <div className="py-3.5 text-right font-semibold">{euro(item.avgPerAffectedShow)}</div>
                          <div className="flex justify-end py-3.5"><span className="transition group-open:rotate-180">⌄</span></div>
                        </summary>
                        <div className="border-t border-[#eee9df] bg-[#faf8f2] px-5 py-4">
                          <div className="space-y-2">
                            {item.items.map((cost, index) => (
                              <div key={`${cost.showId}-${cost.label}-${index}`} className="grid grid-cols-[120px_1fr_1fr_120px] gap-4 text-xs">
                                <div className="font-semibold">{formatDate(cost.date)}</div>
                                <Link href={`/admin/shows/${cost.showId}`} className="font-bold underline decoration-[#c9d65c] decoration-2 underline-offset-2">{cost.venue || "Location offen"}</Link>
                                <div className="text-[#77746c]">{cost.label}</div>
                                <div className="text-right font-black">{euro(cost.amount)}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-[#ddd7ca] bg-[#faf8f2] p-8 text-center text-sm font-semibold text-[#88857d]">
                Für {selectedYear} sind noch keine variablen Showkosten erfasst.
              </div>
            )}
          </Card>
        )}

        {currentView === "break-even" && (
          <div className="space-y-5">
            <Card>
              <SectionHeader
                eyebrow="Break-even · IST"
                title="Wann trägt sich das Künstlergeschäft?"
                note="Der Break-even ist erreicht, wenn die Deckungsbeiträge der Shows die periodisierten Fixkosten des Jahres vollständig decken."
              />

              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl bg-[#faf8f2] p-5">
                  <div className="text-[11px] font-black uppercase tracking-[.12em] text-[#9a978f]">Fixkosten</div>
                  <div className="mt-2 text-2xl font-black">{euro(fixedCostsForYear)}</div>
                  <div className="mt-2 text-xs text-[#88857d]">zu deckender Jahresblock</div>
                </div>
                <div className="rounded-2xl bg-[#faf8f2] p-5">
                  <div className="text-[11px] font-black uppercase tracking-[.12em] text-[#9a978f]">Deckungsbeitrag IST</div>
                  <div className="mt-2 text-2xl font-black">{euro(contribution)}</div>
                  <div className="mt-2 text-xs text-[#88857d]">nach direkten Showkosten</div>
                </div>
                <div className="rounded-2xl bg-[#faf8f2] p-5">
                  <div className="text-[11px] font-black uppercase tracking-[.12em] text-[#9a978f]">Noch zu decken</div>
                  <div className="mt-2 text-2xl font-black">{contributionGap > 0 ? euro(contributionGap) : euro(0)}</div>
                  <div className="mt-2 text-xs text-[#88857d]">{contribution >= fixedCostsForYear && fixedCostsForYear > 0 ? "Break-even erreicht" : "bis zum Break-even"}</div>
                </div>
                <div className="rounded-2xl bg-[#faf8f2] p-5">
                  <div className="text-[11px] font-black uppercase tracking-[.12em] text-[#9a978f]">Deckungsgrad</div>
                  <div className="mt-2 text-2xl font-black">{fixedCostsForYear > 0 ? `${(breakEvenProgress * 100).toLocaleString("de-DE", { maximumFractionDigits: 1 })} %` : "—"}</div>
                  <div className="mt-2 text-xs text-[#88857d]">Fixkosten bereits gedeckt</div>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-xs font-bold text-[#77746c]">
                  <span>Break-even-Fortschritt</span>
                  <span>{euro(Math.min(contribution, fixedCostsForYear))} / {euro(fixedCostsForYear)}</span>
                </div>
                <div className="h-4 overflow-hidden rounded-full bg-[#ece8df]">
                  <div className="h-full rounded-full bg-[#cfdc6a]" style={{ width: `${Math.min(100, breakEvenProgress * 100)}%` }} />
                </div>
              </div>
            </Card>

            <div className="grid gap-5 xl:grid-cols-2">
              <Card>
                <SectionHeader eyebrow="Break-even in Shows" title={avgContribution > 0 ? `${breakEvenShows} Shows rechnerisch nötig` : "Noch nicht berechenbar"} note="Auf Basis des bisherigen durchschnittlichen Deckungsbeitrags je wirtschaftlich ausgewerteter Show." />
                {avgContribution > 0 && (
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-[#faf8f2] p-5">
                      <div className="text-xs font-bold text-[#88857d]">Ø Deckungsbeitrag / Show</div>
                      <div className="mt-2 text-2xl font-black">{euro(avgContribution)}</div>
                    </div>
                    <div className="rounded-2xl bg-[#faf8f2] p-5">
                      <div className="text-xs font-bold text-[#88857d]">Ab heute rechnerisch noch</div>
                      <div className="mt-2 text-2xl font-black">{contributionGap > 0 ? `${remainingBreakEvenShows} Shows` : "0 Shows"}</div>
                    </div>
                  </div>
                )}
              </Card>

              <Card>
                <SectionHeader eyebrow="Break-even in Umsatz" title={breakEvenRevenue > 0 ? euro(breakEvenRevenue) : "Noch nicht berechenbar"} note="Umsatzschwelle bei gleichbleibender bisheriger Deckungsbeitragsmarge." />
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-[#faf8f2] p-5">
                    <div className="text-xs font-bold text-[#88857d]">DB-Marge</div>
                    <div className="mt-2 text-2xl font-black">{totalRevenue > 0 ? `${(contributionMargin * 100).toLocaleString("de-DE", { maximumFractionDigits: 1 })} %` : "—"}</div>
                    <div className="mt-2 text-xs text-[#88857d]">vom Umsatz bleibt nach direkten Kosten</div>
                  </div>
                  <div className="rounded-2xl bg-[#faf8f2] p-5">
                    <div className="text-xs font-bold text-[#88857d]">Bisheriger Umsatz</div>
                    <div className="mt-2 text-2xl font-black">{euro(totalRevenue)}</div>
                    <div className="mt-2 text-xs text-[#88857d]">IST aus erfassten Shows</div>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="bg-[#fffde9]">
              <SectionHeader
                eyebrow="Einordnung"
                title={fixedCostsForYear <= 0 ? "Fixkosten fehlen" : contribution >= fixedCostsForYear ? "✓ Break-even erreicht" : `${euro(contributionGap)} Deckungsbeitrag fehlen noch`}
                note={shows.length !== showsWithEconomics.length ? `Achtung: ${shows.length - showsWithEconomics.length} gespielte ${shows.length - showsWithEconomics.length === 1 ? "Show hat" : "Shows haben"} noch keine Wirtschaftsdaten. Die Break-even-Aussage ist deshalb noch unvollständig.` : "Alle gespielten Shows des Jahres sind wirtschaftlich erfasst."}
              />
            </Card>
          </div>
        )}

        {currentView === "shows" && (
          <>
        <section id="shows">
          <Card>
            <SectionHeader eyebrow="Shows im Detail · IST" title="Welche Show liefert welchen Deckungsbeitrag?" note="Hier erscheinen nur gespielte bzw. abgeschlossene Shows. Kommende und abgesagte Shows werden nicht mitgerechnet." />
            <div className="mt-6 overflow-x-auto">
              <div className="min-w-[950px]">
                <div className="grid grid-cols-[95px_1.25fr_1fr_135px_150px_170px_42px] border-b border-[#e4dfd4] px-3 text-xs font-black uppercase tracking-wide text-[#88857d]">
                  <div className="py-3">Datum</div>
                  <div className="py-3">Show</div>
                  <div className="py-3">Programm</div>
                  <div className="py-3 text-right">Umsatz</div>
                  <div className="py-3 text-right">direkte Kosten</div>
                  <div className="py-3 text-right">Deckungsbeitrag</div>
                  <div />
                </div>

                <div>
                  {showDetails.slice(0, showLimit).map((show) => (
                    <details key={show.id} className="group border-b border-[#eee9df] last:border-0">
                      <summary className="grid cursor-pointer list-none grid-cols-[95px_1.25fr_1fr_135px_150px_170px_42px] items-center px-3 transition hover:bg-[#faf8f2] [&::-webkit-details-marker]:hidden">
                        <div className="py-4 text-sm font-semibold">{formatDate(show.show_date)}</div>
                        <div className="py-4">
                          <div className="font-black">{show.venue || "Location offen"}</div>
                          <div className="mt-1 text-xs text-[#88857d]">{show.city || ""}</div>
                        </div>
                        <div className="py-4 text-sm">{show.program || "—"}</div>
                        <div className="py-4 text-right font-semibold">{show.hasEconomics ? euro(show.revenue) : "—"}</div>
                        <div className="py-4 text-right font-semibold">{show.hasEconomics ? euro(show.costs) : "—"}</div>
                        <div className="py-4 text-right">
                          {show.hasEconomics ? (
                            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-black ${show.contribution >= 0 ? "bg-[#e7f1c8] text-[#425300]" : "bg-[#f6dddd] text-[#8b3535]"}`}>
                              {euro(show.contribution)}
                            </span>
                          ) : "—"}
                        </div>
                        <div className="flex justify-end py-4">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-black text-[#77736b] transition group-open:rotate-180">⌄</span>
                        </div>
                      </summary>

                      <div className="border-t border-[#eee9df] bg-[#faf8f2] px-5 py-5">
                        {show.hasEconomics ? (
                          <div className="grid gap-6 md:grid-cols-[1fr_1.35fr_1fr_auto] md:items-start">
                            <EconomicBreakdown
                              label="Umsatz"
                              total={show.revenue}
                              items={show.revenueItems}
                              fallbackLabel="Gesamtumsatz"
                            />
                            <EconomicBreakdown
                              label="Direkte Kosten"
                              total={show.costs}
                              items={show.costItems}
                              fallbackLabel="Direkte Show-Kosten"
                            />
                            <div>
                              <div className="text-[11px] font-black uppercase tracking-[.12em] text-[#9a978f]">Deckungsbeitrag</div>
                              <div className="mt-2">
                                <span className={`inline-flex rounded-full px-3 py-1.5 text-base font-black ${show.contribution >= 0 ? "bg-[#e7f1c8] text-[#425300]" : "bg-[#f6dddd] text-[#8b3535]"}`}>
                                  {euro(show.contribution)}
                                </span>
                              </div>
                              <div className="mt-2 text-xs text-[#88857d]">Umsatz − direkte Show-Kosten</div>
                            </div>
                            <div className="md:text-right">
                              <Link href={`/admin/shows/${show.id}`} className="inline-flex rounded-full border border-[#ddd7ca] bg-white px-4 py-2 text-sm font-black transition hover:border-[#c9d65c]">
                                Show-Akte →
                              </Link>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <div className="font-black">Wirtschaftsdaten noch nicht erfasst</div>
                              <div className="mt-1 text-sm text-[#88857d]">Für diese gespielte Show fehlen noch Umsatz und direkte Show-Kosten.</div>
                            </div>
                            <Link href={`/admin/shows/${show.id}`} className="inline-flex w-fit rounded-full border border-[#ddd7ca] bg-white px-4 py-2 text-sm font-black transition hover:border-[#c9d65c]">
                              In der Show-Akte ergänzen →
                            </Link>
                          </div>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </div>

            {showDetails.length > 10 && (
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                {showLimit < showDetails.length ? (
                  <Link
                    href={`/admin/analytics?year=${selectedYear}&view=shows&showLimit=${Math.min(showLimit + 10, showDetails.length)}`}
                    className="rounded-full border border-[#ddd7ca] bg-white px-5 py-2.5 text-sm font-black transition hover:border-[#c9d65c] hover:bg-[#faf8f2]"
                  >
                    Weitere Shows anzeigen ({showDetails.length - showLimit})
                  </Link>
                ) : (
                  <Link
                    href={`/admin/analytics?year=${selectedYear}&view=shows`}
                    className="rounded-full border border-[#ddd7ca] bg-white px-5 py-2.5 text-sm font-black transition hover:border-[#c9d65c] hover:bg-[#faf8f2]"
                  >
                    Weniger anzeigen
                  </Link>
                )}
                <span className="text-xs font-semibold text-[#9a978f]">
                  {Math.min(showLimit, showDetails.length)} von {showDetails.length} Shows
                </span>
              </div>
            )}

            {cancelledShows.length > 0 && (
              <details className="mt-6 rounded-2xl border border-[#ead4d4] bg-[#fcf5f5] p-4">
                <summary className="cursor-pointer text-sm font-black text-[#8b3535]">
                  Abgesagte Shows anzeigen ({cancelledShows.length})
                </summary>
                <div className="mt-4 space-y-2">
                  {cancelledShows.map((show) => (
                    <div key={show.id} className="flex flex-col gap-2 rounded-xl bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-black">{show.venue || "Location offen"}</span>
                          <span className="rounded-full bg-[#f4dddd] px-2.5 py-1 text-[11px] font-black text-[#8b3535]">ABGESAGT</span>
                        </div>
                        <div className="mt-1 text-xs text-[#88857d]">
                          {formatDate(show.show_date)} · {show.city || "Ort offen"} · {show.program || "Programm offen"}
                        </div>
                      </div>
                      <Link href={`/admin/shows/${show.id}`} className="text-sm font-black underline decoration-[#c9d65c] decoration-2 underline-offset-4">
                        Show-Akte →
                      </Link>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </Card>
        </section>

          </>
        )}

        {currentView === "programmes" && (
          <Card>
            <SectionHeader
              eyebrow="Programme · IST"
              title="Welche Programme tragen wirtschaftlich?"
              note="Verglichen werden gespielte Shows. Umsatz und Deckungsbeitrag basieren nur auf Shows mit erfassten Wirtschaftsdaten."
            />
            <div className="mt-6 overflow-x-auto">
              <div className="min-w-[980px]">
                <div className="grid grid-cols-[1.45fr_100px_145px_145px_160px_175px_42px] border-b border-[#e4dfd4] px-3 text-xs font-black uppercase tracking-wide text-[#88857d]">
                  <div className="py-3">Programm</div><div className="py-3 text-right">Ausgewertet</div>
                  <div className="py-3 text-right">Umsatz</div><div className="py-3 text-right">Ø Umsatz</div>
                  <div className="py-3 text-right">Deckungsbeitrag</div><div className="py-3 text-right">Ø Deckungsbeitrag</div><div />
                </div>
                {programmeDetails.length ? programmeDetails.map((programme) => (
                  <details key={programme.name} className="group border-b border-[#eee9df] last:border-0">
                    <summary className="grid cursor-pointer list-none grid-cols-[1.45fr_100px_145px_145px_160px_175px_42px] items-center px-3 transition hover:bg-[#faf8f2] [&::-webkit-details-marker]:hidden">
                      <div className="py-4"><div className="font-black">{programme.name}</div></div>
                      <div className="py-4 text-right font-semibold">{programme.evaluated} / {programme.played}</div>
                      <div className="py-4 text-right font-semibold">{programme.evaluated ? euro(programme.revenue) : "—"}</div>
                      <div className="py-4 text-right font-semibold">{programme.evaluated ? euro(programme.avgRevenue) : "—"}</div>
                      <div className="py-4 text-right">{programme.evaluated ? <span className={`inline-flex rounded-full px-3 py-1 text-sm font-black ${programme.contribution >= 0 ? "bg-[#e7f1c8] text-[#425300]" : "bg-[#f6dddd] text-[#8b3535]"}`}>{euro(programme.contribution)}</span> : "—"}</div>
                      <div className="py-4 text-right font-black">{programme.evaluated ? euro(programme.avgContribution) : "—"}</div>
                      <div className="flex justify-end py-4"><span className="flex h-8 w-8 items-center justify-center text-lg font-black text-[#77736b] transition group-open:rotate-180">⌄</span></div>
                    </summary>
                    <div className="border-t border-[#eee9df] bg-[#faf8f2] px-5 py-5">
                      <div className="grid gap-10 md:grid-cols-[.75fr_1.6fr]">
                        <div>
                          <div className="text-[11px] font-black uppercase tracking-[.12em] text-[#9a978f]">Direkte Show-Kosten</div>
                          <div className="mt-2 text-xl font-black">{programme.evaluated ? euro(programme.costs) : "—"}</div>
                          <div className="mt-2 text-xs text-[#88857d]">{programme.evaluated && programme.revenue ? `${((programme.costs / programme.revenue) * 100).toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} % vom Umsatz` : "Noch keine Wirtschaftsdaten"}</div>
                        </div>
                        <div>
                          <div className="text-[11px] font-black uppercase tracking-[.12em] text-[#9a978f]">Shows im Programm</div>
                          <div className="mt-3 space-y-2">
                            {programme.shows.map((show) => (
                              <div key={show.id} className="flex items-center justify-between gap-4 text-xs">
                                <div className="min-w-0"><Link href={`/admin/shows/${show.id}`} className="font-bold underline decoration-[#c9d65c] decoration-2 underline-offset-2">{formatDate(show.show_date)} · {show.venue || "Location offen"}</Link>{!show.hasEconomics && <span className="ml-2 text-[#9a978f]">Wirtschaftsdaten fehlen</span>}</div>
                                <span className="shrink-0 font-black">{show.hasEconomics ? euro(show.contribution) : "—"}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </details>
                )) : <div className="px-3 py-10 text-center text-sm font-semibold text-[#88857d]">In {selectedYear} gibt es noch keine gespielten Shows.</div>}
              </div>
            </div>
          </Card>
        )}

        {currentView === "locations" && (
          <Card>
            <SectionHeader
              eyebrow="Locations · IST"
              title="Welche Locations funktionieren wirtschaftlich?"
              note="Verglichen werden gespielte Shows. Umsatz und Deckungsbeitrag basieren nur auf Shows mit erfassten Wirtschaftsdaten."
            />

            <div className="mt-6 overflow-x-auto">
              <div className="min-w-[1020px]">
                <div className="grid grid-cols-[1.45fr_105px_145px_145px_160px_175px_42px] border-b border-[#e4dfd4] px-3 text-xs font-black uppercase tracking-wide text-[#88857d]">
                  <div className="py-3">Location</div>
                  <div className="py-3 text-right">Ausgewertet</div>
                  <div className="py-3 text-right">Umsatz</div>
                  <div className="py-3 text-right">Ø Umsatz</div>
                  <div className="py-3 text-right">Deckungsbeitrag</div>
                  <div className="py-3 text-right">Ø Deckungsbeitrag</div>
                  <div />
                </div>

                {locationDetails.length ? (
                  <div>
                    {locationDetails.slice(0, locationLimit).map((location) => (
                      <details key={`${location.name}-${location.city}`} className="group border-b border-[#eee9df] last:border-0">
                        <summary className="grid cursor-pointer list-none grid-cols-[1.45fr_105px_145px_145px_160px_175px_42px] items-center px-3 transition hover:bg-[#faf8f2] [&::-webkit-details-marker]:hidden">
                          <div className="py-4">
                            <div className="font-black">{location.name}</div>
                            {location.city && <div className="mt-1 text-xs text-[#88857d]">{location.city}</div>}
                          </div>
                          <div className="py-4 text-right font-semibold">{location.evaluated} / {location.played}</div>
                          <div className="py-4 text-right font-semibold">{location.evaluated ? euro(location.revenue) : "—"}</div>
                          <div className="py-4 text-right font-semibold">{location.evaluated ? euro(location.avgRevenue) : "—"}</div>
                          <div className="py-4 text-right">
                            {location.evaluated ? (
                              <span className={`inline-flex rounded-full px-3 py-1 text-sm font-black ${location.contribution >= 0 ? "bg-[#e7f1c8] text-[#425300]" : "bg-[#f6dddd] text-[#8b3535]"}`}>
                                {euro(location.contribution)}
                              </span>
                            ) : "—"}
                          </div>
                          <div className="py-4 text-right font-black">{location.evaluated ? euro(location.avgContribution) : "—"}</div>
                          <div className="flex justify-end py-4">
                            <span className="flex h-8 w-8 items-center justify-center text-lg font-black text-[#77736b] transition group-open:rotate-180">⌄</span>
                          </div>
                        </summary>

                        <div className="border-t border-[#eee9df] bg-[#faf8f2] px-5 py-5">
                          <div className="grid gap-10 md:grid-cols-[.75fr_1.6fr]">
                            <div>
                              <div className="text-[11px] font-black uppercase tracking-[.12em] text-[#9a978f]">Direkte Show-Kosten</div>
                              <div className="mt-2 text-xl font-black">{location.evaluated ? euro(location.costs) : "—"}</div>
                              <div className="mt-2 text-xs text-[#88857d]">
                                {location.evaluated && location.revenue
                                  ? `${((location.costs / location.revenue) * 100).toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} % vom Umsatz`
                                  : "Noch keine Wirtschaftsdaten"}
                              </div>
                            </div>

                            <div>
                              <div className="text-[11px] font-black uppercase tracking-[.12em] text-[#9a978f]">Shows an dieser Location</div>
                              <div className="mt-3 space-y-2">
                                {location.shows.map((show) => (
                                  <div key={show.id} className="flex items-center justify-between gap-4 text-xs">
                                    <div className="min-w-0">
                                      <Link href={`/admin/shows/${show.id}`} className="font-bold underline decoration-[#c9d65c] decoration-2 underline-offset-2">
                                        {formatDate(show.show_date)} · {show.program || "Programm offen"}
                                      </Link>
                                      {!show.hasEconomics && <span className="ml-2 text-[#9a978f]">Wirtschaftsdaten fehlen</span>}
                                    </div>
                                    <span className="shrink-0 font-black">{show.hasEconomics ? euro(show.contribution) : "—"}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </details>
                    ))}

                    {locationDetails.length > 10 && (
                      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                        {locationLimit < locationDetails.length ? (
                          <Link
                            href={`/admin/analytics?year=${selectedYear}&view=locations&locationLimit=${Math.min(locationLimit + 10, locationDetails.length)}`}
                            className="rounded-full border border-[#ddd7ca] bg-white px-5 py-2.5 text-sm font-black transition hover:border-[#c9d65c] hover:bg-[#faf8f2]"
                          >
                            Weitere Locations anzeigen ({locationDetails.length - locationLimit})
                          </Link>
                        ) : (
                          <Link
                            href={`/admin/analytics?year=${selectedYear}&view=locations`}
                            className="rounded-full border border-[#ddd7ca] bg-white px-5 py-2.5 text-sm font-black transition hover:border-[#c9d65c] hover:bg-[#faf8f2]"
                          >
                            Weniger anzeigen
                          </Link>
                        )}
                        <span className="text-xs font-semibold text-[#9a978f]">
                          {Math.min(locationLimit, locationDetails.length)} von {locationDetails.length} Locations
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="px-3 py-10 text-center text-sm font-semibold text-[#88857d]">
                    In {selectedYear} gibt es noch keine gespielten Shows.
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

      </div>
    </main>
  );
}

function Card({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return <section id={id} className={`rounded-[24px] border border-[#e1dccf] bg-white/90 p-6 shadow-[0_8px_24px_rgba(45,40,28,.05)] ${className}`}>{children}</section>;
}

function Metric({ icon, label, value, note, tone }: { icon: string; label: string; value: string; note: string; tone?: "green" | "blue" | "pink" | "red" }) {
  const bg = tone === "green" ? "bg-[#dfe99a]" : tone === "blue" ? "bg-[#dfe8f4]" : tone === "pink" ? "bg-[#f4d9e7]" : tone === "red" ? "bg-[#f4dddd]" : "bg-[#efede6]";
  return <div className="rounded-[22px] border border-[#e1dccf] bg-white/90 p-5 shadow-[0_8px_20px_rgba(45,40,28,.04)]"><div className={`mb-5 flex h-10 w-10 items-center justify-center rounded-full ${bg}`}><span className="text-lg font-black">{icon}</span></div><div className="text-xs font-black uppercase tracking-[.08em] text-[#817f77]">{label}</div><div className="mt-2 text-3xl font-black tracking-tight">{value}</div><div className="mt-3 text-xs leading-5 text-[#89867e]">{note}</div></div>;
}

function SectionHeader({ eyebrow, title, note }: { eyebrow: string; title: string; note?: string }) {
  return <div><div className="text-xs font-black uppercase tracking-[.12em] text-[#9a978f]">{eyebrow}</div><h2 className="mt-1 text-2xl font-black tracking-tight">{title}</h2>{note && <p className="mt-2 text-sm leading-6 text-[#7b786f]">{note}</p>}</div>;
}

function ViewTab({ href, children, active = false }: { href: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-2.5 text-sm font-black transition ${
        active
          ? "bg-[#20201d] text-white"
          : "bg-[#f4f1e9] text-[#5f5b54] hover:bg-[#ebe7dc]"
      }`}
    >
      {children}
    </Link>
  );
}

function EconomicBreakdown({
  label,
  total,
  items,
  fallbackLabel,
}: {
  label: string;
  total: number;
  items: { label: string; amount: number }[];
  fallbackLabel: string;
}) {
  const visibleItems = items.length ? items : total !== 0 ? [{ label: fallbackLabel, amount: total }] : [];

  return (
    <div>
      <div className="text-[11px] font-black uppercase tracking-[.12em] text-[#9a978f]">{label}</div>
      <div className="mt-1 text-xl font-black">{euro(total)}</div>
      {visibleItems.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {visibleItems.map((item, index) => (
            <div key={`${item.label}-${index}`} className="flex max-w-[300px] items-center justify-between gap-5 text-xs">
              <span className="text-[#77736b]">{item.label}</span>
              <span className="font-bold text-[#4d4a44]">{euro(item.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Bar({ height, className, title }: { height: number; className: string; title?: string }) {
  return (
    <div
      className={`w-3 cursor-help rounded-t-md transition-all duration-150 ${className}`}
      style={{ height: `${Math.max(height > 0 ? 4 : 0, Math.min(100, height))}%` }}
      title={title}
    />
  );
}

function Legend({ colorClass, children }: { colorClass: string; children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-2"><span className={`h-3 w-3 rounded-sm ${colorClass}`} />{children}</span>;
}

const inputClass = "w-full rounded-xl border border-[#d9d4c7] bg-white px-4 py-3 text-sm outline-none placeholder:text-[#aaa79f] focus:border-[#aeb74f]";
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) { return <input {...props} className={`${inputClass} ${props.className || ""}`} />; }
function Placeholder() { return <div className="mt-6 rounded-2xl border border-dashed border-[#d4cec0] bg-[#faf8f2] p-7 text-center text-sm font-semibold text-[#8b887f]">Kommt nach der wirtschaftlichen Basis.</div>; }

function hasEconomicData(economics: EconomicsRow) {
  const revenueItems = Array.isArray(economics.revenue_items) ? economics.revenue_items : [];
  const costItems = Array.isArray(economics.cost_items) ? economics.cost_items : [];

  const hasFilledRevenueItem = revenueItems.some((item: any) => economicsNumber(item?.amount) !== 0);
  const hasFilledCostItem = costItems.some((item: any) => economicsNumber(item?.amount) !== 0);

  return (
    hasFilledRevenueItem ||
    hasFilledCostItem ||
    economicsNumber(economics.revenue_total) !== 0 ||
    economicsNumber(economics.cost_travel) !== 0 ||
    economicsNumber(economics.cost_hotel) !== 0 ||
    economicsNumber(economics.cost_fee) !== 0 ||
    economicsNumber(economics.cost_misc) !== 0
  );
}

function niceChartStep(value: number) {
  if (value <= 0) return 1;

  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;

  const nice =
    normalized <= 1 ? 1 :
    normalized <= 2 ? 2 :
    normalized <= 2.5 ? 2.5 :
    normalized <= 5 ? 5 :
    10;

  return nice * magnitude;
}

function chartScale(maxValue: number) {
  if (maxValue <= 0) {
    return { max: 1, ticks: [1, 0.5, 0] };
  }

  // Ziel: ungefähr 5 Intervalle und nur wenig Luft über dem höchsten Balken.
  // Beispiel: 2.200 € -> 2.500 € mit 500er-Schritten.
  const roughStep = maxValue / 5;
  const step = niceChartStep(roughStep);
  const max = Math.ceil(maxValue / step) * step;

  const ticks: number[] = [];
  for (let value = max; value >= 0; value -= step) {
    ticks.push(value);
  }

  return { max, ticks };
}

function formatChartEuro(value: number) {
  return `${value.toLocaleString("de-DE", { maximumFractionDigits: 0 })} €`;
}

function economicsNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const raw = String(value).trim();
  if (!raw) return 0;

  // Deutsche Eingaben wie "1.200,00" und "512,13" korrekt lesen.
  const normalized = raw.includes(",")
    ? raw.replace(/\./g, "").replace(",", ".")
    : raw;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function economicItems(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item: any) => {
      const category =
        typeof item?.category === "string"
          ? item.category.trim()
          : "";

      return {
        label: String(item?.label || "Position").trim() || "Position",
        amount: economicsNumber(item?.amount),
        ...(category ? { category } : {}),
      };
    })
    .filter((item) => item.amount !== 0);
}

function travelCostItems(legs: TravelLegRow[]) {
  return legs
    .map((leg) => {
      const amount = economicsNumber(leg.actual_cost);
      if (amount === 0) return null;

      const direction =
        leg.direction === "return"
          ? "Rückfahrt"
          : leg.direction === "outbound"
            ? "Hinfahrt"
            : "Fahrt";

      const transport = String(leg.transport_type || "").trim();
      const route = [leg.from_place, leg.to_place]
        .map((value) => String(value || "").trim())
        .filter(Boolean)
        .join(" → ");

      return {
        category: "travel",
        label: [direction, transport, route].filter(Boolean).join(" · "),
        amount,
        source: "show_akte",
      };
    })
    .filter(
      (
        item
      ): item is {
        category: string;
        label: string;
        amount: number;
        source: string;
      } => Boolean(item)
    );
}

function manualEconomicCostItems(
  value: unknown,
  automaticTravelItems: { label: string; amount: number; category?: string }[]
) {
  const items = economicItems(value);

  if (!automaticTravelItems.length) return items;

  const unusedAutomatic = automaticTravelItems.map((item) => ({
    ...item,
    used: false,
  }));

  return items.filter((item) => {
    const category =
      item.category || inferLegacyVariableCostKey(item.label);

    // Nur historische Reisekosten können Dubletten zu den
    // Reisestrecken aus der Show-Akte sein.
    if (category !== "travel") return true;

    const itemLabel = normalizeVariableCostLabel(item.label);

    const matchIndex = unusedAutomatic.findIndex((automatic) => {
      if (automatic.used) return false;

      const sameAmount =
        Math.abs(automatic.amount - item.amount) < 0.01;

      if (!sameAmount) return false;

      const automaticLabel = normalizeVariableCostLabel(automatic.label);

      const sameDirection =
        (itemLabel.includes("hinfahrt") &&
          automaticLabel.includes("hinfahrt")) ||
        ((itemLabel.includes("rückfahrt") ||
          itemLabel.includes("rueckfahrt")) &&
          automaticLabel.includes("rückfahrt"));

      return sameDirection || itemLabel === automaticLabel;
    });

    if (matchIndex === -1) return true;

    unusedAutomatic[matchIndex].used = true;
    return false;
  });
}

function normalizeVariableCostLabel(value: string) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function inferLegacyVariableCostKey(label: string) {
  const value = normalizeVariableCostLabel(label);

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

  if (/(markus|musiker|begleitung|pianist)/.test(value)) {
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

function economicsValues(
  economics: EconomicsRow,
  automaticTravelItems: { amount: number }[] = [],
  manualCostItems?: { amount: number }[]
) {
  const revenueItems = Array.isArray(economics.revenue_items)
    ? economics.revenue_items
    : [];

  const revenueItemValues = revenueItems
    .map((item: any) => economicsNumber(item?.amount))
    .filter((value: number) => value !== 0);

  const revenueFromItems = sum(revenueItemValues);

  const revenue =
    revenueItemValues.length > 0
      ? revenueFromItems
      : economicsNumber(economics.revenue_total);

  const automaticTravelCosts = sum(
    automaticTravelItems.map((item) => item.amount)
  );

  const cleanManualCostItems =
    manualCostItems ??
    economicItems(economics.cost_items);

  const manualCosts = sum(
    cleanManualCostItems.map((item) => item.amount)
  );

  // Neue Logik:
  // Reisekosten aus der Show-Akte + manuelle Zusatzkosten.
  //
  // Falls eine alte Show noch gar keine cost_items hat, bleiben die
  // historischen Legacy-Felder zusätzlich als Fallback erhalten.
  const hasManualItems = cleanManualCostItems.length > 0;

  const legacyNonTravelCosts =
    economicsNumber(economics.cost_hotel) +
    economicsNumber(economics.cost_fee) +
    economicsNumber(economics.cost_misc);

  const legacyTravelFallback =
    automaticTravelCosts === 0
      ? economicsNumber(economics.cost_travel)
      : 0;

  const costs = hasManualItems
    ? automaticTravelCosts + manualCosts
    : automaticTravelCosts +
      legacyTravelFallback +
      legacyNonTravelCosts;

  return { revenue, costs };
}

function normalizeStatus(value: string | null | undefined) {
  return String(value || "").trim().toLowerCase();
}

function isPlayedStatus(value: string | null | undefined) {
  return ["gespielt", "abgeschlossen"].includes(normalizeStatus(value));
}

function isCancelledStatus(value: string | null | undefined) {
  return ["abgesagt", "storniert", "cancelled", "canceled"].includes(normalizeStatus(value));
}

function fixedCostNetAmount(item: FixedCostRow) {
  const amount = Number(item.amount || 0);
  const vatRate = Number(item.vat_rate || 0);
  if (item.amount_type === "gross" && vatRate > 0) {
    return amount / (1 + vatRate / 100);
  }
  return amount;
}

function isFixedCostActiveInMonth(item: FixedCostRow, year: number, monthIndex: number) {
  const monthStart = new Date(year, monthIndex, 1, 12, 0, 0);
  const monthEnd = new Date(year, monthIndex + 1, 0, 12, 0, 0);
  const from = item.valid_from ? new Date(`${item.valid_from}T12:00:00`) : null;
  const to = item.valid_to ? new Date(`${item.valid_to}T12:00:00`) : null;

  if (from && from > monthEnd) return false;
  if (to && to < monthStart) return false;
  return true;
}

function fixedCostForMonth(item: FixedCostRow, year: number, monthIndex: number) {
  const amount = fixedCostNetAmount(item);

  if (item.cadence === "one_off") {
    if (!item.valid_from) return 0;
    const from = new Date(`${item.valid_from}T12:00:00`);
    return from.getFullYear() === year && from.getMonth() === monthIndex ? amount : 0;
  }

  if (!isFixedCostActiveInMonth(item, year, monthIndex)) return 0;

  if (item.cadence === "yearly") {
    return amount / 12;
  }

  return amount;
}

function fixedCostForYear(item: FixedCostRow, year: number) {
  return MONTHS.reduce(
    (total, _label, monthIndex) => total + fixedCostForMonth(item, year, monthIndex),
    0
  );
}

function cadenceLabel(value: FixedCostRow["cadence"]) { return value === "monthly" ? "monatlich" : value === "yearly" ? "jährlich" : "einmalig"; }
function parseGermanNumber(value: FormDataEntryValue | null) { if (value === null) return null; const n = Number(String(value).trim().replace(/\./g, "").replace(",", ".")); return Number.isFinite(n) ? n : null; }
function nullable(value: FormDataEntryValue | null) { const text = value === null ? "" : String(value).trim(); return text || null; }
function sum(values: number[]) { return values.reduce((total, value) => total + Number(value || 0), 0); }
function euro(value: number) { return value.toLocaleString("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function formatDate(value: string | null | undefined) { return value ? new Date(`${value}T12:00:00`).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "—"; }
