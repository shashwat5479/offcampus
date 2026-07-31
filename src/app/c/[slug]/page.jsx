import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { loadGraph, loadViewer, buildContext } from "@/lib/feed";
import { rankFeed } from "@/lib/rank";
import FeedTabs from "@/components/FeedTabs";
import PostCard from "@/components/PostCard";
import JoinButton from "@/components/JoinButton";

export const dynamic = "force-dynamic";

const SORTS = ["hot", "new", "top"];

export default async function CommunityPage({ params, searchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const community = await prisma.community.findUnique({
    where: { slug: params.slug },
    include: { college: true, _count: { select: { members: true, posts: true } } },
  });
  if (!community) notFound();

  const requested = searchParams?.sort;
  const sort = SORTS.includes(requested) ? requested : "hot";

  const graph = await loadGraph();
  const viewer = await loadViewer(user.id);
  const ctx = buildContext(user, graph, viewer);

  const inCommunity = graph.plainPosts.filter((p) => p.communityId === community.id);
  const ranked = rankFeed(inCommunity, sort, ctx).map((p) => graph.postById[p.id]);

  return (
    <div className="mx-auto max-w-feed">
      <div className="mb-3 flex items-center gap-3 rounded-xl2 border border-line bg-paper p-4">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold tracking-tight">
            {community.college?.code} · {community.name}
          </h1>
          <p className="truncate text-sm text-subtle">
            {community.description} · {community._count.members} members · {community._count.posts} posts
          </p>
        </div>
        <JoinButton communityId={community.id} joined={viewer.joined.has(community.id)} size="lg" />
      </div>

      <div className="mb-3">
        <FeedTabs active={sort} basePath={`/c/${community.slug}`} />
      </div>

      <div className="flex flex-col gap-3">
        {ranked.length === 0 ? (
          <p className="rounded-xl2 border border-line bg-paper p-8 text-center text-sm text-subtle">
            No posts in this community yet.
          </p>
        ) : (
          ranked.map((post) => <PostCard key={post.id} post={post} dir={viewer.votesByPost[post.id] || 0} />)
        )}
      </div>
    </div>
  );
}
