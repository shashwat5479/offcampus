import Link from "next/link";

function Item({ href, label, children }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-subtle hover:bg-paper hover:text-ink">
      <span className="shrink-0">{children}</span>
      {label}
    </Link>
  );
}

export default function Sidebar({ joinedCommunities = [], me }) {
  return (
    <aside className="md:block">
      <nav className="flex flex-col gap-0.5 text-sm">
        <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-ink hover:bg-paper">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>
          Home
        </Link>

        <Item href="/search" label="Explore">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/></svg>
        </Item>

        <Item href="/communities" label="Communities">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M15.5 8a3 3 0 1 0 0-.1M3 20a6 6 0 0 1 12 0M14 20a6 6 0 0 1 7-5.2"/></svg>
        </Item>

        <Item href="/opportunities" label="Opportunities">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </Item>

        <Item href={me ? `/u/${me}` : "/login"} label="Profile">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
        </Item>

        <Item href="/settings" label="Settings">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 19.4a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 1.2-2.9H1a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 2.6 7a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H7a1.7 1.7 0 0 0 1-1.5V1a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V7a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>
        </Item>

        <Item href="/notifications" label="Notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/></svg>
        </Item>
      </nav>

      <div className="mt-5 px-3 text-[11px] font-semibold uppercase tracking-wide text-faint">Your communities</div>
      <div className="mt-1 flex flex-col gap-0.5 text-sm">
        {joinedCommunities.length === 0 ? (
          <p className="px-3 py-2 text-xs text-faint">Join a community to see it here.</p>
        ) : (
          joinedCommunities.map((c) => (
            <Link key={c.id} href={`/c/${c.slug}`} className="flex items-center gap-2 truncate rounded-lg px-3 py-2 font-medium text-subtle hover:bg-paper hover:text-ink">
              <span className="text-faint">#</span> {c.college?.code} · {c.name}
            </Link>
          ))
        )}
      </div>
    </aside>
  );
}