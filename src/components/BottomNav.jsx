"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Avatar from "./Avatar";

const I = {
  home: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>,
  radar: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><path d="M12 12l6-3.5"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/></svg>,
  opportunities: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  plus: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
};

export default function BottomNav({ user }) {
  const pathname = usePathname();
  if (!user) return null;
  if (pathname.startsWith("/story/") || pathname.startsWith("/messages")) return null;

  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const profileActive = pathname === `/u/${user.username}`;

  const tab = (href, label, icon) => {
    const active = isActive(href);
    return (
      <Link key={href} href={href} aria-label={label}
        className={`flex flex-1 items-center justify-center py-3 transition-colors duration-200 ${active ? "text-accent" : "text-subtle hover:text-ink"}`}>
        <span className={`transition-transform duration-200 ease-out ${active ? "scale-110" : ""}`}>{icon}</span>
      </Link>
    );
  };

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-paper/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex w-full max-w-lg items-center justify-around px-2">
        {tab("/", "Home", I.home)}
        {tab("/radar", "Radar", I.radar)}

        {/* Create — red circle */}
        <Link href="/submit" aria-label="Create" className="flex flex-1 items-center justify-center py-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white transition-transform duration-200 ease-out active:scale-90 hover:scale-105">{I.plus}</span>
        </Link>

        {tab("/opportunities", "Opportunities", I.opportunities)}

        {/* Profile avatar */}
        <Link href={`/u/${user.username}`} aria-label="Profile"
          className="flex flex-1 items-center justify-center py-3">
          <span className={`flex h-7 w-7 items-center justify-center overflow-hidden rounded-full transition-transform duration-200 ease-out ${profileActive ? "scale-110 ring-2 ring-accent" : "ring-1 ring-line"}`}>
            <Avatar name={user.name} seed={user.username} src={user.avatarUrl} size={28} />
          </span>
        </Link>
      </div>
    </nav>
  );
}
