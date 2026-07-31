import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import SubmitForm from "@/components/SubmitForm";

export const dynamic = "force-dynamic";

export default async function SubmitPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // communities in the user's college first, then the rest
  const communities = await prisma.community.findMany({
    include: { college: true },
    orderBy: [{ collegeId: "asc" }, { name: "asc" }],
  });
  const mine = communities.filter((c) => c.collegeId === user.collegeId);
  const others = communities.filter((c) => c.collegeId !== user.collegeId);

  return (
    <div className="mx-auto max-w-feed">
      <SubmitForm communities={[...mine, ...others]} />
    </div>
  );
}
