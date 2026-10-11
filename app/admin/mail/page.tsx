import { redirect } from "next/navigation";
import { requireBookingMailAdmin } from "@/app/lib/requireBookingMailAdmin";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import MailCenterClient from "./MailCenterClient";

export const dynamic = "force-dynamic";
export default async function MailCenterPage() {
  try { await requireBookingMailAdmin(); } catch { redirect("/admin"); }
  const [mailResult, acquisitionsResult, organizersResult] = await Promise.all([
    supabaseAdmin.from("crm_emails")
      .select("id,acquisition_id,direction,status,from_email,to_emails,subject,body_text,received_at,sent_at,created_at")
      .order("created_at", { ascending: false }).limit(200),
    supabaseAdmin.from("acquisition").select("id,organizer_id,program,status").is("archived_at", null).limit(1000),
    supabaseAdmin.from("organizers").select("id,name").limit(1000),
  ]);
  if (mailResult.error || acquisitionsResult.error || organizersResult.error) {
    console.error("Mail center data load failed", { mail: mailResult.error, acquisitions: acquisitionsResult.error, organizers: organizersResult.error });
    return <main style={{ padding: 32 }}>Mail-Zentrale konnte nicht geladen werden. Bitte Server-Logs prüfen.</main>;
  }
  const names = new Map((organizersResult.data ?? []).map(o => [o.id, o.name]));
  const acquisitions = (acquisitionsResult.data ?? []).map(a => ({
    id: a.id,
    label: `${names.get(a.organizer_id) || "Ohne Veranstalter"} · ${a.program || "Akquise"} · ${a.id.slice(0, 8)}`,
  }));
  return <MailCenterClient initialMails={(mailResult.data ?? [])} acquisitions={acquisitions} />;
}
