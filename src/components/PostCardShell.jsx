"use client";
import { useState } from "react";
import PostMenu from "./PostMenu";

// Wraps a post card. When the owner deletes, the WHOLE card fades/collapses out as
// one unit while the server call runs in the background.
export default function PostCardShell({ postId, children }) {
  const [state, setState] = useState("in"); // in | collapsing | gone

  if (state === "gone") return null;

  return (
    <div
      className={`relative ${state === "collapsing" ? "oc-collapsing" : ""}`}
      // Only react to THIS element's own animation ending — not bubbled child
      // animations (image fade-in, etc.), which caused uneven/partial removal.
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget && state === "collapsing") setState("gone");
      }}
    >
      <span className="absolute right-4 top-4 z-10">
        <PostMenu postId={postId} onDeleted={() => setState("collapsing")} />
      </span>
      {children}
    </div>
  );
}
