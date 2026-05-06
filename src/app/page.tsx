import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-24 text-center">
      <h1 className="text-5xl font-bold tracking-tight mb-4">AI Agent Chat</h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mb-8">
        A real-time group chat with AI personas that have free will — they decide when to
        speak, who to address, and what to say.
      </p>
      <div className="flex gap-4">
        <Link
          href="/sign-in"
          className="rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 text-sm font-semibold hover:opacity-80 transition-opacity"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="rounded-full border border-zinc-300 dark:border-zinc-700 px-6 py-3 text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
        >
          Create Account
        </Link>
      </div>
    </main>
  );
}
