import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// Save a story as a permanent highlight on your profile.
export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { mediaUrl, mediaType, caption, filter, title } = body;
  if (!mediaUrl) return NextResponse.json({ error: "Missing media." }, { status: 400 });

  const highlight = await prisma.storyHighlight.create({
    data: {
      userId: user.id,
      title: (title || "Highlight").slice(0, 30),
      coverUrl: mediaUrl,
      mediaUrl,
      mediaType: mediaType === "VIDEO" ? "VIDEO" : "IMAGE",
      caption: caption || null,
      filter: filter || null,
    },
  });

  return NextResponse.json({ ok: true, id: highlight.id });
}

// Remove a highlight you own.
export async function DELETE(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  let id = searchParams.get("id");
  if (!id) { const b = await request.json().catch(() => ({})); id = b.id; }
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const h = await prisma.storyHighlight.findUnique({ where: { id }, select: { userId: true } });
  if (!h) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (h.userId !== user.id) return NextResponse.json({ error: "Not yours." }, { status: 403 });

  await prisma.storyHighlight.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
