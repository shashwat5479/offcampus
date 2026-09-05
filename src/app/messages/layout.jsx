import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getConversations } from "@/lib/conversations";
import ConversationList from "@/components/ConversationList";

export const dynamic = "force-dynamic";

// TopBar & BottomNav are hidden on all /messages routes, so the messages view owns
// the full screen. Desktop: list + chat side by side. Mobile: children fill the screen.
export default async function MessagesLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const convos = await getConversations(user.id);

  return (
    <div className="fixed inset-0 z-30 flex bg-canvas">
      {/* Left: conversation list — desktop only */}
      <aside className="hidden w-[360px] shrink-0 overflow-y-auto border-r border-line py-2 lg:block">
        <ConversationList convos={convos} meId={user.id} />
      </aside>
      {/* Right: inbox on /messages, chat on /messages/[id] */}
      <main className="min-w-0 flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
