import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbf7ef] px-6">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl shadow-black/10">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-zinc-400">
          primakavi
        </p>

        <h1 className="mt-4 text-4xl font-black">Login</h1>

        <p className="mt-3 text-sm font-semibold leading-6 text-zinc-500">
          Zugriff auf Show-Akten, Dashboard und Markus-Ansicht.
        </p>

        {searchParams?.error && (
          <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            Login fehlgeschlagen. Bitte prüfe E-Mail und Passwort.
          </div>
        )}

        <form action={loginAction} className="mt-6 space-y-4">
          <label className="grid gap-2 text-xs font-black text-zinc-700">
            E-Mail
            <input
              name="email"
              type="email"
              required
              className="h-14 rounded-2xl border border-zinc-200 bg-[#fbf7ef] px-4 text-sm font-semibold outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
            />
          </label>

          <label className="grid gap-2 text-xs font-black text-zinc-700">
            Passwort
            <input
              name="password"
              type="password"
              required
              className="h-14 rounded-2xl border border-zinc-200 bg-[#fbf7ef] px-4 text-sm font-semibold outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
            />
          </label>

          <button
            type="submit"
            className="h-14 w-full rounded-2xl bg-zinc-950 px-5 font-black text-white shadow-lg transition hover:scale-[1.01]"
          >
            Einloggen →
          </button>
        </form>
      </div>
    </main>
  );
}

async function loginAction(formData: FormData) {
  "use server";

  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/login?error=1");
  }

  redirect("/admin");
}