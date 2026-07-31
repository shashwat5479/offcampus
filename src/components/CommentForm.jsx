"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CommentForm({ postId, loggedIn }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loggedIn) {
    return (
      <p className="rounded-lg bg-canvas px-3 py-2 text-sm text-subtle">
        <a href="/login" className="font-medium text-accent">Log in</a> to join the conversation.
      </p>
    );
  }

  async function submit() {
    const text = body.trim();
    if (!text || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, body: text }),
      });
      if (res.status === 401) return router.push("/login");
      if (!res.ok) throw new Error();
      setBody("");
      router.refresh();
    } catch {
      // leave text so the user can retry
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-2">
      <input
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Add a comment…"
        className="flex-1 rounded-lg border border-line bg-canvas px-3 py-2 text-sm outline-none focus:border-ink"
      />
      <button onClick={submit} disabled={busy} className="rounded-lg bg-ink px-4 text-sm font-medium text-white disabled:opacity-50">
        {busy ? "…" : "Reply"}
      </button>
    </div>
  );
}
