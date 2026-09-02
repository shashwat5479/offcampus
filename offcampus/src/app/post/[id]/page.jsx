import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import PostCard from "@/components/PostCard";
import CommentThread from "@/components/CommentThread";
import CommentForm from "@/components/CommentForm";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      author: true,
      community: { include: { college: true } },
      tags: true,
      _count: { select: { comments: true } },
    },
  });
  if (!post) notFound();

  const myPostVote = await prisma.postVote.findUnique({
    where: { userId_postId: { userId: user.id, postId: post.id } },
  });

  const comments = await prisma.comment.findMany({
    where: { postId: post.id },
    include: { author: true },
    orderBy: { createdAt: "asc" },
  });

  // build a tree from the flat list
  const byId = {};
  for (const c of comments) byId[c.id] = { ...c, children: [] };
  const roots = [];
  for (const c of comments) {
    if (c.parentId && byId[c.parentId]) byId[c.parentId].children.push(byId[c.id]);
    else roots.push(byId[c.id]);
  }
  const sortByScore = (a, b) => b.score - a.score;
  roots.sort(sortByScore);
  Object.values(byId).forEach((n) => n.children.sort(sortByScore));

  const myCommentVotes = await prisma.commentVote.findMany({
    where: { userId: user.id, commentId: { in: comments.map((c) => c.id) } },
  });
  const votes = {};
  for (const v of myCommentVotes) votes[v.commentId] = v.value;

  return (
    <div className="mx-auto max-w-feed">
      <Link href="/" className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-subtle hover:text-ink">
        ← Back to feed
      </Link>

      <PostCard post={post} dir={myPostVote?.value || 0} />

      <div className="mt-3 rounded-xl2 border border-line bg-paper p-4">
        <div className="mb-4">
          <CommentForm postId={post.id} loggedIn={!!user} />
        </div>
        <h2 className="mb-1 text-sm font-semibold text-ink">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </h2>
        {roots.length === 0 ? (
          <p className="py-4 text-sm text-faint">No comments yet — start the thread.</p>
        ) : (
          roots.map((node) => <CommentThread key={node.id} node={node} votes={votes} depth={0} />)
        )}
      </div>
    </div>
  );
}
