import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getStoryReactions } from "@/lib/story";

export async function GET(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const storyId = new URL(request.url).searchParams.get("storyId");
  if (!storyId) return NextResponse.json({ error: "No story." }, { status: 400 });

  const reactions = await getStoryReactions(user.id, storyId);
  if (reactions === null) return NextResponse.json({ error: "Not your story." }, { status: 403 });

  return NextResponse.json({ reactions });
}