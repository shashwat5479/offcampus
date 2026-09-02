import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import AuthForm from "@/components/AuthForm";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");
  const colleges = await prisma.college.findMany({ orderBy: { code: "asc" } });
  return <AuthForm mode="signup" colleges={colleges} />;
}
