import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { loadGraph, loadViewer, buildContext } from "@/lib/feed";
import { rankFeed, suggestCommunities, suggestPeople, trendingTags } from "@/lib/rank";
import { getFeedStories } from "@/lib/story";
import Sidebar from "@/components/Sidebar";
import SuggestPanel from "@/components/SuggestPanel";
import FeedTabs from "@/components/FeedTabs";
import PostCard from "@/components/PostCard";
import StoriesBar from "@/components/StoriesBar";

export const dynamic = "force-dynamic";

const SORTS = ["foryou", "hot", "new", "top"];

export default async function HomePage({ searchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const sort = SORTS.includes(searchParams?.sort) ? searchParams.sort : "foryou";

  const graph = await loadGraph();
  const viewer = await loadViewer(user.id);
  const ctx = buildContext(user, graph, viewer);

  const storyGroups = await getFeedStories(user.id);
  const myGroup = storyGroups.find((g) => g.user.id === user.id);
  const otherStories = storyGroups.filter((g) => g.user.id !== user.id);

  const ranked = rankFeed(graph.plainPosts, sort, ctx);
  const posts = ranked.map((p) => graph.postById[p.id]);

  const suggestedCommunities = suggestCommunities({
    communities: graph.communities,
    membersByCommunity: graph.membersByCommunity,
    posts: graph.plainPosts,
    joined: viewer.joined,
    meId: user.id,
    collegeId: user.collegeId,
    limit: 5,
  });

  const suggestedPeople = suggestPeople({
    users: graph.users,
    communities: graph.communities,
    membersByCommunity: graph.membersByCommunity,
    followsBy: graph.followsBy,
    following: viewer.following,
    meId: user.id,
    branch: user.branch,
    collegeId: user.collegeId,
    limit: 5,
  });

  const trending = trendingTags(graph.plainPosts);
  const joinedCommunities = graph.communities.filter((c) => viewer.joined.has(c.id));

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 md:flex-row">
      <div className="w-56 shrink-0">
        <Sidebar joinedCommunities={joinedCommunities} me={user.username} />
      </div>

      <div className="mx-auto flex min-w-0 flex-1 flex-col md:max-w-2xl">
        <div className="mb-4">
          <StoriesBar
            me={{ name: user.name, username: user.username, avatarUrl: user.avatarUrl, hasStory: !!myGroup }}
            groups={otherStories}
          />
        </div>

        <div className="flex flex-col gap-3">
          {posts.length === 0 ? (
            <p className="rounded-xl2 border border-line bg-paper p-8 text-center text-sm text-subtle">
              Nothing here yet. <a href="/submit" className="font-medium text-accent">Write the first post.</a>
            </p>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} dir={viewer.votesByPost[post.id] || 0} />)
          )}
        </div>

        <div className="sticky bottom-0 z-10 mt-4 flex justify-center border-t border-line bg-canvas/90 py-2 backdrop-blur">
          <FeedTabs active={sort} basePath="/" />
        </div>
      </div>

      <div className="w-72 shrink-0">
        <SuggestPanel communities={suggestedCommunities} people={suggestedPeople} trending={trending} />
      </div>
    </div>
  );
}