import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file." }, { status: 400 });
  }

  const okTypes = ["image/", "video/"];
  if (!okTypes.some((t) => file.type.startsWith(t))) {
    return NextResponse.json({ error: "Only images or videos allowed." }, { status: 400 });
  }
  if (file.size > 25 * 1024 * 1024) {
    return NextResponse.json({ error: "Max 25 MB." }, { status: 400 });
  }

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const key = `posts/${user.id}-${Date.now()}.${ext}`;
  const blob = await put(key, file, { access: "public" });

  return NextResponse.json({ url: blob.url, kind: file.type.startsWith("video/") ? "VIDEO" : "IMAGE" });
}
