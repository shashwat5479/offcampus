import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import ChatRoom from "@/components/ChatRoom";

export const dynamic = "force-dynamic";

export default async function ConversationPage({ params }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const convo = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: { user1: true, user2: true },
  });
  if (!convo) notFound();
  if (convo.user1Id !== user.id && convo.user2Id !== user.id) notFound();

  const other = convo.user1Id === user.id ? convo.user2 : convo.user1;

  const messages = await prisma.message.findMany({
    where: { conversationId: convo.id },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return (
    <ChatRoom
      conversationId={convo.id}
      meId={user.id}
      other={{ id: other.id, name: other.name, username: other.username, avatarUrl: other.avatarUrl }}
      initialMessages={messages.map((m) => ({ id: m.id, senderId: m.senderId, body: m.body, createdAt: m.createdAt }))}
    />
  );
}