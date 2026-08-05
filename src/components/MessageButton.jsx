"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MessageButton({ otherId }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function openChat() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/message/open", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: otherId }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 403) { alert("You can only message people you're connected with."); return; }
      if (!res.ok || !data.conversationId) { alert(data.error || "Could not open chat."); return; }
      router.push(`/messages/${data.conversationId}`);
    } finally { setBusy(false); }
  }
  return (
    <button onClick={openChat} disabled={busy} className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink disabled:opacity-50">
      {busy ? "…" : "Message"}
    </button>
  );
}