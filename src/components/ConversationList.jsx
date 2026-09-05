import Link from "next/link";
import Avatar from "@/components/Avatar";
import { timeAgo } from "@/lib/format";

function previewOf(msg, mine) {
  if (!msg) return "Say hi";
  if (msg.deletedAt) return "🚫 Message deleted";
  if (msg.mediaType === "VIDEO") return "🎥 Video";
  if (msg.mediaType === "IMAGE" || msg.mediaUrl) return "📷 Photo";
  const b = msg.body || "";
  if (/^https?:\/\/.*\.(gif|webp)(\?|$)/i.test(b) || /tenor\.com|giphy\.com/i.test(b)) return "🎬 GIF";
  if (b.startsWith("data:image/")) return "🎭 Sticker";
  if (b && [...b].length <= 2 && /^\p{Emoji}/u.test(b)) return b;
  return b || "Say hi";
}

// Renders the list of conversations. `activeId` highlights the open chat (desktop).
export default function ConversationList({ convos, meId, activeId }) {
  return (
    <div className="flex flex-col">
      <h1 className="mb-2 px-3 pt-1 text-xl font-semibold tracking-tight">Messages</h1>
      {convos.length === 0 && (
        <p className="m-2 rounded-xl2 border border-line bg-paper p-6 text-center text-sm text-subtle">
          No conversations yet. Message someone from their profile.
        </p>
      )}
      {convos.map((c) => {
        const other = c.user1Id === meId ? c.user2 : c.user1;
        const clearedAt = c.user1Id === meId ? c.user1ClearedAt : c.user2ClearedAt;
        const rawLast = c.messages[0];
        const last = rawLast && clearedAt && new Date(rawLast.createdAt) <= new Date(clearedAt) ? null : rawLast;
        const mine = last?.senderId === meId;
        const active = c.id === activeId;
        return (
          <Link
            key={c.id}
            href={`/messages/${c.id}`}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-canvas active:bg-canvas ${active ? "bg-canvas" : ""}`}
          >
            <Avatar name={other.name} seed={other.id} src={other.avatarUrl} size={52} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-semibold text-ink">{other.name}</div>
              <div className="truncate text-sm text-subtle">
                {mine && last ? "You: " : ""}{previewOf(last, mine)}
              </div>
            </div>
            {last && <span className="shrink-0 text-xs text-faint">{timeAgo(last.createdAt)}</span>}
          </Link>
        );
      })}
    </div>
  );
}
