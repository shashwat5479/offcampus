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
  const title = (body.title || "").trim();
  const text = (body.body || "").trim();
  if (!communityId || !title) {
    return NextResponse.json({ error: "Community and title are required." }, { status: 400 });
  }

  const community = await prisma.community.findUnique({ where: { id: communityId }, select: { id: true } });
  if (!community) return NextResponse.json({ error: "Community not found." }, { status: 404 });

  const isLink = /^https?:\/\//i.test(text);
  const tags = Array.from(
    new Set(
      (body.tags || "")
        .split(",")
        .map((s) => s.trim().toLowerCase().replace(/^#/, ""))
        .filter(Boolean)
        .slice(0, 6)
    )
  );

  const post = await prisma.post.create({
    data: {
      authorId: user.id,
      communityId,
      type: isLink ? "LINK" : "TEXT",
      title,
      body: text || null,
      linkUrl: isLink ? text : null,
      score: 1,
      tags: { create: tags.map((tag) => ({ tag })) },
    },
  });

  // author implicitly upvotes their own post
  await prisma.postVote.create({ data: { userId: user.id, postId: post.id, value: 1 } });

  return NextResponse.json({ ok: true, id: post.id });
}
