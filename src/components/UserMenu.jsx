"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";

export default function UserMenu({ user }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const ref = useRef(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} aria-label="Settings" className="rounded-full p-2 text-subtle hover:text-ink">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-52 rounded-xl border border-line bg-paper p-1 shadow-lg">
          <Link href={`/u/${user.username}`} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink hover:bg-canvas">
            <Avatar name={user.name} seed={user.username} src={user.avatarUrl} size={28} />
            <span className="truncate">@{user.username}</span>
          </Link>
          <Link href="/settings" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-ink hover:bg-canvas">Edit profile</Link>
          <button onClick={toggleTheme} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-ink hover:bg-canvas">
            <span className="flex items-center gap-2">
              {dark ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
              )}
              Dark mode
            </span>
            <span className="text-xs text-subtle">{dark ? "On" : "Off"}</span>
          </button>
          <button onClick={logout} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-up hover:bg-canvas">Log out</button>
        </div>
      )}
    </div>
  );}