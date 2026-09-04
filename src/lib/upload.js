"use client";

import { upload } from "@vercel/blob/client";
import { compressImage, compressVideo } from "./compress";

// Uploads a File straight to Vercel Blob (bypasses the 4.5MB API limit).
// Images are compressed toward ~0.5MB, videos toward ~5MB with a 25s cap,
// before the upload happens — this runs for every post, story, and chat
// attachment, since they all go through this one function.
// Returns { url, kind, warning }.
export async function uploadFile(file, opts = {}) {
  if (!file) throw new Error("No file.");
  if (!/^(image|video)\//.test(file.type)) throw new Error("Only images or videos.");

  let toUpload = file;
  let warning = null;

  if (file.type.startsWith("image/")) {
    toUpload = await compressImage(file);
  } else if (file.type.startsWith("video/")) {
    const result = await compressVideo(file, opts.maxVideoSeconds ? { maxSeconds: opts.maxVideoSeconds } : undefined);
    toUpload = result.file;
    warning = result.warning;
  }

  if (toUpload.size > 50 * 1024 * 1024) throw new Error("Max 50 MB.");

  const ext = toUpload.name.includes(".") ? toUpload.name.split(".").pop() : "bin";
  const key = `uploads/${Date.now()}.${ext}`;

  const blob = await upload(key, toUpload, {
    access: "public",
    handleUploadUrl: "/api/upload",
  });

  return { url: blob.url, kind: file.type.startsWith("video/") ? "VIDEO" : "IMAGE", warning };
}
