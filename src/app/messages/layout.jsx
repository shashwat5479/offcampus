import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getConversations } from "@/lib/conversations";
import ConversationList from "@/components/ConversationList";

export const dynamic = "force-dynamic";

// Two-pane on desktop (list + open chat side by side), single-pane on mobile.
export default async function MessagesLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const convos = await getConversations(user.id);

  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-5xl">
      {/* Left: conversation list — desktop only */}
      <aside className="hidden w-[360px] shrink-0 overflow-y-auto border-r border-line py-2 lg:block">
        <ConversationList convos={convos} meId={user.id} />
      </aside>
      {/* Right: the page (inbox on /messages, chat on /messages/[id]) */}
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
