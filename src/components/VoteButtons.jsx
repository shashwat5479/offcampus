"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function VoteButtons({ postId, initialScore, initialDir = 0 }) {
  const router = useRouter();
  const [score, setScore] = useState(initialScore);
  const [dir, setDir] = useState(initialDir);
  const [busy, setBusy] = useState(false);

  async function vote(value) {
    if (busy) return;
    const prevDir = dir;
    const prevScore = score;
    const nextDir = prevDir === value ? 0 : value;
    setDir(nextDir);
    setScore(prevScore + (nextDir - prevDir)); // optimistic delta
    setBusy(true);
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "post", id: postId, value }),
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) throw new Error("vote failed");
      router.refresh();
    } catch {
      setDir(prevDir); // rollback
      setScore(prevScore);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex w-9 flex-col items-center gap-0.5 select-none">
      <button
        onClick={() => vote(1)}
        aria-label="Upvote"
        className="rounded p-0.5 transition-transform active:scale-90"
        style={{ color: dir === 1 ? "#e5091a" : "#9aa1ab" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill={dir === 1 ? "#e5091a" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5l7 8h-4v6H9v-6H5z" />
        </svg>
      </button>
      <span className="text-sm font-semibold tabular-nums" style={{ color: dir === 1 ? "#e5091a" : dir === -1 ? "#8a8a94" : "rgb(var(--c-ink))" }}>
        {score >= 1000 ? (score / 1000).toFixed(1).replace(/\.0$/, "") + "k" : score}
      </span>
      <button
        onClick={() => vote(-1)}
        aria-label="Downvote"
        className="rounded p-0.5 transition-transform active:scale-90"
        style={{ color: dir === -1 ? "#8a8a94" : "#9aa1ab" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill={dir === -1 ? "#8a8a94" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19l-7-8h4V5h6v6h4z" />
        </svg>
      </button>
    </div>
  );
}