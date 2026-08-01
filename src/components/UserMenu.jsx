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
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
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
      <button onClick={() => setOpen((o) => !o)} aria-label="Profile">
        <Avatar name={user.name} seed={user.username} src={user.avatarUrl} size={34} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border border-line bg-paper shadow-xl">
          <Link href={`/u/${user.username}`} onClick={() => setOpen(false)} className="flex flex-col items-center gap-2 border-b border-line px-4 py-5 hover:bg-canvas">
            <Avatar name={user.name} seed={user.username} src={user.avatarUrl} size={72} />
            <div className="text-center">
              <div className="text-sm font-semibold text-ink">{user.name}</div>
              <div className="text-xs text-subtle">@{user.username}</div>
            </div>
          </Link>

          <div className="p-1">
            <Link href="/settings" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-canvas">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-subtle"><circle cx="12" cy="8" r="4" /><path d="M6 21v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1" /></svg>
              <div>
                <div className="text-sm font-medium text-ink">Profile</div>
                <div className="text-xs text-subtle">Name, profile picture, bio</div>
              </div>
            </Link>

            <Link href="/settings" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-canvas">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-subtle"><path d="m21 2-2 2m-7.6 7.6a5.5 5.5 0 1 1-7.8 7.8 5.5 5.5 0 0 1 7.8-7.8zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3" /></svg>
              <div>
                <div className="text-sm font-medium text-ink">Account</div>
                <div className="text-xs text-subtle">Password, account info</div>
              </div>
            </Link>

            <button onClick={toggleTheme} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-canvas">
              {dark ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-subtle"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" /></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-subtle"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
              )}
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-ink">Dark mode</div>
                <div className="text-xs text-subtle">Theme appearance</div>
              </div>
              <span className="text-xs text-subtle">{dark ? "On" : "Off"}</span>
            </button>

            <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-canvas">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-up"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
              <div className="text-sm font-medium text-up">Log out</div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}