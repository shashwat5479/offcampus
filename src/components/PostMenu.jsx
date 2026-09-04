"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PostMenu({ postId }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function del(e) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    if (!confirm("Delete this post? This can't be undone.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/post?id=${postId}`, { method: "DELETE" });
      if (res.ok) { router.refresh(); router.push("/"); }
      else { const d = await res.json().catch(() => ({})); alert(d.error || "Couldn't delete."); setBusy(false); }
    } catch { setBusy(false); }
  }

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }}
        className="rounded-full p-1 text-subtle hover:bg-canvas hover:text-ink"
        aria-label="Post options"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); }} />
          <div className="absolute right-0 top-7 z-20 w-36 rounded-xl border border-line bg-paper py-1 shadow-lg">
            <button onClick={del} disabled={busy} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-up hover:bg-canvas disabled:opacity-50">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
              {busy ? "Deleting…" : "Delete post"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
