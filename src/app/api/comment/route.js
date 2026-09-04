import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/notify";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const postId = body.postId;
  const text = (body.body || "").trim();
  const parentId = body.parentId || null;

  if (!postId || !text) return NextResponse.json({ error: "Empty comment." }, { status: 400 });

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });

  // Create the comment FIRST — notify() needs comment.id, which doesn't exist until this runs.
  const comment = await prisma.comment.create({
    data: { postId, authorId: user.id, parentId, body: text, score: 1 },
  });

  // Notifications are best-effort and must never fail the comment itself.
  try {
    if (parentId) {
      const parent = await prisma.comment.findUnique({ where: { id: parentId }, select: { authorId: true } });
      if (parent) await notify({ userId: parent.authorId, actorId: user.id, type: "REPLY", postId, commentId: comment.id });
    } else {
      await notify({ userId: post.authorId, actorId: user.id, type: "COMMENT", postId, commentId: comment.id });
    }
  } catch {}

  return NextResponse.json({ ok: true, id: comment.id });
}
