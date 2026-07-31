import Link from "next/link";
import VoteButtons from "./VoteButtons";
import { timeAgo } from "@/lib/format";

export default function PostCard({ post, dir = 0 }) {
  const college = post.community?.college;
  const commentCount = post._count?.comments ?? 0;
  const tags = post.tags?.map((t) => t.tag) ?? [];

  return (
    <article className="flex gap-3 rounded-xl2 border border-line bg-paper p-4 transition-colors hover:border-[#dfe1e5]">
      <VoteButtons postId={post.id} initialScore={post.score} initialDir={dir} />

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-subtle">
          <Link href={`/c/${post.community.slug}`} className="font-semibold text-ink hover:underline">
            {college?.code} · {post.community.name}
          </Link>
          <span className="text-faint">•</span>
          <Link href={`/u/${post.author.username}`} className="hover:underline">
            @{post.author.username}
          </Link>
          <span className="text-faint">• {timeAgo(post.createdAt)}</span>
          <span className="ml-1 rounded bg-canvas px-1.5 py-0.5 text-[10px] font-medium text-faint">{post.type}</span>
        </div>

        <Link href={`/post/${post.id}`} className="block">
          <h2 className="text-[15px] font-semibold leading-snug text-ink">{post.title}</h2>
          {post.body ? <p className="mt-1 line-clamp-3 text-sm text-subtle">{post.body}</p> : null}
          {post.linkUrl ? (
            <span className="mt-2 block truncate rounded-lg bg-canvas px-3 py-2 text-xs text-accent">🔗 {post.linkUrl}</span>
          ) : null}
        </Link>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {tags.map((tag) => (
            <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`} className="rounded-full bg-canvas px-2 py-0.5 text-[11px] font-medium text-subtle hover:text-ink">
              #{tag}
            </Link>
          ))}
          <Link href={`/post/${post.id}`} className="ml-auto flex items-center gap-1 text-xs font-medium text-subtle hover:text-ink">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinejoin="round" />
            </svg>
            {commentCount}
          </Link>
        </div>
      </div>
    </article>
  );
}
