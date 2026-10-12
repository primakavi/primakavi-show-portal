"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { BarChart3, ChevronDown, Clapperboard, ContactRound, LayoutDashboard, Target, UsersRound } from "lucide-react";

type NavItem = { href: string; label: string; active?: (path: string) => boolean };
type GroupId = "acquisition" | "contacts" | "shows" | "crew";

const groups: { id: GroupId; title: string; icon: ReactNode; items: NavItem[] }[] = [
  { id: "acquisition", title: "Akquise", icon: <Target size={21} />, items: [
    { href: "/admin/acquisition", label: "Alle Akquisen", active: p => p.startsWith("/admin/acquisition") },
    { href: "/admin/mail", label: "Mail-Zentrale" },
    { href: "/admin/acquisition", label: "Wiedervorlagen", active: () => false },
    { href: "/admin/locations/discover", label: "Locations entdecken", active: p => p.startsWith("/admin/locations/discover") },
  ] },
  { id: "contacts", title: "Kontakte", icon: <ContactRound size={21} />, items: [
    { href: "/admin/locations", label: "Locations", active: p => p === "/admin/locations" || (p.startsWith("/admin/locations/") && !p.startsWith("/admin/locations/discover")) },
    { href: "/admin/organizers", label: "Veranstalter", active: p => p.startsWith("/admin/organizers") },
  ] },
  { id: "shows", title: "Shows", icon: <Clapperboard size={21} />, items: [
    { href: "/admin/shows", label: "Alle Shows", active: p => p.startsWith("/admin/shows") },
    { href: "/admin/tourkarte", label: "Tourkarte", active: p => p.startsWith("/admin/tourkarte") },
  ] },
  { id: "crew", title: "Crew", icon: <UsersRound size={21} />, items: [
    { href: "/admin/markus", label: "Markus", active: p => p === "/admin/markus" },
    { href: "/admin/markus/tourkarte", label: "Markus-Karte", active: p => p.startsWith("/admin/markus/tourkarte") },
  ] },
];

export default function AdminSidebar({ user, role }: { user: any; role: string | null }) {
  const pathname = usePathname();
  const isMarkusRole = role === "markus";
  const activeGroup = groups.find(g => g.items.some(item => (item.active ? item.active(pathname) : pathname === item.href)))?.id;
  const [open, setOpen] = useState<Record<GroupId, boolean>>({ acquisition: activeGroup === "acquisition", contacts: activeGroup === "contacts", shows: activeGroup === "shows", crew: activeGroup === "crew" });
  useEffect(() => {
    if (activeGroup) setOpen(prev => ({ ...prev, [activeGroup]: true }));
  }, [activeGroup]);

  return (
    <aside className="sticky top-0 hidden h-screen w-[280px] shrink-0 overflow-hidden border-r border-black/5 bg-[#fffdf8] px-5 py-5 shadow-[20px_0_60px_rgba(0,0,0,0.035)] lg:flex lg:flex-col">
      <Link href={isMarkusRole ? "/admin/markus" : "/admin"} className="mb-4 block shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[14px] bg-[#d9ff00] ring-1 ring-black/10">
            <Image src="/logo-primakavi.png" alt="primakavi" fill priority className="object-cover" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-[20px] font-black tracking-tight text-zinc-950">primakavi</div>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-500">Show Portal</span>
              <span className="h-1 w-1 rounded-full bg-zinc-300" />
              <span className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-400">V.1.03</span>
            </div>
          </div>
        </div>
      </Link>
      <div className="mb-4 border-t border-black/5" />

      <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {!isMarkusRole ? (
          <>
            <MainLink href="/admin" label="Dashboard" icon={<LayoutDashboard size={21} />} active={pathname === "/admin"} />
            {groups.slice(0, 3).map(group => (
              <NavGroup key={group.id} title={group.title} icon={group.icon} open={open[group.id]} onToggle={() => setOpen(prev => ({ ...prev, [group.id]: !prev[group.id] }))} items={group.items} pathname={pathname} />
            ))}
            <MainLink href="/admin/analytics" label="Auswertung" icon={<BarChart3 size={21} />} active={pathname.startsWith("/admin/analytics")} />
            <NavGroup title="Crew" icon={<UsersRound size={21} />} open={open.crew} onToggle={() => setOpen(prev => ({ ...prev, crew: !prev.crew }))} items={groups[3].items} pathname={pathname} />
          </>
        ) : (
          <NavGroup title="Dein Bereich" icon={<UsersRound size={21} />} open={open.crew} onToggle={() => setOpen(prev => ({ ...prev, crew: !prev.crew }))} pathname={pathname} items={[
            { href: "/admin/markus", label: "Meine Shows", active: p => p === "/admin/markus" },
            { href: "/admin/markus/tourkarte", label: "Meine Karte", active: p => p.startsWith("/admin/markus/tourkarte") },
          ]} />
        )}
      </nav>

      <div className="mt-2 shrink-0 space-y-2">
        {!isMarkusRole && (
          <Link href="/admin/help" className={`flex items-center justify-between rounded-xl px-3 py-2 text-[13px] font-bold transition ${pathname.startsWith("/admin/help") ? "bg-[#f7f3eb] text-zinc-950 ring-1 ring-black/5" : "text-zinc-400 hover:bg-[#f7f3eb] hover:text-zinc-800"}`}>
            <span className="flex items-center gap-2.5"><span className="text-[16px]">?</span>Hilfe</span>
            <span className="text-[9px] font-black uppercase tracking-[0.12em] text-zinc-300">Guide</span>
          </Link>
        )}
        <div className="border-t border-black/5 pt-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-400">Eingeloggt</p>
              <p className="mt-1 truncate text-[12px] font-black text-zinc-900">{user?.email || "—"}</p>
            </div>
            {role && <span className="shrink-0 rounded-full bg-[#f7f3eb] px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-zinc-500 ring-1 ring-black/5">{role}</span>}
          </div>
          <a href="/logout" className="mt-2 flex h-9 items-center justify-center rounded-xl bg-zinc-950 text-[12px] font-black text-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/15">Logout</a>
        </div>
      </div>
    </aside>
  );
}

function MainLink({ href, label, icon, active }: { href: string; label: string; icon: ReactNode; active: boolean }) {
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-[14px] px-2.5 py-2 text-[15px] font-black transition ${active ? "bg-[#f1eee7] text-zinc-950 ring-1 ring-black/5" : "text-zinc-800 hover:bg-[#f7f3eb]"}`}>
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${active ? "bg-[#d9ff00] ring-1 ring-black/10" : "bg-[#f1eee7]"}`}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function NavGroup({ title, icon, open, onToggle, items, pathname }: { title: string; icon: ReactNode; open: boolean; onToggle: () => void; items: NavItem[]; pathname: string }) {
  const groupActive = items.some(item => (item.active ? item.active(pathname) : pathname === item.href));
  return (
    <section>
      <button type="button" onClick={onToggle} aria-expanded={open} className={`flex w-full items-center gap-3 rounded-[14px] px-2.5 py-2 text-left text-[15px] font-black transition ${groupActive ? "bg-[#f7f3eb] text-zinc-950" : "text-zinc-800 hover:bg-[#f7f3eb]"}`}>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${groupActive ? "bg-[#d9ff00]" : "bg-[#f1eee7]"}`}>{icon}</span>
        <span className="flex-1">{title}</span>
        <ChevronDown size={17} className={`text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="ml-[54px] mt-1 space-y-0.5 pb-1">
        {items.map(item => {
          const active = item.active ? item.active(pathname) : pathname === item.href;
          return <Link key={`${item.href}-${item.label}`} href={item.href} aria-current={active ? "page" : undefined} className={`block rounded-lg px-3 py-2 text-[14px] font-semibold transition ${active ? "bg-[#f1eee7] text-zinc-950" : "text-zinc-500 hover:bg-[#f7f3eb] hover:text-zinc-950"}`}>{item.label}</Link>;
        })}
      </div>}
    </section>
  );
}
