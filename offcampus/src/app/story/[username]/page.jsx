import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getUserActiveStories } from "@/lib/story";
import StoryViewer from "@/components/StoryViewer";

export const dynamic = "force-dynamic";

export default async function StoryPage({ params }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const data = await getUserActiveStories(user.id, params.username);
  if (!data) notFound();

  if (data.locked) {
    return <div className="mx-auto mt-24 max-w-sm text-center text-sm text-subtle">This account is private. <Link href="/" className="text-accent">Back</Link></div>;
  }
  if (data.stories.length === 0) {
    return <div className="mx-auto mt-24 max-w-sm text-center text-sm text-subtle">No active stories. <Link href="/" className="text-accent">Back</Link></div>;
  }

  return <StoryViewer author={data.author} stories={data.stories} isOwner={user.id === data.author.id} />;
}