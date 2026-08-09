"use client";

import { useState } from "react";

const OPTIONS = [
  ["", "Track"],
  ["SAVED", "Saved"],
  ["APPLIED", "Applied"],
  ["INTERVIEWING", "Interviewing"],
  ["OFFER", "Offer"],
  ["REJECTED", "Rejected"],
];

const COLOR = {
  SAVED: "bg-line text-ink",
  APPLIED: "bg-accent/15 text-accent",
  INTERVIEWING: "bg-up/15 text-up",
  OFFER: "bg-green-500/15 text-green-500",
  REJECTED: "bg-line text-faint",
};

export default function StatusPicker({ opportunityId, initial }) {
  const [status, setStatus] = useState(initial || "");
  const [busy, setBusy] = useState(false);

  async function change(next) {
    setBusy(true);
    const prev = status;
    setStatus(next);
    try {
      const res = await fetch("/api/opportunity/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId, status: next }),
      });
      if (!res.ok) setStatus(prev);
    } catch { setStatus(prev); }
    setBusy(false);
  }

  return (
    <select
      value={status}
      disabled={busy}
      onChange={(e) => change(e.target.value)}
      className={`rounded-full px-2.5 py-1 text-xs font-medium outline-none ${status ? COLOR[status] : "border border-line text-subtle"}`}
    >
      {OPTIONS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
    </select>
  );
}