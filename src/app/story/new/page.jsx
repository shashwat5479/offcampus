"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { uploadFile } from "@/lib/upload";

const FILTERS = [
  { name: "None", css: "" },
  { name: "Warm", css: "sepia(0.35) saturate(1.3)" },
  { name: "Cool", css: "saturate(0.8) hue-rotate(15deg) brightness(1.05)" },
  { name: "B&W", css: "grayscale(1)" },
  { name: "Vintage", css: "sepia(0.5) contrast(0.9) brightness(1.1)" },
  { name: "Vivid", css: "saturate(1.6) contrast(1.1)" },
  { name: "Fade", css: "brightness(1.15) contrast(0.85) saturate(0.7)" },
  { name: "Drama", css: "contrast(1.3) brightness(0.95) saturate(1.2)" },
];

export default function AddStoryPage() {
  const router = useRouter();
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [kind, setKind] = useState(null);
  const [filter, setFilter] = useState(FILTERS[0]);
  const [caption, setCaption] = useState("");
  const [showCaption, setShowCaption] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function pick(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setErr(""); setFile(f);
    setKind(f.type.startsWith("video") ? "video" : "image");
    setPreview(URL.createObjectURL(f));
  }

  function reset() { setFile(null); setPreview(null); setKind(null); setFilter(FILTERS[0]); setCaption(""); setShowCaption(false); }

  async function share() {
    if (!file || busy) return;
    setBusy(true); setErr("");
    try {
      const { url, kind } = await uploadFile(file);
      const res = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaUrl: url, type: kind, caption, filter: filter.name }),
      });
      if (!res.ok) throw new Error("Could not post story");
      router.push("/"); router.refresh();
    } catch (e) { setErr(e.message); setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-md py-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-subtle hover:text-ink">←</Link>
          <h1 className="text-lg font-semibold text-ink">Add to your story</h1>
        </div>
        {preview && <button onClick={reset} className="text-xs text-subtle hover:text-ink">Change</button>}
      </div>

      {!preview ? (
        <label className="flex aspect-[9/16] w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-line bg-paper">
          <div className="flex flex-col items-center gap-2 text-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-faint"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
            <span className="px-6 text-sm text-subtle">Tap to choose a photo or video</span>
          </div>
          <input ref={fileRef} type="file" accept="image/*,video/*" onChange={pick} className="hidden" />
        </label>
      ) : (
        <>
          {/* Preview with filter */}
          <div className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-black">
            {kind === "video" ? (
              <video src={preview} controls className="h-full w-full object-contain" style={{ filter: filter.css }} />
            ) : (
              <img src={preview} alt="" className="h-full w-full object-contain" style={{ filter: filter.css }} />
            )}
            {/* Caption overlay */}
            {caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-10">
                <p className="text-sm font-medium text-white drop-shadow">{caption}</p>
              </div>
            )}
          </div>

          {/* Toolbar: caption + filter */}
          <div className="mt-3 flex items-center justify-between">
            <button onClick={() => setShowCaption((s) => !s)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${showCaption ? "border-accent text-accent" : "border-line text-subtle hover:text-ink"}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>
              Text
            </button>
            <span className="text-[10px] text-faint">Swipe filters below</span>
          </div>

          {showCaption && (
            <input value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={120} placeholder="Add a caption…" autoFocus
              className="mt-2 w-full rounded-xl border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none placeholder:text-faint focus:border-accent" />
          )}

          {/* Filter strip */}
          <div className="mt-3 -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
            {FILTERS.map((f) => (
              <button key={f.name} onClick={() => setFilter(f)}
                className={`flex flex-col items-center gap-1 ${filter.name === f.name ? "" : "opacity-60"}`}>
                <div className="h-14 w-14 overflow-hidden rounded-lg border-2 transition-colors"
                  style={{ borderColor: filter.name === f.name ? "rgb(var(--c-accent))" : "transparent" }}>
                  {kind === "video" ? (
                    <div className="flex h-full w-full items-center justify-center bg-canvas text-[10px] text-faint" style={{ filter: f.css }}>▶</div>
                  ) : (
                    <img src={preview} alt="" className="h-full w-full object-cover" style={{ filter: f.css }} />
                  )}
                </div>
                <span className="text-[10px] font-medium text-subtle">{f.name}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {err && <p className="mt-2 text-center text-xs text-up">{err}</p>}

      {preview && (
        <button onClick={share} disabled={!file || busy}
          className="mt-4 w-full rounded-full bg-accent py-3 text-sm font-semibold text-white disabled:opacity-50">
          {busy ? "Sharing…" : "Share to story"}
        </button>
      )}
      <p className="mt-2 text-center text-xs text-faint">Your story disappears after 24 hours.</p>
    </div>
  );
}