"use client";
import { useState } from "react";
import Link from "next/link";

// Displays post media in its natural orientation:
//  - wide images/videos  -> landscape (capped, no letterboxing)
//  - tall images/videos   -> portrait (capped so it isn't absurdly long)
//  - square-ish           -> square
// No schema change: orientation is detected from the media itself on load.
export default function PostMedia({ src, type, href }) {
  const [ratio, setRatio] = useState(null); // "portrait" | "landscape" | "square"

  function classify(w, h) {
    if (!w || !h) return;
    const r = w / h;
    if (r > 1.15) setRatio("landscape");
    else if (r < 0.85) setRatio("portrait");
    else setRatio("square");
  }

  // Cap heights so posts stay tidy in the feed
  const box =
    ratio === "portrait" ? "aspect-[4/5]"
    : ratio === "landscape" ? "aspect-[16/10]"
    : ratio === "square" ? "aspect-square"
    : "aspect-[4/5]"; // sensible default before load

  const media =
    type === "VIDEO" ? (
      <video
        src={src}
        controls
        playsInline
        onLoadedMetadata={(e) => classify(e.currentTarget.videoWidth, e.currentTarget.videoHeight)}
        className={`w-full ${box} bg-black object-contain`}
      />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        loading="lazy"
        onLoad={(e) => classify(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)}
        className={`w-full ${box} object-cover`}
      />
    );

  // Images link to the post; videos stay interactive (no wrapping link).
  if (type === "VIDEO") {
    return <div className="mt-1 overflow-hidden rounded-xl border border-line bg-black">{media}</div>;
  }
  return (
    <Link href={href} className="mt-1 block overflow-hidden rounded-xl border border-line">
      {media}
    </Link>
  );
}
