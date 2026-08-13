"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RequestActions({ requesterId, iFollow = false }) {
  const router = useRouter();
  const [state, setState] = useState(null);          // null | "accepted" | "declined"
  const [back, setBack] = useState(iFollow ? "following" : null); // null | "following" | "requested"
  const [busy, setBusy] = useState(false);

  function stop(e) { e.preventDefault(); e.stopPropagation(); }

  async function respond(e, action) {
    stop(e);
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/follow/respond", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requesterId, action }),
      });
      if (res.ok) { setState(action === "accept" ? "accepted" : "declined"); router.refresh(); }
    } finally { setBusy(false); }
  }

  async function followBack(e) {
    stop(e);
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/follow", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: requesterId }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) setBack(d.requested ? "requested" : "following");
    } finally { setBusy(false); }
  }

  if (state === "declined") return <span className="text-xs text-subtle">Declined</span>;

  if (state === "accepted") {
    if (back === "requested") return <span className="text-xs text-subtle">Requested</span>;
    if (back === "following") return <span className="text-xs text-subtle">Accepted</span>;
    // accepted, but you don't follow them yet → let them follow back
    return (
      <button onClick={followBack} disabled={busy} className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-paper">
        Follow back
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      <button onClick={(e) => respond(e, "accept")} disabled={busy} className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-paper">Accept</button>
      <button onClick={(e) => respond(e, "decline")} disabled={busy} className="rounded-full border border-line px-3 py-1 text-xs font-medium text-subtle">Decline</button>
    </div>
  );
}