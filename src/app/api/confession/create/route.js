import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createConfession } from "@/lib/confession";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const { body, isPublic } = await request.json().catch(() => ({}));
  const text = (body || "").trim();
  if (text.length < 3) return NextResponse.json({ error: "Say a little more." }, { status: 400 });

  const result = await createConfession({ authorId: user.id, body: text, isPublic, collegeId: user.collegeId });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 429 });
  return NextResponse.json({ ok: true });
}