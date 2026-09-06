"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import Avatar from "./Avatar";

const I = {
  home: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>,
  radar: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><path d="M12 12l6-3.5"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/></svg>,
  opportunities: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  plus: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
};

export default function BottomNav({ user }) {
  const pathname = usePathname();
  const wrapRef = useRef(null);
  const itemRefs = useRef({});
  const [pill, setPill] = useState({ left: 0, width: 0, show: false });

  const items = user
    ? [
        { key: "/", label: "Home", icon: I.home },
        { key: "/radar", label: "Radar", icon: I.radar },
        { key: "__create__", label: "Create", icon: I.plus, create: true, href: "/submit" },
        { key: "/opportunities", label: "Opportunities", icon: I.opportunities },
        { key: `/u/${user.username}`, label: "Profile", profile: true },
      ]
    : [];

  const activeKey = (() => {
    if (!user) return null;
    if (pathname === "/") return "/";
    if (pathname === `/u/${user.username}`) return `/u/${user.username}`;
    const hit = items.find((it) => it.key !== "/" && !it.create && pathname.startsWith(it.key));
    return hit?.key || null;
  })();

  // Slide the highlight pill under the active item
  useLayoutEffect(() => {
    if (!activeKey) { setPill((p) => ({ ...p, show: false })); return; }
    const el = itemRefs.current[activeKey];
    const wrap = wrapRef.current;
    if (el && wrap) {
      const eb = el.getBoundingClientRect();
      const wb = wrap.getBoundingClientRect();
      setPill({ left: eb.left - wb.left, width: eb.width, show: true });
    }
  }, [activeKey, pathname, user]);

  if (!user) return null;
  if (pathname.startsWith("/story/") || pathname.startsWith("/messages")) return null;

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <div ref={wrapRef} className="relative flex items-center gap-1 rounded-full border border-line bg-paper/95 px-2 py-1.5 shadow-2xl backdrop-blur">
        {/* Sliding highlight pill */}
        <span
          className="pointer-events-none absolute top-1/2 -z-0 h-[calc(100%-0.5rem)] -translate-y-1/2 rounded-full bg-accent/15 transition-all duration-300 ease-out"
          style={{ left: pill.left, width: pill.width, opacity: pill.show ? 1 : 0 }}
        />

        {items.map((it) => {
          const active = activeKey === it.key;

          if (it.create) {
            return (
              <Link key={it.key} href={it.href} aria-label="Create"
                ref={(el) => (itemRefs.current[it.key] = el)}
                className="relative z-10 flex flex-col items-center gap-0.5 px-2 py-1">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-white shadow-glow transition-transform duration-200 active:scale-90 hover:scale-105">{it.icon}</span>
                <span className="text-[10px] font-medium text-subtle">{it.label}</span>
              </Link>
            );
          }

          if (it.profile) {
            return (
              <Link key={it.key} href={it.key} aria-label="Profile"
                ref={(el) => (itemRefs.current[it.key] = el)}
                className={`relative z-10 flex flex-col items-center gap-0.5 rounded-full px-3.5 py-1.5 transition-colors duration-200 ${active ? "text-accent" : "text-subtle hover:text-ink"}`}>
                <span className={`flex h-[22px] w-[22px] items-center justify-center overflow-hidden rounded-full transition-transform duration-200 ${active ? "scale-110 ring-2 ring-accent" : ""}`}>
                  <Avatar name={user.name} seed={user.username} src={user.avatarUrl} size={22} />
                </span>
                <span className="text-[10px] font-medium">{it.label}</span>
              </Link>
            );
          }

          return (
            <Link key={it.key} href={it.key} aria-label={it.label}
              ref={(el) => (itemRefs.current[it.key] = el)}
              className={`relative z-10 flex flex-col items-center gap-0.5 rounded-full px-3.5 py-1.5 transition-colors duration-200 ${active ? "text-accent" : "text-subtle hover:text-ink"}`}>
              <span className={`transition-transform duration-200 ${active ? "-translate-y-0.5 scale-110" : ""}`}>{it.icon}</span>
              <span className="text-[10px] font-medium">{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
