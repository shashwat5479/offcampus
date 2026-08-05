import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/notify";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid." }, { status: 400 }); }

  const requesterId = body.requesterId;   // person who requested to follow ME
  const action = body.action;             // "accept" | "decline"
  if (!requesterId || !["accept", "decline"].includes(action)) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const follow = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: requesterId, followingId: user.id } },
  });
  if (!follow) return NextResponse.json({ error: "Request not found." }, { status: 404 });

  if (action === "accept") {
    await prisma.follow.update({ where: { id: follow.id }, data: { status: "ACCEPTED" } });
    await notify({ userId: requesterId, actorId: user.id, type: "FOLLOW_ACCEPTED" });
  } else {
    await prisma.follow.delete({ where: { id: follow.id } });
  }
  return NextResponse.json({ ok: true });
}