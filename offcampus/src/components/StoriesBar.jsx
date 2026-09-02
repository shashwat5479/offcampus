import Link from "next/link";
import Avatar from "./Avatar";

export default function StoriesBar({ me, groups = [] }) {
  return (
    <div className="rounded-xl2 border border-line bg-paper p-3">
      <div className="flex items-start gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Your story — ring opens your story, + adds a new one */}
        <div className="flex w-16 shrink-0 flex-col items-center gap-1">
          <span className="relative">
            <Link href={me?.hasStory ? `/story/${me.username}` : "/story/new"}>
              <span className={`block rounded-full p-[2px] ${me?.hasStory ? "bg-gradient-to-tr from-accent via-up to-accent" : "border-2 border-dashed border-line"}`}>
                <span className="block rounded-full bg-paper p-[2px]">
                  <Avatar name={me?.name || "?"} seed={me?.username} src={me?.avatarUrl} size={54} />
                </span>
              </span>
            </Link>
            <Link
              href="/story/new"
              className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-sm font-bold leading-none text-accentInk ring-2 ring-paper"
            >
              +
            </Link>
          </span>
          <span className="w-full truncate text-center text-[11px] text-subtle">Your story</span>
        </div>

        {/* People with active stories */}
        {groups.map((g) => (
          <Link key={g.user.id} href={`/story/${g.user.username}`} className="flex w-16 shrink-0 flex-col items-center gap-1">
            <span className="rounded-full bg-gradient-to-tr from-accent via-up to-accent p-[2px]">
              <span className="block rounded-full bg-paper p-[2px]">
                <Avatar name={g.user.name} seed={g.user.id} src={g.user.avatarUrl} size={54} />
              </span>
            </span>
            <span className="w-full truncate text-center text-[11px] text-subtle">{g.user.username}</span>
          </Link>
        ))}

        {groups.length === 0 && (
          <span className="self-center text-xs text-faint">No stories yet — be the first.</span>
        )}
      </div>
    </div>
  );
}