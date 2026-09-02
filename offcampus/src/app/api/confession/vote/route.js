import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const { id } = await request.json().catch(() => ({}));
  const value = 1; // confessions are upvote-only (wholesome)
  if (!id) return NextResponse.json({ error: "Bad vote." }, { status: 400 });

  const existing = await prisma.confessionVote.findUnique({
    where: { userId_confessionId: { userId: user.id, confessionId: id } },
  });
  const old = existing ? existing.value : 0;
  const next = old === value ? 0 : value;
  const delta = next - old;

  if (next === 0 && existing) await prisma.confessionVote.delete({ where: { id: existing.id } });
  else if (existing) await prisma.confessionVote.update({ where: { id: existing.id }, data: { value: next } });
  else await prisma.confessionVote.create({ data: { userId: user.id, confessionId: id, value: next } });

  const c = await prisma.confession.update({ where: { id }, data: { score: { increment: delta } } });
  return NextResponse.json({ ok: true, score: c.score, dir: next });
}