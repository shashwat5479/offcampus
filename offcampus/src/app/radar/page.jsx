// src/app/radar/page.jsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { loadRadar } from "@/lib/radar";
import RadarFilters from "@/components/RadarFilters";

export const dynamic = "force-dynamic";

const WHENS = ["today", "week", "all"];
const SCOPES = ["mine", "nearby", "online"];

const ICON = {
  opportunity: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  discussion: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  community: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3"/><path d="M15.5 8a3 3 0 1 0 0-.1M3 20a6 6 0 0 1 12 0M14 20a6 6 0 0 1 7-5.2"/></svg>,
  confession: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h8M8 13h5"/></svg>,
};

export default async function RadarPage({ searchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const when = WHENS.includes(searchParams?.when) ? searchParams.when : "week";
  const scope = SCOPES.includes(searchParams?.scope) ? searchParams.scope : "mine";

  const { sections, total, hasCollege } = await loadRadar({ user, when, scope });

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* immersive header */}
      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/15 to-transparent p-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-white shadow-glow">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><path d="M12 12l6-3.5"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/></svg>
        </span>
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-ink">Campus Radar</h1>
          <p className="text-xs text-subtle">What&rsquo;s happening at your college right now.</p>
        </div>
      </div>

      {/* sticky filters */}
      <div className="sticky top-16 z-20 -mx-4 mb-4 border-b border-line bg-canvas/95 px-4 pt-2 backdrop-blur">
        <RadarFilters when={when} scope={scope} />
      </div>

      {scope === "mine" && !hasCollege && (
        <p className="mb-4 rounded-xl border border-line bg-paper p-4 text-sm text-subtle">
          Set your college in <Link href="/settings" className="font-medium text-accent">settings</Link> to see your campus feed.
        </p>
      )}

      {total === 0 ? (
        <p className="rounded-2xl border border-line bg-paper p-8 text-center text-sm text-subtle">
          Nothing here for this filter yet. Try a wider time range, or check <span className="text-ink">Nearby Colleges</span>.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {sections.map((section) => (
            <section key={section.key}>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-faint">
                <span className="text-accent">{ICON[section.key]}</span>
                {section.label}
              </div>
              <div className="flex flex-col gap-2">
                {section.items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="group flex items-center gap-3 rounded-2xl border border-line bg-paper p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-faint/60 hover:shadow-soft"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-ink">{item.title}</div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-subtle">
                        <span>{item.subtitle}</span>
                        {item.collegeCode && <span className="rounded bg-canvas px-1.5 py-0.5 text-[10px] font-medium text-faint">{item.collegeCode}</span>}
                      </div>
                    </div>
                    <div className="shrink-0 text-right text-[11px] font-medium text-accent">{item.meta}</div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}  