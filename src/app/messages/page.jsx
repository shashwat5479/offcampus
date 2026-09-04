import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Avatar from "@/components/Avatar";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

// Turn a raw message body/media into a clean inbox preview line.
function previewOf(msg, mine) {
  if (!msg) return "Say hi";
  if (msg.deletedAt) return "🚫 Message deleted";
  if (msg.mediaType === "VIDEO") return "🎥 Video";
  if (msg.mediaType === "IMAGE" || msg.mediaUrl) return "📷 Photo";
  const b = msg.body || "";
  if (/^https?:\/\/.*\.(gif|webp)(\?|$)/i.test(b) || /tenor\.com|giphy\.com/i.test(b)) return "🎬 GIF";
  if (b.startsWith("data:image/")) return "🎭 Sticker";
  if (b && [...b].length <= 2 && /^\p{Emoji}/u.test(b)) return b; // single emoji/sticker — show it
  return b || "Say hi";
}

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const convos = await prisma.conversation.findMany({
    where: { OR: [{ user1Id: user.id }, { user2Id: user.id }] },
    orderBy: { updatedAt: "desc" },
    include: {
      user1: true,
      user2: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return (
    <div className="mx-auto w-full max-w-2xl px-1 sm:px-0">
      <h1 className="mb-3 px-2 text-xl font-semibold tracking-tight sm:px-0">Messages</h1>
      <div className="flex flex-col">
        {convos.length === 0 && (
          <p className="rounded-xl2 border border-line bg-paper p-8 text-center text-sm text-subtle">
            No conversations yet. Message someone from their profile.
          </p>
        )}
        {convos.map((c) => {
          const other = c.user1Id === user.id ? c.user2 : c.user1;
          const clearedAt = c.user1Id === user.id ? c.user1ClearedAt : c.user2ClearedAt;
          const rawLast = c.messages[0];
          // if the last message is before "cleared at", don't preview it
          const last = rawLast && clearedAt && new Date(rawLast.createdAt) <= new Date(clearedAt) ? null : rawLast;
          const mine = last?.senderId === user.id;
          return (
            <Link
              key={c.id}
              href={`/messages/${c.id}`}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-canvas active:bg-canvas"
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
    </div>
  );
}
