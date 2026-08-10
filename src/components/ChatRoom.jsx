"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Avatar from "./Avatar";

const PICKER = ["😀","😂","🥹","😍","😎","🤩","😭","😅","😊","🙂","😉","😌","😴","🤔","🤗","🙌","👏","🙏","👍","👎","🔥","✨","🎉","❤️","🧡","💛","💚","💙","💜","🖤","💯","👀","😮","😢","😡","💀","🤝","💪","🫡","🫶"];
const REACTIONS = ["❤️","🔥","😂","😮","😢","👏"];

function loadAbly() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.Ably) return Promise.resolve(window.Ably);
  if (!window.__ablyLoader) {
    window.__ablyLoader = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdn.ably.com/lib/ably.min-2.js";
      s.async = true;
      s.onload = () => resolve(window.Ably);
      s.onerror = () => reject(new Error("Failed to load Ably"));
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

export default function ChatRoom({ conversationId, meId, other, initialMessages }) {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [reactFor, setReactFor] = useState(null);
  const [replyTo, setReplyTo] = useState(null); // { id, body, mine }
  const bottomRef = useRef(null);

  useEffect(() => {
    let client, channel, cancelled = false;
    loadAbly().then((Ably) => {
      if (cancelled || !Ably) return;
      client = new Ably.Realtime({ authUrl: "/api/ably-token" });
      channel = client.channels.get(`conversation:${conversationId}`);
      channel.subscribe("message", (msg) => {
        setMessages((prev) => (prev.some((m) => m.id === msg.data.id) ? prev : [...prev, msg.data]));
      });
      channel.subscribe("reaction", (msg) => {
        setMessages((prev) => applyReaction(prev, msg.data));
      });
    }).catch(() => {});
    return () => { cancelled = true; if (channel) channel.unsubscribe(); if (client) client.close(); };
  }, [conversationId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send() {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setText("");
    setShowPicker(false);
    const currentReply = replyTo;
    setReplyTo(null);
    try {
      const res = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: other.id, body, replyToId: currentReply?.id || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setText(body); setReplyTo(currentReply); return; }
      setMessages((prev) => (prev.some((m) => m.id === data.message.id) ? prev : [...prev, data.message]));
    } catch { setText(body); setReplyTo(currentReply); } finally { setSending(false); }
  }

  async function react(messageId, emoji) {
    setReactFor(null);
    setMessages((prev) => {
      const m = prev.find((x) => x.id === messageId);
      const mine = (m?.reactions || []).find((r) => r.userId === meId);
      const nextEmoji = mine && mine.emoji === emoji ? null : emoji;
      return applyReaction(prev, { messageId, userId: meId, emoji: nextEmoji });
    });
    try {
      await fetch("/api/message/react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, emoji }),
      });
    } catch {}
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-6rem)] max-w-feed flex-col">
      {/* header */}
      <div className="flex items-center gap-3 border-b border-line px-1 pb-3">
        <Link href="/messages" className="text-lg text-subtle hover:text-ink">←</Link>
        <Avatar name={other.name} seed={other.id} src={other.avatarUrl} size={38} />
        <div>
          <div className="text-sm font-semibold text-ink">{other.name}</div>
          <div className="text-xs text-subtle">@{other.username}</div>
        </div>
      </div>

      {/* messages */}
      <div className="flex-1 overflow-y-auto px-1 py-4">
        <div className="flex flex-col gap-1.5">
          {messages.map((m) => {
            const mine = m.senderId === meId;
            const reactions = m.reactions || [];
            const emojis = [...new Set(reactions.map((r) => r.emoji))];

            return (
              <div key={m.id} className={`group flex items-end gap-2 ${mine ? "flex-row-reverse" : "flex-row"}`}>
                {!mine && <Avatar name={other.name} seed={other.id} src={other.avatarUrl} size={26} />}

                <div className={`relative flex max-w-[72%] flex-col ${mine ? "items-end" : "items-start"}`}>
                  {/* quoted reply */}
                  {m.replySnippet && (
                    <div className={`mb-0.5 max-w-full truncate rounded-lg border-l-2 border-accent bg-canvas/60 px-2 py-1 text-[11px] text-subtle ${mine ? "self-end" : "self-start"}`}>
                      <span className="text-faint">{m.replyFromMe ? "You" : other.name}: </span>{m.replySnippet}
                    </div>
                  )}

                  {m.storyMediaUrl ? (
                    <>
                      <span className="mb-0.5 text-[11px] text-faint">{mine ? "You replied to their story" : "Replied to your story"}</span>
                      <div className="overflow-hidden rounded-2xl border border-line">
                        {m.storyMediaType === "VIDEO"
                          ? <video src={m.storyMediaUrl} muted className="h-40 w-28 object-cover" />
                          : <img src={m.storyMediaUrl} alt="" className="h-40 w-28 object-cover" />}
                      </div>
                      {m.body && <div className={`mt-1 rounded-2xl px-3.5 py-2 text-sm ${mine ? "bg-accent text-accentInk" : "bg-canvas text-ink"}`}>{m.body}</div>}
                    </>
                  ) : (
                    <div className={`rounded-2xl px-3.5 py-2 text-sm ${mine ? "rounded-br-md bg-accent text-accentInk" : "rounded-bl-md bg-canvas text-ink"}`}>
                      {m.body}
                    </div>
                  )}

                  {/* reaction pill */}
                  {emojis.length > 0 && (
                    <div className={`-mt-1.5 ${mine ? "self-start" : "self-end"} z-10`}>
                      <span className="rounded-full border border-line bg-paper px-1.5 py-0.5 text-xs shadow-sm">
                        {emojis.join("")}{reactions.length > 1 ? ` ${reactions.length}` : ""}
                      </span>
                    </div>
                  )}

                  {/* react + reply opener */}
                  <div className={`absolute top-1/2 -translate-y-1/2 ${mine ? "right-full mr-1" : "left-full ml-1"}`}>
                    {reactFor === m.id ? (
                      <div className="flex items-center gap-0.5 rounded-full border border-line bg-paper px-1.5 py-1 shadow-gold">
                        {REACTIONS.map((e) => (
                          <button key={e} onClick={() => react(m.id, e)} className="text-base transition-transform hover:scale-125">{e}</button>
                        ))}
                        <button onClick={() => { setReplyTo({ id: m.id, body: m.body, mine }); setReactFor(null); }} className="ml-1 border-l border-line pl-1.5 text-xs text-subtle hover:text-ink">↩</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReactFor(m.id)}
                        className="text-sm text-faint opacity-0 transition-opacity hover:text-ink group-hover:opacity-100"
                        aria-label="React or reply"
                      >☺</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* replying-to bar */}
      {replyTo && (
        <div className="mb-2 flex items-center gap-2 rounded-lg border border-line bg-canvas px-3 py-2 text-xs">
          <div className="min-w-0 flex-1">
            <div className="text-faint">Replying to {replyTo.mine ? "yourself" : other.name}</div>
            <div className="truncate text-subtle">{replyTo.body}</div>
          </div>
          <button onClick={() => setReplyTo(null)} className="text-subtle hover:text-ink">✕</button>
        </div>
      )}

      {/* emoji picker */}
      {showPicker && (
        <div className="mb-2 grid max-h-40 grid-cols-8 gap-1 overflow-y-auto rounded-xl border border-line bg-paper p-2">
          {PICKER.map((e) => (
            <button key={e} onClick={() => setText((t) => t + e)} className="rounded p-1 text-xl hover:bg-canvas">{e}</button>
          ))}
        </div>
      )}

      {/* input */}
      <div className="flex items-center gap-2 border-t border-line pt-3">
        <button onClick={() => setShowPicker((s) => !s)} className="text-xl" aria-label="Emoji">😊</button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Message…"
          className="flex-1 rounded-full border border-line bg-canvas px-4 py-2 text-sm text-ink outline-none focus:border-accent"
        />
        <button onClick={send} disabled={sending || !text.trim()} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accentInk disabled:opacity-50">Send</button>
      </div>
    </div>
  );
}