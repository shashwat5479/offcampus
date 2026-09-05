"use client";

import { useRef, useState, useLayoutEffect } from "react";

// Instagram-style profile tabs with a smooth sliding underline.
// Pass an array of { key, label, icon } and the content for each tab keyed by `key`.
export default function ProfileTabs({ tabs, panels }) {
  const [active, setActive] = useState(tabs[0]?.key);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const refs = useRef({});

  useLayoutEffect(() => {
    const el = refs.current[active];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [active, tabs.length]);

  return (
    <div className="mt-4">
      {/* Tab row */}
      <div className="relative flex items-center justify-center gap-10 border-t border-line">
        {tabs.map((t) => {
          const on = active === t.key;
          return (
            <button
              key={t.key}
              ref={(el) => (refs.current[t.key] = el)}
              onClick={() => setActive(t.key)}
              className={`flex items-center gap-1.5 py-3 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 ${on ? "text-ink" : "text-faint hover:text-subtle"}`}
            >
              <span className={`transition-transform duration-200 ${on ? "scale-110" : ""}`}>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
        {/* Sliding underline */}
        <span
          className="absolute -top-px h-[2px] rounded-full bg-accent transition-all duration-300 ease-out"
          style={{ left: indicator.left, width: indicator.width }}
        />
      </div>

      {/* Active panel (fades in) */}
      <div key={active} style={{ animation: "ocFadeIn 0.25s ease-out" }}>
        {panels[active]}
      </div>
      <style>{`@keyframes ocFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
