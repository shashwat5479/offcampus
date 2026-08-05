import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Avatar from "@/components/Avatar";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

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
    <div className="mx-auto max-w-feed">
      <h1 className="mb-3 text-xl font-semibold tracking-tight">Messages</h1>
      <div className="flex flex-col gap-1">
        {convos.length === 0 && (
          <p className="rounded-xl2 border border-line bg-paper p-8 text-center text-sm text-subtle">
            No conversations yet. Message someone from their profile.
          </p>
        )}
        {convos.map((c) => {
          const other = c.user1Id === user.id ? c.user2 : c.user1;
          const last = c.messages[0];
          return (
            <Link key={c.id} href={`/messages/${c.id}`} className="flex items-center gap-3 rounded-xl border border-line p-3 hover:bg-canvas">
              <Avatar name={other.name} seed={other.id} src={other.avatarUrl} size={40} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-ink">{other.name}</div>
                <div className="truncate text-xs text-subtle">{last ? last.body : "Say hi"}</div>
              </div>
              {last && <span className="text-xs text-faint">{timeAgo(last.createdAt)}</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}