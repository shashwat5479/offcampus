"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SubmitForm({ communities = [] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    communityId: communities[0]?.id || "",
    title: "",
    body: "",
    tags: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit() {
    if (!form.title.trim()) {
      setError("Give your post a title.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) return router.push("/login");
      if (!res.ok) {
        setError(data.error || "Could not publish.");
        return;
      }
      router.push(`/post/${data.id}`);
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const field = "w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm outline-none focus:border-ink";

  return (
    <div className="rounded-xl2 border border-line bg-paper p-5">
      <h1 className="text-lg font-semibold tracking-tight">Create a post</h1>
      <div className="mt-4 flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-subtle">Community</label>
          <select className={field} value={form.communityId} onChange={set("communityId")}>
            {communities.map((c) => (
              <option key={c.id} value={c.id}>{c.college?.code} · {c.name}</option>
            ))}
          </select>
        </div>
        <input className={field} placeholder="An interesting title" value={form.title} onChange={set("title")} />
        <textarea className={`${field} resize-none`} rows={6} placeholder="Text, a link (https://…), code…" value={form.body} onChange={set("body")} />
        <input className={field} placeholder="tags, comma, separated" value={form.tags} onChange={set("tags")} />
        {error && <p className="text-sm text-up">{error}</p>}
        <div className="flex justify-end gap-2">
          <button onClick={() => router.back()} className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-subtle">Cancel</button>
          <button onClick={submit} disabled={busy} className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {busy ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
