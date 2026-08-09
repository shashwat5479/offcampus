import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getConfessions } from "@/lib/confession";
import { ConfessionComposer, ConfessionItem } from "@/components/ConfessionCard";

export const dynamic = "force-dynamic";

export default async function ConfessionsPage({ searchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const scope = searchParams?.scope === "public" ? "public" : "college";
  const confessions = await getConfessions(user, scope);

  return (
    <div className="mx-auto max-w-2xl py-6">
      <h1 className="mb-4 text-xl font-semibold text-ink">Confessions</h1>

      <div className="mb-4"><ConfessionComposer /></div>

      <div className="mb-4 flex gap-2">
        <Link href="/confessions?scope=college" className={`rounded-full px-3 py-1 text-sm ${scope === "college" ? "bg-accent text-accentInk" : "border border-line text-subtle hover:text-ink"}`}>My college</Link>
        <Link href="/confessions?scope=public" className={`rounded-full px-3 py-1 text-sm ${scope === "public" ? "bg-accent text-accentInk" : "border border-line text-subtle hover:text-ink"}`}>All colleges</Link>
      </div>

      <div className="flex flex-col gap-3">
        {confessions.length === 0 ? (
          <p className="rounded-xl2 border border-line bg-paper p-8 text-center text-sm text-subtle">No confessions yet. Be the first.</p>
        ) : (
          confessions.map((c) => <ConfessionItem key={c.id} c={c} />)
        )}
      </div>
    </div>
  );
}