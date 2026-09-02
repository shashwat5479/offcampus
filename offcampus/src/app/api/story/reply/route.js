import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getAblyRest, conversationChannel } from "@/lib/ably";
import { notify } from "@/lib/notify";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const { storyId, text } = await request.json().catch(() => ({}));
  const msg = (text || "").trim();
  if (!storyId || !msg) return NextResponse.json({ error: "Empty reply." }, { status: 400 });

  const story = await prisma.story.findUnique({
    where: { id: storyId },
    select: { authorId: true, expiresAt: true, mediaUrl: true, type: true, author: { select: { isPrivate: true } } },
  });
  if (!story || story.expiresAt < new Date()) return NextResponse.json({ error: "Story not found." }, { status: 404 });
  if (story.authorId === user.id) return NextResponse.json({ error: "Can't reply to your own story." }, { status: 400 });

  let allowed = !story.author.isPrivate;
  if (!allowed) {
    const f = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: user.id, followingId: story.authorId } },
    });
    allowed = f?.status === "ACCEPTED";
  }
  if (!allowed) return NextResponse.json({ error: "You can't reply to this story." }, { status: 403 });

  const [u1, u2] = [user.id, story.authorId].sort();
  let convo = await prisma.conversation.findUnique({ where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } } });
  if (!convo) convo = await prisma.conversation.create({ data: { user1Id: u1, user2Id: u2 } });

  const message = await prisma.message.create({
    data: {
      conversationId: convo.id,
      senderId: user.id,
      body: msg,
      storyMediaUrl: story.mediaUrl,
      storyMediaType: story.type,
    },
  });
  await prisma.conversation.update({ where: { id: convo.id }, data: { updatedAt: new Date() } });

  try {
    const ably = getAblyRest();
    await ably.channels.get(conversationChannel(convo.id)).publish("message", {
      id: message.id,
      senderId: user.id,
      body: msg,
      storyMediaUrl: story.mediaUrl,
      storyMediaType: story.type,
      createdAt: message.createdAt,
    });
  } catch {}

  await notify({ userId: story.authorId, actorId: user.id, type: "MESSAGE" });

  return NextResponse.json({ ok: true, conversationId: convo.id });
}