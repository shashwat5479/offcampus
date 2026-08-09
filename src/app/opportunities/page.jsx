import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import StatusPicker from "@/components/StatusPicker";

export const dynamic = "force-dynamic";

const TYPES = ["All", "Placement", "Internship", "Hackathon"];

function countdown(deadline) {
  if (!deadline) return null;
  const ms = new Date(deadline) - Date.now();
  if (ms < 0) return "Closed";
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  return d > 0 ? `${d}d ${h}h left` : `${h}h left`;
}

export default async function OpportunitiesPage({ searchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const type = TYPES.includes(searchParams?.type) ? searchParams.type : "All";
  const where = type === "All" ? {} : { type };

  const opps = await prisma.opportunity.findMany({
    where,
    orderBy: [{ deadline: "asc" }, { createdAt: "desc" }],
    include: { postedBy: { select: { username: true } } },
  });

  const myApps = await prisma.opportunityApplication.findMany({
    where: { userId: user.id, opportunityId: { in: opps.map((o) => o.id) } },
    select: { opportunityId: true, status: true },
  });
  const statusByOpp = Object.fromEntries(myApps.map((a) => [a.opportunityId, a.status]));

  return (
    <div className="mx-auto max-w-3xl py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink">Opportunities</h1>
        <div className="flex items-center gap-2">
          <Link href="/opportunities/mine" className="rounded-full border border-line px-4 py-1.5 text-sm text-subtle hover:text-ink">My applications</Link>
          <Link href="/opportunities/new" className="rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accentInk">+ Post</Link>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        {TYPES.map((t) => (
          <Link key={t} href={`/opportunities?type=${t}`} className={`rounded-full px-3 py-1 text-sm ${t === type ? "bg-accent text-accentInk" : "border border-line text-subtle hover:text-ink"}`}>{t}</Link>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {opps.length === 0 && (
          <p className="rounded-xl2 border border-line bg-paper p-8 text-center text-sm text-subtle">
            Nothing here yet. <Link href="/opportunities/new" className="text-accent">Post one.</Link>
          </p>
        )}
        {opps.map((o) => {
          const cd = countdown(o.deadline);
          return (
            <div key={o.id} className="rounded-xl2 border border-line bg-paper p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-ink">{o.role} <span className="text-subtle">· {o.company}</span></div>
                  <div className="mt-0.5 flex flex-wrap gap-x-2 text-[11px] text-faint">
                    <span className="rounded bg-accent/12 px-1.5 py-0.5 font-medium text-accent">{o.type}</span>
                    {o.stipend && <span>{o.stipend}</span>}
                    {(o.isRemote ? "Remote" : o.location) && <span>· {o.isRemote ? "Remote" : o.location}</span>}
                    {o.batchYear && <span>· Batch {o.batchYear}</span>}
                    {o.branches && <span>· {o.branches}</span>}
                  </div>
                </div>
                {cd && <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${cd === "Closed" ? "bg-line text-faint" : "bg-up/10 text-up"}`}>{cd}</span>}
              </div>
              {o.description && <p className="mt-2 line-clamp-2 text-sm text-subtle">{o.description}</p>}
              <div className="mt-3 flex items-center gap-3 text-xs">
                <a href={o.applyUrl} target="_blank" rel="noreferrer" className="rounded-full bg-accent px-3 py-1 font-semibold text-accentInk">Apply</a>
                <StatusPicker opportunityId={o.id} initial={statusByOpp[o.id]} />
                <span className="text-faint">by @{o.postedBy.username}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}