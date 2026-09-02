import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import StatusPicker from "@/components/StatusPicker";

export const dynamic = "force-dynamic";

const ORDER = ["OFFER", "INTERVIEWING", "APPLIED", "SAVED", "REJECTED"];
const LABEL = { OFFER: "Offers", INTERVIEWING: "Interviewing", APPLIED: "Applied", SAVED: "Saved", REJECTED: "Rejected" };

export default async function MyApplicationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const apps = await prisma.opportunityApplication.findMany({
    where: { userId: user.id },
    include: { opportunity: { include: { postedBy: { select: { username: true } } } } },
    orderBy: { updatedAt: "desc" },
  });

  const groups = Object.fromEntries(ORDER.map((s) => [s, apps.filter((a) => a.status === s)]));

  return (
    <div className="mx-auto max-w-3xl py-6">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/opportunities" className="text-subtle hover:text-ink">←</Link>
        <h1 className="text-xl font-semibold text-ink">My applications</h1>
      </div>

      {apps.length === 0 && (
        <p className="rounded-xl2 border border-line bg-paper p-8 text-center text-sm text-subtle">
          Nothing tracked yet. <Link href="/opportunities" className="text-accent">Browse opportunities.</Link>
        </p>
      )}

      {ORDER.map((s) => groups[s].length > 0 && (
        <div key={s} className="mb-5">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">{LABEL[s]} · {groups[s].length}</div>
          <div className="flex flex-col gap-2">
            {groups[s].map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-xl2 border border-line bg-paper p-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-ink">{a.opportunity.role} · {a.opportunity.company}</div>
                  <div className="text-[11px] text-faint">{a.opportunity.type}{a.opportunity.stipend ? ` · ${a.opportunity.stipend}` : ""}</div>
                </div>
                <a href={a.opportunity.applyUrl} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline">Apply</a>
                <StatusPicker opportunityId={a.opportunity.id} initial={a.status} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}