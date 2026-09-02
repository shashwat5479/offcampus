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

  const { kind, id } = body;
  const value = body.value === 1 ? 1 : body.value === -1 ? -1 : 0;
  if (!id || !value || (kind !== "post" && kind !== "comment")) {
    return NextResponse.json({ error: "Bad vote." }, { status: 400 });
  }

  if (kind === "post") {
    const existing = await prisma.postVote.findUnique({
      where: { userId_postId: { userId: user.id, postId: id } },
    });
    const old = existing ? existing.value : 0;
    const next = old === value ? 0 : value;
    const delta = next - old;

    if (next === 0) {
      if (existing) await prisma.postVote.delete({ where: { id: existing.id } });
    } else if (existing) {
      await prisma.postVote.update({ where: { id: existing.id }, data: { value: next } });
    } else {
      await prisma.postVote.create({ data: { userId: user.id, postId: id, value: next } });
    }
    const post = await prisma.post.update({ where: { id }, data: { score: { increment: delta } } });
    return NextResponse.json({ ok: true, score: post.score, dir: next });
    if (next === 1) {
      await notify({ userId: post.authorId, actorId: user.id, type: "POST_VOTE", postId: id });
    }
    return NextResponse.json({ ok: true, score: post.score, dir: next }); 
  }

  // comment
  const existing = await prisma.commentVote.findUnique({
    where: { userId_commentId: { userId: user.id, commentId: id } },
  });
  const old = existing ? existing.value : 0;
  const next = old === value ? 0 : value;
  const delta = next - old;

  if (next === 0) {
    if (existing) await prisma.commentVote.delete({ where: { id: existing.id } });
  } else if (existing) {
    await prisma.commentVote.update({ where: { id: existing.id }, data: { value: next } });
    if (next === 1) {
      await notify({ userId: comment.authorId, actorId: user.id, type: "COMMENT_VOTE", commentId: id });
    }
  } else {
    await prisma.commentVote.create({ data: { userId: user.id, commentId: id, value: next } });
  }
  const comment = await prisma.comment.update({ where: { id }, data: { score: { increment: delta } } });
  return NextResponse.json({ ok: true, score: comment.score, dir: next });
}
