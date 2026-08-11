// src/lib/radar.js
// Campus Radar aggregator — each college sees ITS OWN radar.
// Scopes: mine (your college) · nearby (same-city colleges) · online (public/global only).
// A college can never see another college's internal posts.
import { prisma } from "@/lib/db";

function startOfToday() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
function endOfToday() { const d = new Date(); d.setHours(23, 59, 59, 999); return d; }
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d; }
function daysAhead(n) { const d = new Date(); d.setDate(d.getDate() + n); return d; }

function trunc(s, n = 90) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n).trimEnd() + "…" : s;
}
function closesIn(deadline) {
  const ms = new Date(deadline).getTime() - Date.now();
  const days = Math.ceil(ms / 86400000);
  if (days <= 0) return "Closes today";
  if (days === 1) return "Closes tomorrow";
  if (days <= 14) return `Closes in ${days} days`;
  return "Closes " + new Date(deadline).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

const SCOPES = ["mine", "nearby", "online"];

export async function loadRadar({ user, when = "week", scope = "mine" }) {
  if (!SCOPES.includes(scope)) scope = "mine";
  const now = new Date();
  const since = when === "today" ? startOfToday() : when === "week" ? daysAgo(7) : null;
  const deadlineMax = when === "today" ? endOfToday() : when === "week" ? daysAhead(7) : daysAhead(60);

  const myCollegeId = user?.collegeId || null;

  // Resolve which colleges this scope may read from. Never "all".
  let scopeCollegeIds = []; // for mine/nearby
  if (scope === "mine") {
    scopeCollegeIds = myCollegeId ? [myCollegeId] : [];
  } else if (scope === "nearby") {
    if (myCollegeId) {
      const me = await prisma.college.findUnique({ where: { id: myCollegeId }, select: { city: true } });
      if (me?.city) {
        const near = await prisma.college.findMany({
          where: { city: me.city, id: { not: myCollegeId } },
          select: { id: true },
        });
        scopeCollegeIds = near.map((c) => c.id);
      }
    }
  }
  const online = scope === "online";

  // Content lens: public/global content for "online", else strictly the scoped colleges.
  const communityScope = online ? { isPublic: true } : { collegeId: { in: scopeCollegeIds } };

  // ---- 1. Opportunities closing soon (gated by poster's college; online = remote) ----
  const oppWhere = { deadline: { gte: now, lte: deadlineMax } };
  if (online) oppWhere.isRemote = true;
  else oppWhere.postedBy = { collegeId: { in: scopeCollegeIds } };
  const opps = await prisma.opportunity.findMany({
    where: oppWhere,
    orderBy: { deadline: "asc" },
    take: 12,
    select: { id: true, company: true, role: true, type: true, deadline: true, isRemote: true, location: true },
  });
  const oppItems = opps.map((o) => ({
    id: `opp-${o.id}`,
    category: "opportunity",
    subtype: o.type,
    title: `${o.role} · ${o.company}`,
    subtitle: `${o.type}${o.isRemote ? " · Remote" : o.location ? " · " + o.location : ""}`,
    meta: closesIn(o.deadline),
    href: "/opportunities",
    at: o.deadline,
  }));

  // ---- 2. Trending discussions ----
  const postWhere = { community: communityScope };
  if (since) postWhere.createdAt = { gte: since };
  const posts = await prisma.post.findMany({
    where: postWhere,
    orderBy: [{ score: "desc" }, { createdAt: "desc" }],
    take: 8,
    select: {
      id: true, title: true, score: true, createdAt: true,
      community: { select: { name: true, college: { select: { code: true } } } },
      _count: { select: { comments: true } },
    },
  });
  const postItems = posts.map((p) => ({
    id: `post-${p.id}`,
    category: "discussion",
    title: p.title,
    subtitle: p.community?.name || "Discussion",
    meta: `${p.score} upvotes · ${p._count.comments} comments`,
    href: `/post/${p.id}`,
    at: p.createdAt,
    collegeCode: p.community?.college?.code || null,
  }));

  // ---- 3. Communities to check out ----
  const comms = await prisma.community.findMany({
    where: communityScope,
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true, name: true, slug: true, category: true, type: true,
      college: { select: { code: true } },
      _count: { select: { members: true } },
    },
  });
  const commItems = comms.map((c) => ({
    id: `comm-${c.id}`,
    category: "community",
    title: c.name,
    subtitle: c.category || c.type || "Community",
    meta: `${c._count.members} member${c._count.members === 1 ? "" : "s"}`,
    href: `/c/${c.slug}`,
    at: null,
    collegeCode: c.college?.code || null,
  }));

  // ---- 4. Latest confessions ----
  const confWhere = { hidden: false };
  if (since) confWhere.createdAt = { gte: since };
  if (online) confWhere.isPublic = true;
  else confWhere.collegeId = { in: scopeCollegeIds };
  const confs = await prisma.confession.findMany({
    where: confWhere,
    orderBy: { createdAt: "desc" },
    take: 6,
    select: { id: true, body: true, score: true, createdAt: true },
  });
  const confItems = confs.map((c) => ({
    id: `conf-${c.id}`,
    category: "confession",
    title: trunc(c.body),
    subtitle: "Anonymous",
    meta: `${c.score} upvotes`,
    href: "/confessions",
    at: c.createdAt,
  }));

  const sections = [
    { key: "opportunity", label: "Opportunities closing soon", items: oppItems },
    { key: "discussion", label: "Trending discussions", items: postItems },
    { key: "community", label: "Communities to check out", items: commItems },
    { key: "confession", label: "Latest confessions", items: confItems },
  ].filter((s) => s.items.length > 0);

  const total = sections.reduce((n, s) => n + s.items.length, 0);
  return { sections, total, when, scope, hasCollege: !!myCollegeId };
}