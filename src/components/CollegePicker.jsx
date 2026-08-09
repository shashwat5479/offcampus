"use client";

import { useEffect, useRef, useState } from "react";

export default function CollegePicker({ value, onChange }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const boxRef = useRef(null);

  useEffect(() => {
    if (selectedLabel && q === selectedLabel) return;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/colleges/search?q=${encodeURIComponent(q)}`);
        const d = await res.json();
        setResults(d.colleges || []);
      } catch { setResults([]); }
    }, 200);
    return () => clearTimeout(t);
  }, [q, selectedLabel]);

  useEffect(() => {
    const onDoc = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(c) {
    const label = `${c.code} — ${c.name}`;
    setSelectedLabel(label);
    setQ(label);
    onChange(c.id);
    setOpen(false);
  }

  async function addNew() {
    const name = q.trim();
    if (name.length < 3) return;
    try {
      const res = await fetch("/api/colleges/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const d = await res.json();
      if (res.ok) pick(d.college);
    } catch {}
  }

  const field = "w-full rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none focus:border-accent";

  return (
    <div ref={boxRef} className="relative">
      <input
        className={field}
        placeholder="Search your college…"
        value={q}
        onChange={(e) => { setQ(e.target.value); setSelectedLabel(""); onChange(""); setOpen(true); }}
        onFocus={() => setOpen(true)}
      />
      {open && (results.length > 0 || q.trim().length >= 3) && (
        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-line bg-paper shadow-gold">
          {results.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => pick(c)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-canvas"
            >
              <span className="rounded bg-accent/12 px-1.5 py-0.5 text-[11px] font-semibold text-accent">{c.code}</span>
              <span className="truncate text-ink">{c.name}</span>
            </button>
          ))}
          {q.trim().length >= 3 && !results.some((c) => `${c.code} — ${c.name}` === q) && (
            <button
              type="button"
              onClick={addNew}
              className="flex w-full items-center gap-2 border-t border-line px-3 py-2 text-left text-sm text-accent hover:bg-canvas"
            >
              + Add “{q.trim()}”
            </button>
          )}
        </div>
      )}
    </div>
  );
}