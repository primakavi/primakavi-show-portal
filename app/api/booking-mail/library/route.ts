import { NextRequest, NextResponse } from "next/server";
import { requireBookingMailAdmin } from "@/app/lib/requireBookingMailAdmin";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
export const runtime = "nodejs";
export async function GET() {
  try {
    await requireBookingMailAdmin();
    const { data, error } = await supabaseAdmin.schema("booking").from("artist_files")
      .select("id,title,file_name,file_size,mime_type,category")
      .eq("artist_key", "sonja").eq("is_active", true).eq("available_for_email", true)
      .order("sort_order").order("title");
    if (error) throw error;
    return NextResponse.json({ files: data ?? [] });
  } catch (error) { console.error("Library GET:", error); return NextResponse.json({ error: "Dateibibliothek nicht verfügbar." }, { status: 403 }); }
}
