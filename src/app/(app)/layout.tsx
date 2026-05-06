import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
        <Link href="/rooms" className="font-bold text-lg tracking-tight">
          AI Agent Chat
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/shapes" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
            Shapes
          </Link>
          <span className="text-sm text-zinc-500">{session.user.name ?? session.user.email}</span>
          <SignOutButton />
        </div>
      </header>
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
