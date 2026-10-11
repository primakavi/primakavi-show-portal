import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/** Call from every server action / API route that sends or imports booking mail. */
export async function requireBookingMailAdmin() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Authorization check only: session refresh cookies are managed by middleware.
        },
      },
    }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Nicht angemeldet.");
  }

  const { data: profile, error: roleError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (roleError || profile?.role !== "admin") {
    throw new Error("Keine Berechtigung für das Booking-Mailcenter.");
  }

  return { userId: user.id, email: user.email ?? null };
}
