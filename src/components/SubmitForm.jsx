"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { uploadFile } from "@/lib/upload";

export default function SubmitForm({ communities = [] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    communityId: "",
    title: "",
    body: "",
    mediaUrl: "",
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
      const { url } = await uploadFile(file);
      setForm((f) => ({ ...f, mediaUrl: url }));
    } catch (err) {
      setError(err.message || "Upload failed.");
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

  const field = "w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent";

  return (
    <div className="rounded-xl2 border border-line bg-paper p-5">
      <h1 className="text-lg font-semibold tracking-tight text-ink">Create a post</h1>
      <div className="mt-4 flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-subtle">
            Community <span className="text-faint">(optional)</span>
          </label>
          <select className={field} value={form.communityId} onChange={set("communityId")}>
            <option value="">No community · personal post</option>
            {communities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.college?.code ? `${c.college.code} · ` : ""}{c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-subtle">Title</label>
          <input className={field} value={form.title} onChange={set("title")} placeholder="What's up?" />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-subtle">Body</label>
          <textarea className={field} rows={4} value={form.body} onChange={set("body")} placeholder="Say more (optional)…" />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-subtle">Photo / video (optional)</label>
          <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFile} className="hidden" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-lg border border-line px-3 py-2 text-xs text-subtle hover:text-ink"
          >
            {uploading ? "Uploading…" : form.mediaUrl ? "Change media" : "Add photo / video"}
          </button>
          {form.mediaUrl && (
            <div className="mt-2 overflow-hidden rounded-lg border border-line">
              {/\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(form.mediaUrl) ? (
                <video src={form.mediaUrl} controls className="max-h-64 w-full object-contain" />
              ) : (
                <img src={form.mediaUrl} alt="" className="max-h-64 w-full object-contain" />
              )}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-subtle">Tags <span className="text-faint">(comma-separated)</span></label>
          <input className={field} value={form.tags} onChange={set("tags")} placeholder="events, hackathon" />
        </div>

        {error && <p className="text-sm text-up">{error}</p>}

        <button
          onClick={submit}
          disabled={busy || uploading}
          className="rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accentInk disabled:opacity-50"
        >
          {busy ? "Publishing…" : "Publish"}
        </button>
      </div>
    </div>
  );
}