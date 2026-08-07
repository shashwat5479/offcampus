import { prisma } from "@/lib/db";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function createStory({ authorId, mediaUrl, type }) {
  return prisma.story.create({
    data: {
      authorId,
      mediaUrl,
      type: type === "VIDEO" ? "VIDEO" : "IMAGE",
      expiresAt: new Date(Date.now() + DAY_MS),
    },
  });
}

export async function getFeedStories(viewerId) {
  const now = new Date();

  const me = await prisma.user.findUnique({
    where: { id: viewerId },
    select: { collegeId: true },
  });

  const following = await prisma.follow.findMany({
    where: { followerId: viewerId, status: "ACCEPTED" },
    select: { followingId: true },
  });
  const followedIds = following.map((f) => f.followingId);

  const orClauses = [
    { authorId: viewerId },
    { authorId: { in: followedIds } },
    me?.collegeId
      ? { author: { isPrivate: false, collegeId: me.collegeId } }
      : { author: { isPrivate: false } },
  ];

  const stories = await prisma.story.findMany({
    where: { expiresAt: { gt: now }, OR: orClauses },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { id: true, name: true, username: true, avatarUrl: true } } },
  });

  const byAuthor = new Map();
  for (const s of stories) {
    const g = byAuthor.get(s.authorId) || { user: s.author, count: 0 };
    g.count += 1;
    byAuthor.set(s.authorId, g);
  }
  return Array.from(byAuthor.values());
}

export async function getUserActiveStories(viewerId, username) {
  const target = await prisma.user.findUnique({
    where: { username },
    select: { id: true, name: true, username: true, avatarUrl: true, isPrivate: true },
  });
  if (!target) return null;

  let allowed = target.id === viewerId || !target.isPrivate;
  if (!allowed) {
    const f = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: viewerId, followingId: target.id } },
    });
    allowed = f?.status === "ACCEPTED";
  }
  if (!allowed) return { author: target, stories: [], locked: true };

  const stories = await prisma.story.findMany({
    where: { authorId: target.id, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      mediaUrl: true,
      type: true,
      reactions: { where: { userId: viewerId }, select: { emoji: true } },
    },
  });
  const mapped = stories.map((s) => ({
    id: s.id,
    mediaUrl: s.mediaUrl,
    type: s.type,
    myReaction: s.reactions[0]?.emoji || null,
  }));
  return { author: target, stories: mapped, locked: false };
  
}
// Reactions the OWNER can see on their own stories
export async function getStoryReactions(ownerId, storyId) {
  const story = await prisma.story.findUnique({
    where: { id: storyId },
    select: { authorId: true },
  });
  if (!story || story.authorId !== ownerId) return null; // only the owner

  const reactions = await prisma.storyReaction.findMany({
    where: { storyId },
    orderBy: { createdAt: "desc" },
    select: {
      emoji: true,
      user: { select: { id: true, name: true, username: true, avatarUrl: true } },
    },
  });
  return reactions;
}