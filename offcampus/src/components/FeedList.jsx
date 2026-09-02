"use client";

import { Children, useEffect, useRef, useState } from "react";

export default function FeedList({ children, step = 15 }) {
  const all = Children.toArray(children);
  const [count, setCount] = useState(() => Math.min(step, all.length));
  const sentinel = useRef(null);

  useEffect(() => {
    if (count >= all.length) return;
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setCount((c) => Math.min(c + step, all.length));
        }
      },
      { rootMargin: "800px" } // start loading before the user reaches the end
    );
    io.observe(el);
    return () => io.disconnect();
  }, [count, all.length, step]);

  return (
    <div className="flex flex-col gap-3">
      {all.slice(0, count)}
      {count < all.length ? (
        <div ref={sentinel} className="py-6 text-center text-sm text-faint">Loading more…</div>
      ) : (
        <div className="py-6 text-center text-xs text-faint">You&apos;re all caught up ✦</div>
      )}
    </div>
  );
}