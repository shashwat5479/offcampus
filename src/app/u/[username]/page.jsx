import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Avatar from "@/components/Avatar";
import FollowButton from "@/components/FollowButton";
import PostCard from "@/components/PostCard";
import MessageButton from "@/components/MessageButton";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }) {
  const me = await getCurrentUser();
  if (!me) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: {
      college: true,
      _count: { select: { followers: true, following: true, posts: true } },
    },
  });
  if (!user) notFound();
  const followers = await prisma.follow.count({ where: { followingId: user.id, status: "ACCEPTED" } });
  const following = await prisma.follow.count({ where: { followerId: user.id, status: "ACCEPTED" } });

  const posts = await prisma.post.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      author: true,
      community: { include: { college: true } },
      tags: true,
      _count: { select: { comments: true } },
    },
  });

  const isMe = me.id === user.id;
  let iFollow = false;
  if (!isMe) {
    const rel = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: me.id, followingId: user.id } },
    });
    iFollow = !!rel;
  }

  const myVotes = await prisma.postVote.findMany({
    where: { userId: me.id, postId: { in: posts.map((p) => p.id) } },
  });
  const dirByPost = {};
  for (const v of myVotes) dirByPost[v.postId] = v.value;

  return (
    <div className="mx-auto max-w-feed">
      <div className="rounded-xl2 border border-line bg-paper p-5">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} seed={user.id} src={user.avatarUrl} size={64} />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold tracking-tight">{user.name}</h1>
            <p className="text-sm text-subtle">
              @{user.username}
              {user.college ? ` · ${user.college.code}` : ""}
              {user.branch ? ` · ${user.branch}` : ""}
              {user.year ? ` · Year ${user.year}` : ""}
            </p>
            <p className="mt-1 text-xs text-faint">
              {followers} followers · {following} following · {user._count.posts} posts
              
            </p>
          </div>
{!isMe && (
  <div className="flex items-center gap-2">
    <FollowButton userId={user.id} following={iFollow} size="lg" />
    <MessageButton otherId={user.id} />
  </div>
)}        </div>
        {user.bio ? <p className="mt-3 text-sm text-ink">{user.bio}</p> : null}
      </div>

      <div className="mt-3 flex flex-col gap-3">
        {posts.length === 0 ? (
          <p className="rounded-xl2 border border-line bg-paper p-8 text-center text-sm text-subtle">No posts yet.</p>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} dir={dirByPost[post.id] || 0} />)
        )}
      </div>
    </div>
  );
}
