// src/components/RadarFilters.jsx
"use client";

import Link from "next/link";

const WHENS = [["today", "Today"], ["week", "This Week"], ["all", "All time"]];
// No "All Colleges" — each college's radar is separate.
const SCOPES = [["mine", "My College"], ["nearby", "Nearby Colleges"], ["online", "Online"]];

function Chip({ href, active, children }) {
  return (
    <Link
      href={href}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active ? "bg-accent text-white" : "border border-line bg-paper text-subtle hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}

export default function RadarFilters({ when, scope }) {
  return (
    <div className="mb-1 flex flex-col gap-2">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {SCOPES.map(([id, label]) => (
          <Chip key={id} href={`/radar?when=${when}&scope=${id}`} active={scope === id}>{label}</Chip>
        ))}
      </div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {WHENS.map(([id, label]) => (
          <Chip key={id} href={`/radar?when=${id}&scope=${scope}`} active={when === id}>{label}</Chip>
        ))}
      </div>
    </div>
  );
}