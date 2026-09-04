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

  const communityId = body.communityId || null;
  const title = (body.title || "").trim();
  const text = (body.body || "").trim();
  if (!title) {
    return NextResponse.json({ error: "Give your post a title." }, { status: 400 });
  }

  if (communityId) {
    const community = await prisma.community.findUnique({ where: { id: communityId }, select: { id: true } });
    if (!community) return NextResponse.json({ error: "Community not found." }, { status: 404 });
  }

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
      communityId: communityId || null,
      type,
      title,
      body: text || null,
      linkUrl,
      score: 1,
      tags: { create: tags.map((tag) => ({ tag })) },
    },
  });

  await prisma.postVote.create({ data: { userId: user.id, postId: post.id, value: 1 } });

  return NextResponse.json({ ok: true, id: post.id });
}

// Delete a post you own. Post's children (comments, votes, tags) do NOT cascade
// in the schema, so we remove them explicitly inside a transaction.
export async function DELETE(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  let postId = searchParams.get("id");
  if (!postId) {
    const body = await request.json().catch(() => ({}));
    postId = body.postId;
  }
  if (!postId) return NextResponse.json({ error: "Missing post id." }, { status: 400 });

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  if (post.authorId !== user.id) {
    return NextResponse.json({ error: "You can only delete your own posts." }, { status: 403 });
  }

  // Order matters: comment-votes -> reply comments -> top-level comments -> post rows.
  const commentIds = (await prisma.comment.findMany({ where: { postId }, select: { id: true } })).map((c) => c.id);

  await prisma.$transaction([
    prisma.commentVote.deleteMany({ where: { commentId: { in: commentIds } } }),
    prisma.comment.deleteMany({ where: { postId, parentId: { not: null } } }), // replies first
    prisma.comment.deleteMany({ where: { postId } }),                          // then top-level
    prisma.postVote.deleteMany({ where: { postId } }),
    prisma.postTag.deleteMany({ where: { postId } }),
    prisma.notification.deleteMany({ where: { postId } }),
    prisma.post.delete({ where: { id: postId } }),
  ]);

  return NextResponse.json({ ok: true });
}

// Edit a post you own. Only title, body, and tags are editable (not media/community,
// to keep it simple and avoid re-deriving type). Tags are fully replaced.
export async function PATCH(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const postId = body.postId;
  const title = (body.title || "").trim();
  const text = (body.body || "").trim();
  if (!postId) return NextResponse.json({ error: "Missing post id." }, { status: 400 });
  if (!title) return NextResponse.json({ error: "Give your post a title." }, { status: 400 });

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  if (post.authorId !== user.id) {
    return NextResponse.json({ error: "You can only edit your own posts." }, { status: 403 });
  }

  const tags = Array.from(new Set(
    (body.tags || "").split(",").map((s) => s.trim().toLowerCase().replace(/^#/, "")).filter(Boolean).slice(0, 6)
  ));

  await prisma.$transaction([
    prisma.postTag.deleteMany({ where: { postId } }),
    prisma.post.update({
      where: { id: postId },
      data: {
        title,
        body: text || null,
        tags: { create: tags.map((tag) => ({ tag })) },
      },
    }),
  ]);

  return NextResponse.json({ ok: true, id: postId });
}
