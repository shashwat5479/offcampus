import { prisma } from "@/lib/db";

export async function getConversations(userId) {
  return prisma.conversation.findMany({
    where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
    orderBy: { updatedAt: "desc" },
    include: {
      user1: true,
      user2: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
}
