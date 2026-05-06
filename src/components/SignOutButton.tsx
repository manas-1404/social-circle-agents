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
      className="px-2.5 py-1 rounded-md text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors"
    >
      sign out
    </button>
  );
}

