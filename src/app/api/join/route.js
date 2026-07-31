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

  const communityId = body.communityId;
  if (!communityId) return NextResponse.json({ error: "Missing community." }, { status: 400 });

  const existing = await prisma.membership.findUnique({
    where: { userId_communityId: { userId: user.id, communityId } },
  });

  if (existing) {
    await prisma.membership.delete({ where: { id: existing.id } });
    return NextResponse.json({ ok: true, joined: false });
  }
  await prisma.membership.create({ data: { userId: user.id, communityId } });
  return NextResponse.json({ ok: true, joined: true });
}
