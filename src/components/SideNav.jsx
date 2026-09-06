"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Avatar from "./Avatar";

const icon = {
  home: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  radar: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><path d="M12 12l6-3.5"/></>,
  create: <path d="M12 5v14M5 12h14" />,
  opportunities: <><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
  communities: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
  confessions: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  messages: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />,
  notifications: <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
};

function Svg({ d }) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
}

export default function SideNav({ user }) {
  const pathname = usePathname();
  if (!user) return null;
  if (pathname.startsWith("/story/") || pathname.startsWith("/messages")) return null;

  const active = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const items = [
    { href: "/", label: "Home", d: icon.home },
    { href: "/radar", label: "Radar", d: icon.radar },
    { href: "/search", label: "Search", d: icon.search },
    { href: "/communities", label: "Communities", d: icon.communities },
    { href: "/confessions", label: "Confessions", d: icon.confessions },
    { href: "/opportunities", label: "Opportunities", d: icon.opportunities },
    { href: "/messages", label: "Messages", d: icon.messages },
    { href: "/notifications", label: "Notifications", d: icon.notifications },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[240px] flex-col border-r border-line bg-paper/95 px-3 py-5 backdrop-blur lg:flex">
      {/* Logo */}
      <Link href="/" className="mb-6 flex items-center gap-2 px-2">
        <span className="text-xl font-bold tracking-tight text-ink">OffCampus</span>
      </Link>

      {/* Create — prominent */}
      <Link href="/submit"
        className="mb-2 flex items-center gap-3 rounded-xl bg-accent px-4 py-2.5 font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95">
        <Svg d={icon.create} /> Create
      </Link>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {items.map((it) => {
          const on = active(it.href);
          return (
            <Link key={it.href} href={it.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition-colors ${on ? "bg-accent/15 font-semibold text-accent" : "text-subtle hover:bg-canvas hover:text-ink"}`}>
              <Svg d={it.d} />
              <span>{it.label}</span>
            </Link>
          );
        })}

        <div className="my-2 border-t border-line" />

        <Link href="/settings"
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition-colors ${active("/settings") ? "bg-accent/15 font-semibold text-accent" : "text-subtle hover:bg-canvas hover:text-ink"}`}>
          <Svg d={icon.settings} />
          <span>Settings</span>
        </Link>
      </nav>

      {/* Profile at the bottom */}
      <Link href={`/u/${user.username}`}
        className="mt-2 flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-canvas">
        <span className="overflow-hidden rounded-full ring-1 ring-line">
          <Avatar name={user.name} seed={user.username} src={user.avatarUrl} size={34} />
        </span>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-ink">{user.name}</div>
          <div className="truncate text-xs text-subtle">@{user.username}</div>
        </div>
      </Link>
    </aside>
  );
}
