import Link from "next/link";
import Avatar from "@/components/Avatar";
import FollowButton from "@/components/FollowButton";

export default function UserListItem({ user, isMe, followState }) {
  return (
    <div className="flex items-center gap-3 px-1 py-2.5">
      <Link href={`/u/${user.username}`} className="shrink-0">
        <Avatar name={user.name} seed={user.id} src={user.avatarUrl} size={48} />
      </Link>
      <Link href={`/u/${user.username}`} className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{user.username}</p>
        <p className="truncate text-xs text-subtle">
          {user.name}
          {user.college ? ` · ${user.college.code}` : ""}
        </p>
      </Link>
      {!isMe && <FollowButton userId={user.id} status={followState} />}
    </div>
  );
}