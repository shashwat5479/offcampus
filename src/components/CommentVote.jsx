"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CommentVote({ commentId, initialScore, initialDir = 0 }) {
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
    setScore(prevScore + (nextDir - prevDir));
    setBusy(true);
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "comment", id: commentId, value }),
      });
      if (res.status === 401) return router.push("/login");
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setDir(prevDir);
      setScore(prevScore);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2 text-xs text-faint">
      <button onClick={() => vote(1)} className="hover:text-up" style={{ color: dir === 1 ? "#e8543a" : undefined }}>▲</button>
      <span className="font-semibold tabular-nums text-subtle">{score}</span>
      <button onClick={() => vote(-1)} className="hover:text-accent" style={{ color: dir === -1 ? "#3b5bfd" : undefined }}>▼</button>
    </div>
  );
}
