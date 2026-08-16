"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export default function TopBar({ user, unread }) {
  const router = useRouter();
  const pathname = usePathname();

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [trending, setTrending] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [dark, setDark] = useState(true);
  const boxRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    function onDoc(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMenuOpen(false);
    router.push("/login");
    router.refresh();
  }

  async function loadTrending() {
    if (loaded) return;
    setLoaded(true);
    try {
      const res = await fetch("/api/trending");
      const d = await res.json();
      setTrending(d.trending || []);
    } catch { setTrending([]); }
  }

  function openPanel() { setOpen(true); loadTrending(); }

  function search(term) {
    const t = (term ?? q).trim();
    setOpen(false);
    router.push(t ? `/search?q=${encodeURIComponent(t)}` : "/search");
  }

  if (pathname.startsWith("/story/") || pathname.match(/^\/messages\/.+/)) return null;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-shell items-center gap-2 px-3">
          {/* Hamburger → left drawer */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-subtle transition-colors hover:bg-canvas hover:text-ink"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          </button>

          {/* Wordmark — corner brand */}
          <Link href="/" className="mr-1 hidden shrink-0 items-center sm:flex">
            <span className="font-display text-[19px] font-bold tracking-tight text-ink">OffCampus</span>
          </Link>

          {/* Search pill — logo inside, reddish-orange lining */}
          <div ref={boxRef} className="relative min-w-0 flex-1">
            <div
              onClick={() => inputRef.current?.focus()}
              className={`flex h-10 cursor-text items-center gap-2.5 rounded-full border bg-canvas px-3 transition-all duration-200 ${
                open
                  ? "border-up ring-2 ring-up/40 shadow-[0_0_0_4px_rgb(var(--c-up)/0.18)]"
                  : "border-up/60 shadow-[0_0_0_2px_rgb(var(--c-up)/0.10)] hover:border-up"
              }`}
            >
              <img src="/logo.png" alt="OffCampus" className="h-6 w-6 shrink-0 rounded-md object-contain" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={openPanel}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder="Search OffCampus"
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-subtle"
              />
            </div>

            {open && (
              <div className="absolute left-0 right-0 top-full z-40 mt-2 rounded-2xl border border-line bg-paper p-3 shadow-2xl">
                {q.trim() && (
                  <button onClick={() => search()} className="mb-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-canvas">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-faint"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" /><path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                    Search for &ldquo;{q.trim()}&rdquo;
                  </button>
                )}
                <div className="px-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-faint">Explore trending</div>
                <div className="flex flex-wrap gap-1.5">
                  {trending.length === 0 ? (
                    <span className="px-2 py-1 text-xs text-faint">{loaded ? "Nothing trending yet." : "Loading…"}</span>
                  ) : (
                    trending.map(({ tag }) => (
                      <button key={tag} onClick={() => search(tag)} className="rounded-full bg-canvas px-3 py-1.5 text-sm font-medium text-subtle transition-colors hover:text-up">
                        #{tag}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Messages + Notifications — pushed hard right */}
          <div className="ml-auto flex shrink-0 items-center gap-1">
            {user ? (
              <>
                <Link href="/messages" aria-label="Messages" className="flex h-9 w-9 items-center justify-center rounded-full text-subtle transition-colors hover:bg-canvas hover:text-ink">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                </Link>
                <Link href="/notifications" aria-label="Notifications" className="relative flex h-9 w-9 items-center justify-center rounded-full text-subtle transition-colors hover:bg-canvas hover:text-ink">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>
                  {unread > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-up"></span>}
                </Link>
              </>
            ) : (
              <Link href="/login" className="rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-paper">Log in</Link>
            )}
          </div>
        </div>
      </header>

      {/* Left drawer — OUTSIDE the header so fixed positioning covers the viewport */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] animate-fade-in bg-black/50 backdrop-blur-sm" onClick={() => setMenuOpen(false)}>
          <div
            className="animate-slide-left absolute left-0 top-0 flex h-full w-[min(84vw,320px)] flex-col overflow-y-auto border-r border-line bg-paper p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">Menu</span>
              <button onClick={() => setMenuOpen(false)} aria-label="Close" className="rounded-full p-1 text-subtle hover:bg-canvas hover:text-ink">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
              </button>
            </div>
            <Link href="/communities" onClick={() => setMenuOpen(false)} className="mb-2 flex items-center gap-3 rounded-2xl border border-line bg-canvas p-3.5 text-ink transition-colors hover:bg-paper">
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M15.5 8a3 3 0 1 0 0-.1M3 20a6 6 0 0 1 12 0M14 20a6 6 0 0 1 7-5.2"/></svg>
  <span className="text-sm font-semibold">Communities</span>
</Link>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/confessions" onClick={() => setMenuOpen(false)} className="flex flex-col items-center gap-1.5 rounded-2xl border border-line bg-canvas p-4 text-ink transition-colors hover:bg-paper">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h8M8 13h5"/></svg>
                <span className="text-sm font-medium">Confessions</span>
              </Link>
              <Link href="/opportunities" onClick={() => setMenuOpen(false)} className="flex flex-col items-center gap-1.5 rounded-2xl border border-line bg-canvas p-4 text-ink transition-colors hover:bg-paper">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                <span className="text-sm font-medium">Opportunities</span>
              </Link>
            </div>

            <div className="mt-2 space-y-0.5">
              <Link href="/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-subtle transition-colors hover:bg-canvas hover:text-ink">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 19.4a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 1.2-2.9H1a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 2.6 7a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H7a1.7 1.7 0 0 0 1-1.5V1a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V7a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>
                Settings
              </Link>
              <button onClick={toggleTheme} className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm text-subtle transition-colors hover:bg-canvas hover:text-ink">
                <span className="flex items-center gap-3">
                  {dark ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/></svg>
                  )}
                  Theme
                </span>
                <span className="text-xs text-faint">{dark ? "Dark" : "Light"}</span>
              </button>
              {user && (
                <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-up transition-colors hover:bg-canvas">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                  Log out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}