import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

function codeFrom(name) {
  return name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10) || "COL";
}

export async function POST(request) {
  // (onboarding user may not be logged in yet, so this is intentionally open —
  //  it only creates a college row, nothing sensitive)
  const { name } = await request.json().catch(() => ({}));
  const clean = (name || "").trim();
  if (clean.length < 3) return NextResponse.json({ error: "Enter a full college name." }, { status: 400 });

  // reuse if it already exists (case-insensitive)
  const existing = await prisma.college.findFirst({
    where: { name: { equals: clean, mode: "insensitive" } },
    select: { id: true, name: true, code: true },
  });
  if (existing) return NextResponse.json({ ok: true, college: existing });

  // unique code
  let code = codeFrom(clean);
  for (let i = 0; i < 6; i++) {
    const taken = await prisma.college.findUnique({ where: { code } });
    if (!taken) break;
    code = codeFrom(clean) + Math.floor(Math.random() * 100);
  }

  const college = await prisma.college.create({ data: { name: clean, code } });
  return NextResponse.json({ ok: true, college });
}