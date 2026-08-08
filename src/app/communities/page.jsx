import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import JoinButton from "@/components/JoinButton";

export const dynamic = "force-dynamic";

export default async function CommunitiesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const where = user.collegeId
    ? { OR: [{ isPublic: true }, { collegeId: user.collegeId }] }
    : { isPublic: true };

  const communities = await prisma.community.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { college: { select: { code: true } }, _count: { select: { members: true } } },
  });

  const mine = await prisma.membership.findMany({ where: { userId: user.id }, select: { communityId: true } });
  const joined = new Set(mine.map((m) => m.communityId));

  return (
    <div className="mx-auto max-w-2xl py-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink">Communities</h1>
        <Link href="/communities/new" className="rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accentInk">+ Create</Link>
      </div>

      <div className="flex flex-col gap-2">
        {communities.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-xl2 border border-line bg-paper p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/12 text-sm font-bold text-accent">
              {c.name?.[0]?.toUpperCase() || "#"}
            </span>
            <Link href={`/c/${c.slug}`} className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-ink">{c.name}</div>
              <div className="text-[11px] text-faint">
                {c.isPublic ? (c.category || "Public") : (c.college?.code || "College")} · {c._count.members} members
              </div>
            </Link>
            <JoinButton communityId={c.id} joined={joined.has(c.id)} />
          </div>
        ))}
        {communities.length === 0 && (
          <p className="rounded-xl2 border border-line bg-paper p-8 text-center text-sm text-subtle">
            No communities yet. <Link href="/communities/new" className="text-accent">Create one.</Link>
          </p>
        )}
      </div>
    </div>
  );
}