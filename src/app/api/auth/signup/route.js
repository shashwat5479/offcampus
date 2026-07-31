import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { sign, SESSION_COOKIE, COOKIE_OPTS } from "@/lib/auth";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  const username = (body.username || "").trim().toLowerCase().replace(/\s+/g, "");
  const name = (body.name || "").trim();
  const password = body.password || "";

  if (!email || !username || !name || !password) {
    return NextResponse.json({ error: "Name, username, email and password are required." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { email: true, username: true },
  });
  if (existing) {
    const field = existing.email === email ? "email" : "username";
    return NextResponse.json({ error: `That ${field} is already taken.` }, { status: 409 });
  }

  const year = Number.parseInt(body.year, 10);
  const user = await prisma.user.create({
    data: {
      email,
      username,
      name,
      passwordHash: hashPassword(password),
      branch: body.branch ? String(body.branch).trim() : null,
      year: Number.isFinite(year) ? year : null,
      collegeId: body.collegeId || null,
    },
  });

  const res = NextResponse.json({ ok: true, username: user.username });
  res.cookies.set(SESSION_COOKIE, sign(user.id), COOKIE_OPTS);
  return res;
}
