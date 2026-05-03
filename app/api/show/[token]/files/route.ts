import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

const BUCKET_NAME = "show-files";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { token } = await params;

  const { data: show, error: showError } = await supabaseAdmin
    .schema("booking")
    .from("shows")
    .select("id")
    .eq("token", token)
    .single();

  if (showError || !show) {
    console.error("Show für Dateien nicht gefunden:", showError);
    return NextResponse.json({ files: [] });
  }

  const { data: files, error } = await supabaseAdmin
    .schema("booking")
    .from("show_files")
    .select("*")
    .eq("show_id", show.id)
    .order("uploaded_at", { ascending: false });

  if (error) {
    console.error("Dateien laden fehlgeschlagen:", error);
    return NextResponse.json({ files: [] });
  }

  return NextResponse.json({ files: files || [] });
}

export async function POST(request: Request, { params }: RouteContext) {
  const { token } = await params;
  const formData = await request.formData();

  const file = formData.get("file") as File | null;
  const fileType = String(formData.get("file_type") || "Sonstiges");

  if (!file) {
    return NextResponse.json(
      { error: "Keine Datei übermittelt." },
      { status: 400 }
    );
  }

  const { data: show, error: showError } = await supabaseAdmin
    .schema("booking")
    .from("shows")
    .select("id")
    .eq("token", token)
    .single();

  if (showError || !show) {
    console.error("Show für Upload nicht gefunden:", showError);
    return NextResponse.json(
      { error: "Show nicht gefunden." },
      { status: 404 }
    );
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
    console.error("Storage Upload fehlgeschlagen:", uploadError);
    return NextResponse.json(
      { error: uploadError.message },
      { status: 500 }
    );
  }

  const { error: dbError } = await supabaseAdmin
    .schema("booking")
    .from("show_files")
    .insert({
      show_id: show.id,
      file_type: fileType,
      file_name: file.name,
      storage_path: storagePath,
      size_bytes: file.size,
    });

  if (dbError) {
    console.error("Datei-Metadaten speichern fehlgeschlagen:", dbError);
    return NextResponse.json(
      { error: dbError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}