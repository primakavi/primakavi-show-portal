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
  const isMarkusRole = role === "markus";

  return (
    <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 overflow-hidden border-r border-black/5 bg-[#fffdf8] px-5 py-5 shadow-[20px_0_60px_rgba(0,0,0,0.035)] lg:flex lg:flex-col">
      {/* ======================================================
          LOGO
      ====================================================== */}

      <Link
        href={isMarkusRole ? "/admin/markus" : "/admin"}
        className="mb-4 block shrink-0"
      >
        <div className="flex items-center gap-3.5">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[14px] bg-[#d9ff00] ring-1 ring-black/10">
            <Image
              src="/logo-primakavi.png"
              alt="primakavi"
              fill
              priority
              className="object-cover"
            />
          </div>

          <div className="min-w-0">
            <div className="truncate text-[20px] font-black tracking-tight text-zinc-950">
              primakavi
            </div>

            <div className="mt-0.5 flex items-center gap-1.5">
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

      {/* ======================================================
          NAVIGATION
      ====================================================== */}

      <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {!isMarkusRole && (
          <>
            <SidebarLink
              href="/admin"
              label="Dashboard"
              icon="◎"
              active={pathname === "/admin"}
            />

            {/* AKQUISE */}

            <NavSection title="Akquise">
              <SidebarLink
                href="/admin/acquisition"
                label="Akquise"
                icon="🎯"
                active={pathname.startsWith("/admin/acquisition")}
              />

              <SidebarLink
                href="/admin/locations/discover"
                label="Locations entdecken"
                icon="✨"
                active={pathname.startsWith(
                  "/admin/locations/discover"
                )}
              />
            </NavSection>

            {/* KONTAKTE */}

            <NavSection title="Kontakte">
              <SidebarLink
                href="/admin/locations"
                label="Locations"
                icon="🏛️"
                active={
                  pathname === "/admin/locations" ||
                  (pathname.startsWith("/admin/locations/") &&
                    !pathname.startsWith(
                      "/admin/locations/discover"
                    ))
                }
              />

              <SidebarLink
                href="/admin/organizers"
                label="Veranstalter"
                icon="🏢"
                active={pathname.startsWith(
                  "/admin/organizers"
                )}
              />
            </NavSection>

            {/* SHOWS */}

            <NavSection title="Shows">
              <SidebarLink
                href="/admin/shows"
                label="Shows"
                icon="🎭"
                active={pathname.startsWith("/admin/shows")}
              />

              <SidebarLink
                href="/admin/tourkarte"
                label="Tourkarte"
                icon="🗺️"
                active={pathname.startsWith(
                  "/admin/tourkarte"
                )}
              />
            </NavSection>

            {/* AUSWERTUNG */}

            <NavSection title="Auswertung">
              <SidebarLink
                href="/admin/insights"
                label="Auswertung"
                icon="📊"
                active={pathname.startsWith(
                  "/admin/insights"
                )}
              />
            </NavSection>

            {/* MARKUS */}

            <NavSection title="Markus">
              <SidebarLink
                href="/admin/markus"
                label="Markus"
                icon="🎹"
                active={pathname === "/admin/markus"}
              />

              <SidebarLink
                href="/admin/markus/tourkarte"
                label="Markus-Karte"
                icon="🗺️"
                active={pathname.startsWith(
                  "/admin/markus/tourkarte"
                )}
              />
            </NavSection>
          </>
        )}

        {/* MARKUS-ROLLE */}

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
              active={pathname.startsWith(
                "/admin/markus/tourkarte"
              )}
            />
          </NavSection>
        )}
      </nav>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className="mt-2 shrink-0 space-y-2">
        {!isMarkusRole && (
          <Link
            href="/admin/help"
            className={[
              "flex items-center justify-between rounded-xl px-3 py-2 text-[13px] font-bold transition",
              pathname.startsWith("/admin/help")
                ? "bg-[#f7f3eb] text-zinc-950 ring-1 ring-black/5"
                : "text-zinc-400 hover:bg-[#f7f3eb] hover:text-zinc-800",
            ].join(" ")}
          >
            <span className="flex items-center gap-2.5">
              <span className="text-[16px]">?</span>
              Hilfe
            </span>

            <span className="text-[9px] font-black uppercase tracking-[0.12em] text-zinc-300">
              Guide
            </span>
          </Link>
        )}

        <div className="border-t border-black/5 pt-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-400">
                Eingeloggt
              </p>

              <p className="mt-1 truncate text-[12px] font-black text-zinc-900">
                {user?.email || "—"}
              </p>
            </div>

            {role && (
              <span className="shrink-0 rounded-full bg-[#f7f3eb] px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-zinc-500 ring-1 ring-black/5">
                {role}
              </span>
            )}
          </div>

          <a
            href="/logout"
            className="mt-2 flex h-9 items-center justify-center rounded-xl bg-zinc-950 text-[12px] font-black text-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/15"
          >
            Logout
          </a>
        </div>
      </div>
    </aside>
  );
}

// ============================================================
// SECTION
// ============================================================

function NavSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="mb-1 px-3 pt-0.5 text-[9px] font-black uppercase tracking-[0.17em] text-zinc-400">
        {title}
      </p>

      <div className="space-y-0.5">
        {children}
      </div>
    </section>
  );
}

// ============================================================
// LINK
// ============================================================

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
        "group flex items-center gap-3 rounded-[14px] px-3 py-1.5 text-[13.5px] font-bold transition-all",
        active
          ? "bg-[#f1eee7] text-zinc-950 ring-1 ring-black/5"
          : "text-zinc-500 hover:bg-[#f7f3eb] hover:text-zinc-950",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-[16px] transition",
          active
            ? "bg-[#d9ff00] text-zinc-950 ring-1 ring-black/10"
            : "bg-white ring-1 ring-black/5 group-hover:bg-[#fffdf8]",
        ].join(" ")}
      >
        {icon}
      </span>

      <span className="truncate">
        {label}
      </span>
    </Link>
  );
}