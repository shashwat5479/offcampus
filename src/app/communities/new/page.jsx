"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CATEGORIES = ["Hackathon", "Event", "Fest", "Club", "Study", "General"];

export default function NewCommunityPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("Hackathon");
  const [isPublic, setIsPublic] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function create() {
    if (!name.trim() || busy) return;
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/community/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: desc, category, isPublic }),
      });
      const text = await res.text();
      let d = {};
      try { d = JSON.parse(text); } catch {}
      if (!res.ok) throw new Error(d.error || `Failed (${res.status})`);
      router.push(`/c/${d.slug}`);
      router.refresh();
    } catch (e) { setErr(e.message); setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-lg py-8">
      <div className="mb-5 flex items-center gap-3">
        <Link href="/communities" className="text-subtle hover:text-ink">←</Link>
        <h1 className="text-lg font-semibold text-ink">Create a community</h1>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-subtle">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Smart India Hackathon 2026"
            className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent" />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-subtle">Description</label>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} placeholder="What's this community for?"
            className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent" />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-subtle">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <label className="flex items-center gap-3 rounded-lg border border-line bg-canvas px-3 py-2.5">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="h-4 w-4 accent-[rgb(var(--c-accent))]" />
          <span className="text-sm text-ink">
            <span className="font-medium">Public community</span>
            <span className="block text-xs text-subtle">Anyone from any college can find and join. Best for hackathons & events.</span>
          </span>
        </label>

        {err && <p className="text-xs text-up">{err}</p>}

        <button onClick={create} disabled={!name.trim() || busy}
          className="rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accentInk disabled:opacity-50">
          {busy ? "Creating…" : "Create community"}
        </button>
      </div>
    </div>
  );
}