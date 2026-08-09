"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

export default function SubmitForm({ communities = [] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    communityId: "",
    title: "",
    body: "",
    mediaUrl:"",
    tags: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || "Upload failed."); return; }
      setForm((f) => ({ ...f, mediaUrl: data.url }));
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

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
          <label className="mb-1 block text-xs font-medium text-subtle">Community <span className="text-faint">(optional)</span></label>
          <select className={field} value={form.communityId} onChange={set("communityId")}>
            <option value="">No community · personal post</option>
            {communities.map((c) => (
              <option key={c.id} value={c.id}>{c.college?.code ? `${c.college.code} · ` : ""}{c.name}</option>
            ))}
          </select>
        </div>
        <input className={field} placeholder="An interesting title" value={form.title} onChange={set("title")} />
        <textarea className={`${field} resize-none`} rows={6} placeholder="Text, a link (https://…), code…" value={form.body} onChange={set("body")} />
        <div>
          <button type="button" onClick={() => fileRef.current?.click()} className="rounded-lg border border-line px-3 py-2 text-sm font-medium text-subtle">
            {uploading ? "Uploading…" : "Upload image / video"}
          </button>
          <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFile} className="hidden" />
          {form.mediaUrl && !uploading && <span className="ml-2 text-xs text-subtle">Attached ✓</span>}
        </div>
        <input className={field} placeholder="Image or video URL (optional)" value={form.mediaUrl} onChange={set("mediaUrl")} />
        <input className={field} placeholder="tags, comma, separated" value={form.tags} onChange={set("tags")} />
        {error && <p className="text-sm text-up">{error}</p>}
        <div className="flex justify-end gap-2">
          <button onClick={() => router.back()} className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-subtle">Cancel</button>
          <button onClick={submit} disabled={busy} className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper disabled:opacity-50">
            {busy ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
