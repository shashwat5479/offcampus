import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";
import { sign, SESSION_COOKIE, COOKIE_OPTS } from "@/lib/auth";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const email = session.user.email.toLowerCase();
  let user = await prisma.user.findUnique({ where: { email } });

  // New Google user → auto-create with a unique username (no password)
  if (!user) {
    const base =
      (session.user.name || email.split("@")[0])
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 12) || "user";
    let username = base;
    for (let i = 0; i < 6; i++) {
      const taken = await prisma.user.findUnique({ where: { username } });
      if (!taken) break;
      username = base + Math.floor(Math.random() * 10000);
    }
    user = await prisma.user.create({
      data: {
        email,
        username,
        name: session.user.name || username,
        passwordHash: "",
        avatarUrl: session.user.image || null,
      },
    });
  }

  const res = NextResponse.redirect(new URL("/", request.url));
  res.cookies.set(SESSION_COOKIE, sign(user.id), COOKIE_OPTS);
  return res;
}