import Link from "next/link";
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
let followState = "none";
if (!isMe) {
  const rel = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: me.id, followingId: user.id } },
  });
  iFollow = !!rel;
  if (rel) followState = rel.status === "ACCEPTED" ? "following" : "requested";
}

  const myVotes = await prisma.postVote.findMany({
    where: { userId: me.id, postId: { in: posts.map((p) => p.id) } },
  });
  const dirByPost = {};
  for (const v of myVotes) dirByPost[v.postId] = v.value;

  return (
    <div className="mx-auto max-w-feed">
      <div className="rounded-xl2 border border-line bg-paper p-5">
        <div className="flex items-start gap-5 sm:gap-8">
          {/* Avatar with an Instagram-style story ring */}
          <div className="shrink-0">
            <div className="rounded-full bg-gradient-to-tr from-accent via-up to-ink p-[3px]">
              <div className="rounded-full bg-paper p-[3px]">
                <Avatar name={user.name} seed={user.id} src={user.avatarUrl} size={80} />
              </div>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            {/* username + action buttons, IG-style top row */}
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="truncate text-lg font-semibold tracking-tight">{user.username}</h1>
              {!isMe ? (
                <div className="flex items-center gap-2">
                  <FollowButton userId={user.id} status={followState} size="lg" />
                  <MessageButton otherId={user.id} />
                </div>
              ) : (
                <Link
                  href="/settings"
                  className="rounded-full border border-line px-4 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-canvas"
                >
                  Edit profile
                </Link>
              )}
            </div>

            {/* stat pills — posts / followers / following, IG-style */}
            <div className="mt-3 flex items-center gap-5 sm:gap-8">
              <div className="text-sm">
                <span className="font-semibold text-ink">{user._count.posts}</span>{" "}
                <span className="text-subtle">posts</span>
              </div>
              <Link href={`/u/${user.username}/followers`} className="text-sm transition-colors hover:text-accent">
                <span className="font-semibold text-ink">{followers}</span>{" "}
                <span className="text-subtle">followers</span>
              </Link>
              <Link href={`/u/${user.username}/following`} className="text-sm transition-colors hover:text-accent">
                <span className="font-semibold text-ink">{following}</span>{" "}
                <span className="text-subtle">following</span>
              </Link>
            </div>

            <p className="mt-3 text-sm font-semibold text-ink">{user.name}</p>
            <p className="text-sm text-subtle">
              @{user.username}
              {user.college ? ` · ${user.college.code}` : ""}
              {user.branch ? ` · ${user.branch}` : ""}
              {user.year ? ` · Year ${user.year}` : ""}
            </p>
            {user.bio ? <p className="mt-1 text-sm text-ink">{user.bio}</p> : null}
          </div>
        </div>
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