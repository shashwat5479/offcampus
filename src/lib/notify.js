import { prisma } from "./db";

// Maps a notification type to the recipient's on/off preference column.
// Types NOT listed here (FOLLOW_REQUEST, FOLLOW_ACCEPTED) have no toggle and
// are always delivered.
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
    const prefField = PREF[type];
    if (prefField) {
      const recipient = await prisma.user.findUnique({
        where: { id: userId },
        select: { [prefField]: true },
      });
      if (recipient && recipient[prefField] === false) return; // muted this type
    }
    // types without a pref (e.g. FOLLOW_REQUEST) fall straight through
    await prisma.notification.create({ data: { userId, actorId, type, postId, commentId } });
  } catch {
    // notifications are best-effort; never block the main action
  }
}