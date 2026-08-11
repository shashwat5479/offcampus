import { prisma } from "./db";
import { tagAffinity } from "./rank";

// Loads the social graph. Pass the viewer so personal-post privacy can be enforced.
//
// Visibility rules for the global feed:
//   - Community posts: shown as before (their reach is the community's scope).
//   - Personal posts (communityId = null): shown only if
//       * the author's account is PUBLIC (isPrivate = false)  → global, or
//       * the viewer follows the author (private account → followers only), or
//       * the viewer IS the author (always sees their own posts).
export async function loadGraph(viewer = null) {
  const viewerId = viewer?.id || null;
  const followingIds = viewer?.following ? Array.from(viewer.following) : [];

  const orRules = [
    { communityId: { not: null } },                         // all community posts
    { communityId: null, author: { isPrivate: false } },    // public accounts' personal posts
  ];
  if (viewerId) orRules.push({ communityId: null, authorId: viewerId });               // own posts
  if (followingIds.length) orRules.push({ communityId: null, authorId: { in: followingIds } }); // followed private accounts
  const postWhere = { OR: orRules };

  const [posts, communities, users, memberships, follows] = await Promise.all([
    prisma.post.findMany({
      where: postWhere,
      orderBy: { createdAt: "desc" },
      take: 300,
      include: {
        author: true,
        community: { include: { college: true } },
        tags: true,
        _count: { select: { comments: true } },
      },
    }),
    prisma.community.findMany({
      include: { college: true, _count: { select: { members: true } } },
    }),
    prisma.user.findMany({ include: { college: true } }),
    prisma.membership.findMany({ select: { userId: true, communityId: true } }),
    prisma.follow.findMany({ select: { followerId: true, followingId: true } }),
  ]);

  const membersByCommunity = {};
  for (const m of memberships) {
    (membersByCommunity[m.communityId] ||= []).push(m.userId);
  }

  const followsBy = {};
  for (const f of follows) {
    (followsBy[f.followerId] ||= []).push(f.followingId);
  }

  const communityById = Object.fromEntries(communities.map((c) => [c.id, c]));
  const postById = Object.fromEntries(posts.map((p) => [p.id, p]));

  // plain shape used by the ranking engine
  const plainPosts = posts.map((p) => ({
    id: p.id,
    score: p.score,
    createdAt: p.createdAt.getTime(),
    communityId: p.communityId,
    authorId: p.authorId,
    tags: p.tags.map((t) => t.tag),
  }));

  return {
    posts,
    plainPosts,
    postById,
    communities,
    communityById,
    users,
    membersByCommunity,
    followsBy,
  };
}

// Viewer-specific state: their votes, joined communities, who they follow.
export async function loadViewer(userId) {
  const votes = await prisma.postVote.findMany({
    where: { userId },
    select: { postId: true, value: true },
  });
  const votesByPost = {};
  const upvoted = new Set();
  for (const v of votes) {
    votesByPost[v.postId] = v.value;
    if (v.value === 1) upvoted.add(v.postId);
  }
  const memberships = await prisma.membership.findMany({
    where: { userId },
    select: { communityId: true },
  });
  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  return {
    votesByPost,
    upvoted,
    joined: new Set(memberships.map((m) => m.communityId)),
    following: new Set(follows.map((f) => f.followingId)),
  };
}

// Assembles the ctx object the ranking engine expects.
export function buildContext(user, graph, viewer) {
  return {
    meId: user.id,
    collegeId: user.collegeId,
    branch: user.branch,
    joined: viewer.joined,
    following: viewer.following,
    communityById: graph.communityById,
    aff: tagAffinity(graph.plainPosts, viewer.upvoted),
  };
}