import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getConversations } from "@/lib/conversations";
import ConversationList from "@/components/ConversationList";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const convos = await getConversations(user.id);

  return (
    <>
      {/* Mobile: full conversation list */}
      <div className="h-full w-full overflow-y-auto px-1 py-2 lg:hidden">
        <ConversationList convos={convos} meId={user.id} />
      </div>
      {/* Desktop: list lives in the sidebar, so show a friendly empty state here */}
      <div className="hidden h-full flex-col items-center justify-center text-center lg:flex">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-ink">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <h2 className="mt-4 text-xl font-semibold text-ink">Your Messages</h2>
        <p className="mt-1 text-sm text-subtle">Select a conversation to start chatting.</p>
      </div>
    </>
  );
}
