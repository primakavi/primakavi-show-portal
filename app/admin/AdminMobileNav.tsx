"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function AdminMobileNav({
  user,
  role,
}: {
  user: any;
  role: string | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isMarkusRole = role === "markus";

  const links = isMarkusRole
    ? [
        { href: "/admin/markus", label: "Meine Shows", icon: "🎹" },
        { href: "/admin/markus/tourkarte", label: "Meine Karte", icon: "🗺️" },
      ]
    : [
        { href: "/admin", label: "Dashboard", icon: "✨" },
        { href: "/admin/shows", label: "Alle Shows", icon: "📋" },
        { href: "/admin/tourkarte", label: "Tourkarte", icon: "🗺️" },
        { href: "/admin/markus", label: "Markus-Ansicht", icon: "🎹" },
        { href: "/admin/markus/tourkarte", label: "Markus-Karte", icon: "🗺️" },
        { href: "/admin/help", label: "Hilfe", icon: "?" },
      ];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-black/5 bg-[#fbf7ef]/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-lg shadow-black/5">
          <Link href={isMarkusRole ? "/admin/markus" : "/admin"} className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-2xl bg-[#d9ff00] ring-1 ring-black/10">
              <Image
                src="/logo-primakavi.png"
                alt="primakavi"
                fill
                priority
                className="object-cover"
              />
            </div>

            <div>
              <p className="text-sm font-black text-zinc-950">primakavi</p>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                Show Portal
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full bg-zinc-950 px-4 py-2 text-xs font-black text-white"
          >
            Menü
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            aria-label="Menü schließen"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <aside className="absolute right-0 top-0 flex h-full w-[86vw] max-w-sm flex-col bg-[#fffdf8] px-5 py-5 shadow-2xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-lg font-black text-zinc-950">Menü</p>
                <p className="text-xs font-bold text-zinc-400">
                  {isMarkusRole ? "Markus-Bereich" : "Admin-Bereich"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-lg font-black text-white"
              >
                ×
              </button>
            </div>

            <nav className="space-y-2">
              {links.map((link) => {
                const active =
                  link.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={[
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition",
                      active
                        ? "bg-zinc-950 text-white shadow-lg shadow-black/10"
                        : "text-zinc-600 hover:bg-[#fbf7ef] hover:text-zinc-950",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "flex h-9 w-9 items-center justify-center rounded-xl text-lg",
                        active ? "bg-white/15" : "bg-white",
                      ].join(" ")}
                    >
                      {link.icon}
                    </span>
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-black/5 pt-5">
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
                className="mt-4 flex h-11 items-center justify-center rounded-2xl bg-zinc-950 text-sm font-black text-white"
              >
                Logout
              </a>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}