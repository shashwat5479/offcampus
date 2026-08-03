"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import UserMenu from "./UserMenu";

export default function TopBar({ user }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  function search() {
    const term = q.trim();
    router.push(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-shell items-center gap-3 px-4">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="OffCampus" className="h-8 w-8 rounded-lg object-contain" />
          <span className="hidden text-[17px] font-semibold tracking-tight text-ink sm:block">OffCampus</span>
        </Link>

        <div className="flex h-9 flex-1 items-center gap-2 rounded-full border border-line bg-canvas px-3 sm:max-w-sm">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-faint">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Search OffCampus"
            className="w-full bg-transparent text-sm outline-none placeholder:text-faint"
          />
        </div>

        <nav className="ml-auto flex items-center gap-1">
          <Link href="/submit" aria-label="New post" className="flex h-9 w-9 items-center justify-center rounded-full text-subtle hover:bg-canvas hover:text-ink">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          </Link>
          <Link href="/notifications" aria-label="Notifications" className="relative flex h-9 w-9 items-center justify-center rounded-full text-subtle hover:bg-canvas hover:text-ink">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>
            {unread > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-up"></span>}
          </Link>
         
           {user ? (
            <UserMenu user={user} />
          ) : (
            <Link href="/login" className="rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-paper">Log in</Link>
          )}
        </nav>
      </div>
    </header>
  );
}