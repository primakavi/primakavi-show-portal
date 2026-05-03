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

      {/* HERO BACKGROUND */}
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[3rem] bg-[#101014] text-white shadow-2xl shadow-black/15">
        
        {/* GRADIENT */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(255,105,180,0.4),transparent_30%),radial-gradient(circle_at_32%_28%,rgba(255,145,60,0.28),transparent_35%),radial-gradient(circle_at_72%_92%,rgba(190,255,90,0.18),transparent_30%)]" />

        {/* DOODLES */}
        <div className="absolute top-15 right-105 rotate-6 text-6xl">✨</div>

        {/* CONTENT */}
<div className="relative grid min-h-[650px] items-start px-10 py-12 lg:grid-cols-[1.2fr_0.8fr]">          
          {/* LEFT TEXT */}
<div className="max-w-xl pt-4 lg:pt-6">
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

            <h1 className="mt-8 text-5xl font-black leading-[0.95] tracking-tight">
              Deine Show-Zentrale.
            </h1>

            <p className="mt-6 text-sm font-semibold leading-7 text-white/70">
              Akten, Veranstalter-Infos, Tourkarte und Read-Only-Ansicht an einem Ort
            <br />
              reduziert, schnell und einsatzbereit.
            </p>


          </div>

          {/* LOGIN CARD */}
{/* LOGIN CARD */}
<div className="mt-10 flex h-full items-center lg:mt-0 lg:pl-10">
<div className="w-full rounded-[2.5rem] bg-white p-7 shadow-2xl shadow-black/20 ring-1 ring-black/5 backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-black/25">                
              <p className="text-xs font-black uppercase tracking-[0.25em] text-pink-500">
                Willkommen zurück
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-tight text-zinc-950">
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
                  className="h-14 w-full rounded-2xl border border-zinc-200 bg-[#fbf7ef] px-4 text-sm font-semibold outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
                />

                <input
                  name="password"
                  type="password"
                  required
                  placeholder="Passwort"
                  className="h-14 w-full rounded-2xl border border-zinc-200 bg-[#fbf7ef] px-4 text-sm font-semibold outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
                />

                <button
                  type="submit"
className="h-14 w-full rounded-2xl bg-zinc-950 font-black text-white shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20"                >
                  Einloggen →
                </button>
              </form>

              <div className="mt-5 rounded-2xl bg-[#fbf7ef] px-4 py-3 text-xs font-bold text-zinc-500">
                Rollen werden automatisch erkannt.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function HeroTile({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm ring-1 ring-white/10">
      <p className="font-black">{title}</p>
      <p className="text-xs text-white/50">{text}</p>
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