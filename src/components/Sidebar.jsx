import Link from "next/link";

export default function Sidebar({ joinedCommunities = [] }) {
  return (
    <aside className="md:block">
      <nav className="flex flex-col gap-0.5 text-sm">
        <Link href="/" className="rounded-lg px-3 py-2 font-medium text-ink hover:bg-paper">Home</Link>
        <Link href="/search" className="rounded-lg px-3 py-2 font-medium text-subtle hover:bg-paper hover:text-ink">Explore</Link>
        <Link href="/submit" className="rounded-lg px-3 py-2 font-medium text-subtle hover:bg-paper hover:text-ink">New post</Link>
      </nav>

      <div className="mt-5 px-3 text-[11px] font-semibold uppercase tracking-wide text-faint">Your communities</div>
      <div className="mt-1 flex flex-col gap-0.5 text-sm">
        {joinedCommunities.length === 0 ? (
          <p className="px-3 py-2 text-xs text-faint">Join a community to see it here.</p>
        ) : (
          joinedCommunities.map((c) => (
            <Link key={c.id} href={`/c/${c.slug}`} className="truncate rounded-lg px-3 py-2 font-medium text-subtle hover:bg-paper hover:text-ink">
              <span className="text-faint">#</span> {c.college?.code} · {c.name}
            </Link>
          ))
        )}
      </div>
    </aside>
  );
}
