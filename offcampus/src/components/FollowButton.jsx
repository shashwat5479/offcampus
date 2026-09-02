"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// status: "none" | "requested" | "following"
// (backward compatible: also accepts a `following` boolean)
export default function FollowButton({ userId, status, following, size = "sm" }) {
  const router = useRouter();
  const [state, setState] = useState(status || (following ? "following" : "none"));
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const prev = state;
    if (state !== "none") setState("none"); // optimistic un-follow / cancel request
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.status === 401) return router.push("/login");
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error();
      if (d.requested) setState("requested");
      else if (d.following) setState("following");
      else setState("none");
    } catch {
      setState(prev);
    } finally {
      setBusy(false);
    }
  }

  const pad = size === "lg" ? "px-4 py-1.5 text-sm" : "px-3 py-1 text-xs";
  const label = state === "following" ? "Following" : state === "requested" ? "Requested" : "Follow";
  const on = state !== "none";
  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`rounded-full border font-semibold transition-colors ${pad} ${
        on ? "border-line bg-paper text-subtle" : "border-ink bg-ink text-paper"
      } disabled:opacity-60`}
    >
      {label}
    </button>
  );
}