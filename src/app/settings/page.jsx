import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import SettingsForm from "@/components/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const initial = {
    name: user.name || "",
    username: user.username,
    bio: user.bio || "",
    branch: user.branch || "",
    year: user.year || "",
    avatarUrl: user.avatarUrl || "",
  };
  return (
    <div className="mx-auto max-w-feed">
      <SettingsForm initial={initial} />
    </div>
  );
}