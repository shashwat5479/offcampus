"use client";

import { getVideoDuration, MediaLimitError } from "./compress";

// ---------------------------------------------------------------------------
// Uploads media to Cloudinary (unsigned preset). Cloudinary compresses/optimizes
// SERVER-SIDE with excellent quality — far better than browser compression.
//
// Targets (enforced/requested here; Cloudinary does the actual compression):
//   Images       -> ~1 MB   (quality auto, capped dimensions)
//   Story videos -> ~5 MB, max 30s
//   Post videos  -> ~10 MB, max 60s
//
// Duration limits are enforced client-side BEFORE upload (reject if too long).
// Same signature as before: uploadFile(file, opts) -> { url, kind, warning }.
//   opts.kind: "story" | "post" | "chat" | "avatar"  (controls video limits)
// ---------------------------------------------------------------------------

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "drmpijecc";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || "OFFCAMPUS";

const VIDEO_LIMITS = {
  story: { maxSeconds: 30 },
  post: { maxSeconds: 60 },
  chat: { maxSeconds: 60 },
  default: { maxSeconds: 60 },
};

export async function uploadFile(file, opts = {}) {
  if (!file) throw new Error("No file.");
  if (!/^(image|video)\//.test(file.type)) throw new Error("Only images or videos.");

  const isVideo = file.type.startsWith("video/");
  const kind = isVideo ? "VIDEO" : "IMAGE";
  let warning = null;

  // Enforce video duration limit up-front (Cloudinary can't shorten a too-long clip).
  if (isVideo) {
    const limit = VIDEO_LIMITS[opts.kind] || VIDEO_LIMITS.default;
    const duration = await getVideoDuration(file).catch(() => null);
    if (duration && duration > limit.maxSeconds + 0.5) {
      throw new MediaLimitError(
        `Videos here must be ${limit.maxSeconds} seconds or shorter. This one is ${Math.round(duration)}s — trim it and try again.`
      );
    }
  }

  // Hard safety cap on the ORIGINAL upload size (Cloudinary free tier friendliness).
  const HARD_CAP = isVideo ? 100 * 1024 * 1024 : 20 * 1024 * 1024;
  if (file.size > HARD_CAP) {
    throw new Error(`File is too large (max ${isVideo ? "100MB" : "20MB"} before optimization).`);
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);
  // Cloudinary auto-optimizes on delivery via URL transforms (see buildUrl below).

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${isVideo ? "video" : "image"}/upload`;

  let res;
  try {
    res = await fetch(endpoint, { method: "POST", body: form });
  } catch {
    throw new Error("Upload failed — check your connection.");
  }
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.error?.message || "Upload failed.");
  }
  const data = await res.json();

  // Build an OPTIMIZED delivery URL:
  //  - images: f_auto (best format: webp/avif), q_auto (auto quality), width cap 1600
  //  - videos: q_auto, width cap 1280 — Cloudinary compresses toward small sizes
  const url = optimizedUrl(data.secure_url, isVideo);

  return { url, kind, warning };
}

// Insert Cloudinary transformation params into the delivery URL so every view
// is auto-optimized (smaller files, right format, near-invisible quality loss).
function optimizedUrl(secureUrl, isVideo) {
  if (!secureUrl) return secureUrl;
  const marker = isVideo ? "/video/upload/" : "/image/upload/";
  const idx = secureUrl.indexOf(marker);
  if (idx === -1) return secureUrl;
  const transform = isVideo
    ? "q_auto,w_1280,c_limit/"
    : "f_auto,q_auto,w_1600,c_limit/";
  return secureUrl.slice(0, idx + marker.length) + transform + secureUrl.slice(idx + marker.length);
}
