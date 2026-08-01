import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  if (body.newPassword) {
    if (!verifyPassword(body.currentPassword || "", user.passwordHash)) {
      return NextResponse.json({ error: "Current password is wrong." }, { status: 400 });
    }
    if (body.newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters." }, { status: 400 });
    }
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hashPassword(body.newPassword) } });
  }

  const data = {};
  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (typeof body.bio === "string") data.bio = body.bio.trim() || null;
  if (typeof body.branch === "string") data.branch = body.branch.trim() || null;
  if (body.year !== undefined) {
    const y = Number.parseInt(body.year, 10);
    data.year = Number.isFinite(y) ? y : null;
  }
  if (typeof body.avatarUrl === "string" && body.avatarUrl) data.avatarUrl = body.avatarUrl;

  if (Object.keys(data).length) await prisma.user.update({ where: { id: user.id }, data });
  return NextResponse.json({ ok: true });
}