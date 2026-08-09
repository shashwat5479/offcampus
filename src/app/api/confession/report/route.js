import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const HIDE_THRESHOLD = 3; // auto-hide after this many reports

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const { id } = await request.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "Bad request." }, { status: 400 });

  // one report per user per confession — reuse a vote-style unique guard
  const existing = await prisma.confessionReport.findUnique({
    where: { userId_confessionId: { userId: user.id, confessionId: id } },
  }).catch(() => null);
  if (existing) return NextResponse.json({ ok: true, already: true });

  await prisma.confessionReport.create({ data: { userId: user.id, confessionId: id } });

  const c = await prisma.confession.update({
    where: { id },
    data: { reportCount: { increment: 1 } },
    select: { reportCount: true },
  });

  if (c.reportCount >= HIDE_THRESHOLD) {
    await prisma.confession.update({ where: { id }, data: { hidden: true } });
  }

  return NextResponse.json({ ok: true });
}