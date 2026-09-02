import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createStory } from "@/lib/story";

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