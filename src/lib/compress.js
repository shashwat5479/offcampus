"use client";

// ---------------------------------------------------------------------------
// Client-side media compression, run before every upload (posts, stories, chat).
// Images -> resized + re-encoded until under IMAGE_MAX_BYTES (0.5 MB).
// Videos -> duration hard-capped at VIDEO_MAX_SECONDS (rejected, not trimmed);
//           re-encoded toward VIDEO_MAX_BYTES (5 MB) where the browser
//           supports it; otherwise uploaded at original size with a warning
//           rather than risk producing a video that won't play back.
// ---------------------------------------------------------------------------

export const IMAGE_MAX_BYTES = 0.5 * 1024 * 1024; // 500 KB
export const VIDEO_MAX_BYTES = 5 * 1024 * 1024;   // 5 MB
export const VIDEO_MAX_SECONDS = 25;

export class MediaLimitError extends Error {}

// ---------------- Images ----------------
export async function compressImage(file, maxBytes = IMAGE_MAX_BYTES) {
  if (!file || !file.type.startsWith("image/")) return file;
  if (file.type === "image/gif") return file; // never re-encode GIFs — kills animation
  if (file.size <= maxBytes) return file; // already small enough

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file; // decode failed — upload original rather than fail the post

  const MAX_DIM = 1920;
  let w = bitmap.width, h = bitmap.height;
  if (Math.max(w, h) > MAX_DIM) {
    const scale = MAX_DIM / Math.max(w, h);
    w = Math.round(w * scale); h = Math.round(h * scale);
  }

  let canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  const mime = supportsWebp() ? "image/webp" : "image/jpeg";

  let quality = 0.85;
  let blob = await toBlob(canvas, mime, quality);

  // 1) Lower quality first — cheapest way to shrink, least visible loss
  while (blob && blob.size > maxBytes && quality > 0.4) {
    quality -= 0.1;
    blob = await toBlob(canvas, mime, quality);
  }
  // 2) Still too big → shrink dimensions and retry at a slightly higher quality
  while (blob && blob.size > maxBytes && canvas.width > 480) {
    const next = document.createElement("canvas");
    next.width = Math.round(canvas.width * 0.85);
    next.height = Math.round(canvas.height * 0.85);
    next.getContext("2d").drawImage(canvas, 0, 0, next.width, next.height);
    canvas = next;
    blob = await toBlob(canvas, mime, Math.max(quality, 0.6));
  }

  if (!blob) return file;
  const ext = mime === "image/webp" ? "webp" : "jpg";
  return new File([blob], renameExt(file.name, ext), { type: mime, lastModified: Date.now() });
}

function toBlob(canvas, mime, quality) {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), mime, quality));
}

let _webpSupport = null;
function supportsWebp() {
  if (_webpSupport !== null) return _webpSupport;
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    _webpSupport = c.toDataURL("image/webp").startsWith("data:image/webp");
  } catch { _webpSupport = false; }
  return _webpSupport;
}

function renameExt(name, ext) {
  const base = name.includes(".") ? name.slice(0, name.lastIndexOf(".")) : name;
  return `${base}.${ext}`;
}

// ---------------- Videos ----------------
export function getVideoDuration(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(v.duration); };
    v.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read video.")); };
    v.src = url;
  });
}

export async function compressVideo(file, { maxBytes = VIDEO_MAX_BYTES, maxSeconds = VIDEO_MAX_SECONDS } = {}) {
  if (!file || !file.type.startsWith("video/")) return { file, warning: null };

  const duration = await getVideoDuration(file).catch(() => null);
  if (duration && duration > maxSeconds + 0.5) {
    throw new MediaLimitError(
      `Videos must be ${maxSeconds} seconds or shorter. This one is ${Math.round(duration)}s — trim it and try again.`
    );
  }
  if (file.size <= maxBytes) return { file, warning: null };

  const mimeType = pickRecorderMime();
  if (!mimeType || !duration) {
    return { file, warning: "Couldn't shrink this video further in your browser — uploaded at original size." };
  }

  try {
    const compressed = await reencodeVideo(file, duration, maxBytes, mimeType);
    if (compressed && compressed.size < file.size) return { file: compressed, warning: null };
    return { file, warning: null };
  } catch {
    return { file, warning: "Couldn't shrink this video further in your browser — uploaded at original size." };
  }
}

function pickRecorderMime() {
  if (typeof MediaRecorder === "undefined") return null;
  const candidates = ["video/mp4;codecs=h264", "video/mp4", "video/webm;codecs=vp9", "video/webm"];
  return candidates.find((m) => MediaRecorder.isTypeSupported?.(m)) || null;
}

async function reencodeVideo(file, duration, maxBytes, mimeType) {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.src = url; video.muted = true; video.playsInline = true;
  await new Promise((res, rej) => { video.onloadedmetadata = res; video.onerror = rej; });

  const MAX_DIM = 1280;
  let w = video.videoWidth, h = video.videoHeight;
  if (Math.max(w, h) > MAX_DIM) {
    const scale = MAX_DIM / Math.max(w, h);
    w = Math.round(w * scale); h = Math.round(h * scale);
  }
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");

  const targetBitrate = Math.floor((maxBytes * 8) / duration * 0.9); // 10% safety margin for container overhead
  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: Math.max(targetBitrate, 300_000) });

  const chunks = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
  const stopped = new Promise((resolve) => { recorder.onstop = resolve; });

  recorder.start(250);
  await video.play().catch(() => {});

  await new Promise((resolve) => {
    video.onended = resolve;
    function draw() {
      if (video.ended || video.paused) return;
      ctx.drawImage(video, 0, 0, w, h);
      requestAnimationFrame(draw);
    }
    draw();
  });

  recorder.stop();
  await stopped;
  URL.revokeObjectURL(url);

  const blob = new Blob(chunks, { type: mimeType.split(";")[0] });
  const ext = mimeType.startsWith("video/mp4") ? "mp4" : "webm";
  return new File([blob], renameExt(file.name, ext), { type: blob.type, lastModified: Date.now() });
}
