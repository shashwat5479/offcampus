import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { loadGraph, loadViewer } from "@/lib/feed";
import { trendingTags } from "@/lib/rank";
import PostCard from "@/components/PostCard";
import Avatar from "@/components/Avatar";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const q = (searchParams?.q || "").trim();

  if (!q) {
    const graph = await loadGraph();
    const trending = trendingTags(graph.plainPosts, Date.now(), 16);
    return (
      <div className="mx-auto max-w-feed">
        <div className="rounded-xl2 border border-line bg-paper p-5">
          <h1 className="text-lg font-semibold tracking-tight">Explore</h1>
          <p className="mt-1 text-sm text-subtle">Trending topics across campuses right now.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {trending.map(({ tag }) => (
              <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`} className="rounded-full bg-canvas px-3 py-1.5 text-sm font-medium text-subtle hover:text-ink">
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const [posts, communities, people] = await Promise.all([
    prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: q } },
          { body: { contains: q } },
          { tags: { some: { tag: { contains: q } } } },
        ],
      },
      orderBy: { score: "desc" },
      take: 15,
      include: {
        author: true,
        community: { include: { college: true } },
        tags: true,
        _count: { select: { comments: true } },
      },
    }),
    prisma.community.findMany({
      where: {
        OR: [{ name: { contains: q } }, { slug: { contains: q } }, { description: { contains: q } }],
      },
      include: { college: true },
      take: 8,
    }),
    prisma.user.findMany({
      where: {
        AND: [
          { id: { not: user.id } },
          { OR: [{ name: { contains: q } }, { username: { contains: q } }] },
        ],
      },
      include: { college: true },
      take: 8,
    }),
  ]);

  const viewer = await loadViewer(user.id);
  const nothing = posts.length + communities.length + people.length === 0;

  return (
    <div className="mx-auto max-w-feed">
      <h1 className="mb-3 text-sm text-subtle">
        Results for <span className="font-semibold text-ink">"{q}"</span>
      </h1>

      {communities.length > 0 && (
        <section className="mb-3 rounded-xl2 border border-line bg-paper p-4">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">Communities</h2>
          <div className="flex flex-col">
            {communities.map((c) => (
              <Link key={c.id} href={`/c/${c.slug}`} className="flex items-center gap-2 py-1.5 text-sm hover:opacity-80">
                <span className="font-medium text-ink">{c.college?.code} · {c.name}</span>
                <span className="truncate text-xs text-faint">{c.description}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {people.length > 0 && (
        <section className="mb-3 rounded-xl2 border border-line bg-paper p-4">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">People</h2>
          <div className="flex flex-col gap-1">
            {people.map((u) => (
              <Link key={u.id} href={`/u/${u.username}`} className="flex items-center gap-2 py-1 hover:opacity-80">
                <Avatar name={u.name} seed={u.id} size={28} />
                <span className="text-sm font-medium text-ink">{u.name}</span>
                <span className="text-xs text-faint">@{u.username}{u.college ? ` · ${u.college.code}` : ""}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-col gap-3">
        {posts.map((post) => <PostCard key={post.id} post={post} dir={viewer.votesByPost[post.id] || 0} />)}
      </div>

      {nothing && (
        <p className="rounded-xl2 border border-line bg-paper p-8 text-center text-sm text-subtle">
          Nothing matches "{q}" yet.
        </p>
      )}
    </div>
  );
}
