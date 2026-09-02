import Link from "next/link";
import Avatar from "./Avatar";
import CommentVote from "./CommentVote";
import { timeAgo } from "@/lib/format";

export default function CommentThread({ node, votes = {}, depth = 0 }) {
  return (
    <div className={depth > 0 ? "ml-3 border-l border-line pl-3" : ""}>
      <div className="py-2">
        <div className="mb-1 flex items-center gap-2 text-xs text-subtle">
          <Avatar name={node.author.name} seed={node.author.id} size={22} />
          <Link href={`/u/${node.author.username}`} className="font-semibold text-ink hover:underline">
            @{node.author.username}
          </Link>
          <span className="text-faint">• {timeAgo(node.createdAt)}</span>
        </div>
        <p className="whitespace-pre-wrap text-sm text-ink">{node.body}</p>
        <div className="mt-1">
          <CommentVote commentId={node.id} initialScore={node.score} initialDir={votes[node.id] || 0} />
        </div>
      </div>
      {node.children?.map((child) => (
        <CommentThread key={child.id} node={child} votes={votes} depth={depth + 1} />
      ))}
    </div>
  );
}
