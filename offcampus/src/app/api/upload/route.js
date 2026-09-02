import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "video/mp4", "video/webm", "video/quicktime"],
        maximumSizeInBytes: 50 * 1024 * 1024, // 50 MB
        addRandomSuffix: true,
        tokenPayload: JSON.stringify({ userId: user.id }),
      }),
      onUploadCompleted: async () => {
        // optional: persist metadata here later
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}