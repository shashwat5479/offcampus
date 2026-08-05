"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RequestActions({ requesterId }) {
  const router = useRouter();
  const [done, setDone] = useState("");
  const [busy, setBusy] = useState(false);

  async function respond(action) {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/follow/respond", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requesterId, action }),
      });
      if (res.ok) { setDone(action === "accept" ? "Accepted" : "Declined"); router.refresh(); }
    } finally { setBusy(false); }
  }

  if (done) return <span className="text-xs text-subtle">{done}</span>;
  return (
    <div className="flex gap-2">
      <button onClick={() => respond("accept")} disabled={busy} className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-paper">Accept</button>
      <button onClick={() => respond("decline")} disabled={busy} className="rounded-full border border-line px-3 py-1 text-xs font-medium text-subtle">Decline</button>
    </div>
  );
}