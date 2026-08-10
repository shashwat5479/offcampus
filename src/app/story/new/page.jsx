"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { uploadFile } from "@/lib/upload";

export default function AddStoryPage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [kind, setKind] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function pick(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setErr("");
    setFile(f);
    setKind(f.type.startsWith("video") ? "video" : "image");
    setPreview(URL.createObjectURL(f));
  }

  async function share() {
    if (!file || busy) return;
    setBusy(true);
    setErr("");
    try {
      const { url, kind } = await uploadFile(file);
      const res = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaUrl: url, type: kind }),
      });
      if (!res.ok) throw new Error("Could not post story");
      router.push("/");
      router.refresh();
    } catch (e) {
      setErr(e.message);
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-8">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/" className="text-subtle hover:text-ink">←</Link>
        <h1 className="text-lg font-semibold text-ink">Add to your story</h1>
      </div>

      <label className="flex aspect-[9/16] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl2 border border-dashed border-line bg-paper">
        {preview ? (
          kind === "video"
            ? <video src={preview} controls className="h-full w-full object-contain" />
            : <img src={preview} alt="" className="h-full w-full object-contain" />
        ) : (
          <span className="px-6 text-center text-sm text-subtle">Tap to choose a photo or video</span>
        )}
        <input type="file" accept="image/*,video/*" onChange={pick} className="hidden" />
      </label>

      {err && <p className="mt-2 text-center text-xs text-up">{err}</p>}

      <button
        onClick={share}
        disabled={!file || busy}
        className="mt-4 w-full rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accentInk disabled:opacity-50"
      >
        {busy ? "Sharing…" : "Share to story"}
      </button>
      <p className="mt-2 text-center text-xs text-faint">Your story disappears after 24 hours.</p>
    </div>
  );
}