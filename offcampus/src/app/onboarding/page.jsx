import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { unsign } from "@/lib/auth";
import OnboardingForm from "@/components/OnboardingForm";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const raw = cookies().get("oc_pending")?.value;
  const data = raw ? unsign(raw) : null;
  if (!data) redirect("/login");

  let pending;
  try { pending = JSON.parse(data); } catch { redirect("/login"); }

  // if they already finished somehow, don't re-onboard
  const existing = await prisma.user.findUnique({ where: { email: pending.email } });
  if (existing) redirect("/");

  const colleges = await prisma.college.findMany({ select: { id: true, code: true, name: true }, orderBy: { code: "asc" } });

  return <OnboardingForm pending={pending} colleges={colleges} />;
}