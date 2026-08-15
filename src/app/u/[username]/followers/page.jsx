import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import UserListItem from "@/components/UserListItem";

export const dynamic = "force-dynamic";

export default async function FollowersPage({ params }) {
  const me = await getCurrentUser();
  if (!me) redirect("/login");

  const user = await prisma.user.findUnique({ where: { username: params.username } });
  if (!user) notFound();

  const rows = await prisma.follow.findMany({
    where: { followingId: user.id, status: "ACCEPTED" },
    orderBy: { createdAt: "desc" },
    include: { follower: { include: { college: true } } },
  });
  const people = rows.map((r) => r.follower);

  const myRels = await prisma.follow.findMany({
    where: { followerId: me.id, followingId: { in: people.map((p) => p.id) } },
  });
  const relByUser = {};
  for (const r of myRels) relByUser[r.followingId] = r.status === "ACCEPTED" ? "following" : "requested";

  return (
    <div className="mx-auto max-w-feed">
      <div className="mb-3 flex items-center gap-3">
        <Link href={`/u/${user.username}`} className="rounded-full p-2 text-subtle hover:bg-paper hover:text-ink">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </Link>
        <h1 className="text-lg font-semibold tracking-tight">
          Followers <span className="text-subtle">· @{user.username}</span>
        </h1>
      </div>

      <div className="rounded-xl2 border border-line bg-paper px-4">
        {people.length === 0 ? (
          <p className="py-8 text-center text-sm text-subtle">No followers yet.</p>
        ) : (
          <div className="divide-y divide-line">
            {people.map((p) => (
              <UserListItem key={p.id} user={p} isMe={p.id === me.id} followState={relByUser[p.id] || "none"} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}