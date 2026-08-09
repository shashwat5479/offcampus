"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { timeAgo } from "@/lib/format";

export function ConfessionComposer() {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function post() {
    if (body.trim().length < 3 || busy) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/confession/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, isPublic }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || "Failed");
      setBody("");
      router.refresh();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl2 border border-line bg-paper p-4">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="Share something anonymously…"
        className="w-full resize-none bg-transparent text-sm text-ink outline-none placeholder:text-faint"
      />
      <div className="mt-2 flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs text-subtle">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-3.5 w-3.5 accent-[rgb(var(--c-accent))]"
          />
          {isPublic ? "All colleges" : "My college only"}
        </label>
        <button
          onClick={post}
          disabled={busy || body.trim().length < 3}
          className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accentInk disabled:opacity-50"
        >
          {busy ? "Posting…" : "Confess"}
        </button>
      </div>
      {err && <p className="mt-1 text-xs text-up">{err}</p>}
      <p className="mt-1 text-[11px] text-faint">Posted anonymously. Be kind — abuse gets removed.</p>
    </div>
  );
}

export function ConfessionItem({ c }) {
  const [score, setScore] = useState(c.score);
  const [dir, setDir] = useState(c.dir);
  const [reported, setReported] = useState(false);

  async function up() {
    const prevS = score;
    const prevD = dir;
    const next = dir === 1 ? 0 : 1;
    setDir(next);
    setScore(score + (next - dir));
    try {
      const res = await fetch("/api/confession/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: c.id }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setDir(prevD);
      setScore(prevS);
    }
  }

  async function report() {
    if (reported) return;
    if (!confirm("Report this confession? It'll be hidden if others report it too.")) return;
    setReported(true);
    try {
      await fetch("/api/confession/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: c.id }),
      });
    } catch {
      setReported(false);
    }
  }

  return (
    <div className="rounded-xl2 border border-line bg-paper p-4">
      <div className="mb-1 flex items-center gap-2 text-[11px] text-faint">
        <span className="font-medium text-subtle">Anonymous</span>
        {c.isPublic && (
          <span className="rounded bg-accent/12 px-1.5 py-0.5 font-medium text-accent">All colleges</span>
        )}
        <span>· {timeAgo(c.createdAt)}</span>
      </div>

      <p className="whitespace-pre-wrap text-sm text-ink">{c.body}</p>

      <div className="mt-2 flex items-center">
        <button
          onClick={up}
          className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
            dir === 1 ? "text-up" : "text-subtle hover:text-up"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={dir === 1 ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M12 5l7 8h-4v6H9v-6H5z" />
          </svg>
          {score}
        </button>

        <button
          onClick={report}
          disabled={reported}
          className="ml-3 text-xs text-faint hover:text-up disabled:opacity-50"
        >
          {reported ? "Reported" : "Report"}
        </button>
      </div>
    </div>
  );
}