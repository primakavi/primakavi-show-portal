"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar({
  user,
  role,
}: {
  user: any;
  role: string | null;
}) {
  const pathname = usePathname();
  const isMarkusView = pathname.startsWith("/admin/markus");
  const isMarkusRole = role === "markus";

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-black/5 bg-[#fffdf8] px-6 py-6 shadow-[20px_0_60px_rgba(0,0,0,0.04)] lg:flex lg:flex-col">
      <Link href={isMarkusRole ? "/admin/markus" : "/admin"} className="mb-10 block">
        <div className="flex items-center gap-4">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl bg-[#d9ff00] ring-1 ring-black/10">
            <Image
              src="/logo-primakavi.png"
              alt="primakavi"
              fill
              priority
              className="object-cover"
            />
          </div>

          <div>
            <div className="text-xl font-black tracking-tight text-zinc-950">
              primakavi
            </div>

            <div className="mt-1 flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                Show Portal
              </span>
              <span className="h-1 w-1 rounded-full bg-zinc-300" />
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
                V.1.02
              </span>
            </div>
          </div>
        </div>
      </Link>

      <nav className="space-y-6">
        {!isMarkusRole && (
          <>
            <NavSection title="Überblick">
              <SidebarLink
                href="/admin"
                label="Dashboard"
                icon="✨"
                active={pathname === "/admin"}
              />
            </NavSection>

            <NavSection title="Shows">
              <SidebarLink
                href="/admin/shows"
                label="Alle Shows"
                icon="📋"
                active={pathname.startsWith("/admin/shows")}
              />

              <SidebarLink
                href="/admin/tourkarte"
                label="Tourkarte"
                icon="🗺️"
                active={pathname.startsWith("/admin/tourkarte")}
              />
            </NavSection>
          </>
        )}

        <NavSection title={isMarkusRole ? "Dein Bereich" : "Perspektiven"}>
          <SidebarLink
            href="/admin/markus"
            label="Markus-Ansicht"
            icon="🎹"
            active={pathname === "/admin/markus"}
          />

          <SidebarLink
            href="/admin/markus/tourkarte"
            label="Markus-Karte"
            icon="🗺️"
            active={pathname.startsWith("/admin/markus/tourkarte")}
          />
        </NavSection>
      </nav>

      <div className="mt-auto space-y-4">
        <div
          className={[
            "rounded-3xl px-5 py-4 text-zinc-900 shadow-[0_10px_30px_rgba(0,0,0,0.05)] ring-1 ring-black/5",
            isMarkusView
              ? "bg-gradient-to-br from-lime-200 via-green-100 to-white"
              : "bg-gradient-to-br from-[#fff2c8] via-[#ffe1cf] to-white",
          ].join(" ")}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
            {isMarkusView ? "Markus-Modus" : "Booking"}
          </p>

          <p className="mt-3 text-sm font-black text-zinc-950">
            {isMarkusView ? "Reduzierte Ansicht aktiv" : "Show-Zentrale aktiv"}
          </p>

          <p className="mt-2 text-xs leading-relaxed text-zinc-600">
            {isMarkusView
              ? "Fokus auf Termine, Karte, Ablauf und Piano-relevante Infos."
              : "Shows, Akten, Tourplanung und interne Steuerung an einem Ort."}
          </p>
        </div>

        <div className="border-t border-black/5 pt-5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
            Eingeloggt
          </p>

          <p className="mt-2 truncate text-sm font-black text-zinc-900">
            {user?.email || "—"}
          </p>

          {role && (
            <p className="mt-1 text-xs font-bold text-zinc-400">
              Rolle: {role}
            </p>
          )}

          <a
            href="/logout"
            className="mt-4 flex h-11 items-center justify-center rounded-2xl bg-zinc-950 text-sm font-black text-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/15"
          >
            Logout
          </a>
        </div>
      </div>
    </aside>
  );
}

function NavSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 px-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
        {title}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function SidebarLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-black transition",
        active
          ? "bg-zinc-950 text-white shadow-lg shadow-black/10"
          : "text-zinc-600 hover:bg-[#fbf7ef] hover:text-zinc-950",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-9 w-9 items-center justify-center rounded-xl text-lg transition",
          active ? "bg-white/15" : "bg-white/70",
        ].join(" ")}
      >
        {icon}
      </span>

      <span>{label}</span>
    </Link>
  );
}