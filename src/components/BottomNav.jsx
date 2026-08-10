"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

/* Icons copied from Sidebar.jsx so styling stays identical */
const I = {
  home: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>
  ),
  explore: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/></svg>
  ),
  communities: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M15.5 8a3 3 0 1 0 0-.1M3 20a6 6 0 0 1 12 0M14 20a6 6 0 0 1 7-5.2"/></svg>
  ),
  profile: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
  ),
  confessions: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h8M8 13h5"/></svg>
  ),
  opportunities: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
  ),
  notifications: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/></svg>
  ),
  settings: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 19.4a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 1.2-2.9H1a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 2.6 7a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H7a1.7 1.7 0 0 0 1-1.5V1a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V7a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>
  ),
  more: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></svg>
  ),
  close: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
  ),
};

export default function BottomNav({ me, unread = 0 }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  // Hide the bar on logged-out screens (login / onboarding etc.)
  if (!me) return null;

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const main = [
    { href: "/", label: "Home", icon: I.home },
    { href: "/search", label: "Explore", icon: I.explore },
    { href: "/communities", label: "Communities", icon: I.communities },
    { href: `/u/${me}`, label: "Profile", icon: I.profile },
  ];

  const featured = [
    { href: "/confessions", label: "Confessions", icon: I.confessions },
    { href: "/opportunities", label: "Opportunities", icon: I.opportunities },
  ];

  const utility = [
    { href: "/notifications", label: "Notifications", icon: I.notifications, dot: unread > 0 },
    { href: "/settings", label: "Settings", icon: I.settings },
  ];

  const moreActive = [...featured, ...utility].some((i) => isActive(i.href));

  return (
    <>
      {/* Separate section: Confessions + Opportunities */}
      {moreOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setMoreOpen(false)}>
          <div
            className="absolute bottom-24 left-1/2 w-[min(92vw,420px)] -translate-x-1/2 rounded-xl2 border border-line bg-paper p-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-faint">More</span>
              <button onClick={() => setMoreOpen(false)} className="rounded-full p-1 text-subtle hover:bg-canvas hover:text-ink" aria-label="Close">{I.close}</button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {featured.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMoreOpen(false)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl2 border p-4 transition-colors ${
                    isActive(href) ? "border-accent/50 bg-accent/10 text-accent" : "border-line bg-canvas text-ink hover:bg-paper"
                  }`}
                >
                  {icon}
                  <span className="text-sm font-medium">{label}</span>
                </Link>
              ))}
            </div>

            <div className="mt-2 space-y-0.5">
              {utility.map(({ href, label, icon, dot }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMoreOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive(href) ? "bg-accent/10 text-accent" : "text-subtle hover:bg-canvas hover:text-ink"
                  }`}
                >
                  <span className="relative">
                    {icon}
                    {dot && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-up" />}
                  </span>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom bar — centered floating pill on mobile and desktop */}
      <nav className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
        <div className="flex items-center gap-0.5 rounded-full border border-line bg-paper/95 px-1.5 py-1.5 shadow-2xl backdrop-blur">
          {main.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={`flex flex-col items-center gap-0.5 rounded-full px-4 py-1.5 transition-colors ${
                isActive(href) ? "bg-accent/15 text-accent" : "text-subtle hover:text-ink"
              }`}
            >
              {icon}
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          ))}

          <button
            onClick={() => setMoreOpen((v) => !v)}
            aria-label="More"
            className={`flex flex-col items-center gap-0.5 rounded-full px-4 py-1.5 transition-colors ${
              moreActive || moreOpen ? "bg-accent/15 text-accent" : "text-subtle hover:text-ink"
            }`}
          >
            {I.more}
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}