"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

export default function TopBar({ user }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  function search() {
    const term = q.trim();
    router.push(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-shell items-center gap-3 px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-sm font-bold text-white"><img src="/logo.png" alt="OffCampus" className="h-8 w-8 rounded-lg object-contain" /></span>
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
          <ThemeToggle />
          {user ? (
            <>
              <Link
                href="/submit"
                className="hidden rounded-full bg-ink px-3.5 py-1.5 text-sm font-medium text-paper sm:inline-block"
              >
                New post
              </Link>
                <Link href="/settings" className="rounded-full px-2.5 py-1.5 text-sm text-subtle hover:text-ink">Settings</Link>
              <button onClick={logout} className="rounded-full px-2.5 py-1.5 text-sm text-subtle hover:text-ink">
                Log out
              </button>
            </>
          ) : (
            <Link href="/login" className="rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-white">
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
