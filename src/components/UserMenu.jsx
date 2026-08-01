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
      <button onClick={() => setOpen((o) => !o)} aria-label="Menu">
        <Avatar name={user.name} seed={user.username} src={user.avatarUrl} size={32} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-line bg-paper p-1 shadow-lg">
          <Link href={`/u/${user.username}`} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-ink hover:bg-canvas">Profile</Link>
          <Link href="/settings" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-ink hover:bg-canvas">Settings</Link>
          <button onClick={toggleTheme} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-ink hover:bg-canvas">
            <span>Dark mode</span><span className="text-xs text-subtle">{dark ? "On" : "Off"}</span>
          </button>
          <button onClick={logout} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-up hover:bg-canvas">Log out</button>
        </div>
      )}
    </div>
  );
}