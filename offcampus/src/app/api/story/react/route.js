import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ALLOWED = ["❤️", "🔥", "😂", "😮", "😢", "👏"];

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const { storyId, emoji } = await request.json().catch(() => ({}));
  if (!storyId || !ALLOWED.includes(emoji)) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const reaction = await prisma.storyReaction.upsert({
    where: { storyId_userId: { storyId, userId: user.id } },
    update: { emoji },
    create: { storyId, userId: user.id, emoji },
  });
  return NextResponse.json({ ok: true, emoji: reaction.emoji });
}