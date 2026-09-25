"use client";

import { useMemo, useState } from "react";

type Category = {
  id?: string;
  label?: string | null;
  price?: number | string | null;
  sold_count?: number | string | null;
};

type SettlementChoice = "calculated" | "manual";

function numberValue(value: unknown) {
  if (value === null || value === undefined || value === "") return 0;

  const parsed = Number(
    String(value).trim().replace(",", ".")
  );

  return Number.isFinite(parsed) ? parsed : 0;
}

export default function SettlementEditor({
  show,
  categories,
}: {
  show: any;
  categories: Category[];
}) {
  const base = numberValue(show.fee_base_amount);
  const artistShare = numberValue(show.fee_artist_share);
  const organizerShare = numberValue(show.fee_organizer_share);
  const threshold = numberValue(show.fee_share_threshold);

  const model = String(show.fee_model || "");
  const combo = String(
    show.fee_combination_mode || "minimum_or_share"
  );

  const ticketData = useMemo(() => {
    const salesMode =
      show.ticket_sales_mode === "categories"
        ? "categories"
        : "total";

    const totalTicketsSold = numberValue(show.tickets_sold);

    const usableCategories = categories.filter(
      (category) => numberValue(category.price) > 0
    );

    /*
     * ------------------------------------------------------------
     * MODUS: NACH PREISKATEGORIE
     * ------------------------------------------------------------
     *
     * Hier sind ausschließlich die Verkäufe je Kategorie maßgeblich.
     * Alte / zusätzliche Gesamtwerte werden nicht zur Umsatzberechnung
     * herangezogen.
     */

    if (salesMode === "categories") {
      const enteredCategories = usableCategories.filter(
        (category) =>
          category.sold_count !== null &&
          category.sold_count !== undefined &&
          String(category.sold_count).trim() !== ""
      );

      const soldTickets = enteredCategories.reduce(
        (sum, category) =>
          sum + numberValue(category.sold_count),
        0
      );

      const revenue = enteredCategories.reduce(
        (sum, category) =>
          sum +
          numberValue(category.price) *
            numberValue(category.sold_count),
        0
      );

      if (enteredCategories.length > 0) {
        return {
          soldTickets,
          revenue,
          source: "category_sales" as const,
          price: 0,
          categoryCount: usableCategories.length,
          enteredCategoryCount: enteredCategories.length,
          salesMode,
        };
      }

      return {
        soldTickets: 0,
        revenue: 0,
        source: "missing_category_sales" as const,
        price: 0,
        categoryCount: usableCategories.length,
        enteredCategoryCount: 0,
        salesMode,
      };
    }

    /*
     * ------------------------------------------------------------
     * MODUS: NUR GESAMTZAHL
     * ------------------------------------------------------------
     */

    if (totalTicketsSold <= 0) {
      return {
        soldTickets: 0,
        revenue: 0,
        source: "missing_tickets" as const,
        price: 0,
        categoryCount: usableCategories.length,
        enteredCategoryCount: 0,
        salesMode,
      };
    }

    /*
     * Genau eine Preiskategorie:
     *
     * Gesamtzahl × Ticketpreis ist eindeutig.
     */

    if (usableCategories.length === 1) {
      const price = numberValue(
        usableCategories[0].price
      );

      return {
        soldTickets: totalTicketsSold,
        revenue: totalTicketsSold * price,
        source: "single_category" as const,
        price,
        categoryCount: 1,
        enteredCategoryCount: 0,
        salesMode,
      };
    }

    /*
     * Mehrere Ticketpreise:
     *
     * Wir kennen zwar die Gesamtzahl, aber nicht die Verteilung.
     * Deshalb darf kein Ticketumsatz erfunden werden.
     */

    if (usableCategories.length > 1) {
      return {
        soldTickets: totalTicketsSold,
        revenue: 0,
        source: "multiple_prices" as const,
        price: 0,
        categoryCount: usableCategories.length,
        enteredCategoryCount: 0,
        salesMode,
      };
    }

    /*
     * Gesamtzahl vorhanden, aber kein Ticketpreis.
     */

    return {
      soldTickets: totalTicketsSold,
      revenue: 0,
      source: "missing_price" as const,
      price: 0,
      categoryCount: 0,
      enteredCategoryCount: 0,
      salesMode,
    };
  }, [
    categories,
    show.tickets_sold,
    show.ticket_sales_mode,
  ]);

  const ticketRevenue = ticketData.revenue;

  const normalShare =
    (ticketRevenue * artistShare) / 100;

  const thresholdShare =
    (Math.max(0, ticketRevenue - threshold) *
      artistShare) /
    100;

  let calculatedParticipation = 0;
  let calculatedTotal = 0;

  if (model === "fixed") {
    calculatedTotal = base;
  }

  if (model === "share") {
    calculatedParticipation = normalShare;
    calculatedTotal = normalShare;
  }

  if (model === "minimum_plus_share") {
    if (combo === "fixed_plus_share") {
      calculatedParticipation = normalShare;
      calculatedTotal =
        base + calculatedParticipation;
    } else if (
      combo === "fixed_plus_threshold_share"
    ) {
      calculatedParticipation = thresholdShare;
      calculatedTotal =
        base + calculatedParticipation;
    } else {
      calculatedParticipation = normalShare;
      calculatedTotal = Math.max(
        base,
        normalShare
      );
    }
  }

  const calculationPossible =
    model === "fixed" ||
    (ticketData.soldTickets > 0 &&
      ticketRevenue > 0);

  /*
   * Wenn eine bestehende manuelle Abrechnung gespeichert ist,
   * öffnen wir sie wieder als manuell.
   * Sonst standardmäßig die CRM-Berechnung.
   */
  const initialChoice: SettlementChoice =
    show.settlement_method === "manual"
      ? "manual"
      : "calculated";

  const [choice, setChoice] =
    useState<SettlementChoice>(initialChoice);

  const [manualTotal, setManualTotal] = useState(
    show.settlement_method === "manual"
      ? String(show.settlement_total_amount ?? "")
      : ""
  );

  const actualTotal =
    choice === "calculated" && calculationPossible
      ? calculatedTotal
      : choice === "manual"
        ? numberValue(manualTotal)
        : 0;

  if (!model || model === "other") {
    return (
      <div className="rounded-xl bg-[#fbf7ef] p-4 text-sm font-semibold text-zinc-600">
        Für dieses Honorar-Modell ist keine automatische
        Abrechnung möglich.
      </div>
    );
  }

  if (model === "fixed") {
    return (
      <div className="rounded-2xl bg-[#fbf7ef] p-4 ring-1 ring-black/5">
        <input
          type="hidden"
          name="settlement_total_amount"
          value={base.toFixed(2)}
        />
        <input
          type="hidden"
          name="settlement_method"
          value="tickets"
        />
        <input
          type="hidden"
          name="settlement_share_amount"
          value=""
        />
        <input
          type="hidden"
          name="settlement_confirmed"
          value="1"
        />

        <Header show={show} />

        <div className="mt-4 rounded-xl bg-white p-4 ring-1 ring-black/5">
          <div className="text-xs font-semibold text-zinc-500">
            Vereinbartes Festhonorar
          </div>

          <div className="mt-1 text-xl font-black">
            {euro(base)}
          </div>
        </div>

        <TotalBox total={base} />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#fbf7ef] p-4 ring-1 ring-black/5">
      <input
        type="hidden"
        name="settlement_total_amount"
        value={actualTotal.toFixed(2)}
      />

      <input
        type="hidden"
        name="settlement_method"
        value={
          choice === "manual"
            ? "manual"
            : "tickets"
        }
      />

      <input
        type="hidden"
        name="settlement_share_amount"
        value={
          choice === "calculated" &&
          calculationPossible
            ? calculatedParticipation.toFixed(2)
            : ""
        }
      />

      <input
        type="hidden"
        name="settlement_confirmed"
        value="1"
      />

      <Header show={show} />

      {/* VORAUSSICHTLICHE ABRECHNUNG */}

      <div className="mt-4 rounded-xl bg-white p-4 ring-1 ring-black/5">
        <div className="text-[10px] font-black uppercase tracking-[.12em] text-zinc-400">
          Voraussichtliche Abrechnung
        </div>

        {calculationPossible ? (
          <>
            <div className="mt-3 space-y-2 text-sm">
              <InfoRow
                label="Verkaufte Tickets"
                value={String(
                  ticketData.soldTickets
                )}
              />

              {ticketData.source ===
                "single_category" && (
                <InfoRow
                  label="Ticketpreis"
                  value={euro(ticketData.price)}
                />
              )}

              {ticketData.source ===
                "category_sales" && (
                <InfoRow
                  label="Preisgrundlage"
                  value="Verkäufe nach Preiskategorien"
                />
              )}

              <InfoRow
                label="Ticketumsatz"
                value={euro(ticketRevenue)}
              />

              <InfoRow
                label="Sonjas Anteil"
                value={`${artistShare} %`}
              />

              {combo ===
                "fixed_plus_threshold_share" && (
                <InfoRow
                  label="Beteiligung ab Umsatz"
                  value={euro(threshold)}
                />
              )}
            </div>

            <div className="mt-3 border-t border-zinc-100 pt-3">
              {model === "share" && (
                <InfoRow
                  label="Errechnete Beteiligung"
                  value={euro(normalShare)}
                  strong
                />
              )}

              {model ===
                "minimum_plus_share" &&
                combo === "minimum_or_share" && (
                  <div className="space-y-2">
                    <InfoRow
                      label="Mindesthonorar"
                      value={euro(base)}
                    />
                    <InfoRow
                      label="Beteiligung"
                      value={euro(normalShare)}
                    />
                    <InfoRow
                      label="Höherer Betrag"
                      value={euro(calculatedTotal)}
                      strong
                    />
                  </div>
                )}

              {model ===
                "minimum_plus_share" &&
                combo === "fixed_plus_share" && (
                  <div className="space-y-2">
                    <InfoRow
                      label="Festhonorar"
                      value={euro(base)}
                    />
                    <InfoRow
                      label="Zusätzliche Beteiligung"
                      value={euro(
                        calculatedParticipation
                      )}
                    />
                    <InfoRow
                      label="Gesamt"
                      value={euro(calculatedTotal)}
                      strong
                    />
                  </div>
                )}

              {model ===
                "minimum_plus_share" &&
                combo ===
                  "fixed_plus_threshold_share" && (
                  <div className="space-y-2">
                    <InfoRow
                      label="Festhonorar"
                      value={euro(base)}
                    />
                    <InfoRow
                      label="Zusätzliche Beteiligung"
                      value={euro(
                        calculatedParticipation
                      )}
                    />
                    <InfoRow
                      label="Gesamt"
                      value={euro(calculatedTotal)}
                      strong
                    />
                  </div>
                )}
            </div>

            <p className="mt-3 text-[11px] font-semibold text-zinc-400">
              Automatisch aus den aktuell hinterlegten
              Ticket- und Vertragsdaten berechnet.
            </p>
          </>
        ) : (
          <CalculationWarning ticketData={ticketData} />
        )}
      </div>

      {/* TATSÄCHLICHE ABRECHNUNG */}

      <div className="mt-4">
        <div className="text-xs font-black text-zinc-700">
          Wie wurde tatsächlich abgerechnet?
        </div>

        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() =>
              setChoice("calculated")
            }
            className={`rounded-xl p-3 text-left ring-1 transition ${
              choice === "calculated"
                ? "bg-white ring-[#c9d65c]"
                : "bg-white/60 ring-black/5 hover:bg-white"
            }`}
          >
            <div className="text-sm font-black">
              Berechnung übernehmen
            </div>

            <div className="mt-1 text-xs text-zinc-500">
              {calculationPossible
                ? `${euro(
                    calculatedTotal
                  )} als tatsächlichen Künstlerumsatz übernehmen.`
                : "Automatische Berechnung derzeit nicht möglich."}
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setChoice("manual")
            }
            className={`rounded-xl p-3 text-left ring-1 transition ${
              choice === "manual"
                ? "bg-white ring-[#c9d65c]"
                : "bg-white/60 ring-black/5 hover:bg-white"
            }`}
          >
            <div className="text-sm font-black">
              Abweichenden Betrag eingeben
            </div>

            <div className="mt-1 text-xs text-zinc-500">
              Wenn die Veranstalterabrechnung
              tatsächlich anders ausgefallen ist.
            </div>
          </button>
        </div>
      </div>

      {choice === "manual" && (
        <div className="mt-3 rounded-xl bg-white p-4 ring-1 ring-black/5">
          <label className="block">
            <span className="mb-1.5 block text-xs font-black text-zinc-600">
              Tatsächlicher Künstlerumsatz €
            </span>

            <input
              type="number"
              min="0"
              step="0.01"
              value={manualTotal}
              onChange={(e) =>
                setManualTotal(e.target.value)
              }
              className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold"
            />

            <span className="mt-1 block text-[11px] font-semibold text-zinc-500">
              Gesamtbetrag, der Sonja laut
              tatsächlicher Abrechnung für die
              Show zusteht.
            </span>
          </label>

          {calculationPossible && (
            <div className="mt-3 rounded-lg bg-zinc-50 p-3 text-xs font-semibold text-zinc-600">
              Das CRM hat anhand der hinterlegten
              Daten{" "}
              <b>{euro(calculatedTotal)}</b>{" "}
              errechnet.
            </div>
          )}
        </div>
      )}

      <TotalBox total={actualTotal} />
    </div>
  );
}

function Header({ show }: { show: any }) {
  return (
    <>
      <div className="text-[10px] font-black uppercase tracking-[.12em] text-zinc-400">
        Abrechnung aus Vertragsmodell
      </div>

      <div className="mt-2 text-sm font-black text-zinc-900">
        {feeDescription(show)}
      </div>
    </>
  );
}

function CalculationWarning({
  ticketData,
}: {
  ticketData: {
    soldTickets: number;
    source: string;
    categoryCount: number;
  };
}) {
  let text =
    "Die voraussichtliche Abrechnung kann noch nicht automatisch berechnet werden.";

  if (ticketData.source === "missing_tickets") {
    text =
      "Es sind noch keine verkauften Tickets erfasst.";
  }

  if (ticketData.source === "missing_price") {
    text =
      "Die Ticketzahl ist erfasst, aber es ist noch kein Ticketpreis hinterlegt.";
  }

  if (ticketData.source === "multiple_prices") {
    text = `${ticketData.soldTickets} verkaufte Tickets sind erfasst, aber es gibt ${ticketData.categoryCount} Preiskategorien. Bitte die Verkäufe je Preiskategorie erfassen oder den tatsächlichen Abrechnungsbetrag eingeben.`;
  }

  return (
    <div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-800">
      {text}
    </div>
  );
}

function InfoRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span
        className={
          strong
            ? "font-black text-zinc-900"
            : "font-semibold text-zinc-500"
        }
      >
        {label}
      </span>

      <span
        className={`text-right ${
          strong
            ? "text-base font-black text-zinc-900"
            : "font-black text-zinc-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function TotalBox({ total }: { total: number }) {
  return (
    <div className="mt-4 flex items-end justify-between gap-4 rounded-xl bg-zinc-950 p-4 text-white">
      <div>
        <div className="text-[10px] font-black uppercase tracking-[.12em] text-white/50">
          Tatsächlicher Künstlerumsatz
        </div>

        <div className="mt-1 text-xs font-semibold text-white/60">
          Wird beim Speichern in die
          Wirtschaftlichkeit übernommen.
        </div>
      </div>

      <div className="text-2xl font-black">
        {euro(total)}
      </div>
    </div>
  );
}

function euro(n: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(Number.isFinite(n) ? n : 0);
}

function feeDescription(show: any) {
  const base = euro(
    numberValue(show.fee_base_amount)
  );

  const artist = numberValue(
    show.fee_artist_share
  );

  const organizer = numberValue(
    show.fee_organizer_share
  );

  const combo = String(
    show.fee_combination_mode ||
      "minimum_or_share"
  );

  if (show.fee_model === "fixed") {
    return `Festhonorar ${base}`;
  }

  if (show.fee_model === "share") {
    return `Umsatzbeteiligung ${artist}/${organizer}`;
  }

  if (
    show.fee_model ===
    "minimum_plus_share"
  ) {
    if (combo === "fixed_plus_share") {
      return `${base} Festhonorar + ${artist}/${organizer} zusätzliche Beteiligung`;
    }

    if (
      combo ===
      "fixed_plus_threshold_share"
    ) {
      return `${base} Festhonorar + ${artist}/${organizer} Beteiligung ab ${euro(
        numberValue(show.fee_share_threshold)
      )} Umsatz`;
    }

    return `${base} Mindesthonorar oder ${artist}/${organizer} Beteiligung – der höhere Betrag zählt`;
  }

  return "Honorarvereinbarung";
}