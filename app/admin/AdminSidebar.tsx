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
    <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 border-r border-black/5 bg-[#fffdf8] px-5 py-5 shadow-[20px_0_60px_rgba(0,0,0,0.035)] lg:flex lg:flex-col">
      <Link
        href={isMarkusRole ? "/admin/markus" : "/admin"}
        className="mb-8 block"
      >
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[#d9ff00] ring-1 ring-black/10">
            <Image
              src="/logo-primakavi.png"
              alt="primakavi"
              fill
              priority
              className="object-cover"
            />
          </div>

          <div className="min-w-0">
            <div className="truncate text-lg font-black tracking-tight text-zinc-950">
              primakavi
            </div>

            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-500">
                Show Portal
              </span>
              <span className="h-1 w-1 rounded-full bg-zinc-300" />
              <span className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-400">
                V.1.03
              </span>
            </div>
          </div>
        </div>
      </Link>

      <nav className="space-y-5">
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

              <SidebarLink
                href="/admin/insights"
                label="Auswertung"
                icon="📊"
                active={pathname.startsWith("/admin/insights")}
              />
            </NavSection>

            <NavSection title="Ansichten">
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
          </>
        )}

        {isMarkusRole && (
          <NavSection title="Dein Bereich">
            <SidebarLink
              href="/admin/markus"
              label="Meine Shows"
              icon="🎹"
              active={pathname === "/admin/markus"}
            />

            <SidebarLink
              href="/admin/markus/tourkarte"
              label="Meine Karte"
              icon="🗺️"
              active={pathname.startsWith("/admin/markus/tourkarte")}
            />
          </NavSection>
        )}
      </nav>

      <div className="mt-auto space-y-4">
        <div
          className={[
            "rounded-2xl px-4 py-3 text-zinc-900 shadow-[0_10px_30px_rgba(0,0,0,0.04)] ring-1 ring-black/5",
            isMarkusView
              ? "bg-gradient-to-br from-lime-100 via-green-50 to-white"
              : "bg-gradient-to-br from-[#fff4d4] via-[#ffe8dc] to-white",
          ].join(" ")}
        >
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-500">
            {isMarkusView ? "Markus-Modus" : "Booking"}
          </p>

          <p className="mt-2 text-[13px] font-black text-zinc-950">
            {isMarkusView ? "Reduzierte Ansicht" : "Show-Zentrale aktiv"}
          </p>

          <p className="mt-1.5 text-[11px] font-medium leading-relaxed text-zinc-600">
            {isMarkusView
              ? "Termine, Karte, Ablauf und Piano-relevante Infos."
              : "Shows, Akten, Tourplanung und interne Steuerung."}
          </p>
        </div>

        {!isMarkusRole && (
          <div>
            <Link
              href="/admin/help"
              className={[
                "flex items-center justify-between rounded-xl px-3 py-2 text-[13px] font-bold transition",
                pathname.startsWith("/admin/help")
                  ? "bg-[#f7f3eb] text-zinc-950 ring-1 ring-black/5"
                  : "text-zinc-400 hover:bg-[#f7f3eb] hover:text-zinc-800",
              ].join(" ")}
            >
              <span className="flex items-center gap-2">
                <span className="text-sm">?</span>
                Hilfe
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.12em] text-zinc-300">
                Guide
              </span>
            </Link>
          </div>
        )}

        <div className="border-t border-black/5 pt-4">
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-400">
            Eingeloggt
          </p>

          <p className="mt-2 truncate text-[13px] font-black text-zinc-900">
            {user?.email || "—"}
          </p>

          {role && (
            <p className="mt-1 text-[11px] font-bold text-zinc-400">
              Rolle: {role}
            </p>
          )}

          <a
            href="/logout"
            className="mt-3 flex h-10 items-center justify-center rounded-xl bg-zinc-950 text-[13px] font-black text-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/15"
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
    <section>
      <p className="mb-2 px-3 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-400">
        {title}
      </p>
      <div className="space-y-1">{children}</div>
    </section>
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
        "group flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-bold transition-all",
        active
          ? "bg-zinc-950 text-white shadow-md shadow-black/5"
          : "text-zinc-500 hover:bg-[#f7f3eb] hover:text-zinc-950",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[15px] transition",
          active
            ? "bg-white/10"
            : "bg-white ring-1 ring-black/5 group-hover:bg-[#fffdf8]",
        ].join(" ")}
      >
        {icon}
      </span>

      <span className="truncate">{label}</span>
    </Link>
  );
}