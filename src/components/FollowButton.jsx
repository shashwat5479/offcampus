"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function FollowButton({ userId, following, size = "sm" }) {
  const router = useRouter();
  const [on, setOn] = useState(following);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const prev = on;
    setOn(!prev);
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.status === 401) return router.push("/login");
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setOn(prev);
    } finally {
      setBusy(false);
    }
  }

  const pad = size === "lg" ? "px-4 py-1.5 text-sm" : "px-3 py-1 text-xs";
  return (
    <button
      onClick={toggle}
      className={`rounded-full border font-semibold transition-colors ${pad} ${
        on ? "border-line bg-paper text-subtle" : "border-ink bg-ink text-white"
      }`}
    >
      {on ? "Following" : "Follow"}
    </button>
  );
}
