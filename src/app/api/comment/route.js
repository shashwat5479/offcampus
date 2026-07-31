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

  const postId = body.postId;
  const text = (body.body || "").trim();
  const parentId = body.parentId || null;

  if (!postId || !text) return NextResponse.json({ error: "Empty comment." }, { status: 400 });

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });

  const comment = await prisma.comment.create({
    data: { postId, authorId: user.id, parentId, body: text, score: 1 },
  });
  return NextResponse.json({ ok: true, id: comment.id });
}
