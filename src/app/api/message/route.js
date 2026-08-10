import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { areConnected } from "@/lib/connection";
import { getAblyRest, conversationChannel } from "@/lib/ably";
import { notify } from "@/lib/notify";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const toUserId = body.toUserId;
  const text = (body.body || "").trim();
  if (!toUserId || !text) return NextResponse.json({ error: "Empty message." }, { status: 400 });

  // only connected (mutually-accepted) users can DM
  const connected = await areConnected(user.id, toUserId);
  if (!connected) return NextResponse.json({ error: "You can only message your connections." }, { status: 403 });

  // find or create the conversation (store the two user ids in a stable order)
  const [u1, u2] = [user.id, toUserId].sort();
  let convo = await prisma.conversation.findUnique({
    where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
  });
  if (!convo) {
    convo = await prisma.conversation.create({ data: { user1Id: u1, user2Id: u2 } });
  }

  // save the message
  // optional reply target — fetch a short snippet to show in the bubble
  let replyToId = body.replyToId || null;
  let replySnippet = null;
  let replyFromMe = null;
  if (replyToId) {
    const parent = await prisma.message.findUnique({
      where: { id: replyToId },
      select: { id: true, body: true, senderId: true, conversationId: true },
    });
    // only allow replying to a message in the same conversation
    if (parent && parent.conversationId === convo.id) {
      replySnippet = (parent.body || "").slice(0, 80);
      replyFromMe = parent.senderId === user.id;
    } else {
      replyToId = null;
    }
  }

  const message = await prisma.message.create({
    data: { conversationId: convo.id, senderId: user.id, body: text, replyToId },
  });
  await prisma.conversation.update({ where: { id: convo.id }, data: { updatedAt: new Date() } });

  // publish live to the conversation channel so the other browser sees it instantly
  try {
    const ably = getAblyRest();
    await ably.channels.get(conversationChannel(convo.id)).publish("message", {
      id: message.id,
      senderId: user.id,
      body: text,
      replyToId,
      replySnippet,
      replyFromMe,
      createdAt: message.createdAt,
    });
  } catch {
    // realtime is best-effort; the message is already saved
  }

  // in-app notification for the recipient
  await notify({ userId: toUserId, actorId: user.id, type: "MESSAGE" });

  return NextResponse.json({ ok: true, conversationId: convo.id, message });
}