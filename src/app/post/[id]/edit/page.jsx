import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import EditPostForm from "@/components/EditPostForm";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: { tags: true },
  });
  if (!post) notFound();
  if (post.authorId !== user.id) redirect(`/post/${post.id}`);

  return (
    <div className="py-2">
      <EditPostForm post={{ id: post.id, title: post.title, body: post.body, linkUrl: post.linkUrl, tags: post.tags }} />
    </div>
  );
}
