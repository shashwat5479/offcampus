"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Avatar from "./Avatar";

const REACTIONS = ["❤️","🔥","😂","😮","😢","👏"];
const TENOR_KEY = "AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ";

const STICKER_PACKS = {
  "Smileys": ["😀","😃","😄","😁","😆","🤣","😂","🥹","😊","😇","🙂","😉","😌","😍","🥰","😘","😗","😙","😚","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🫡","🤐","🤨","😐","😑","😶","🫥","😏","😒","🙄","😬","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮","🥵","🥶","🥴","😵","🤯","🤠","🥳","🥸","😎","🤓","🧐","😕","🫤","😟","🙁","😮","😯","😲","😳","🥺","🥹","😦","😧","😨","😰","😥","😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬","😈","👿","💀","☠️","💩","🤡","👹","👺","👻","👽","👾","🤖"],
  "Hands": ["👋","🤚","🖐️","✋","🖖","🫱","🫲","🫳","🫴","👌","🤌","🤏","✌️","🤞","🫰","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","🫵","👍","👎","✊","👊","🤛","🤜","👏","🙌","🫶","👐","🤲","🤝","🙏","✍️","💅","🤳","💪","🦾"],
  "Hearts": ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","❤️‍🔥","❤️‍🩹","💟","♥️","🫶","😍","🥰","😘","💏","💑"],
  "Animals": ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐻‍❄️","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐔","🐧","🐦","🐤","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🐛","🦋","🐌","🐞","🐜","🪲","🪳","🦟","🦗","🕷️","🦂","🐢","🐍","🦎","🦖","🦕","🐙","🦑","🦐","🦞","🦀","🐡","🐠","🐟","🐬","🐳","🐋","🦈","🐊"],
  "Food": ["🍏","🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑","🥦","🥬","🥒","🌶️","🫑","🌽","🥕","🫒","🧄","🧅","🥔","🍠","🫘","🥐","🥯","🍞","🥖","🥨","🧀","🥚","🍳","🧈","🥞","🧇","🥓","🥩","🍗","🍖","🌭","🍔","🍟","🍕","🫓","🥪","🥙","🧆","🌮","🌯","🫔","🥗","🥘","🫕","🥫","🍝","🍜","🍲","🍛","🍣","🍱","🥟","🦪","🍤","🍙","🍚","🍘","🍥","🥠","🥮","🍢","🍡","🍧","🍨","🍦","🥧","🧁","🍰","🎂","🍮","🍭","🍬","🍫","🍿","🍩","🍪","🌰","🥜","🍯"],
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

function getFavStickers() { try { return JSON.parse(localStorage.getItem("oc_fav_stickers") || "[]"); } catch { return []; } }
function setFavStickers(arr) { try { localStorage.setItem("oc_fav_stickers", JSON.stringify(arr.slice(0, 50))); } catch {} }

export default function ChatRoom({ conversationId, meId, other, initialMessages }) {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [panel, setPanel] = useState(null); // null | "sticker" | "gif"
  const [stickerPack, setStickerPack] = useState("Favourites");
  const [favs, setFavs] = useState([]);
  const [reactFor, setReactFor] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [gifs, setGifs] = useState([]);
  const [gifQ, setGifQ] = useState("");
  const [gifLoading, setGifLoading] = useState(false);
  const [mentioning, setMentioning] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { setFavs(getFavStickers()); }, []);

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

  // Load trending GIFs when GIF panel opens
  const loadTrending = useCallback(async () => {
    setGifLoading(true);
    try {
      const res = await fetch(`https://tenor.googleapis.com/v2/featured?key=${TENOR_KEY}&limit=20&media_filter=tinygif,gif`);
      const d = await res.json();
      setGifs(d.results || []);
    } catch { setGifs([]); }
    setGifLoading(false);
  }, []);

  async function searchGifs(q) {
    setGifQ(q);
    if (!q.trim()) { loadTrending(); return; }
    setGifLoading(true);
    try {
      const res = await fetch(`https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(q)}&key=${TENOR_KEY}&limit=20&media_filter=tinygif,gif`);
      const d = await res.json();
      setGifs(d.results || []);
    } catch { setGifs([]); }
    setGifLoading(false);
  }

  function openPanel(p) {
    if (panel === p) { setPanel(null); return; }
    setPanel(p);
    if (p === "gif") loadTrending();
  }

  async function sendMsg(body) {
    const msg = (body || text).trim();
    if (!msg || sending) return;
    setSending(true); setText(""); setPanel(null);
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

  function sendSticker(s) { sendMsg(s); }
  function sendGif(url) { sendMsg(url); setPanel(null); setGifs([]); setGifQ(""); }

  function toggleFav(s) {
    setFavs((prev) => {
      const next = prev.includes(s) ? prev.filter((x) => x !== s) : [s, ...prev];
      setFavStickers(next); return next;
    });
  }

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

  function handleInput(e) {
    const v = e.target.value;
    setText(v);
    const atMatch = v.match(/@(\w*)$/);
    setMentioning(!!atMatch);
  }

  function insertMention() {
    setText((t) => t.replace(/@\w*$/, `@${other.username} `));
    setMentioning(false);
    inputRef.current?.focus();
  }

  const gifUrl = (g) => g.media_formats?.tinygif?.url || g.media_formats?.gif?.url || "";

  return (
    <div className="mx-auto flex h-[100dvh] max-w-feed flex-col">
      {/* header */}
      <div className="flex items-center gap-3 border-b border-line px-2 py-3">
        <Link href="/messages" className="text-lg text-subtle hover:text-ink">←</Link>
        <Avatar name={other.name} seed={other.id} src={other.avatarUrl} size={38} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-ink">{other.name}</div>
          <div className="truncate text-xs text-subtle">@{other.username}</div>
        </div>
        <button onClick={() => { setShowSearch((s) => { if (s) setSearch(""); return !s; }); }}
          className={`rounded-full p-2 ${showSearch ? "text-accent" : "text-subtle"}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" /><path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
      </div>

      {showSearch && (
        <div className="flex items-center gap-2 border-b border-line bg-canvas px-3 py-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search messages…" autoFocus
            className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-faint" />
          {search && <button onClick={() => setSearch("")} className="text-xs text-subtle">Clear</button>}
        </div>
      )}

      {/* messages */}
      <div className="flex-1 overflow-y-auto px-2 py-4">
        <div className="flex flex-col gap-1.5">
          {query && visible.length === 0 && <p className="py-8 text-center text-sm text-faint">No messages match.</p>}
          {visible.map((m) => {
            const mine = m.senderId === meId;
            const reactions = m.reactions || [];
            const emojis = [...new Set(reactions.map((r) => r.emoji))];
            const isGif = m.body?.match(/^https?:\/\/.*\.(gif|webp)/i);
            const isSingleEmoji = m.body && [...m.body].length <= 2 && /^\p{Emoji}/u.test(m.body);
            return (
              <div key={m.id} className={`group flex items-end gap-2 ${mine ? "flex-row-reverse" : "flex-row"}`}>
                {!mine && <Avatar name={other.name} seed={other.id} src={other.avatarUrl} size={26} />}
                <div className={`relative flex max-w-[72%] flex-col ${mine ? "items-end" : "items-start"}`}>
                  {m.replySnippet && (
                    <div className={`mb-0.5 max-w-full truncate rounded-lg border-l-2 border-accent bg-canvas/60 px-2 py-1 text-[11px] text-subtle`}>
                      <span className="text-faint">{m.replyFromMe ? "You" : other.name}: </span>{m.replySnippet}
                    </div>
                  )}
                  {isGif ? (
                    <img src={m.body} alt="GIF" className={`max-w-[200px] rounded-2xl ${mine ? "rounded-br-md" : "rounded-bl-md"}`} />
                  ) : isSingleEmoji ? (
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
                  <div className={`absolute top-1/2 -translate-y-1/2 ${mine ? "right-full mr-1" : "left-full ml-1"}`}>
                    {reactFor === m.id ? (
                      <div className="flex items-center gap-0.5 rounded-full border border-line bg-paper px-1.5 py-1 shadow-lg">
                        {REACTIONS.map((e) => <button key={e} onClick={() => react(m.id, e)} className="text-base hover:scale-125">{e}</button>)}
                        <button onClick={() => { setReplyTo({ id: m.id, body: m.body, mine }); setReactFor(null); }} className="ml-1 border-l border-line pl-1.5 text-xs text-subtle">↩</button>
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

      {/* reply bar */}
      {replyTo && (
        <div className="flex items-center gap-2 border-t border-line bg-canvas px-3 py-2 text-xs">
          <div className="min-w-0 flex-1">
            <div className="text-faint">Replying to {replyTo.mine ? "yourself" : other.name}</div>
            <div className="truncate text-subtle">{replyTo.body}</div>
          </div>
          <button onClick={() => setReplyTo(null)} className="text-subtle">✕</button>
        </div>
      )}

      {/* mention suggestion */}
      {mentioning && (
        <div className="border-t border-line bg-paper px-3 py-2">
          <button onClick={insertMention} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-canvas">
            <Avatar name={other.name} seed={other.id} src={other.avatarUrl} size={24} />
            <span className="font-medium text-ink">@{other.username}</span>
            <span className="text-xs text-subtle">{other.name}</span>
          </button>
        </div>
      )}

      {/* sticker panel */}
      {panel === "sticker" && (
        <div className="border-t border-line bg-paper">
          <div className="flex gap-1 overflow-x-auto border-b border-line px-2 py-1.5">
            {["Favourites", ...Object.keys(STICKER_PACKS)].map((p) => (
              <button key={p} onClick={() => setStickerPack(p)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${stickerPack === p ? "bg-accent text-white" : "text-subtle hover:text-ink"}`}>{p}</button>
            ))}
          </div>
          <div className="grid max-h-48 grid-cols-5 gap-1 overflow-y-auto p-2">
            {(stickerPack === "Favourites" ? favs : STICKER_PACKS[stickerPack] || []).map((s, i) => (
              <div key={`${s}-${i}`} className="group relative">
                <button onClick={() => sendSticker(s)} className="flex h-14 w-full items-center justify-center rounded-xl bg-canvas text-3xl transition-transform hover:scale-110">{s}</button>
                <button onClick={() => toggleFav(s)}
                  className={`absolute -right-0.5 -top-0.5 rounded-full bg-paper p-0.5 text-[10px] opacity-0 shadow group-hover:opacity-100 ${favs.includes(s) ? "text-accent" : "text-faint"}`}>
                  {favs.includes(s) ? "★" : "☆"}
                </button>
              </div>
            ))}
            {stickerPack === "Favourites" && favs.length === 0 && (
              <p className="col-span-5 py-4 text-center text-xs text-faint">Long-press any sticker to add to favourites</p>
            )}
          </div>
        </div>
      )}

      {/* GIF panel */}
      {panel === "gif" && (
        <div className="border-t border-line bg-paper">
          <div className="px-2 pt-2">
            <input value={gifQ} onChange={(e) => searchGifs(e.target.value)} placeholder="Search GIFs…" autoFocus
              className="w-full rounded-full border border-line bg-canvas px-3 py-1.5 text-sm text-ink outline-none placeholder:text-faint" />
          </div>
          <div className="max-h-52 overflow-y-auto p-2">
            {gifLoading ? (
              <p className="py-6 text-center text-xs text-faint">Loading…</p>
            ) : gifs.length > 0 ? (
              <div className="grid grid-cols-3 gap-1">
                {gifs.map((g) => (
                  <button key={g.id} onClick={() => sendGif(gifUrl(g))} className="overflow-hidden rounded-lg transition-transform hover:scale-105">
                    <img src={gifUrl(g)} alt="" className="h-24 w-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-xs text-faint">{gifQ.trim() ? "No GIFs found" : "Trending GIFs"}</p>
            )}
          </div>
          <p className="border-t border-line px-2 py-1 text-[9px] text-faint">Powered by Tenor</p>
        </div>
      )}

      {/* input bar — pinned to bottom */}
      <div className="flex items-center gap-2 border-t border-line bg-paper px-2 py-3">
        <button onClick={() => openPanel("sticker")} className={`rounded-full p-1.5 ${panel === "sticker" ? "text-accent" : "text-subtle"}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2" strokeLinecap="round"/><circle cx="9" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1" fill="currentColor" stroke="none"/></svg>
        </button>
        <button onClick={() => openPanel("gif")} className={`rounded-full p-1.5 text-xs font-bold ${panel === "gif" ? "text-accent" : "text-subtle"}`}>GIF</button>
        <input ref={inputRef} value={text} onChange={handleInput} onKeyDown={(e) => e.key === "Enter" && sendMsg()}
          placeholder="Message…" className="flex-1 rounded-full border border-line bg-canvas px-4 py-2 text-sm text-ink outline-none focus:border-accent" />
        <button onClick={() => sendMsg()} disabled={sending || !text.trim()} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Send</button>
      </div>
    </div>
  );
}