"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Avatar from "./Avatar";
import { uploadFile } from "@/lib/upload";

const MAX_MEDIA_MB = 50;

const REACTIONS = ["❤️","🔥","😂","😮","😢","👏"];
// Move this to an env var (NEXT_PUBLIC_TENOR_KEY) — see the note at the end of the chat response.
const TENOR_KEY = process.env.NEXT_PUBLIC_TENOR_KEY || "AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ";

// ---- Emoji categories ----
const EMOJI_CATS = {
  "Smileys": ["😀","😃","😄","😁","😆","😅","🤣","😂","🥹","😊","😇","🙂","🙃","😉","😌","😍","🥰","😘","😗","😚","😙","🥲","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🫡","🤐","🤨","😐","😑","😶","🫥","😏","😒","🙄","😬","🤥","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮","🥵","🥶","🥴","😵","🤯","🥳","🥸","😎","🤓","🧐","😕","🫤","😟","🙁","😮","😯","😲","😳","🥺","😦","😧","😨","😰","😥","😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬","😈","👿","💀","☠️","💩","🤡","👹","👺","👻","👽","👾","🤖"],
  "Hands": ["👋","🤚","🖐️","✋","🖖","🫱","🫲","👌","🤌","🤏","✌️","🤞","🫰","🤟","🤘","🤙","👈","👉","👆","👇","☝️","🫵","👍","👎","✊","👊","🤛","🤜","👏","🙌","🫶","👐","🤲","🤝","🙏","💪","🦾"],
  "Hearts": ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","❤️‍🔥","❤️‍🩹","💟"],
  "Animals": ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐔","🐧","🐦","🦆","🦅","🦉","🐺","🐴","🦄","🐝","🦋","🐌","🐞","🐢","🐍","🐙","🐬","🐳","🦈","🐊"],
  "Food": ["🍏","🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🍒","🍑","🥭","🍍","🥝","🍅","🥑","🌽","🥕","🍔","🍟","🍕","🌮","🍣","🍱","🍦","🍩","🍪","🎂","🧁","☕","🍵","🧋","🍷","🍺","🥤"],
  "Objects": ["⚽","🏀","🏈","⚾","🎾","🏐","🎮","🕹️","🎯","🎲","🧩","🎭","🎨","🎬","🎤","🎧","🎵","🎹","🥁","📱","💻","⌨️","📷","📸","🔭","🔬","💡","🔥","✨","💫","⭐","🌟","💯","💥","🎉","🎊","🎈","🎁","🏆","🥇","📚","✏️","📌","📢"],
};

// ---- Sticker packs (large visual stickers) ----
const STICKER_PACKS = {
  "Popular": ["😀","😍","🥺","😎","🤩","😤","🥳","🤯","😭","🤗","🫶","👀","🔥","💀","👻","🤖","💩","👽","🫡","🤌","👊","✊","🤝","👏","🙌","💪","🫰","✌️","👋","🤙"],
  "Love": ["❤️","💕","💖","💗","💓","💞","💘","💝","🥰","😍","😘","💑","💏","🫶","❤️‍🔥","💔","🥹","😻","💐","🌹"],
  "Reactions": ["👍","👎","😂","🤣","😮","😱","🥵","🥶","🤮","🤯","💯","✅","❌","⚠️","🚫","❓","❗","🆗","🆘","🔝"],
  "Vibes": ["🎉","🎊","🎈","🥳","🎯","🚀","⭐","✨","💫","🌈","☀️","🌙","⚡","🔥","❄️","🌊","🍃","🎵","🎶","🎤"],
  "Food": ["🍕","🍔","🍟","🌮","🍣","🍱","🍜","🍛","🍩","🍪","🧁","🎂","🍦","☕","🧋","🍿","🥐","🍳","🥗","🍝"],
};

function fmtTime(d) {
  if (!d) return "";
  try { return new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); } catch { return ""; }
}

function loadAbly() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.Ably) return Promise.resolve(window.Ably);
  if (!window.__ablyLoader) {
    window.__ablyLoader = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdn.ably.com/lib/ably.min-2.js"; s.async = true;
      s.onload = () => resolve(window.Ably); s.onerror = () => reject(new Error("Ably fail"));
      document.head.appendChild(s);
    });
  }
  return window.__ablyLoader;
}

function applyReaction(list, { messageId, userId, emoji }) {
  return list.map((m) => {
    if (m.id !== messageId) return m;
    const others = (m.reactions || []).filter((r) => r.userId !== userId);
    return { ...m, reactions: emoji ? [...others, { userId, emoji }] : others };
  });
}

// Favorites persistence
function getFavs(key) { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } }
function setFavsStore(key, arr) { try { localStorage.setItem(key, JSON.stringify(arr.slice(0, 60))); } catch {} }

export default function ChatRoom({ conversationId, meId, other, initialMessages }) {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelTab, setPanelTab] = useState("emoji"); // emoji | sticker | gif
  const [emojiCat, setEmojiCat] = useState("Smileys");
  const [stickerPack, setStickerPack] = useState("Favourites");
  const [stickerFavs, setStickerFavs] = useState([]);
  const [gifFavs, setGifFavs] = useState([]);
  const [customStickers, setCustomStickers] = useState([]);
  const [gifs, setGifs] = useState([]);
  const [gifQ, setGifQ] = useState("");
  const [gifLoading, setGifLoading] = useState(false);
  const [reactFor, setReactFor] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [mentioning, setMentioning] = useState(false);
  const [saveToast, setSaveToast] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const fileRef = useRef(null);
  const mediaRef = useRef(null);

  useEffect(() => {
    setStickerFavs(getFavs("oc_fav_stickers"));
    setGifFavs(getFavs("oc_fav_gifs"));
    setCustomStickers(getFavs("oc_custom_stickers"));
  }, []);

  useEffect(() => {
    let client, channel, cancelled = false;
    loadAbly().then((Ably) => {
      if (cancelled || !Ably) return;
      client = new Ably.Realtime({ authUrl: "/api/ably-token" });
      channel = client.channels.get(`conversation:${conversationId}`);
      channel.subscribe("message", (msg) => { setMessages((prev) => (prev.some((m) => m.id === msg.data.id) ? prev : [...prev, msg.data])); });
      channel.subscribe("reaction", (msg) => { setMessages((prev) => applyReaction(prev, msg.data)); });
    }).catch(() => {});
    return () => { cancelled = true; if (channel) channel.unsubscribe(); if (client) client.close(); };
  }, [conversationId]);

  useEffect(() => { if (!search) bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, search]);

  const query = search.trim().toLowerCase();
  const visible = useMemo(() => (query ? messages.filter((m) => (m.body || "").toLowerCase().includes(query)) : messages), [messages, query]);

  // ---- GIF ----
  const loadTrending = useCallback(async () => {
    setGifLoading(true);
    try {
      const res = await fetch(`https://tenor.googleapis.com/v2/featured?key=${TENOR_KEY}&limit=20&media_filter=tinygif,gif`);
      const d = await res.json(); setGifs(d.results || []);
    } catch { setGifs([]); }
    setGifLoading(false);
  }, []);

  async function searchGifs(q) {
    setGifQ(q);
    if (!q.trim()) { loadTrending(); return; }
    setGifLoading(true);
    try {
      const res = await fetch(`https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(q)}&key=${TENOR_KEY}&limit=20&media_filter=tinygif,gif`);
      const d = await res.json(); setGifs(d.results || []);
    } catch { setGifs([]); }
    setGifLoading(false);
  }

  function gifUrl(g) { return g.media_formats?.tinygif?.url || g.media_formats?.gif?.url || ""; }

  // ---- Send ----
  async function sendMsg(body) {
    const msg = (body || text).trim();
    if (!msg || sending) return;
    setSending(true); setText(""); setPanelOpen(false);
    const currentReply = replyTo; setReplyTo(null);
    try {
      const res = await fetch("/api/message", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: other.id, body: msg, replyToId: currentReply?.id || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setText(msg); setReplyTo(currentReply); return; }
      setMessages((prev) => (prev.some((m) => m.id === data.message.id) ? prev : [...prev, data.message]));
    } catch { setText(msg); setReplyTo(currentReply); } finally { setSending(false); }
  }

  // ---- Media (image / video, up to 50MB) ----
  async function sendMedia(file) {
    if (!file || uploading) return;
    setUploadErr("");
    if (!/^(image|video)\//.test(file.type)) { setUploadErr("Only images or videos are supported."); return; }
    if (file.size > MAX_MEDIA_MB * 1024 * 1024) { setUploadErr(`Max file size is ${MAX_MEDIA_MB} MB.`); return; }

    setUploading(true); setPanelOpen(false);
    const currentReply = replyTo; setReplyTo(null);
    try {
      const { url, kind } = await uploadFile(file);
      const res = await fetch("/api/message", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: other.id, mediaUrl: url, mediaType: kind, replyToId: currentReply?.id || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setUploadErr(data.error || "Upload failed."); setReplyTo(currentReply); return; }
      setMessages((prev) => (prev.some((m) => m.id === data.message.id) ? prev : [...prev, data.message]));
    } catch (e) {
      setUploadErr(e.message || "Upload failed. Check your connection.");
      setReplyTo(currentReply);
    } finally {
      setUploading(false);
    }
  }
  function handleMediaPick(e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (f) sendMedia(f);
  }

  // ---- Favorites ----
  function toggleStickerFav(s) {
    setStickerFavs((prev) => {
      const next = prev.includes(s) ? prev.filter((x) => x !== s) : [s, ...prev];
      setFavsStore("oc_fav_stickers", next); return next;
    });
  }
  function toggleGifFav(url) {
    setGifFavs((prev) => {
      const next = prev.includes(url) ? prev.filter((x) => x !== url) : [url, ...prev];
      setFavsStore("oc_fav_gifs", next); return next;
    });
  }
  function saveReceivedToFav(body) {
    if (body?.match(/^https?:\/\/.*\.(gif|webp)/i)) {
      toggleGifFav(body);
      setSaveToast("GIF saved to favourites!");
    } else if (body && [...body].length <= 2 && /^\p{Emoji}/u.test(body)) {
      toggleStickerFav(body);
      setSaveToast("Sticker saved to favourites!");
    }
    setTimeout(() => setSaveToast(null), 1500);
  }

  // ---- Custom stickers ----
  function createSticker(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result;
      setCustomStickers((prev) => {
        const next = [url, ...prev].slice(0, 30);
        setFavsStore("oc_custom_stickers", next); return next;
      });
    };
    reader.readAsDataURL(f);
  }

  // ---- Reactions ----
  async function react(messageId, emoji) {
    setReactFor(null);
    setMessages((prev) => {
      const m = prev.find((x) => x.id === messageId);
      const mine = (m?.reactions || []).find((r) => r.userId === meId);
      const nextEmoji = mine && mine.emoji === emoji ? null : emoji;
      return applyReaction(prev, { messageId, userId: meId, emoji: nextEmoji });
    });
    try { await fetch("/api/message/react", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messageId, emoji }) }); } catch {}
  }

  // ---- Mentions ----
  function handleInput(e) {
    setText(e.target.value);
    setMentioning(e.target.value.match(/@(\w*)$/) !== null);
  }
  function insertMention() {
    setText((t) => t.replace(/@\w*$/, `@${other.username} `));
    setMentioning(false); inputRef.current?.focus();
  }

  // ---- Panel toggle ----
  function openTab(tab) {
    if (panelOpen && panelTab === tab) { setPanelOpen(false); return; }
    setPanelOpen(true); setPanelTab(tab);
    if (tab === "gif") loadTrending();
  }

  const isGif = (b) => b?.match(/^https?:\/\/.*\.(gif|webp)/i);
  const isSingleEmoji = (b) => b && [...b].length <= 2 && /^\p{Emoji}/u.test(b);
  const isCustomSticker = (b) => b?.startsWith("data:image/");

  return (
    <div className="mx-auto flex h-[100dvh] max-w-feed flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-line px-2 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
        <Link href="/messages" className="text-lg text-subtle hover:text-ink">←</Link>
        <Avatar name={other.name} seed={other.id} src={other.avatarUrl} size={38} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-ink">{other.name}</div>
          <div className="truncate text-xs text-subtle">@{other.username}</div>
        </div>
        <button onClick={() => { setShowSearch((s) => { if (s) setSearch(""); return !s; }); }}
          className={`rounded-full p-2 ${showSearch ? "text-accent" : "text-subtle"}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/><path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
      </div>

      {showSearch && (
        <div className="flex items-center gap-2 border-b border-line bg-canvas px-3 py-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search messages…" autoFocus className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-faint" />
          {search && <button onClick={() => setSearch("")} className="text-xs text-subtle">Clear</button>}
        </div>
      )}

      {/* Toast */}
      {saveToast && <div className="mx-auto mt-1 rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent">{saveToast}</div>}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-2 py-4">
        <div className="flex flex-col gap-1.5">
          {query && visible.length === 0 && <p className="py-8 text-center text-sm text-faint">No messages match.</p>}
          {visible.map((m) => {
            const mine = m.senderId === meId;
            const reactions = m.reactions || [];
            const emojis = [...new Set(reactions.map((r) => r.emoji))];
            return (
              <div key={m.id} className={`group flex items-end gap-2 ${mine ? "flex-row-reverse" : "flex-row"}`}>
                {!mine && <Avatar name={other.name} seed={other.id} src={other.avatarUrl} size={26} />}
                <div className={`relative flex max-w-[72%] flex-col ${mine ? "items-end" : "items-start"}`}>
                  {m.replySnippet && (
                    <div className="mb-0.5 max-w-full truncate rounded-lg border-l-2 border-accent bg-canvas/60 px-2 py-1 text-[11px] text-subtle">
                      <span className="text-faint">{m.replyFromMe ? "You" : other.name}: </span>{m.replySnippet}
                    </div>
                  )}
                  {m.mediaUrl ? (
                    m.mediaType === "VIDEO" ? (
                      <video src={m.mediaUrl} controls playsInline preload="metadata"
                        className={`max-h-[320px] max-w-[240px] rounded-2xl bg-black ${mine ? "rounded-br-md" : "rounded-bl-md"}`} />
                    ) : (
                      <img src={m.mediaUrl} alt="" loading="lazy"
                        className={`max-h-[320px] max-w-[240px] rounded-2xl object-cover ${mine ? "rounded-br-md" : "rounded-bl-md"}`} />
                    )
                  ) : isGif(m.body) ? (
                    <img src={m.body} alt="GIF" className={`max-w-[200px] rounded-2xl ${mine ? "rounded-br-md" : "rounded-bl-md"}`} />
                  ) : isCustomSticker(m.body) ? (
                    <img src={m.body} alt="Sticker" className="h-28 w-28 rounded-xl object-contain" />
                  ) : isSingleEmoji(m.body) ? (
                    <span className="text-5xl">{m.body}</span>
                  ) : (
                    <div className={`rounded-2xl px-3.5 py-2 text-sm ${mine ? "rounded-br-md bg-accent text-white" : "rounded-bl-md bg-canvas text-ink"}`}>{m.body}</div>
                  )}
                  <span className="mt-0.5 px-1 text-[10px] text-faint" suppressHydrationWarning>{fmtTime(m.createdAt)}</span>
                  {emojis.length > 0 && (
                    <div className={`-mt-1 ${mine ? "self-start" : "self-end"} z-10`}>
                      <span className="rounded-full border border-line bg-paper px-1.5 py-0.5 text-xs shadow-sm">{emojis.join("")}{reactions.length > 1 ? ` ${reactions.length}` : ""}</span>
                    </div>
                  )}
                  {/* Reaction + reply + save bar */}
                  <div className={`absolute top-1/2 -translate-y-1/2 ${mine ? "right-full mr-1" : "left-full ml-1"}`}>
                    {reactFor === m.id ? (
                      <div className="flex items-center gap-0.5 rounded-full border border-line bg-paper px-1.5 py-1 shadow-lg">
                        {REACTIONS.map((e) => <button key={e} onClick={() => react(m.id, e)} className="text-base hover:scale-125">{e}</button>)}
                        <button onClick={() => { setReplyTo({ id: m.id, body: m.body, mine }); setReactFor(null); }} className="ml-1 border-l border-line pl-1.5 text-xs text-subtle">↩</button>
                        {!mine && (isGif(m.body) || isSingleEmoji(m.body)) && (
                          <button onClick={() => { saveReceivedToFav(m.body); setReactFor(null); }} className="ml-1 border-l border-line pl-1.5 text-xs text-subtle">★</button>
                        )}
                      </div>
                    ) : (
                      <button onClick={() => setReactFor(m.id)} className="text-sm text-faint opacity-0 group-hover:opacity-100">☺</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Reply bar */}
      {replyTo && (
        <div className="flex items-center gap-2 border-t border-line bg-canvas px-3 py-2 text-xs">
          <div className="min-w-0 flex-1">
            <div className="text-faint">Replying to {replyTo.mine ? "yourself" : other.name}</div>
            <div className="truncate text-subtle">{replyTo.body}</div>
          </div>
          <button onClick={() => setReplyTo(null)} className="text-subtle">✕</button>
        </div>
      )}

      {/* Mention suggestion */}
      {mentioning && (
        <div className="border-t border-line bg-paper px-3 py-2">
          <button onClick={insertMention} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-canvas">
            <Avatar name={other.name} seed={other.id} src={other.avatarUrl} size={24} />
            <span className="font-medium text-ink">@{other.username}</span>
          </button>
        </div>
      )}

      {/* ===== WhatsApp-style panel with 3 tabs ===== */}
      {panelOpen && (
        <div className="border-t border-line bg-paper">
          {/* Tab bar */}
          <div className="flex border-b border-line">
            {[["emoji","😊 Emoji"],["sticker","🎭 Stickers"],["gif","GIF"]].map(([id, label]) => (
              <button key={id} onClick={() => openTab(id)}
                className={`flex-1 py-2 text-xs font-semibold transition-colors ${panelTab === id ? "border-b-2 border-accent text-accent" : "text-subtle"}`}>{label}</button>
            ))}
          </div>

          {/* EMOJI tab */}
          {panelTab === "emoji" && (
            <div>
              <div className="flex gap-1 overflow-x-auto border-b border-line px-2 py-1">
                {Object.keys(EMOJI_CATS).map((c) => (
                  <button key={c} onClick={() => setEmojiCat(c)}
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${emojiCat === c ? "bg-accent text-white" : "text-subtle"}`}>{c}</button>
                ))}
              </div>
              <div className="grid max-h-48 grid-cols-8 gap-0.5 overflow-y-auto p-2">
                {(EMOJI_CATS[emojiCat] || []).map((e, i) => (
                  <button key={`${e}-${i}`} onClick={() => setText((t) => t + e)} className="rounded p-1 text-xl hover:bg-canvas">{e}</button>
                ))}
              </div>
            </div>
          )}

          {/* STICKER tab */}
          {panelTab === "sticker" && (
            <div>
              <div className="flex gap-1 overflow-x-auto border-b border-line px-2 py-1">
                <button onClick={() => setStickerPack("Favourites")} className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${stickerPack === "Favourites" ? "bg-accent text-white" : "text-subtle"}`}>★ Favs</button>
                <button onClick={() => setStickerPack("Custom")} className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${stickerPack === "Custom" ? "bg-accent text-white" : "text-subtle"}`}>✏️ Custom</button>
                {Object.keys(STICKER_PACKS).map((p) => (
                  <button key={p} onClick={() => setStickerPack(p)} className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${stickerPack === p ? "bg-accent text-white" : "text-subtle"}`}>{p}</button>
                ))}
              </div>
              <div className="max-h-48 overflow-y-auto p-2">
                {stickerPack === "Custom" ? (
                  <div className="grid grid-cols-4 gap-2">
                    <button onClick={() => fileRef.current?.click()} className="flex h-20 items-center justify-center rounded-xl border-2 border-dashed border-line text-2xl text-faint hover:border-accent hover:text-accent">+</button>
                    <input ref={fileRef} type="file" accept="image/*" onChange={createSticker} className="hidden" />
                    {customStickers.map((url, i) => (
                      <div key={i} className="group relative">
                        <button onClick={() => sendMsg(url)} className="flex h-20 w-full items-center justify-center rounded-xl bg-canvas p-1">
                          <img src={url} alt="" className="max-h-full max-w-full object-contain" />
                        </button>
                        <button onClick={() => toggleStickerFav(url)} className={`absolute -right-1 -top-1 rounded-full bg-paper p-0.5 text-[10px] shadow opacity-0 group-hover:opacity-100 ${stickerFavs.includes(url) ? "text-accent" : "text-faint"}`}>
                          {stickerFavs.includes(url) ? "★" : "☆"}
                        </button>
                      </div>
                    ))}
                    {customStickers.length === 0 && <p className="col-span-3 py-4 text-center text-xs text-faint">Tap + to create a sticker from any image</p>}
                  </div>
                ) : (
                  <div className="grid grid-cols-5 gap-1.5">
                    {(stickerPack === "Favourites" ? stickerFavs : STICKER_PACKS[stickerPack] || []).map((s, i) => (
                      <div key={`${s}-${i}`} className="group relative">
                        <button onClick={() => sendMsg(s)}
                          className="flex h-14 w-full items-center justify-center rounded-xl bg-canvas text-3xl transition-transform hover:scale-110">
                          {s.startsWith("data:") ? <img src={s} alt="" className="max-h-full max-w-full object-contain" /> : s}
                        </button>
                        <button onClick={() => toggleStickerFav(s)}
                          className={`absolute -right-0.5 -top-0.5 rounded-full bg-paper p-0.5 text-[10px] shadow opacity-0 group-hover:opacity-100 ${stickerFavs.includes(s) ? "text-accent" : "text-faint"}`}>
                          {stickerFavs.includes(s) ? "★" : "☆"}
                        </button>
                      </div>
                    ))}
                    {stickerPack === "Favourites" && stickerFavs.length === 0 && <p className="col-span-5 py-4 text-center text-xs text-faint">Tap ★ on any sticker to save here</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* GIF tab */}
          {panelTab === "gif" && (
            <div>
              <div className="flex gap-1 overflow-x-auto border-b border-line px-2 py-1">
                <button onClick={() => { setGifQ(""); loadTrending(); }} className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${!gifQ.trim() ? "bg-accent text-white" : "text-subtle"}`}>🔥 Trending</button>
                <button onClick={() => setGifQ("favourites")} className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${gifQ === "favourites" ? "bg-accent text-white" : "text-subtle"}`}>★ Favs</button>
              </div>
              <div className="px-2 pt-2">
                <input value={gifQ === "favourites" ? "" : gifQ} onChange={(e) => searchGifs(e.target.value)} placeholder="Search GIFs…"
                  className="w-full rounded-full border border-line bg-canvas px-3 py-1.5 text-sm text-ink outline-none placeholder:text-faint" />
              </div>
              <div className="max-h-48 overflow-y-auto p-2">
                {gifQ === "favourites" ? (
                  gifFavs.length > 0 ? (
                    <div className="grid grid-cols-3 gap-1">
                      {gifFavs.map((url, i) => (
                        <div key={i} className="group relative">
                          <button onClick={() => sendMsg(url)} className="overflow-hidden rounded-lg">
                            <img src={url} alt="" className="h-24 w-full object-cover" loading="lazy" />
                          </button>
                          <button onClick={() => toggleGifFav(url)} className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-[10px] text-white opacity-0 group-hover:opacity-100">★</button>
                        </div>
                      ))}
                    </div>
                  ) : <p className="py-6 text-center text-xs text-faint">Save GIFs from trending or from messages using ★</p>
                ) : gifLoading ? (
                  <p className="py-6 text-center text-xs text-faint">Loading…</p>
                ) : gifs.length > 0 ? (
                  <div className="grid grid-cols-3 gap-1">
                    {gifs.map((g) => (
                      <div key={g.id} className="group relative">
                        <button onClick={() => sendMsg(gifUrl(g))} className="overflow-hidden rounded-lg hover:scale-105 transition-transform">
                          <img src={gifUrl(g)} alt="" className="h-24 w-full object-cover" loading="lazy" />
                        </button>
                        <button onClick={() => toggleGifFav(gifUrl(g))}
                          className={`absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-[10px] text-white opacity-0 group-hover:opacity-100 ${gifFavs.includes(gifUrl(g)) ? "text-accent" : ""}`}>
                          {gifFavs.includes(gifUrl(g)) ? "★" : "☆"}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : <p className="py-6 text-center text-xs text-faint">{gifQ.trim() ? "No GIFs found" : "Loading trending…"}</p>}
              </div>
              <p className="border-t border-line px-2 py-1 text-[9px] text-faint">Powered by Tenor</p>
            </div>
          )}
        </div>
      )}

      {/* Upload error toast */}
      {uploadErr && (
        <div className="mx-auto mb-1 rounded-full bg-up/15 px-3 py-1 text-center text-xs font-medium text-up">{uploadErr}</div>
      )}
      {uploading && (
        <div className="mx-auto mb-1 flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1 text-xs text-subtle">
          <span className="h-2 w-2 animate-pulse rounded-full bg-accent" /> Uploading…
        </div>
      )}

      {/* Input bar */}
      <div className="flex items-center gap-1.5 border-t border-line bg-paper px-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3">
        <button onClick={() => openTab("emoji")} aria-label="Emoji, stickers and GIFs"
          className={`shrink-0 rounded-full p-1.5 text-xl leading-none ${panelOpen ? "text-accent" : "text-subtle"}`}>😊</button>

        <input ref={inputRef} value={text} onChange={handleInput} onKeyDown={(e) => e.key === "Enter" && sendMsg()}
          onFocus={() => setPanelOpen(false)}
          placeholder="Message…" className="min-w-0 flex-1 rounded-full border border-line bg-canvas px-4 py-2 text-[15px] text-ink outline-none focus:border-accent" />

        <button onClick={() => mediaRef.current?.click()} disabled={uploading} aria-label="Share photo or video"
          className="shrink-0 rounded-full p-1.5 text-subtle disabled:opacity-40">
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="5" width="18" height="14" rx="3" />
            <circle cx="8.5" cy="10" r="1.5" fill="currentColor" stroke="none" />
            <path d="m21 16-5.2-5.2a1.5 1.5 0 0 0-2.12 0L5 19" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <input ref={mediaRef} type="file" accept="image/*,video/*" onChange={handleMediaPick} className="hidden" />

        {text.trim() ? (
          <button onClick={() => sendMsg()} disabled={sending} className="shrink-0 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Send</button>
        ) : null}
      </div>
    </div>
  );
}