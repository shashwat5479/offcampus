import Link from "next/link";
import Avatar from "./Avatar";
import VoteButtons from "./VoteButtons";
import ShareButton from "./ShareButton";
import PostCardShell from "./PostCardShell";
import PostMedia from "./PostMedia";
import { timeAgo } from "@/lib/format";

export default function PostCard({ post, dir = 0, viewerId }) {
  const college = post.community?.college;
  const commentCount = post._count?.comments ?? 0;
  const isOwner = viewerId && post.author?.id === viewerId;
  const hasMedia = (post.type === "IMAGE" || post.type === "VIDEO") && post.linkUrl;
  const caption = post.body || (post.title && post.title !== post.body ? post.title : "");

  const card = (
    <article className="flex gap-3 rounded-xl2 border border-line bg-paper p-4 transition-colors hover:border-faint">
      <VoteButtons postId={post.id} initialScore={post.score} initialDir={dir} />

      <div className="min-w-0 flex-1">
        {/* Author row */}
        <div className="mb-2 flex items-center gap-2">
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
              <Link href={`/u/${post.author.username}`} className="font-semibold text-ink hover:underline">
                {post.author.name}
              </Link>
            )}
            <span className="text-faint">•</span>
            <Link href={`/u/${post.author.username}`} className="hover:underline">@{post.author.username}</Link>
            <span className="text-faint">• {timeAgo(post.createdAt)}</span>
          </div>
        </div>

        {/* Media (auto-orientation) */}
        {hasMedia ? (
          <PostMedia src={post.linkUrl} type={post.type} href={`/post/${post.id}`} />
        ) : post.linkUrl ? (
          <a href={post.linkUrl} target="_blank" rel="noreferrer" className="mt-1 block truncate rounded-lg bg-canvas px-3 py-2 text-xs text-accent">🔗 {post.linkUrl}</a>
        ) : null}

        {/* Title / caption UNDER the post (Instagram-style) */}
        {caption ? (
          <Link href={`/post/${post.id}`} className="mt-2 block">
            <p className="line-clamp-3 text-sm text-ink">
              <span className="font-semibold">{post.author.username}</span>{" "}{caption}
            </p>
          </Link>
        ) : null}

        {/* Actions */}
        <div className="mt-2 flex items-center">
          <div className="ml-auto flex items-center gap-3">
            <Link href={`/post/${post.id}`} className="flex items-center gap-1 text-xs font-medium text-subtle hover:text-ink">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinejoin="round" />
              </svg>
              {commentCount}
            </Link>
            <ShareButton postId={post.id} title={caption || "Post"} />
          </div>
        </div>
      </div>
    </article>
  );

  return isOwner ? <PostCardShell postId={post.id}>{card}</PostCardShell> : card;
}
