import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { NavTabs } from "@/components/NavTabs";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const displayName = session.user.name ?? session.user.email;
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col h-screen bg-zinc-950">
      <header className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/60 flex-shrink-0 bg-zinc-950/80 backdrop-blur-md">
        <Link href="/rooms" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center transition-opacity group-hover:opacity-80">
            <span className="text-white text-xs font-black">S</span>
          </div>
          <span className="font-bold text-base text-zinc-100 tracking-tight">Social Agents</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2.5 bg-zinc-900 border border-zinc-800 rounded-full pl-1.5 pr-4 py-1.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-[10px] font-bold text-white">
              {initials}
            </div>
            <span className="text-sm text-zinc-300 hidden sm:block">{displayName}</span>
          </div>
          <SignOutButton />
        </div>
      </header>
      <NavTabs />
      <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
    </div>
  );
}
