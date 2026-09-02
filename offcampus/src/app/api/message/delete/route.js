import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getAblyRest, conversationChannel } from "@/lib/ably";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const { messageId } = await request.json().catch(() => ({}));
  if (!messageId) return NextResponse.json({ error: "Missing message." }, { status: 400 });

  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) return NextResponse.json({ error: "Message not found." }, { status: 404 });
  if (message.senderId !== user.id) {
    return NextResponse.json({ error: "You can only delete your own messages." }, { status: 403 });
  }

  await prisma.message.update({
    where: { id: messageId },
    data: { body: "", mediaUrl: null, mediaType: null, deletedAt: new Date() },
  });

  try {
    const ably = getAblyRest();
    await ably.channels.get(conversationChannel(message.conversationId)).publish("delete", { id: messageId });
  } catch {
    // realtime is best-effort; the delete is already saved
  }

  return NextResponse.json({ ok: true });
}
