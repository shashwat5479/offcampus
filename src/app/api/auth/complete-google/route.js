import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { sign, unsign, SESSION_COOKIE, COOKIE_OPTS } from "@/lib/auth";

export async function POST(request) {
  const raw = cookies().get("oc_pending")?.value;
  const data = raw ? unsign(raw) : null;
  if (!data) return NextResponse.json({ error: "Session expired. Sign in again." }, { status: 401 });

  let pending;
  try { pending = JSON.parse(data); } catch { return NextResponse.json({ error: "Bad session." }, { status: 400 }); }

  const body = await request.json().catch(() => ({}));
  const username = (body.username || "").trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
  const name = (body.name || "").trim();
  if (!username || username.length < 3) return NextResponse.json({ error: "Pick a username (3+ letters/numbers)." }, { status: 400 });
  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });

  // guard duplicates
  const taken = await prisma.user.findUnique({ where: { username } });
  if (taken) return NextResponse.json({ error: "That username is taken." }, { status: 409 });
  const emailUsed = await prisma.user.findUnique({ where: { email: pending.email } });
  if (emailUsed) return NextResponse.json({ error: "Account already exists." }, { status: 409 });

  const user = await prisma.user.create({
    data: {
      email: pending.email,
      username,
      name,
      passwordHash: "",
      avatarUrl: pending.avatarUrl || null,
      collegeId: body.collegeId || null,
      branch: (body.branch || "").trim() || null,
      year: body.year ? parseInt(body.year, 10) || null : null,
    },
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, sign(user.id), COOKIE_OPTS);
  res.cookies.set("oc_pending", "", { path: "/", maxAge: 0 }); // clear pending
  return res;
}