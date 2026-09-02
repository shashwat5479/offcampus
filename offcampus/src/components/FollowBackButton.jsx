"use client";
import { useState } from "react";

export default function FollowBackButton({ userId, iFollow = false }) {
  const [state, setState] = useState(iFollow ? "following" : null); // null | "following" | "requested"
  const [busy, setBusy] = useState(false);

  async function follow(e) {
    e.preventDefault();
    e.stopPropagation(); // don't trigger the notification's link
    if (busy || state) return;
    setBusy(true);
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) setState(d.requested ? "requested" : "following");
    } finally {
      setBusy(false);
    }
  }

  if (state === "following") return <span className="text-xs text-subtle">Following</span>;
  if (state === "requested") return <span className="text-xs text-subtle">Requested</span>;
  return (
    <button
      onClick={follow}
      disabled={busy}
      className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-paper disabled:opacity-50"
    >
      Follow back
    </button>
  );
}