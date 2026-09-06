"use client";
import { useState } from "react";
import PostMenu from "./PostMenu";

// Wraps a post card. When the owner deletes, the card fades/collapses out smoothly
// (Instagram-style) while the server call runs in the background.
export default function PostCardShell({ postId, children }) {
  const [state, setState] = useState("in"); // in | collapsing | gone
  if (state === "gone") return null;
  return (
    <div className={`relative ${state === "collapsing" ? "oc-collapsing" : ""}`}
      onAnimationEnd={() => state === "collapsing" && setState("gone")}>
      <span className="absolute right-4 top-4 z-10">
        <PostMenu postId={postId} onDeleted={() => setState("collapsing")} />
      </span>
      {children}
    </div>
  );
}
