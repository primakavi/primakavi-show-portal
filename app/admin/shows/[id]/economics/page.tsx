import Link from "next/link";
import { revalidatePath } from "next/cache";
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
    .select(`
      id,
      artist,
      program,
      show_date,
      venue,
      city,
      fee_model,
      fee_base_amount,
      fee_artist_share,
      fee_organizer_share,
      fee_tax_mode,
      fee_notes,
      settlement_total_amount,
      settlement_confirmed,

      accommodation_status,
      accommodation_hotel_name,
      accommodation_actual_cost,

      promo_print_cost,
      promo_shipping_cost
    `)
    .eq("id", id)
    .single();

  const { data: economics } = await supabaseAdmin
    .schema("booking")
    .from("show_economics")
    .select("*")
    .eq("show_id", id)
    .maybeSingle();

  const { data: travelLegs } = await supabaseAdmin
    .schema("booking")
    .from("show_travel_legs")
    .select(`
      id,
      direction,
      transport_type,
      from_place,
      to_place,
      actual_cost
    `)
    .eq("show_id", id)
    .order("direction")
    .order("sort_order");

  const { data: cast } = await supabaseAdmin
    .schema("booking")
    .from("show_cast")
    .select(`
      id,
      name,
      role,
      actual_cost,
      sort_order
    `)
    .eq("show_id", id)
    .order("sort_order");

  const { data: allEconomics } = await supabaseAdmin
    .schema("booking")
    .from("show_economics")
    .select("revenue_total, profit");

  const validRows =
    allEconomics?.filter((row) => row.revenue_total !== null) || [];

  const benchmark =
    validRows.length > 0
      ? {
          avgRevenue: average(
            validRows.map((row) => Number(row.revenue_total) || 0)
          ),
          avgProfit: average(
            validRows.map((row) => Number(row.profit) || 0)
          ),
        }
      : undefined;

  return (
    <main className="min-h-screen bg-[#fbf7ef] px-6 py-8 text-[#191917]">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[.14em] text-[#9a978f]">
              primakavi · Booking CRM · Nachbereitung
            </div>

            <h1 className="mt-2 text-4xl font-black tracking-tight">
              Wirtschaftlichkeit
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#77746c]">
              Einnahmen, direkte Show-Kosten und Deckungsbeitrag der Show.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold text-[#6f6c65]">
              {show?.show_date && (
                <span className="rounded-full bg-[#f4f1e9] px-3 py-1.5">
                  {new Date(`${show.show_date}T12:00:00`).toLocaleDateString(
                    "de-DE"
                  )}
                </span>
              )}

              {show?.venue && (
                <span className="rounded-full bg-[#f4f1e9] px-3 py-1.5">
                  {show.venue}
                  {show.city ? ` · ${show.city}` : ""}
                </span>
              )}

              {show?.program && (
                <span className="rounded-full bg-[#f4f1e9] px-3 py-1.5">
                  {show.program}
                </span>
              )}
            </div>
          </div>

          <Link
            href={`/admin/shows/${id}`}
            className="inline-flex w-fit items-center rounded-full border border-[#ddd7ca] bg-white px-5 py-2.5 text-sm font-black transition hover:border-[#c9d65c] hover:bg-[#faf8f2]"
          >
            ← Zurück zur Show-Akte
          </Link>
        </header>

        <EconomicsTab
          showId={id}
          show={show ?? undefined}
          initialData={economics ?? undefined}
          travelLegs={travelLegs ?? []}
          cast={cast ?? []}
          benchmark={benchmark}
          completedAt={economics?.completed_at ?? null}
          completeAction={completeEconomicsAction}
          reopenAction={reopenEconomicsAction}
        />
      </div>
    </main>
  );
}

async function completeEconomicsAction(formData: FormData) {
  "use server";
  const showId = String(formData.get("show_id") || "");
  if (!showId) return;

  const { error } = await supabaseAdmin
    .schema("booking")
    .from("show_economics")
    .update({ completed_at: new Date().toISOString() })
    .eq("show_id", showId);

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/shows/${showId}/economics`);
  revalidatePath(`/admin/shows/${showId}`);
  revalidatePath("/admin/shows");
}

async function reopenEconomicsAction(formData: FormData) {
  "use server";
  const showId = String(formData.get("show_id") || "");
  if (!showId) return;

  const { error } = await supabaseAdmin
    .schema("booking")
    .from("show_economics")
    .update({ completed_at: null })
    .eq("show_id", showId);

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/shows/${showId}/economics`);
  revalidatePath(`/admin/shows/${showId}`);
  revalidatePath("/admin/shows");
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
