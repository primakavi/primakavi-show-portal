import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function POST(
  request: Request,
  context: { params: Promise<{ showId: string }> }
) {
  const { showId } = await context.params;
  const body = await request.json();

  const payload = {
    show_id: showId,

    revenue_items: body.revenue_items ?? [],
    cost_items: body.cost_items ?? [],
    revenue_total: toNumberOrZero(body.revenue_total),
    profit: toNumberOrZero(body.profit),

    economic_rating: cleanText(body.economic_rating),
    would_book_again: cleanText(body.would_book_again),
    strategic_value: cleanText(body.strategic_value),
    show_goal: cleanText(body.show_goal),

    audience_rating: cleanText(body.audience_rating),
    venue_rating: cleanText(body.venue_rating),
    organization_rating: cleanText(body.organization_rating),
    effort_rating: cleanText(body.effort_rating),
    tech_rating: cleanText(body.tech_rating),

    tickets_sold: toNumberOrNull(body.tickets_sold),
    ticket_price_avg: toNumberOrNull(body.ticket_price_avg),

    notes: cleanText(body.notes),

    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .schema("booking")
    .from("show_economics")
    .upsert(payload, { onConflict: "show_id" })
    .select()
    .single();

  if (error) {
    console.error("Supabase economics error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ economics: data });
}

function cleanText(value: unknown) {
  if (value === undefined || value === null) return null;

  const text = String(value).trim();
  return text.length ? text : null;
}

function toNumberOrNull(value: unknown) {
  if (value === undefined || value === null || value === "") return null;

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function toNumberOrZero(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}