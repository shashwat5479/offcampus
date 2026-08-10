"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Avatar from "./Avatar";
import { uploadFile } from "@/lib/upload";

export default function SettingsForm({ user }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: user.name || "",
    bio: user.bio || "",
    avatarUrl: user.avatarUrl || "",
    isPrivate: !!user.isPrivate,
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function handleAvatar(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const { url } = await uploadFile(file);
      setForm((f) => ({ ...f, avatarUrl: url }));
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not save.");
        return;
      }
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
      <h1 className="text-lg font-semibold tracking-tight text-ink">Settings</h1>

      <div className="mt-4 flex items-center gap-4">
        <Avatar name={form.name} seed={user.id} src={form.avatarUrl} size={64} />
        <div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-lg border border-line px-3 py-2 text-xs text-subtle hover:text-ink"
          >
            {uploading ? "Uploading…" : "Change photo"}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-subtle">Name</label>
          <input className={field} value={form.name} onChange={set("name")} />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-subtle">Bio</label>
          <textarea className={field} rows={3} value={form.bio} onChange={set("bio")} placeholder="Tell people about yourself…" />
        </div>

        <label className="flex items-center gap-3 rounded-lg border border-line bg-canvas px-3 py-2.5">
          <input
            type="checkbox"
            checked={form.isPrivate}
            onChange={(e) => setForm({ ...form, isPrivate: e.target.checked })}
            className="h-4 w-4 accent-[rgb(var(--c-accent))]"
          />
          <span className="text-sm text-ink">
            <span className="font-medium">Private account</span>
            <span className="block text-xs text-subtle">Only approved followers can see your posts and stories.</span>
          </span>
        </label>

        {error && <p className="text-sm text-up">{error}</p>}

        <button
          onClick={save}
          disabled={busy || uploading}
          className="rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accentInk disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}