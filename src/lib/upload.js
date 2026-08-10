"use client";

import { upload } from "@vercel/blob/client";

// Uploads a File straight to Vercel Blob (bypasses the 4.5MB API limit).
// Returns { url, kind }.
export async function uploadFile(file) {
  if (!file) throw new Error("No file.");
  if (!/^(image|video)\//.test(file.type)) throw new Error("Only images or videos.");
  if (file.size > 50 * 1024 * 1024) throw new Error("Max 50 MB.");

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const key = `uploads/${Date.now()}.${ext}`;

  const blob = await upload(key, file, {
    access: "public",
    handleUploadUrl: "/api/upload",
  });

  return { url: blob.url, kind: file.type.startsWith("video/") ? "VIDEO" : "IMAGE" };
}