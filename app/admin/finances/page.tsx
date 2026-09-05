import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

type FinanceTransaction = {
  id: string;
  transaction_date: string;
  type: "income" | "expense";
  category: string;
  description: string | null;
  amount: number;
  notes: string | null;
};

function formatEuro(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export default async function FinancesPage() {
  const currentYear = new Date().getFullYear();

  const { data, error } = await supabaseAdmin
    .schema("booking")
    .from("finance_transactions")
    .select(`
      id,
      transaction_date,
      type,
      category,
      description,
      amount,
      notes
    `)
    .gte("transaction_date", `${currentYear}-01-01`)
    .lte("transaction_date", `${currentYear}-12-31`)
    .order("transaction_date", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-[#fbf7ef] p-8">
        <div className="rounded-3xl bg-white p-8 font-bold text-red-600 shadow-xl">
          Fehler: {error.message}
        </div>
      </main>
    );
  }

  const transactions = (data || []) as FinanceTransaction[];

  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const expenses = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const profit = income - expenses;
  const margin = income > 0 ? Math.round((profit / income) * 100) : 0;

  const kpis = [
    ["Umsatz YTD", formatEuro(income)],
    ["Kosten YTD", formatEuro(expenses)],
    ["Gewinn YTD", formatEuro(profit)],
    ["Marge", `${margin} %`],
  ];

  return (
    <main className="min-h-screen bg-[#fbf7ef] px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[2rem] bg-zinc-950 p-8 text-white shadow-2xl">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-lime-300">
            Business Cockpit
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight">
            Finanzen
          </h1>

          <p className="mt-3 max-w-2xl text-sm text-zinc-400">
            Einnahmen, Kosten und Business-Überschuss für Sonjas Künstlerbusiness.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {kpis.map(([label, value]) => (
              <div
                key={label}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
              >
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">
                  {label}
                </p>
                <p className="mt-3 text-2xl font-black">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400">
                  EÜR Übersicht
                </p>
                <h2 className="mt-2 text-2xl font-black text-zinc-950">
                  Einnahmen & Ausgaben
                </h2>
              </div>

              <button className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-black text-white shadow-lg">
                + Buchung erfassen
              </button>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-[#fbf7ef] px-5 py-4">
                <span className="font-bold text-zinc-700">Einnahmen</span>
                <span className="font-black text-emerald-700">
                  {formatEuro(income)}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-[#fbf7ef] px-5 py-4">
                <span className="font-bold text-zinc-700">Ausgaben</span>
                <span className="font-black text-red-600">
                  -{formatEuro(expenses)}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-zinc-950 px-5 py-5 text-white">
                <span className="font-black">Überschuss</span>
                <span className="text-xl font-black">
                  {formatEuro(profit)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-xl">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400">
              Business Health
            </p>
            <h2 className="mt-2 text-2xl font-black text-zinc-950">
              Einschätzung
            </h2>

            <div className="mt-6 rounded-3xl bg-[#fbf7ef] p-5">
              <p className="text-3xl font-black">
                {profit > 0 ? "🟢 Gesund" : income > 0 ? "🟡 Beobachten" : "⚪ Noch keine Daten"}
              </p>
              <p className="mt-3 text-sm font-medium leading-6 text-zinc-600">
                Sobald Einnahmen und Kosten erfasst sind, sieht Sonja hier direkt,
                ob das Business wirtschaftlich gesund läuft.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400">
                Ledger
              </p>
              <h2 className="mt-2 text-2xl font-black text-zinc-950">
                Letzte Buchungen
              </h2>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="mt-6 rounded-3xl bg-[#fbf7ef] p-8 text-sm font-bold text-zinc-500">
              Noch keine Buchungen erfasst.
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-3xl border border-zinc-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#fbf7ef] text-xs uppercase tracking-[0.2em] text-zinc-400">
                  <tr>
                    <th className="px-5 py-4">Datum</th>
                    <th className="px-5 py-4">Kategorie</th>
                    <th className="px-5 py-4">Beschreibung</th>
                    <th className="px-5 py-4 text-right">Betrag</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((item) => (
                    <tr key={item.id} className="border-t border-zinc-100">
                      <td className="px-5 py-4 font-bold text-zinc-700">
                        {new Date(item.transaction_date).toLocaleDateString("de-DE")}
                      </td>
                      <td className="px-5 py-4 font-bold text-zinc-700">
                        {item.category}
                      </td>
                      <td className="px-5 py-4 text-zinc-500">
                        {item.description || "—"}
                      </td>
                      <td
                        className={[
                          "px-5 py-4 text-right font-black",
                          item.type === "income"
                            ? "text-emerald-700"
                            : "text-red-600",
                        ].join(" ")}
                      >
                        {item.type === "income" ? "+" : "-"}
                        {formatEuro(Number(item.amount || 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}