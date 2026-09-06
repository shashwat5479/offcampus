import Link from "next/link";
import Avatar from "./Avatar";
import VoteButtons from "./VoteButtons";
import ShareButton from "./ShareButton";
import PostCardShell from "./PostCardShell";
import { timeAgo } from "@/lib/format";

export default function PostCard({ post, dir = 0, viewerId }) {
  const college = post.community?.college;
  const commentCount = post._count?.comments ?? 0;
  const isOwner = viewerId && post.author?.id === viewerId;

  const card = (
    <article className="flex gap-3 rounded-xl2 border border-line bg-paper p-4 transition-colors hover:border-faint">
      <VoteButtons postId={post.id} initialScore={post.score} initialDir={dir} />

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center gap-2">
          {/* Author avatar — clickable to their profile */}
          <Link href={`/u/${post.author.username}`} className="shrink-0" aria-label={`@${post.author.username}`}>
            <span className="block overflow-hidden rounded-full ring-1 ring-line transition-transform hover:scale-105">
              <Avatar name={post.author.name} seed={post.author.id} src={post.author.avatarUrl} size={34} />
            </span>
          </Link>
          <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 text-xs text-subtle">
            {post.community ? (
              <Link href={`/c/${post.community.slug}`} className="font-semibold text-ink hover:underline">
                {college?.code ? `${college.code} · ` : ""}{post.community.name}
              </Link>
            ) : (
              <span className="font-semibold text-ink">Personal</span>
            )}
            <span className="text-faint">•</span>
            <Link href={`/u/${post.author.username}`} className="hover:underline">
              @{post.author.username}
            </Link>
            <span className="text-faint">• {timeAgo(post.createdAt)}</span>
          </div>
        </div>

        <Link href={`/post/${post.id}`} className="block">
          <h2 className="text-[15px] font-semibold leading-snug text-ink">{post.title}</h2>
          {post.body ? <p className="mt-1 line-clamp-3 text-sm text-subtle">{post.body}</p> : null}
        </Link>

        {post.type === "IMAGE" && post.linkUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.linkUrl} alt="" className="w-full rounded-xl border border-line object-contain" />
        ) : post.type === "VIDEO" && post.linkUrl ? (
          <video src={post.linkUrl} controls className="w-full rounded-xl border border-line object-contain" />
        ) : post.linkUrl ? (
          <a href={post.linkUrl} target="_blank" rel="noreferrer" className="mt-2 block truncate rounded-lg bg-canvas px-3 py-2 text-xs text-accent">🔗 {post.linkUrl}</a>
        ) : null}

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <div className="ml-auto flex items-center gap-3">
            <Link href={`/post/${post.id}`} className="flex items-center gap-1 text-xs font-medium text-subtle hover:text-ink">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinejoin="round" />
              </svg>
              {commentCount}
            </Link>
            <ShareButton postId={post.id} title={post.title} />
          </div>
        </div>
      </div>
    </article>
  );

  return isOwner ? <PostCardShell postId={post.id}>{card}</PostCardShell> : card;
}