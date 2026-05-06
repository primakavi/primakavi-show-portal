import Link from "next/link";
import EconomicsTab from "@/components/EconomicsTab";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export default async function EconomicsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: show } = await supabaseAdmin
    .schema("booking")
    .from("shows")
    .select("id, artist, program, show_date, venue, city")
    .eq("id", id)
    .single();

  const { data: economics } = await supabaseAdmin
    .schema("booking")
    .from("show_economics")
    .select("*")
    .eq("show_id", id)
    .maybeSingle();

  const { data: allEconomics } = await supabaseAdmin
    .schema("booking")
    .from("show_economics")
    .select("revenue_total, profit");

  const validRows =
    allEconomics?.filter((row) => row.revenue_total !== null) || [];

  const avgRevenue = average(
    validRows.map((row) => Number(row.revenue_total) || 0)
  );

  const avgProfit = average(
    validRows.map((row) => Number(row.profit) || 0)
  );

  const benchmark =
    validRows.length > 0
      ? {
          avgRevenue,
          avgProfit,
        }
      : undefined;

  return (
    <div className="space-y-5 text-zinc-950">
      <section className="relative overflow-hidden rounded-[2.4rem] bg-[#101014] p-10 text-white shadow-2xl shadow-black/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(255,105,180,0.38),transparent_28%),radial-gradient(circle_at_35%_25%,rgba(255,145,60,0.28),transparent_35%),radial-gradient(circle_at_70%_95%,rgba(190,255,90,0.13),transparent_28%)]" />

        <div className="absolute right-24 top-10 rotate-6 text-6xl text-pink-400">
          💸
        </div>

        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-white/50">
              primakavi · Nachbereitung
            </p>

            <h1 className="mt-4 text-5xl font-black tracking-tight">
              Wirtschaftlichkeit
            </h1>

            <p className="mt-4 max-w-xl text-white/70">
              Einnahmen, Kosten und Learnings zur Show.
            </p>
          </div>

          <Link
            href={`/admin/shows/${id}`}
            className="rounded-3xl bg-white/10 px-6 py-4 text-sm font-black text-white ring-1 ring-white/15 transition hover:bg-white/15"
          >
            ← Zurück zur Akte
          </Link>
        </div>
      </section>

      <EconomicsTab
        showId={id}
        show={show ?? undefined}
        initialData={economics ?? undefined}
        benchmark={benchmark}
      />
    </div>
  );
}

function average(values: number[]) {
  if (!values.length) return 0;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}