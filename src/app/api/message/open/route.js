import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { areConnected } from "@/lib/connection";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid." }, { status: 400 }); }

  const toUserId = body.toUserId;
  if (!toUserId) return NextResponse.json({ error: "Missing user." }, { status: 400 });

  const connected = await areConnected(user.id, toUserId);
  if (!connected) return NextResponse.json({ error: "You can only message your connections." }, { status: 403 });

  const [u1, u2] = [user.id, toUserId].sort();
  let convo = await prisma.conversation.findUnique({ where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } } });
  if (!convo) convo = await prisma.conversation.create({ data: { user1Id: u1, user2Id: u2 } });

  return NextResponse.json({ ok: true, conversationId: convo.id });
}
