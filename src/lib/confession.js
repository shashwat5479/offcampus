import { prisma } from "@/lib/db";

const DAY = 24 * 60 * 60 * 1000;

export async function createConfession({ authorId, body, isPublic, collegeId }) {
  // rate limit: max 5 confessions per user per 24h
  const since = new Date(Date.now() - DAY);
  const recent = await prisma.confession.count({ where: { authorId, createdAt: { gt: since } } });
  if (recent >= 5) return { error: "You've hit the limit (5 per day). Try again later." };

  const c = await prisma.confession.create({
    data: { authorId, body: body.trim().slice(0, 1000), isPublic: !!isPublic, collegeId: isPublic ? null : collegeId },
  });
  return { id: c.id };
}

// Returns confessions with NO author info — truly anonymous to the client.
export async function getConfessions(viewer, scope = "college") {
  const where =
    scope === "public"
      ? { isPublic: true, hidden: false }
      : { hidden: false, isPublic: false, collegeId: viewer.collegeId };

  const rows = await prisma.confession.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, body: true, score: true, isPublic: true, createdAt: true },
  });

  const myVotes = await prisma.confessionVote.findMany({
    where: { userId: viewer.id, confessionId: { in: rows.map((r) => r.id) } },
    select: { confessionId: true, value: true },
  });
  const dirBy = Object.fromEntries(myVotes.map((v) => [v.confessionId, v.value]));

  return rows.map((r) => ({ ...r, dir: dirBy[r.id] || 0 }));
}