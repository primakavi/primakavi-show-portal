import AdminSidebar from "./AdminSidebar";
import AdminMobileNav from "./AdminMobileNav";
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
      <AdminMobileNav user={user} role={role} />

      <div className="min-h-screen lg:flex">
        <AdminSidebar user={user} role={role} />

        <main className="min-w-0 flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}