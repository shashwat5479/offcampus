"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Avatar from "./Avatar";

// Load the Ably browser library from its CDN once, then reuse window.Ably.
// This deliberately avoids `import ... from "ably"` so webpack never has to
// bundle/parse ably/build/ably.js on the client.
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

export default function ChatRoom({ conversationId, meId, other, initialMessages }) {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  // connect to Ably and subscribe to this conversation's channel
  useEffect(() => {
    let client;
    let channel;
    let cancelled = false;

    loadAbly()
      .then((Ably) => {
        if (cancelled || !Ably) return;
        client = new Ably.Realtime({ authUrl: "/api/ably-token" });
        channel = client.channels.get(`conversation:${conversationId}`);
        channel.subscribe("message", (msg) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.data.id)) return prev; // no dupes
            return [...prev, msg.data];
          });
        });
      })
      .catch(() => {
        // realtime is best-effort; sending still works via the API + refresh
      });

    return () => {
      cancelled = true;
      if (channel) channel.unsubscribe();
      if (client) client.close();
    };
  }, [conversationId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send() {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setText("");
    try {
      const res = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: other.id, body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setText(body); return; }
      // optimistic add (subscription also fires, dedup handles it)
      setMessages((prev) => prev.some((m) => m.id === data.message.id) ? prev : [...prev, data.message]);
    } catch {
      setText(body);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-feed flex-col">
      <div className="flex items-center gap-3 border-b border-line pb-3">
        <Link href="/messages" className="text-subtle">←</Link>
        <Avatar name={other.name} seed={other.id} src={other.avatarUrl} size={36} />
        <div>
          <div className="text-sm font-semibold text-ink">{other.name}</div>
          <div className="text-xs text-subtle">@{other.username}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-3">
        <div className="flex flex-col gap-2">
          {messages.map((m) => {
            const mine = m.senderId === meId;
            if (m.storyMediaUrl) {
              return (
                <div key={m.id} className={`flex max-w-[75%] flex-col gap-1 ${mine ? "items-end self-end" : "items-start self-start"}`}>
                  <span className="text-[11px] text-faint">{mine ? "You replied to their story" : "Replied to your story"}</span>
                  <div className="overflow-hidden rounded-2xl border border-line">
                    {m.storyMediaType === "VIDEO" ? (
                      <video src={m.storyMediaUrl} muted className="h-40 w-28 object-cover" />
                    ) : (
                      <img src={m.storyMediaUrl} alt="" className="h-40 w-28 object-cover" />
                    )}
                  </div>
                  <div className={`rounded-2xl px-3 py-2 text-sm ${mine ? "bg-ink text-paper" : "bg-canvas text-ink"}`}>{m.body}</div>
                </div>
              );
            }
            return (
              <div key={m.id} className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${mine ? "self-end bg-ink text-paper" : "self-start bg-canvas text-ink"}`}>
                {m.body}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="flex gap-2 border-t border-line pt-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Message…"
          className="flex-1 rounded-full border border-line bg-canvas px-4 py-2 text-sm outline-none focus:border-ink"
        />
        <button onClick={send} disabled={sending} className="rounded-full bg-ink px-4 text-sm font-semibold text-paper disabled:opacity-50">Send</button>
      </div>
    </div>
  );
}