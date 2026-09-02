import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// "Delete chat" clears the caller's OWN view of the conversation history —
// it never deletes messages for the other participant, same as WhatsApp's
// "Delete chat" (as opposed to "Delete for everyone").
export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const { conversationId } = await request.json().catch(() => ({}));
  if (!conversationId) return NextResponse.json({ error: "Missing conversation." }, { status: 400 });

  const convo = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!convo) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (convo.user1Id !== user.id && convo.user2Id !== user.id) {
    return NextResponse.json({ error: "Not your conversation." }, { status: 403 });
  }

  const field = convo.user1Id === user.id ? "user1ClearedAt" : "user2ClearedAt";
  await prisma.conversation.update({ where: { id: conversationId }, data: { [field]: new Date() } });

  return NextResponse.json({ ok: true });
}
