import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbf7ef] px-5 py-6">
      <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-[3rem] bg-[#101014] text-white shadow-2xl shadow-black/15">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(255,105,180,0.4),transparent_30%),radial-gradient(circle_at_32%_28%,rgba(255,145,60,0.28),transparent_35%),radial-gradient(circle_at_72%_92%,rgba(190,255,90,0.18),transparent_30%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.06),transparent_35%,rgba(255,255,255,0.03))] opacity-40" />

        <div className="absolute right-[38%] top-14 rotate-6 text-6xl opacity-90">
          ✨
        </div>
        <div className="relative grid min-h-[650px] items-start gap-8 px-10 py-12 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="max-w-xl pt-4 lg:pt-6">
            <div className="flex items-start gap-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-[#d9ff00] ring-1 ring-white/20">
                <Image
                  src="/logo-primakavi.png"
                  alt="primakavi"
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              <div>
                <p className="text-xl font-black">primakavi</p>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/50">
                  Show Portal
                </p>
              </div>
            </div>

            <div className="mt-7 h-[3px] w-20 rounded-full bg-gradient-to-r from-pink-400 via-orange-300 to-lime-300" />

            <h1 className="mt-9 text-6xl font-black leading-[0.9] tracking-tight lg:text-7xl">
              Deine Show-
              <br />
              Zentrale.
            </h1>

            <p className="mt-7 max-w-lg text-sm font-semibold leading-7 text-white/70">
              Akten, Veranstalter-Infos, Tourkarte und Read-Only-Ansicht an einem
              Ort — reduziert, schnell und einsatzbereit.
            </p>

<div className="mt-8 flex flex-wrap gap-2">
  <Badge>🎭 Shows verwalten</Badge>
  <Badge>🧾 Akten & Infos</Badge>
  <Badge>🗺️ Tour planen</Badge>
  <Badge>🎹 Read only</Badge>
</div>

          </section>

          <section className="mt-10 flex h-full items-center lg:mt-0 lg:pl-6">
            <div className="w-full rounded-[2.5rem] bg-white p-7 text-zinc-950 shadow-2xl shadow-black/20 ring-1 ring-black/5 backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-black/25">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-pink-500">
                Willkommen zurück
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-tight">
                Einloggen
              </h2>

              <p className="mt-2 text-sm font-semibold text-zinc-500">
                Zugriff auf Shows, Tourkarte und Read-Only-Bereich.
              </p>

              {searchParams?.error && (
                <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  Login fehlgeschlagen.
                </div>
              )}

              <form action={loginAction} className="mt-6 space-y-4">
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="E-Mail"
                  autoComplete="email"
                  className="h-14 w-full rounded-2xl border border-zinc-200 bg-[#fbf7ef] px-4 text-sm font-semibold outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
                />

                <input
                  name="password"
                  type="password"
                  required
                  placeholder="Passwort"
                  autoComplete="current-password"
                  className="h-14 w-full rounded-2xl border border-zinc-200 bg-[#fbf7ef] px-4 text-sm font-semibold outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
                />

                <button
                  type="submit"
                  className="h-14 w-full rounded-2xl bg-zinc-950 font-black text-white shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20"
                >
                  Einloggen →
                </button>
              </form>

              <div className="mt-5 rounded-2xl bg-[#fbf7ef] px-4 py-3 text-xs font-bold text-zinc-500">
                Rollen werden automatisch erkannt.
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Badge({
  children,
  muted = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <span
      className={[
        "rounded-full px-4 py-2 text-xs font-black ring-1 backdrop-blur",
        muted
          ? "bg-white/5 text-white/45 ring-white/10"
          : "bg-white/10 text-white ring-white/10",
      ].join(" ")}
    >
      {children}
    </span>
  );
}
function HeroTile({
  title,
  text,
  disabled = false,
}: {
  title: string;
  text: string;
  disabled?: boolean;
}) {
  return (
    <div
      className={[
        "relative rounded-2xl px-4 py-3 text-sm ring-1 backdrop-blur transition",
        disabled
          ? "bg-white/5 ring-white/10 opacity-60"
          : "bg-white/10 ring-white/10 hover:bg-white/15",
      ].join(" ")}
    >
      {disabled && (
        <span className="absolute right-3 top-3 rounded-full bg-white/10 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-white/60">
          bald
        </span>
      )}

      <p className="font-black">{title}</p>
      <p
        className={[
          "mt-1 text-xs font-bold",
          disabled ? "text-white/40" : "text-white/60",
        ].join(" ")}
      >
        {text}
      </p>
    </div>
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