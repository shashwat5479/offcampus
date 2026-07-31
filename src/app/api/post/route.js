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

  const mediaUrl = (body.mediaUrl || "").trim();
  const isImage = /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i.test(mediaUrl);
  const isVideo = /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(mediaUrl);
  let type = "TEXT";
  let linkUrl = null;
  if (mediaUrl) {
    type = isImage ? "IMAGE" : isVideo ? "VIDEO" : "LINK";
    linkUrl = mediaUrl;
  } else if (/^https?:\/\//i.test(text)) {
    type = "LINK";
    linkUrl = text;
  }
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
      type,
            title,
            body: text || null,
      linkUrl,
      score: 1,
      tags: { create: tags.map((tag) => ({ tag })) },
    },
  });

  // author implicitly upvotes their own post
  await prisma.postVote.create({ data: { userId: user.id, postId: post.id, value: 1 } });

  return NextResponse.json({ ok: true, id: post.id });
}
