"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const FILTER_MAP = {
  Warm: "sepia(0.35) saturate(1.3)", Cool: "saturate(0.8) hue-rotate(15deg) brightness(1.05)",
  "B&W": "grayscale(1)", Vintage: "sepia(0.5) contrast(0.9) brightness(1.1)",
  Vivid: "saturate(1.6) contrast(1.1)", Fade: "brightness(1.15) contrast(0.85) saturate(0.7)",
  Drama: "contrast(1.3) brightness(0.95) saturate(1.2)",
};
function fcss(f) { return f ? FILTER_MAP[f] : undefined; }

export default function HighlightsRow({ highlights, isMe, myStories = [] }) {
  const router = useRouter();
  const [items, setItems] = useState(highlights);
  const [viewing, setViewing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [picked, setPicked] = useState(null);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  async function remove(id, e) {
    e.stopPropagation();
    if (!confirm("Remove this highlight?")) return;
    try {
      const res = await fetch(`/api/highlight?id=${id}`, { method: "DELETE" });
      if (res.ok) { setItems((prev) => prev.filter((h) => h.id !== id)); setViewing(null); }
    } catch {}
  }

  async function saveHighlight() {
    if (!picked || saving) return;
    setSaving(true); setSaveErr("");
    try {
      const res = await fetch("/api/highlight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaUrl: picked.mediaUrl,
          mediaType: picked.type,
          caption: picked.caption || null,
          filter: picked.filter || null,
          title: title.trim() || "Highlight",
        }),
      });
      if (res.ok) {
        setAdding(false); setPicked(null); setTitle(""); setSaveErr("");
        router.refresh();
      } else {
        const d = await res.json().catch(() => ({}));
        setSaveErr(d.error || "Couldn't save — the highlights table may not be set up yet.");
      }
    } catch { setSaveErr("Network error. Try again."); } finally { setSaving(false); }
  }

  const hasRow = (items && items.length > 0) || isMe;
  if (!hasRow) return null;

  return (
    <>
      <div className="mt-4 flex gap-4 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* + New (owner only) */}
        {isMe && (
          <button onClick={() => setAdding(true)} className="flex shrink-0 flex-col items-center gap-1">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-line text-2xl text-subtle transition-colors hover:border-accent hover:text-accent">+</div>
            <span className="text-[11px] text-subtle">New</span>
          </button>
        )}

        {items.map((h) => (
          <button key={h.id} onClick={() => setViewing(h)} className="flex shrink-0 flex-col items-center gap-1">
            <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-line p-[2px]">
              {h.mediaType === "VIDEO" ? (
                <video src={h.coverUrl} muted className="h-full w-full rounded-full object-cover" style={{ filter: fcss(h.filter) }} />
              ) : (
                <img src={h.coverUrl} alt="" className="h-full w-full rounded-full object-cover" style={{ filter: fcss(h.filter) }} />
              )}
            </div>
            <span className="max-w-[64px] truncate text-[11px] text-subtle">{h.title}</span>
          </button>
        ))}
      </div>

      {/* Add-highlight picker */}
      {adding && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 sm:items-center" onClick={() => setAdding(false)}>
          <div onClick={(e) => e.stopPropagation()} className="flex max-h-[85vh] w-full max-w-md flex-col rounded-t-2xl border border-line bg-paper sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h3 className="text-sm font-semibold text-ink">New Highlight</h3>
              <button onClick={() => setAdding(false)} className="text-lg text-subtle">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3">
            {myStories.length === 0 ? (
              <p className="py-8 text-center text-sm text-subtle">
                No stories yet.<br />
                <span className="text-xs text-faint">Post a story and it&apos;ll appear here to add to highlights.</span>
              </p>
            ) : (
              <>
                <p className="mb-2 text-xs text-subtle">Your story archive — pick any to highlight:</p>
                <div className="grid grid-cols-4 gap-2">
                  {myStories.map((s) => (
                    <button key={s.id} onClick={() => setPicked(s)}
                      className={`relative aspect-[9/16] overflow-hidden rounded-lg border-2 ${picked?.id === s.id ? "border-accent" : "border-transparent"}`}>
                      {s.type === "VIDEO" ? (
                        <video src={s.mediaUrl} muted className="h-full w-full object-cover" style={{ filter: fcss(s.filter) }} />
                      ) : (
                        <img src={s.mediaUrl} alt="" className="h-full w-full object-cover" style={{ filter: fcss(s.filter) }} />
                      )}
                      {s.expiresAt && new Date(s.expiresAt) > new Date() && (
                        <span className="absolute left-1 top-1 rounded bg-accent px-1 text-[8px] font-bold text-white">LIVE</span>
                      )}
                    </button>
                  ))}
                </div>
                <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={30} placeholder="Highlight name (e.g. Trip)"
                  className="mt-3 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none placeholder:text-faint focus:border-accent" />
              </>
            )}
            </div>
            {myStories.length > 0 && (
              <div className="border-t border-line px-4 py-3">
                {saveErr && <p className="mb-2 text-center text-xs text-up">{saveErr}</p>}
                <button onClick={saveHighlight} disabled={!picked || saving}
                  className="w-full rounded-full bg-accent py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                  {saving ? "Saving…" : "Add to highlights"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View a highlight */}
      {viewing && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black" onClick={() => setViewing(null)}>
          <button onClick={() => setViewing(null)} className="absolute right-4 z-10 text-3xl text-white/90" style={{ top: "calc(1rem + env(safe-area-inset-top))" }}>×</button>
          {isMe && (
            <button onClick={(e) => remove(viewing.id, e)} className="absolute left-4 z-10 rounded-full bg-black/40 p-2 text-white/90 backdrop-blur" style={{ top: "calc(1rem + env(safe-area-inset-top))" }} aria-label="Remove highlight">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
            </button>
          )}
          <div className="mx-auto flex h-full w-full max-w-[420px] items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {viewing.mediaType === "VIDEO" ? (
              <video src={viewing.mediaUrl} controls autoPlay className="max-h-full w-full object-contain" style={{ filter: fcss(viewing.filter) }} />
            ) : (
              <img src={viewing.mediaUrl} alt="" className="max-h-full w-full object-contain" style={{ filter: fcss(viewing.filter) }} />
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
