"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { uploadFile } from "@/lib/upload";

const FILTERS = [
  { name: "None", css: "none" },
  { name: "Warm", css: "sepia(0.35) saturate(1.3)" },
  { name: "Cool", css: "saturate(0.8) hue-rotate(15deg) brightness(1.05)" },
  { name: "B&W", css: "grayscale(1)" },
  { name: "Vintage", css: "sepia(0.5) contrast(0.9) brightness(1.1)" },
  { name: "Vivid", css: "saturate(1.6) contrast(1.1)" },
  { name: "Fade", css: "brightness(1.15) contrast(0.85) saturate(0.7)" },
  { name: "Drama", css: "contrast(1.3) brightness(0.95) saturate(1.2)" },
];

// Instagram-style genre shortcuts — tapping one searches that genre instantly.
const MUSIC_GENRES = ["Trending", "Bollywood", "Pop", "Hip-Hop", "Romantic", "Party", "Lo-fi", "Rock", "Chill", "Indie"];

export default function AddStoryPage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [kind, setKind] = useState(null);
  const [filter, setFilter] = useState(FILTERS[0]);
  const [caption, setCaption] = useState("");
  const [showCaption, setShowCaption] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  const [musicQ, setMusicQ] = useState("");
  const [musicResults, setMusicResults] = useState([]);
  const [musicLoading, setMusicLoading] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function pick(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setErr(""); setFile(f);
    setKind(f.type.startsWith("video") ? "video" : "image");
    setPreview(URL.createObjectURL(f));
  }

  function reset() {
    setFile(null); setPreview(null); setKind(null); setFilter(FILTERS[0]);
    setCaption(""); setShowCaption(false); setSelectedSong(null);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
  }

  async function searchMusic(q) {
    setMusicQ(q);
    if (!q.trim()) { setMusicResults([]); return; }
    setMusicLoading(true);
    try {
      const res = await fetch(`https://saavn.dev/api/search/songs?query=${encodeURIComponent(q)}&limit=10`);
      const d = await res.json();
      setMusicResults(d.data?.results || []);
    } catch { setMusicResults([]); }
    setMusicLoading(false);
  }

  function pickSong(song) {
    const url = song.downloadUrl?.find((d) => d.quality === "160kbps")?.url
      || song.downloadUrl?.find((d) => d.quality === "320kbps")?.url
      || song.downloadUrl?.[0]?.url;
    if (!url) return;
    setSelectedSong({ name: song.name, artist: song.artists?.primary?.[0]?.name || "", image: song.image?.[1]?.url || song.image?.[0]?.url || "", url });
    setShowMusic(false);
    // preview audio
    if (audioRef.current) audioRef.current.pause();
    const a = new Audio(url); a.volume = 0.5; a.play().catch(() => {});
    audioRef.current = a; setAudioPlaying(true);
    a.onended = () => setAudioPlaying(false);
  }

  function togglePreviewAudio() {
    if (!audioRef.current) return;
    if (audioPlaying) { audioRef.current.pause(); setAudioPlaying(false); }
    else { audioRef.current.play().catch(() => {}); setAudioPlaying(true); }
  }

  function removeSong() {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setSelectedSong(null); setAudioPlaying(false);
  }

  async function share() {
    if (!file || busy) return;
    setBusy(true); setErr("");
    if (audioRef.current) audioRef.current.pause();
    try {
      const { url, kind: k } = await uploadFile(file);
      const res = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaUrl: url, type: k,
          caption: caption || null,
          filter: filter.name !== "None" ? filter.name : null,
          musicUrl: selectedSong?.url || null,
          musicTitle: selectedSong ? `${selectedSong.name} — ${selectedSong.artist}` : null,
        }),
      });
      if (!res.ok) throw new Error("Could not post story");
      router.push("/"); router.refresh();
    } catch (e) { setErr(e.message); setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-md py-6 px-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-subtle hover:text-ink">←</Link>
          <h1 className="text-lg font-semibold text-ink">Add to your story</h1>
        </div>
        {preview && <button onClick={reset} className="text-xs text-subtle hover:text-ink">Change</button>}
      </div>

      {!preview ? (
        <label className="flex aspect-[9/16] w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-line bg-paper">
          <div className="flex flex-col items-center gap-3 text-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-faint"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
            <span className="px-6 text-sm text-subtle">Tap to choose a photo or video</span>
          </div>
          <input type="file" accept="image/*,video/*" onChange={pick} className="hidden" />
        </label>
      ) : (
        <>
          {/* Preview */}
          <div className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-black">
            {kind === "video" ? (
              <video src={preview} controls className="h-full w-full object-contain" style={{ filter: filter.css === "none" ? undefined : filter.css }} />
            ) : (
              <img src={preview} alt="" className="h-full w-full object-contain" style={{ filter: filter.css === "none" ? undefined : filter.css }} />
            )}
            {caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-5 pt-12">
                <p className="text-sm font-medium text-white drop-shadow-lg">{caption}</p>
              </div>
            )}
            {selectedSong && (
              <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur">
                <span className="text-xs">🎵</span>
                <span className="max-w-[150px] truncate text-xs text-white">{selectedSong.name}</span>
                <button onClick={togglePreviewAudio} className="text-xs text-white/80">{audioPlaying ? "⏸" : "▶"}</button>
                <button onClick={removeSong} className="text-xs text-white/60">✕</button>
              </div>
            )}
          </div>

          {/* Toolbar */}
          <div className="mt-3 flex items-center gap-2">
            <button onClick={() => { setShowCaption((s) => !s); setShowMusic(false); }}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${showCaption ? "border-accent text-accent" : "border-line text-subtle"}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>
              Text
            </button>
            <button onClick={() => { setShowMusic((s) => !s); setShowCaption(false); }}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${showMusic ? "border-accent text-accent" : "border-line text-subtle"}`}>
              🎵 Music
            </button>
          </div>

          {/* Caption input */}
          {showCaption && (
            <input value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={120} placeholder="Add a caption…" autoFocus
              className="mt-2 w-full rounded-xl border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none placeholder:text-faint focus:border-accent" />
          )}

          {/* Music search */}
          {showMusic && (
            <div className="mt-2 rounded-xl border border-line bg-canvas p-2">
              <input value={musicQ} onChange={(e) => searchMusic(e.target.value)} placeholder="Search songs…" autoFocus
                className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none placeholder:text-faint focus:border-accent" />
              {/* Genre shortcuts, like Instagram's music picker */}
              <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {MUSIC_GENRES.map((g) => (
                  <button key={g} onClick={() => searchMusic(g)}
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${musicQ === g ? "border-accent bg-accent text-white" : "border-line text-subtle"}`}>
                    {g}
                  </button>
                ))}
              </div>
              <div className="mt-2 max-h-48 overflow-y-auto">
                {musicLoading && <p className="py-4 text-center text-xs text-faint">Searching…</p>}
                {!musicLoading && musicResults.length === 0 && musicQ.trim() && <p className="py-4 text-center text-xs text-faint">No songs found.</p>}
                {musicResults.map((s) => (
                  <button key={s.id} onClick={() => pickSong(s)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-paper">
                    {s.image?.[0]?.url && <img src={s.image[0].url} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover" />}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-ink">{s.name}</div>
                      <div className="truncate text-xs text-subtle">{s.artists?.primary?.[0]?.name || ""}</div>
                    </div>
                    <span className="text-xs text-accent">Add</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filter strip */}
          <div className="mt-3 -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
            {FILTERS.map((f) => (
              <button key={f.name} onClick={() => setFilter(f)}
                className={`flex shrink-0 flex-col items-center gap-1 ${filter.name === f.name ? "opacity-100" : "opacity-50"}`}>
                <div className="h-14 w-14 overflow-hidden rounded-lg border-2"
                  style={{ borderColor: filter.name === f.name ? "rgb(var(--c-accent))" : "transparent" }}>
                  {kind === "video" ? (
                    <div className="flex h-full w-full items-center justify-center bg-canvas text-sm text-faint" style={{ filter: f.css === "none" ? undefined : f.css }}>▶</div>
                  ) : (
                    <img src={preview} alt="" className="h-full w-full object-cover" style={{ filter: f.css === "none" ? undefined : f.css }} />
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
          className="mt-3 w-full rounded-full bg-accent py-3 text-sm font-semibold text-white disabled:opacity-50">
          {busy ? "Sharing…" : "Share to story"}
        </button>
      )}
      <p className="mt-2 text-center text-xs text-faint">Your story disappears after 24 hours.</p>
    </div>
  );
}