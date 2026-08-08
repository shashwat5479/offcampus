import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "community";
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const { name, description, category, isPublic } = await request.json().catch(() => ({}));
  const cleanName = (name || "").trim();
  if (!cleanName) return NextResponse.json({ error: "Name required." }, { status: 400 });
  if (!isPublic && !user.collegeId) return NextResponse.json({ error: "No college on your account." }, { status: 400 });

  const base = slugify(cleanName);
  let slug = base;
  for (let n = 0; n < 6; n++) {
    const exists = await prisma.community.findUnique({ where: { slug } });
    if (!exists) break;
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const community = await prisma.community.create({
    data: {
      name: cleanName,
      slug,
      description: (description || "").trim() || null,
      type: isPublic ? "PUBLIC" : "COLLEGE",
      isPublic: !!isPublic,
      category: (category || "").trim() || null,
      collegeId: isPublic ? null : user.collegeId,
    },
  });

  await prisma.membership.create({ data: { userId: user.id, communityId: community.id, role: "OWNER" } });

  return NextResponse.json({ ok: true, slug: community.slug });
}