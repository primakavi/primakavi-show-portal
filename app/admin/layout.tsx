import AdminSidebar from "./AdminSidebar";
import { createClient } from "@/app/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;

  if (user?.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    role = profile?.role || null;
  }

  return (
    <div className="min-h-screen bg-[#fbf7ef]">
      <div className="flex min-h-screen">
        <AdminSidebar user={user} role={role} />

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}