import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

const BUCKET_NAME = "show-files";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const { data: show, error: showError } = await supabaseAdmin
    .from("shows")
    .select("id")
    .eq("token", token)
    .single();

  if (showError || !show) {
    return NextResponse.json({ files: [] });
  }

  const { data: files, error } = await supabaseAdmin
    .from("show_files")
    .select("*")
    .eq("show_id", show.id)
    .order("uploaded_at", { ascending: false });

  if (error) {
    return NextResponse.json({ files: [] });
  }

  return NextResponse.json({ files: files || [] });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const formData = await request.formData();

  const file = formData.get("file") as File | null;
  const fileType = String(formData.get("file_type") || "Sonstiges");

  if (!file) {
    return NextResponse.json({ error: "Keine Datei übermittelt" }, { status: 400 });
  }

  const { data: show, error: showError } = await supabaseAdmin
    .from("shows")
    .select("id")
    .eq("token", token)
    .single();

  if (showError || !show) {
    return NextResponse.json({ error: "Show nicht gefunden" }, { status: 404 });
  }

  const safeFileName = file.name.replace(/[^a-zA-Z0-9äöüÄÖÜß._-]/g, "_");
  const storagePath = `${show.id}/${Date.now()}-${safeFileName}`;

  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(storagePath, arrayBuffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { error: dbError } = await supabaseAdmin.from("show_files").insert({
    show_id: show.id,
    file_type: fileType,
    file_name: file.name,
    storage_path: storagePath,
    size_bytes: file.size,
  });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}