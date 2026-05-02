"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();
  const isMarkusView = pathname.startsWith("/admin/markus");

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-black/5 bg-white/80 p-5 shadow-xl shadow-black/5 backdrop-blur lg:block">
      <div className="mb-10">
        <div className="text-2xl font-black tracking-tight">primakavi</div>
        <div className="mt-2 inline-flex rounded-full bg-[#fbf7ef] px-3 py-1 text-xs font-black">
          SHOW PORTAL
        </div>
      </div>

      <nav className="space-y-2">
        <SidebarLink href="/admin" label="Dashboard" icon="✨" active={pathname === "/admin"} />
        <SidebarLink href="/admin/shows" label="Alle Shows" icon="📋" active={pathname.startsWith("/admin/shows")} />
        <SidebarLink href="/admin/markus" label="Markus-Ansicht" icon="🎹" active={isMarkusView} />
      </nav>

      <div
        className={[
          "absolute bottom-5 left-5 right-5 rounded-3xl p-5 shadow-sm ring-1 ring-black/5",
          isMarkusView
            ? "bg-gradient-to-br from-lime-200 via-green-100 to-white"
            : "bg-gradient-to-br from-[#fff2c8] to-[#ffe1cf]",
        ].join(" ")}
      >
        <div className="text-2xl">{isMarkusView ? "🎹" : "💡"}</div>

        <p className="mt-3 text-sm font-black">
          {isMarkusView ? "Markus-Modus aktiv" : "Booking-Zentrale"}
        </p>

        <p className="mt-1 text-xs leading-relaxed text-neutral-600">
          {isMarkusView
            ? "Reduzierte Piano-Vorschau – perfekt für Technik, Ablauf und Adresse."
            : "Alles rund um Shows, Akten und Vorbereitung."}
        </p>
      </div>
    </aside>
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
        "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition",
        active
          ? "bg-black text-white shadow-lg shadow-black/10"
          : "text-neutral-700 hover:bg-[#fbf7ef] hover:text-black",
      ].join(" ")}
    >
      <span className="text-lg">{icon}</span>
      {label}
    </Link>
  );
}