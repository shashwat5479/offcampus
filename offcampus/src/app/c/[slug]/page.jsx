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
    include: {
      college: { select: { code: true } },
      _count: { select: { members: true, posts: true } },
    },
  });
  if (!community) notFound();

  const requested = searchParams?.sort;
  const sort = SORTS.includes(requested) ? requested : "hot";

  const graph = await loadGraph();
  const viewer = await loadViewer(user.id);
  const ctx = buildContext(user, graph, viewer);

  const inCommunity = graph.plainPosts.filter((p) => p.communityId === community.id);
  const ranked = rankFeed(inCommunity, sort, ctx).map((p) => graph.postById[p.id]);

  const memberCount = community._count.members;
  const isMember = viewer.joined.has(community.id);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="overflow-hidden rounded-xl2 border border-line bg-paper">
        <div className="h-24 bg-gradient-to-r from-accent/30 to-transparent" />
        <div className="-mt-8 flex items-end gap-3 px-4 pb-3">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-paper bg-accent/15 text-2xl font-bold text-accent">
            {community.name?.[0]?.toUpperCase() || "#"}
          </span>
          <div className="min-w-0 flex-1 pb-1">
            <h1 className="truncate text-lg font-semibold text-ink">{community.name}</h1>
            <p className="text-xs text-faint">
              {community.isPublic ? (community.category || "Public") : (community.college?.code || "College")} · {memberCount} members
            </p>
          </div>
          <div className="flex items-center gap-2 pb-1">
            <JoinButton communityId={community.id} joined={isMember} />
            <a href={`/submit?community=${community.slug}`} className="rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accentInk">Create Post</a>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <FeedTabs active={sort} basePath={`/c/${community.slug}`} />
          {ranked.length === 0 ? (
            <p className="rounded-xl2 border border-line bg-paper p-8 text-center text-sm text-subtle">
              No posts yet. <a href={`/submit?community=${community.slug}`} className="text-accent">Be the first.</a>
            </p>
          ) : (
            ranked.map((post) => <PostCard key={post.id} post={post} dir={viewer.votesByPost[post.id] || 0} />)
          )}
        </div>

        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="rounded-xl2 border border-line bg-paper p-4">
            <h3 className="mb-2 text-sm font-semibold text-ink">About</h3>
            {community.description && <p className="mb-3 text-sm text-subtle">{community.description}</p>}
            <div className="space-y-1 text-xs text-faint">
              <div>{community.isPublic ? "Public community" : "College community"}</div>
              <div>{memberCount} members</div>
              <div>Created {new Date(community.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}