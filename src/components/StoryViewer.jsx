"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Avatar from "./Avatar";

const EMOJIS = ["❤️", "🔥", "😂", "😮", "😢", "👏"];

export default function StoryViewer({ author, stories, isOwner }) {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reactions, setReactions] = useState(() =>
    Object.fromEntries(stories.map((s) => [s.id, s.myReaction || null]))
  );
  const [burst, setBurst] = useState(null);
  const [viewers, setViewers] = useState(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const timer = useRef(null);
  const cur = stories[i];

  function close() { router.push("/"); }
  function next() { i < stories.length - 1 ? setI(i + 1) : close(); }
  function prev() { if (i > 0) setI(i - 1); }

  useEffect(() => {
    setProgress(0);
    if (!cur || cur.type === "VIDEO" || paused) return;
    const DURATION = 5000;
    const start = Date.now();
    timer.current = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / DURATION);
      setProgress(p);
      if (p >= 1) { clearInterval(timer.current); next(); }
    }, 50);
    return () => clearInterval(timer.current);
  }, [i, paused]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  async function react(emoji) {
    setReactions((r) => ({ ...r, [cur.id]: r[cur.id] === emoji ? null : emoji }));
    setBurst({ e: emoji, k: Date.now() });
    setTimeout(() => setBurst(null), 900);
    try {
      await fetch("/api/story/react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId: cur.id, emoji }),
      });
    } catch {}
  }

  async function sendReply() {
    const text = reply.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/story/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId: cur.id, text }),
      });
      if (res.ok) { setReply(""); setSent(true); setTimeout(() => setSent(false), 1500); }
      else { const d = await res.json().catch(() => ({})); alert(d.error || "Couldn't send"); }
    } catch {}
    setSending(false);
  }

  async function openViewers() {
    try {
      const res = await fetch(`/api/story/reactions?storyId=${cur.id}`);
      const data = await res.json();
      setViewers(res.ok ? data.reactions : []);
    } catch { setViewers([]); }
  }

  if (!cur) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative flex h-full max-h-[92vh] w-full max-w-[420px] flex-col">
        <div className="absolute left-0 right-0 top-2 z-10 flex gap-1 px-3">
          {stories.map((s, idx) => (
            <div key={s.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
              <div className="h-full bg-white" style={{ width: idx < i ? "100%" : idx === i ? `${progress * 100}%` : "0%" }} />
            </div>
          ))}
        </div>

        <div className="absolute left-3 top-5 z-10 flex items-center gap-2">
          <Avatar name={author.name} seed={author.id} src={author.avatarUrl} size={32} />
          <span className="text-sm font-semibold text-white drop-shadow">{author.username}</span>
        </div>
        <button onClick={close} className="absolute right-3 top-5 z-10 text-2xl leading-none text-white/90">×</button>

        {cur.type === "VIDEO" ? (
          <video key={cur.id} src={cur.mediaUrl} autoPlay onEnded={next} className="h-full w-full object-contain" />
        ) : (
          <img key={cur.id} src={cur.mediaUrl} alt="" className="h-full w-full object-contain" />
        )}

        <button onClick={prev} className="absolute left-0 top-0 z-0 h-[calc(100%-8rem)] w-1/3" aria-label="Previous" />
        <button onClick={next} className="absolute right-0 top-0 z-0 h-[calc(100%-8rem)] w-1/3" aria-label="Next" />

        {burst && (
          <div key={burst.k} className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
            <span className="animate-[floatUp_0.9s_ease-out_forwards] text-7xl">{burst.e}</span>
          </div>
        )}

        {isOwner ? (
          <button
            onClick={openViewers}
            className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium text-white backdrop-blur"
          >
            👁 Reactions
          </button>
        ) : (
          <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col gap-2 p-3">
            <div className="flex justify-center gap-3">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => react(e)}
                  className={`text-2xl transition-transform duration-150 hover:scale-125 active:scale-150 ${
                    reactions[cur.id] === e ? "scale-150 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" : "opacity-70"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onFocus={() => setPaused(true)}
                onBlur={() => setPaused(false)}
                onKeyDown={(e) => e.key === "Enter" && sendReply()}
                placeholder={`Reply to ${author.username}…`}
                className="flex-1 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/60 outline-none"
              />
              <button
                onClick={sendReply}
                disabled={!reply.trim() || sending}
                className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accentInk disabled:opacity-50"
              >
                {sent ? "Sent ✓" : "Send"}
              </button>
            </div>
          </div>
        )}

        {viewers !== null && (
          <div className="absolute inset-0 z-40 flex items-end bg-black/50" onClick={() => setViewers(null)}>
            <div onClick={(e) => e.stopPropagation()} className="max-h-[60%] w-full overflow-y-auto rounded-t-2xl bg-paper p-4">
              <div className="mb-2 text-sm font-semibold text-ink">Reactions · {viewers.length}</div>
              {viewers.length === 0 ? (
                <p className="py-6 text-center text-sm text-subtle">No reactions yet.</p>
              ) : (
                viewers.map((v) => (
                  <div key={v.user.id} className="flex items-center gap-3 py-2">
                    <Avatar name={v.user.name} seed={v.user.id} src={v.user.avatarUrl} size={34} />
                    <span className="flex-1 text-sm text-ink">{v.user.name} <span className="text-faint">@{v.user.username}</span></span>
                    <span className="text-xl">{v.emoji}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
