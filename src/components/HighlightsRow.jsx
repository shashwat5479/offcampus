"use client";
import { useState } from "react";

const FILTER_MAP = {
  Warm: "sepia(0.35) saturate(1.3)", Cool: "saturate(0.8) hue-rotate(15deg) brightness(1.05)",
  "B&W": "grayscale(1)", Vintage: "sepia(0.5) contrast(0.9) brightness(1.1)",
  Vivid: "saturate(1.6) contrast(1.1)", Fade: "brightness(1.15) contrast(0.85) saturate(0.7)",
  Drama: "contrast(1.3) brightness(0.95) saturate(1.2)",
};

export default function HighlightsRow({ highlights, isMe }) {
  const [items, setItems] = useState(highlights);
  const [viewing, setViewing] = useState(null);

  async function remove(id, e) {
    e.stopPropagation();
    if (!confirm("Remove this highlight?")) return;
    try {
      const res = await fetch(`/api/highlight?id=${id}`, { method: "DELETE" });
      if (res.ok) { setItems((prev) => prev.filter((h) => h.id !== id)); setViewing(null); }
    } catch {}
  }

  if (!items || items.length === 0) return null;

  return (
    <>
      <div className="mt-4 flex gap-4 overflow-x-auto px-1 pb-1">
        {items.map((h) => (
          <button key={h.id} onClick={() => setViewing(h)} className="flex shrink-0 flex-col items-center gap-1">
            <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-line p-[2px]">
              {h.mediaType === "VIDEO" ? (
                <video src={h.coverUrl} muted className="h-full w-full rounded-full object-cover" style={h.filter ? { filter: FILTER_MAP[h.filter] } : undefined} />
              ) : (
                <img src={h.coverUrl} alt="" className="h-full w-full rounded-full object-cover" style={h.filter ? { filter: FILTER_MAP[h.filter] } : undefined} />
              )}
            </div>
            <span className="max-w-[64px] truncate text-[11px] text-subtle">{h.title}</span>
          </button>
        ))}
      </div>

      {viewing && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black" onClick={() => setViewing(null)}>
          <button onClick={() => setViewing(null)} className="absolute right-4 top-4 z-10 text-3xl text-white/90" style={{ top: "calc(1rem + env(safe-area-inset-top))" }}>×</button>
          {isMe && (
            <button onClick={(e) => remove(viewing.id, e)} className="absolute left-4 top-4 z-10 rounded-full bg-black/40 p-2 text-white/90 backdrop-blur" style={{ top: "calc(1rem + env(safe-area-inset-top))" }} aria-label="Remove highlight">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
            </button>
          )}
          <div className="mx-auto flex h-full w-full max-w-[420px] items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {viewing.mediaType === "VIDEO" ? (
              <video src={viewing.mediaUrl} controls autoPlay className="max-h-full w-full object-contain" style={viewing.filter ? { filter: FILTER_MAP[viewing.filter] } : undefined} />
            ) : (
              <img src={viewing.mediaUrl} alt="" className="max-h-full w-full object-contain" style={viewing.filter ? { filter: FILTER_MAP[viewing.filter] } : undefined} />
            )}
            {viewing.caption && (
              <div className="absolute inset-x-0 bottom-8 px-5">
                <p className="text-center text-[15px] font-medium text-white drop-shadow-lg">{viewing.caption}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
