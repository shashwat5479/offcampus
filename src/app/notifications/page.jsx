import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Avatar from "@/components/Avatar";
import { timeAgo } from "@/lib/format";
import RequestActions from "@/components/RequestActions";
export const dynamic = "force-dynamic";

const TEXT = {
  FOLLOW: "started following you",
  COMMENT: "commented on your post",
  REPLY: "replied to your comment",
  POST_VOTE: "upvoted your post",
  COMMENT_VOTE: "upvoted your comment",
  FOLLOW_REQUEST: "requested to follow you",
  FOLLOW_ACCEPTED: "accepted your follow request",
  MESSAGE: "sent you a message",
};

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const items = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { actor: true },
  });

  // which follow-request senders do I already follow? (for the "Follow back" state)
  const requesterIds = items.filter((n) => n.type === "FOLLOW_REQUEST").map((n) => n.actorId);
  const myFollows = requesterIds.length
    ? await prisma.follow.findMany({
        where: { followerId: user.id, followingId: { in: requesterIds } },
        select: { followingId: true },
      })
    : [];
  const iFollow = new Set(myFollows.map((f) => f.followingId));

  // mark all as read when the page opens
  await prisma.notification.updateMany({ where: { userId: user.id, read: false }, data: { read: true } });

  return (
    <div className="mx-auto max-w-feed">
      <h1 className="mb-3 text-xl font-semibold tracking-tight">Notifications</h1>
      <div className="flex flex-col gap-1">
        {items.length === 0 && (
          <p className="rounded-xl2 border border-line bg-paper p-8 text-center text-sm text-subtle">No notifications yet.</p>
        )}
        {items.map((n) => (
          <Link
            key={n.id}
            href={n.postId ? `/post/${n.postId}` : `/u/${n.actor.username}`}
            className={`flex items-center gap-3 rounded-xl border border-line p-3 hover:bg-canvas ${n.read ? "bg-paper" : "bg-canvas"}`}
          >
            <Avatar name={n.actor.name} seed={n.actor.id} src={n.actor.avatarUrl} size={36} />
            <div className="min-w-0 flex-1 text-sm text-ink">
              <span className="font-semibold">@{n.actor.username}</span> {TEXT[n.type] || "interacted"}
            </div>
            <span className="text-xs text-faint">{timeAgo(n.createdAt)}</span>
            {n.type === "FOLLOW_REQUEST" && <RequestActions requesterId={n.actor.id} iFollow={iFollow.has(n.actor.id)} />}
          </Link>
        ))}
      </div>
    </div>
  );
}