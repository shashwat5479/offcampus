import {notify} from "@/lib/notify";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const targetId = body.userId;
  if (!targetId) return NextResponse.json({ error: "Missing user." }, { status: 400 });
  if (targetId === user.id) return NextResponse.json({ error: "You can't follow yourself." }, { status: 400 });

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: user.id, followingId: targetId } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return NextResponse.json({ ok: true, following: false });
  }
  const target = await prisma.user.findUnique({ where: { id: targetId }, select: { isPrivate: true } });
  const status = target?.isPrivate ? "PENDING" : "ACCEPTED";

  await prisma.follow.create({ data: { followerId: user.id, followingId: targetId, status } });

  await notify({
    userId: targetId,
    actorId: user.id,
    type: status === "PENDING" ? "FOLLOW_REQUEST" : "FOLLOW",
  });

  return NextResponse.json({ ok: true, following: status === "ACCEPTED", requested: status === "PENDING" });
}
