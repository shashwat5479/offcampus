import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { addConfessionComment, getConfessionComments } from "@/lib/confession";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const { confessionId, body } = await request.json().catch(() => ({}));
  const text = (body || "").trim();
  if (!confessionId || text.length < 1) {
    return NextResponse.json({ error: "Empty comment." }, { status: 400 });
  }

  const result = await addConfessionComment({ authorId: user.id, confessionId, body: text });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 429 });

  const comments = await getConfessionComments(confessionId);
  return NextResponse.json({ ok: true, comments });
}

export async function GET(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const confessionId = new URL(request.url).searchParams.get("confessionId");
  if (!confessionId) return NextResponse.json({ error: "No confession." }, { status: 400 });

  const comments = await getConfessionComments(confessionId);
  return NextResponse.json({ comments });
}