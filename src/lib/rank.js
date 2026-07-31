// ============================================================================
// OffCampus recommendation engine (pure functions, no DB access).
// Server components/route handlers fetch rows, map them to the plain shapes
// below, and call these. Keeping it framework-free makes it easy to unit test.
//
// Post shape expected: { id, score, createdAt (ms), communityId, authorId, tags: string[] }
// ============================================================================

const EPOCH = new Date("2024-01-01T00:00:00Z").getTime();
const H = 3600000;

// Reddit-style "hot": log-scaled vote magnitude + a time term so fresh posts
// surface without old high-scorers dominating forever.
export function hotScore(post, now = Date.now()) {
  const s = post.score || 0;
  const order = Math.log10(Math.max(Math.abs(s), 1));
  const sign = s > 0 ? 1 : s < 0 ? -1 : 0;
  const seconds = (post.createdAt - EPOCH) / 1000;
  return sign * order + seconds / 45000;
}

// Build the viewer's topic-taste vector from the posts they've upvoted.
// upvotedPostIds: Set of postIds the viewer voted +1 on.
export function tagAffinity(posts, upvotedPostIds) {
  const aff = {};
  for (const p of posts) {
    if (upvotedPostIds.has(p.id)) {
      for (const tg of p.tags) aff[tg] = (aff[tg] || 0) + 1;
    }
  }
  return aff;
}

// Personalized "For You" score = hot baseline + signals about THIS viewer.
export function personalScore(post, ctx, now = Date.now()) {
  let s = hotScore(post, now);
  if (ctx.joined.has(post.communityId)) s += 6; // communities you're in
  const comm = ctx.communityById[post.communityId];
  if (comm && comm.collegeId === ctx.collegeId) s += 3; // your college
  let tagBoost = 0;
  for (const tg of post.tags) tagBoost += ctx.aff[tg] || 0;
  s += tagBoost * 1.6; // your topics
  if (ctx.following.has(post.authorId)) s += 4; // people you follow
  return s;
}

export function rankFeed(posts, sort, ctx, now = Date.now()) {
  const arr = [...posts];
  if (sort === "new") return arr.sort((a, b) => b.createdAt - a.createdAt);
  if (sort === "top") return arr.sort((a, b) => b.score - a.score);
  if (sort === "hot") return arr.sort((a, b) => hotScore(b, now) - hotScore(a, now));
  return arr.sort((a, b) => personalScore(b, ctx, now) - personalScore(a, ctx, now));
}

// Communities you're not in, ranked by collaborative signal (people who share a
// community with you are already there) + same college + recent activity.
export function suggestCommunities({ communities, membersByCommunity, posts, joined, meId, collegeId, limit = 5 }, now = Date.now()) {
  const peers = new Set();
  for (const cid of joined) {
    for (const uid of membersByCommunity[cid] || []) if (uid !== meId) peers.add(uid);
  }
  const out = [];
  for (const c of communities) {
    if (joined.has(c.id)) continue;
    const mem = membersByCommunity[c.id] || [];
    let coMembers = 0;
    for (const uid of mem) if (peers.has(uid)) coMembers++;
    const recent = posts.filter((p) => p.communityId === c.id && now - p.createdAt < 48 * H).length;
    const sameCollege = c.collegeId === collegeId ? 1 : 0;
    const score = coMembers * 3 + recent * 1.5 + sameCollege * 2;
    if (score > 0) out.push({ community: c, score, coMembers, sameCollege, members: mem.length });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, limit);
}

// People you don't follow, ranked by friends-of-friends + shared communities +
// same branch / same college cohort.
export function suggestPeople({ users, communities, membersByCommunity, followsBy, following, meId, branch, collegeId, limit = 5 }) {
  const fof = {};
  for (const uid of following) {
    for (const v of followsBy[uid] || []) {
      if (v !== meId && !following.has(v)) fof[v] = (fof[v] || 0) + 1;
    }
  }
  const out = [];
  for (const u of users) {
    if (u.id === meId || following.has(u.id)) continue;
    const mutuals = fof[u.id] || 0;
    let shared = 0;
    for (const c of communities) {
      const mem = membersByCommunity[c.id] || [];
      if (mem.includes(u.id) && mem.includes(meId)) shared++;
    }
    const sameBranch = u.branch && u.branch === branch ? 1 : 0;
    const sameCollege = u.collegeId === collegeId ? 1 : 0;
    const score = mutuals * 3 + shared * 2 + sameBranch + sameCollege * 0.5;
    if (score > 0) out.push({ user: u, score, mutuals, shared, sameBranch });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function trendingTags(posts, now = Date.now(), limit = 10) {
  const m = {};
  for (const p of posts) {
    if (now - p.createdAt < 72 * H) {
      for (const tg of p.tags) m[tg] = (m[tg] || 0) + Math.max(p.score, 1);
    }
  }
  return Object.entries(m)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, weight]) => ({ tag, weight }));
}
