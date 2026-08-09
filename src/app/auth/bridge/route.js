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
  const user = await prisma.user.findUnique({ where: { email } });

  // Existing user → log in
  if (user) {
    const res = NextResponse.redirect(new URL("/", request.url));
    res.cookies.set(SESSION_COOKIE, sign(user.id), COOKIE_OPTS);
    return res;
  }

  // New user → send to onboarding, carrying their Google details in a short cookie
  const res = NextResponse.redirect(new URL("/onboarding", request.url));
  res.cookies.set(
    "oc_pending",
    sign(JSON.stringify({ email, name: session.user.name || "", avatarUrl: session.user.image || "" })),
    { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 15 } // 15 min
  );
  return res;
}