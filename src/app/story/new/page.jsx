"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { uploadFile } from "@/lib/upload";
import { searchAudius, trendingAudius, audiusStreamUrl } from "@/lib/audius";

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

const MOOD_EMOJI = { Trending: "🔥", Chill: "🌙", Hype: "⚡", Romantic: "💗", Party: "🎉", Emotional: "🎬" };

export default function AddStoryPage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [kind, setKind] = useState(null);
  const [filter, setFilter] = useState(FILTERS[0]);
  const [caption, setCaption] = useState("");
  const [showCaption, setShowCaption] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [musicTab, setMusicTab] = useState("online"); // "online" (Audius) | "library"
  const [onlineQ, setOnlineQ] = useState("");
  const [onlineResults, setOnlineResults] = useState([]);
  const [onlineLoading, setOnlineLoading] = useState(false);
  const [onlineErr, setOnlineErr] = useState("");
  const [musicMood, setMusicMood] = useState("");
  const [selectedSong, setSelectedSong] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [previewId, setPreviewId] = useState(null);
  const audioRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // Load the local track library once
  useEffect(() => {
    fetch("/music/tracks.json")
      .then((r) => r.json())
      .then(async (list) => {
        // Keep only tracks whose .mp3 actually exists (HEAD request), so empty
        // slots in the catalog never show up as broken options.
        const checks = await Promise.all(
          list.map((t) =>
            fetch(t.url, { method: "HEAD" }).then((r) => (r.ok ? t : null)).catch(() => null)
          )
        );
        setTracks(checks.filter(Boolean));
      })
      .catch(() => setTracks([]));
    return () => { if (audioRef.current) audioRef.current.pause(); };
  }, []);

  // Load Audius trending the first time the online tab is shown
  useEffect(() => {
    if (showMusic && musicTab === "online" && onlineResults.length === 0 && !onlineQ) {
      loadTrending();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMusic, musicTab]);

  async function loadTrending() {
    setOnlineLoading(true); setOnlineErr("");
    const r = await trendingAudius();
    if (r === null) setOnlineErr("Couldn't reach the music service. Try again or use Your Library.");
    setOnlineResults(r || []);
    setOnlineLoading(false);
  }

  async function runOnlineSearch(q) {
    setOnlineQ(q);
    if (!q.trim()) { loadTrending(); return; }
    setOnlineLoading(true); setOnlineErr("");
    const r = await searchAudius(q);
    if (r === null) setOnlineErr("Couldn't reach the music service. Try again or use Your Library.");
    setOnlineResults(r || []);
    setOnlineLoading(false);
  }

  // Preview / select an Audius track (resolve its stream URL first)
  async function previewOnline(t) {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (previewId === t.id) { setPreviewId(null); return; }
    const url = await audiusStreamUrl(t.id);
    const a = new Audio(url); a.volume = 0.6;
    a.play().catch(() => setOnlineErr("Couldn't play this track."));
    audioRef.current = a; setPreviewId(t.id);
    a.onended = () => setPreviewId(null);
  }

  async function selectOnline(t) {
    const url = await audiusStreamUrl(t.id);
    selectTrack({ id: t.id, title: t.title, artist: t.artist, mood: "Online", url });
  }

  const moods = Array.from(new Set(tracks.map((t) => t.mood)));
  const shownTracks = musicMood ? tracks.filter((t) => t.mood === musicMood) : tracks;

  function pick(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setErr(""); setFile(f);
    setKind(f.type.startsWith("video") ? "video" : "image");
    setPreview(URL.createObjectURL(f));
  }

  function reset() {
    setFile(null); setPreview(null); setKind(null); setFilter(FILTERS[0]);
    setCaption(""); setShowCaption(false); setSelectedSong(null); setShowMusic(false);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
  }

  // Tap a track: preview it playing; tapping again selects it for the story
  function previewTrack(t) {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (previewId === t.id) { setPreviewId(null); return; }
    const a = new Audio(t.url); a.volume = 0.6;
    a.play().catch(() => setErr("Couldn't play preview — add the .mp3 to public/music/."));
    audioRef.current = a; setPreviewId(t.id);
    a.onended = () => setPreviewId(null);
  }

  function selectTrack(t) {
    setSelectedSong(t);
    setShowMusic(false);
    if (audioRef.current) { audioRef.current.pause(); }
    const a = new Audio(t.url); a.volume = 0.5; a.play().catch(() => {});
    audioRef.current = a; setAudioPlaying(true); setPreviewId(null);
    a.onended = () => setAudioPlaying(false);
  }

  function toggleAudio() {
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
          musicTitle: selectedSong ? `${selectedSong.title} — ${selectedSong.artist}` : null,
        }),
      });
      if (!res.ok) throw new Error("Could not post story");
      router.push("/"); router.refresh();
    } catch (e) { setErr(e.message); setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-subtle hover:text-ink">←</Link>
          <h1 className="text-lg font-semibold text-ink">Add to your story</h1>
        </div>
        {preview && <button onClick={reset} className="text-xs font-medium text-subtle hover:text-ink">Change</button>}
      </div>

      {!preview ? (
        <label className="group flex aspect-[9/16] w-full cursor-pointer items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-line bg-gradient-to-b from-paper to-canvas transition-colors hover:border-accent">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent transition-transform group-hover:scale-110">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
            </div>
            <span className="px-6 text-sm font-medium text-subtle">Tap to choose a photo or video</span>
            <span className="text-[11px] text-faint">Photos & videos up to 25s</span>
          </div>
          <input type="file" accept="image/*,video/*" onChange={pick} className="hidden" />
        </label>
      ) : (
        <>
          {/* Preview */}
          <div className="relative aspect-[9/16] w-full overflow-hidden rounded-3xl bg-black shadow-2xl">
            {kind === "video" ? (
              <video src={preview} controls playsInline className="h-full w-full object-contain" style={{ filter: filter.css === "none" ? undefined : filter.css }} />
            ) : (
              <img src={preview} alt="" className="h-full w-full object-contain" style={{ filter: filter.css === "none" ? undefined : filter.css }} />
            )}
            {caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-5 pb-6 pt-14">
                <p className="text-[15px] font-semibold text-white drop-shadow-lg">{caption}</p>
              </div>
            )}
            {selectedSong && (
              <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 backdrop-blur-sm">
                <span className={`text-sm ${audioPlaying ? "animate-spin" : ""}`} style={{ animationDuration: "3s" }}>🎵</span>
                <span className="max-w-[140px] truncate text-xs font-medium text-white">{selectedSong.title}</span>
                <button onClick={toggleAudio} className="text-xs text-white/80">{audioPlaying ? "⏸" : "▶"}</button>
                <button onClick={removeSong} className="text-xs text-white/60">✕</button>
              </div>
            )}
          </div>

          {/* Toolbar */}
          <div className="mt-4 flex items-center gap-2">
            <button onClick={() => { setShowCaption((s) => !s); setShowMusic(false); }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors ${showCaption ? "border-accent bg-accent/10 text-accent" : "border-line text-subtle hover:text-ink"}`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>
              Text
            </button>
            <button onClick={() => { setShowMusic((s) => !s); setShowCaption(false); }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors ${showMusic ? "border-accent bg-accent/10 text-accent" : "border-line text-subtle hover:text-ink"}`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
              Music
            </button>
          </div>

          {/* Caption input */}
          {showCaption && (
            <input value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={120} placeholder="Add a caption…" autoFocus
              className="mt-3 w-full rounded-xl border border-line bg-canvas px-4 py-2.5 text-sm text-ink outline-none placeholder:text-faint focus:border-accent" />
          )}

          {/* Music picker — Online (Audius) + Your Library */}
          {showMusic && (
            <div className="mt-3 rounded-2xl border border-line bg-canvas p-3">
              {/* source tabs */}
              <div className="mb-2 flex gap-1 rounded-full bg-paper p-1">
                <button onClick={() => setMusicTab("online")}
                  className={`flex-1 rounded-full py-1.5 text-[12px] font-semibold ${musicTab === "online" ? "bg-accent text-white" : "text-subtle"}`}>🔎 Search songs</button>
                <button onClick={() => setMusicTab("library")}
                  className={`flex-1 rounded-full py-1.5 text-[12px] font-semibold ${musicTab === "library" ? "bg-accent text-white" : "text-subtle"}`}>🎵 Your Library</button>
              </div>

              {musicTab === "online" ? (
                <>
                  <input value={onlineQ} onChange={(e) => runOnlineSearch(e.target.value)} placeholder="Search songs, artists…" autoFocus
                    className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none placeholder:text-faint focus:border-accent" />
                  {onlineErr && <p className="mt-1 px-1 text-[11px] text-up">{onlineErr}</p>}
                  <div className="mt-2 max-h-52 overflow-y-auto">
                    {onlineLoading ? (
                      <p className="py-6 text-center text-xs text-faint">Searching…</p>
                    ) : onlineResults.length === 0 ? (
                      <p className="py-6 text-center text-xs text-faint">{onlineQ ? "No songs found." : "Loading trending…"}</p>
                    ) : onlineResults.map((t) => (
                      <div key={t.id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-paper">
                        <button onClick={() => previewOnline(t)} className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-accent/15 text-accent">
                          {t.artwork ? <img src={t.artwork} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" /> : null}
                          <span className="relative z-10 drop-shadow">{previewId === t.id ? "⏸" : "▶"}</span>
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-ink">{t.title}</div>
                          <div className="truncate text-xs text-subtle">{t.artist}</div>
                        </div>
                        <button onClick={() => selectOnline(t)} className="shrink-0 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">Add</button>
                      </div>
                    ))}
                  </div>
                  <p className="mt-1 text-center text-[9px] text-faint">Music from Audius · royalty-free artists</p>
                </>
              ) : (
                <>
                  {moods.length > 0 && (
                    <div className="flex gap-1.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      <button onClick={() => setMusicMood("")}
                        className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${!musicMood ? "bg-accent text-white" : "bg-paper text-subtle"}`}>All</button>
                      {moods.map((m) => (
                        <button key={m} onClick={() => setMusicMood(m)}
                          className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${musicMood === m ? "bg-accent text-white" : "bg-paper text-subtle"}`}>
                          {MOOD_EMOJI[m] || "🎵"} {m}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="mt-1 max-h-52 overflow-y-auto">
                    {shownTracks.length === 0 ? (
                      <p className="py-6 text-center text-xs text-faint">No tracks in your library yet. Add .mp3 files to public/music/ (see README).</p>
                    ) : shownTracks.map((t) => (
                      <div key={t.id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-paper">
                        <button onClick={() => previewTrack(t)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
                          {previewId === t.id ? "⏸" : "▶"}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-ink">{t.title}</div>
                          <div className="truncate text-xs text-subtle">{t.artist} · {t.mood}</div>
                        </div>
                        <button onClick={() => selectTrack(t)} className="shrink-0 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">Add</button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Filter strip */}
          <div className="mt-4 -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FILTERS.map((f) => (
              <button key={f.name} onClick={() => setFilter(f)}
                className={`flex shrink-0 flex-col items-center gap-1.5 transition-opacity ${filter.name === f.name ? "opacity-100" : "opacity-55"}`}>
                <div className="h-16 w-16 overflow-hidden rounded-2xl border-2 transition-all"
                  style={{ borderColor: filter.name === f.name ? "rgb(var(--c-accent))" : "transparent" }}>
                  {kind === "video" ? (
                    <div className="flex h-full w-full items-center justify-center bg-canvas text-lg text-faint" style={{ filter: f.css === "none" ? undefined : f.css }}>▶</div>
                  ) : (
                    <img src={preview} alt="" className="h-full w-full object-cover" style={{ filter: f.css === "none" ? undefined : f.css }} />
                  )}
                </div>
                <span className={`text-[11px] font-semibold ${filter.name === f.name ? "text-accent" : "text-subtle"}`}>{f.name}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {err && <p className="mt-3 text-center text-xs text-up">{err}</p>}
      {preview && (
        <button onClick={share} disabled={!file || busy}
          className="mt-4 w-full rounded-full bg-accent py-3.5 text-sm font-bold text-white shadow-lg transition-transform active:scale-[0.98] disabled:opacity-50">
          {busy ? "Sharing…" : "Share to story"}
        </button>
      )}
      <p className="mt-3 text-center text-xs text-faint">Your story disappears after 24 hours.</p>
    </div>
  );
}
