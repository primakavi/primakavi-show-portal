import { NextRequest, NextResponse } from "next/server";
import { requireBookingMailAdmin } from "@/app/lib/requireBookingMailAdmin";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
export const runtime = "nodejs";
const validShortcut = (v: unknown) => typeof v === "string" && /^[a-z0-9_-]{1,60}$/.test(v);
const validId = (v: unknown) => typeof v === "string" && /^[0-9a-f-]{36}$/i.test(v);
const sameOrigin = (r: NextRequest) => { const origin = r.headers.get("origin"); try { return !!origin && new URL(origin).origin === r.nextUrl.origin; } catch { return false; } };
export async function GET() {
  try {
    await requireBookingMailAdmin();
    const { data, error } = await supabaseAdmin.schema("booking").from("mail_templates")
      .select("id,title,shortcut,category,subject,body,sort_order")
      .eq("artist_key", "sonja").eq("is_active", true).order("sort_order").order("title");
    if (error) throw error;
    return NextResponse.json({ templates: data ?? [] });
  } catch (error) { console.error("Templates GET:", error); return NextResponse.json({ error: "Textbausteine nicht verfügbar." }, { status: 403 }); }
}
export async function POST(request: NextRequest) {
  try {
    await requireBookingMailAdmin();
    if (!sameOrigin(request)) return NextResponse.json({ error: "Ungültiger Ursprung." }, { status: 403 });
    const b = await request.json();
    if (typeof b.title !== "string" || !b.title.trim() || b.title.length > 150 || !validShortcut(b.shortcut) ||
        typeof b.body !== "string" || !b.body.trim() || b.body.length > 30000 ||
        (b.subject != null && (typeof b.subject !== "string" || b.subject.length > 500)) ||
        (b.category != null && (typeof b.category !== "string" || b.category.length > 100)))
      return NextResponse.json({ error: "Bitte Textbaustein prüfen (Kürzel nur a-z, 0-9, _ und -)." }, { status: 400 });
    const payload = { artist_key: "sonja", title: b.title.trim(), shortcut: b.shortcut, body: b.body,
      category: b.category?.trim() || "Sonstiges", subject: b.subject?.trim() || null };
    const query = supabaseAdmin.schema("booking").from("mail_templates");
    const result = validId(b.id) ? await query.update(payload).eq("id", b.id).eq("artist_key", "sonja").select("id").single() : await query.insert(payload).select("id").single();
    if (result.error) { console.error(result.error); return NextResponse.json({ error: "Speichern fehlgeschlagen. Ist das Kürzel bereits vergeben?" }, { status: 400 }); }
    return NextResponse.json({ saved: true, id: result.data.id });
  } catch (error) { console.error("Templates POST:", error); return NextResponse.json({ error: "Nicht berechtigt." }, { status: 403 }); }
}
export async function DELETE(request: NextRequest) {
  try {
    await requireBookingMailAdmin();
    if (!sameOrigin(request)) return NextResponse.json({ error: "Ungültiger Ursprung." }, { status: 403 });
    const b = await request.json();
    if (!validId(b.id)) return NextResponse.json({ error: "Ungültige ID." }, { status: 400 });
    const { error } = await supabaseAdmin.schema("booking").from("mail_templates").update({ is_active: false }).eq("id", b.id).eq("artist_key", "sonja");
    if (error) throw error;
    return NextResponse.json({ deleted: true });
  } catch (error) { console.error("Templates DELETE:", error); return NextResponse.json({ error: "Löschen fehlgeschlagen." }, { status: 403 }); }
}
