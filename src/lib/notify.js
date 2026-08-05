import { prisma } from "./db";

// prefField maps a type to the recipient's on/off preference column
const PREF = {
  FOLLOW: "notifyFollow",
  COMMENT: "notifyComment",
  REPLY: "notifyReply",
  POST_VOTE: "notifyVote",
  COMMENT_VOTE: "notifyVote",
  MESSAGE: "notifyMessage",
};

export async function notify({ userId, actorId, type, postId = null, commentId = null }) {
  if (!userId || userId === actorId) return; // never notify yourself
  try {
    const recipient = await prisma.user.findUnique({
      where: { id: userId },
      select: { [PREF[type]]: true },
    });
    if (recipient && recipient[PREF[type]] === false) return; // muted this type
    await prisma.notification.create({ data: { userId, actorId, type, postId, commentId } });
  } catch {
    // notifications are best-effort; never block the main action
  }
}