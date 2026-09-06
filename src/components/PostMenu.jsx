"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// `onDeleted` (optional): called to remove the card from a list instantly.
// If not provided, we navigate home after delete (used on the post detail page).
export default function PostMenu({ postId, onDeleted }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function del(e) {
    e.preventDefault(); e.stopPropagation();
    if (!confirm("Delete this post? This can't be undone.")) return;
    setOpen(false);

    // Optimistic: act instantly, fire the server call in the background.
    if (onDeleted) {
      onDeleted(); // parent hides the card immediately
      fetch(`/api/post?id=${postId}`, { method: "DELETE" }).catch(() => {});
    } else {
      // On the detail page: leave instantly, delete in the background.
      router.push("/");
      fetch(`/api/post?id=${postId}`, { method: "DELETE" }).then(() => router.refresh()).catch(() => {});
    }
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
          <div className="absolute right-0 top-7 z-20 w-36 overflow-hidden rounded-xl border border-line bg-paper py-1 shadow-lg">
            <Link
              href={`/post/${postId}/edit`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-canvas"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
              Edit post
            </Link>
            <button onClick={del} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-up hover:bg-canvas">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
              Delete post
            </button>
          </div>
        </>
      )}
    </div>
  );
}
