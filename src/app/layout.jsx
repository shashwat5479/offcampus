import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";

export const metadata = {
  title: "OffCampus",
  description: "The network for Indian college campuses.",
};

export default async function RootLayout({ children }) {
  const user = await getCurrentUser();
  const unread = user
    ? await prisma.notification.count({ where: { userId: user.id, read: false } })
    : 0;
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-canvas text-ink font-sans">
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('theme');if(t!=='light'){document.documentElement.classList.add('dark')}}catch(e){document.documentElement.classList.add('dark')}",
          }}
        />
        <TopBar
          user={user ? { username: user.username, name: user.name, avatarUrl: user.avatarUrl } : null}
          unread={unread}
        />
       <main className="mx-auto w-full max-w-[1600px] px-4 pt-6 pb-28">{children}</main>
        <BottomNav me={user ? user.username : null} unread={unread} />
      </body>
    </html>
  );
}