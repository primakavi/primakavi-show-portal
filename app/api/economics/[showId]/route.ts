import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function POST(
  request: Request,
  context: { params: Promise<{ showId: string }> }
) {
  const { showId } = await context.params;
  const body = await request.json();

  const { data, error } = await supabaseAdmin
    .schema("booking")
    .from("show_economics")
    .upsert(
      {
        show_id: showId,
        ...body,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "show_id" }
    )
    .select()
    .single();

  if (error) {
    console.error("Supabase economics error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ economics: data });
}