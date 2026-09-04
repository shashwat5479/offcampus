"use client";

import { useState } from "react";

export default function ShareButton({ postId, title }) {
  const [copied, setCopied] = useState(false);

  async function share(e) {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/post/${postId}`;

    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch {} // user cancelled — fine
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <button onClick={share} className="flex items-center gap-1 text-xs font-medium text-subtle hover:text-ink" aria-label="Share post">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
        <path d="M8.6 13.5 15.4 17.5M15.4 6.5 8.6 10.5" />
      </svg>
      {copied ? "Copied!" : "Share"}
    </button>
  );
}
