import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request) {
  const q = (new URL(request.url).searchParams.get("q") || "").trim();
  const colleges = await prisma.college.findMany({
    where: q
      ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { code: { contains: q, mode: "insensitive" } }] }
      : {},
    select: { id: true, name: true, code: true },
    orderBy: { code: "asc" },
    take: 8,
  });
  return NextResponse.json({ colleges });
}