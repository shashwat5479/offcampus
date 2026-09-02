import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getAblyRest, conversationChannel } from "@/lib/ably";

const ALLOWED = ["❤️", "🔥", "😂", "😮", "😢", "👏"];

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const { messageId, emoji } = await request.json().catch(() => ({}));
  if (!messageId || !ALLOWED.includes(emoji)) return NextResponse.json({ error: "Bad request." }, { status: 400 });

  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { conversationId: true, conversation: { select: { user1Id: true, user2Id: true } } },
  });
  if (!message) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (message.conversation.user1Id !== user.id && message.conversation.user2Id !== user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const existing = await prisma.messageReaction.findUnique({
    where: { messageId_userId: { messageId, userId: user.id } },
  });
  let finalEmoji = emoji;
  if (existing && existing.emoji === emoji) {
    await prisma.messageReaction.delete({ where: { id: existing.id } });
    finalEmoji = null; // toggled off
  } else if (existing) {
    await prisma.messageReaction.update({ where: { id: existing.id }, data: { emoji } });
  } else {
    await prisma.messageReaction.create({ data: { messageId, userId: user.id, emoji } });
  }

  try {
    const ably = getAblyRest();
    await ably.channels.get(conversationChannel(message.conversationId)).publish("reaction", {
      messageId, userId: user.id, emoji: finalEmoji,
    });
  } catch {}

  return NextResponse.json({ ok: true });
}