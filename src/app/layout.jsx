import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import TopBar from "@/components/TopBar";

export const metadata = {
  title: "OffCampus",
  description: "The network for Indian college campuses.",
};

export default async function RootLayout({ children }) {
  const user = await getCurrentUser();
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas text-ink font-sans">
        <TopBar user={user ? { username: user.username, name: user.name } : null} />
        <main className="mx-auto w-full max-w-shell px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
