import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

const BUCKET_NAME = "show-files";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: file, error } = await supabaseAdmin
    .from("show_files")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (error || !file?.storage_path) {
    return NextResponse.json(
      { error: "Datei nicht gefunden oder storage_path fehlt." },
      { status: 404 }
    );
  }

  const { data, error: signedError } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .createSignedUrl(file.storage_path, 60 * 10);

  if (signedError || !data?.signedUrl) {
    return NextResponse.json(
      {
        error:
          signedError?.message ||
          `Signed URL konnte nicht erstellt werden. Prüfe Bucket: ${BUCKET_NAME}`,
      },
      { status: 500 }
    );
  }

  return NextResponse.redirect(data.signedUrl);
}