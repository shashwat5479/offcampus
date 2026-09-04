"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EditPostForm({ post }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: post.title || "",
    body: post.body || "",
    tags: (post.tags || []).map((t) => t.tag).join(", "),
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const field = "w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent";

  async function save() {
    if (!form.title.trim()) { setError("Give your post a title."); return; }
    setError(""); setBusy(true);
    try {
      const res = await fetch("/api/post", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, ...form }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || "Could not save."); return; }
      router.push(`/post/${post.id}`);
      router.refresh();
    } catch { setError("Network error. Try again."); } finally { setBusy(false); }
  }

  return (
    <div className="mx-auto w-full max-w-feed">
      <div className="rounded-xl2 border border-line bg-paper p-5">
        <h1 className="text-lg font-semibold tracking-tight text-ink">Edit post</h1>
        <div className="mt-4 flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-subtle">Title</label>
            <input className={field} value={form.title} onChange={set("title")} placeholder="Title" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-subtle">Body</label>
            <textarea className={field} rows={5} value={form.body} onChange={set("body")} placeholder="Say more (optional)…" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-subtle">Tags <span className="text-faint">(comma-separated)</span></label>
            <input className={field} value={form.tags} onChange={set("tags")} placeholder="events, hackathon" />
          </div>
          {(post.linkUrl) && <p className="text-xs text-faint">Media can't be changed while editing — delete and repost to change the photo/video.</p>}
          {error && <p className="text-sm text-up">{error}</p>}
          <div className="flex gap-2">
            <button onClick={save} disabled={busy} className="rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              {busy ? "Saving…" : "Save changes"}
            </button>
            <button onClick={() => router.back()} className="rounded-full border border-line px-4 py-2.5 text-sm font-medium text-subtle hover:text-ink">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
