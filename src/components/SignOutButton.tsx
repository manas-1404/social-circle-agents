"use client";

import { signOut } from "@/lib/auth/client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/sign-in");
  }

  return (
    <button
      onClick={handleSignOut}
      className="px-3 py-1.5 rounded-md text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
    >
      sign out
    </button>
  );
}

