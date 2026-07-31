import Link from "next/link";
import Avatar from "./Avatar";
import JoinButton from "./JoinButton";
import FollowButton from "./FollowButton";

export default function SuggestPanel({ communities = [], people = [], trending = [] }) {
  return (
    <aside className="lg:block">
      <div className="flex flex-col gap-4">
        <section className="rounded-xl2 border border-line bg-paper p-4">
          <h3 className="mb-3 text-sm font-semibold text-ink">Suggested communities</h3>
          <div className="flex flex-col gap-3">
            {communities.length === 0 && <p className="text-xs text-faint">You're in everything relevant — nice.</p>}
            {communities.map(({ community, coMembers, sameCollege }) => (
              <div key={community.id} className="flex items-center gap-2">
                <Link href={`/c/${community.slug}`} className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-ink">
                    {community.college?.code} · {community.name}
                  </div>
                  <div className="text-[11px] text-faint">
                    {coMembers > 0 ? `${coMembers} you'd know` : "active now"}
                    {sameCollege ? " · your college" : ""}
                  </div>
                </Link>
                <JoinButton communityId={community.id} joined={false} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl2 border border-line bg-paper p-4">
          <h3 className="mb-3 text-sm font-semibold text-ink">People to follow</h3>
          <div className="flex flex-col gap-3">
            {people.length === 0 && <p className="text-xs text-faint">No suggestions right now.</p>}
            {people.map(({ user, mutuals, shared, sameBranch }) => (
              <div key={user.id} className="flex items-center gap-2">
                <Avatar name={user.name} seed={user.id} size={32} />
                <Link href={`/u/${user.username}`} className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-ink">{user.name}</div>
                  <div className="text-[11px] text-faint">
                    {mutuals > 0 ? `${mutuals} mutual` : shared > 0 ? `${shared} shared` : sameBranch ? "same branch" : `@${user.username}`}
                  </div>
                </Link>
                <FollowButton userId={user.id} following={false} />
              </div>
            ))}
          </div>
        </section>

        {trending.length > 0 && (
          <section className="rounded-xl2 border border-line bg-paper p-4">
            <h3 className="mb-3 text-sm font-semibold text-ink">Trending</h3>
            <div className="flex flex-wrap gap-1.5">
              {trending.map(({ tag }) => (
                <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`} className="rounded-full bg-canvas px-2.5 py-1 text-xs font-medium text-subtle hover:text-ink">
                  #{tag}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </aside>
  );
}
