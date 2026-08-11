"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Avatar from "./Avatar";

const I = {
  home: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>,
  communities: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M15.5 8a3 3 0 1 0 0-.1M3 20a6 6 0 0 1 12 0M14 20a6 6 0 0 1 7-5.2"/></svg>,
  create: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  opportunities: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
};

export default function BottomNav({ user }) {
  const pathname = usePathname();

  // Hide while viewing a story or inside a chat
  const hideNav = pathname.startsWith("/story/") || pathname.startsWith("/messages/");
  if (!user || hideNav) return null;

  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const profileActive = pathname === `/u/${user.username}`;

  const slot = (href, label, icon) => {
    const active = isActive(href);
    return (
      <Link
        key={href}
        href={href}
        aria-label={label}
        className={`flex flex-col items-center gap-0.5 rounded-full px-3.5 py-1.5 transition-colors ${
          active ? "bg-accent/15 text-accent" : "text-subtle hover:text-ink"
        }`}
      >
        {icon}
        <span className="text-[10px] font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-full border border-line bg-paper/95 px-2 py-1.5 shadow-2xl backdrop-blur">
        {slot("/", "Home", I.home)}
        {slot("/communities", "Communities", I.communities)}

        {/* Create — same size as the rest, accent-colored */}
        <Link
          href="/submit"
          aria-label="Create"
          className={`flex flex-col items-center gap-0.5 rounded-full px-3.5 py-1.5 transition-colors ${
            isActive("/submit") ? "bg-accent/15 text-accent" : "text-accent hover:opacity-80"
          }`}
        >
          {I.create}
          <span className="text-[10px] font-medium">Create</span>
        </Link>

        {slot("/opportunities", "Opportunities", I.opportunities)}

        {/* Profile — avatar, same 22px footprint */}
        <Link
          href={`/u/${user.username}`}
          aria-label="Profile"
          className={`flex flex-col items-center gap-0.5 rounded-full px-3.5 py-1.5 transition-colors ${
            profileActive ? "text-accent" : "text-subtle hover:text-ink"
          }`}
        >
          <span className={`flex h-[22px] w-[22px] items-center justify-center overflow-hidden rounded-full ${profileActive ? "ring-2 ring-accent" : ""}`}>
            <Avatar name={user.name} seed={user.username} src={user.avatarUrl} size={22} />
          </span>
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </div>
    </nav>
  );
}