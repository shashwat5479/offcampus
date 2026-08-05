import { prisma } from "./db";

// Two users are "connected" only if each follows the other with ACCEPTED status.
export async function areConnected(aId, bId) {
  if (!aId || !bId || aId === bId) return false;
  const [aFollowsB, bFollowsA] = await Promise.all([
    prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: aId, followingId: bId } },
      select: { status: true },
    }),
    prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: bId, followingId: aId } },
      select: { status: true },
    }),
  ]);
  return aFollowsB?.status === "ACCEPTED" && bFollowsA?.status === "ACCEPTED";
}