import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createStory } from "@/lib/story";
import { prisma } from "@/lib/db";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const { mediaUrl, type, caption, filter, musicUrl, musicTitle } = await request.json().catch(() => ({}));
  if (!mediaUrl) return NextResponse.json({ error: "No media." }, { status: 400 });

  const story = await createStory({
    authorId: user.id, mediaUrl, type,
    ...(caption && { caption }),
    ...(filter && { filter }),
    ...(musicUrl && { musicUrl }),
    ...(musicTitle && { musicTitle }),
  });
  return NextResponse.json({ ok: true, story });
}
// Delete a story you own. StoryReaction cascades on Story delete, so no manual cleanup needed.
export async function DELETE(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  let storyId = searchParams.get("id");
  if (!storyId) {
    const body = await request.json().catch(() => ({}));
    storyId = body.storyId;
  }
  if (!storyId) return NextResponse.json({ error: "Missing story id." }, { status: 400 });

  const story = await prisma.story.findUnique({ where: { id: storyId }, select: { authorId: true } });
  if (!story) return NextResponse.json({ error: "Story not found." }, { status: 404 });
  if (story.authorId !== user.id) {
    return NextResponse.json({ error: "You can only delete your own story." }, { status: 403 });
  }

  await prisma.story.delete({ where: { id: storyId } });
  return NextResponse.json({ ok: true });
}
