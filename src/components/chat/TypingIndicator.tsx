"use client";

export type TypingShape = {
  shapeId: string;
  shapeName: string;
};

export function TypingIndicator({ typers }: { typers: TypingShape[] }) {
  if (typers.length === 0) return null;
  const names = typers.map((t) => t.shapeName).join(", ");
  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-500 dark:text-zinc-400">
      <span className="flex gap-1">
        <span className="animate-bounce delay-0 w-1.5 h-1.5 rounded-full bg-zinc-400" />
        <span className="animate-bounce delay-150 w-1.5 h-1.5 rounded-full bg-zinc-400" />
        <span className="animate-bounce delay-300 w-1.5 h-1.5 rounded-full bg-zinc-400" />
      </span>
      <span>{names} {typers.length === 1 ? "is" : "are"} typing…</span>
    </div>
  );
}
