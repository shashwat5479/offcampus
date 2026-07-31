import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./db";

const SECRET = process.env.SESSION_SECRET || "dev-insecure-secret";
export const SESSION_COOKIE = "oc_session";

export const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 days
};

// value.signature  (signature = HMAC-SHA256 of value)
export function sign(value) {
  const sig = crypto.createHmac("sha256", SECRET).update(value).digest("hex");
  return `${value}.${sig}`;
}

export function unsign(signed) {
  if (!signed || typeof signed !== "string") return null;
  const idx = signed.lastIndexOf(".");
  if (idx < 0) return null;
  const value = signed.slice(0, idx);
  const sig = signed.slice(idx + 1);
  const expected = crypto.createHmac("sha256", SECRET).update(value).digest("hex");
  if (sig.length !== expected.length) return null;
  const ok = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  return ok ? value : null;
}

// Read the signed cookie and return the userId (or null). Works in server
// components and route handlers.
export function getSessionUserId() {
  const raw = cookies().get(SESSION_COOKIE)?.value;
  return unsign(raw);
}

export async function getCurrentUser() {
  const id = getSessionUserId();
  if (!id) return null;
  try {
    return await prisma.user.findUnique({
      where: { id },
      include: { college: true },
    });
  } catch {
    return null;
  }
}
