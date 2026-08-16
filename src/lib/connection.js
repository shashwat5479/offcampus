import { prisma } from "./db";

export async function areConnected(senderId, recipientId) {
  if (!senderId || !recipientId || senderId === recipientId) return false;
  const follow = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: senderId, followingId: recipientId } },
    select: { id: true },
  });
  return !!follow;
}