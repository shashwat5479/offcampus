import Link from "next/link";

const TABS = [
  ["foryou", "For You"],
  ["hot", "Hot"],
  ["new", "New"],
  ["top", "Top"],
];

export default function FeedTabs({ active, basePath = "/" }) {
  return (
    <div className="flex gap-1 rounded-xl2 border border-line bg-paper p-1">
      {TABS.map(([id, label]) => {
        const on = active === id;
        return (
          <Link
            key={id}
            href={`${basePath}?sort=${id}`}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              on ? "bg-ink text-white" : "text-subtle hover:text-ink"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
