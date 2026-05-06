import { db } from "@/lib/db";
import { shapes } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import Link from "next/link";

export default async function ShapesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const myShapes = await db
    .select()
    .from(shapes)
    .where(eq(shapes.creator_id, session!.user.id));

  return (
    <div className="max-w-xl mx-auto px-5 py-8">
      <div className="mb-5 p-4 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-400 leading-relaxed">
        <p className="text-zinc-200 font-semibold mb-1">What are Shapes?</p>
        Shapes are AI personas that live in your chat rooms. Each one has its own personality, backstory, and memory. Add them to a room and they&apos;ll respond on their own — you don&apos;t control what they say.
        <span className="block mt-1 text-zinc-500">Shapes you create are private to you. You can add them to any of your rooms.</span>
      </div>

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Shapes</h1>
          <p className="text-sm text-zinc-400 mt-0.5">{myShapes.length} persona{myShapes.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/shapes/new"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Shape
        </Link>
      </div>

      {myShapes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 p-10 text-center">
          <p className="text-2xl mb-2 text-violet-400">✦</p>
          <p className="text-sm font-medium text-zinc-300 mb-1">No shapes yet</p>
          <p className="text-xs text-zinc-600">Create a shape — an AI persona with its own personality and memory.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {myShapes.map((shape) => (
            <li key={shape.id}>
              <Link
                href={`/shapes/${shape.id}`}
                className="group flex items-start gap-3 px-4 py-3.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-violet-900/60 border border-violet-800/50 flex items-center justify-center text-base font-bold text-violet-300 flex-shrink-0">
                  {shape.display_name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-base font-semibold text-zinc-100">{shape.display_name}</p>
                    <span className="text-xs text-violet-400 bg-violet-950/60 border border-violet-900/50 rounded px-2 py-0.5 capitalize">
                      {shape.persona_kernel.identity.archetype}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
                    {shape.persona_kernel.identity.backstory_short}
                  </p>
                  {shape.persona_kernel.signature_phrases.length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {shape.persona_kernel.signature_phrases.slice(0, 2).map((phrase) => (
                        <span key={phrase} className="text-xs text-zinc-400 bg-zinc-800 rounded px-2 py-0.5">
                          &ldquo;{phrase}&rdquo;
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <svg className="text-zinc-600 group-hover:text-zinc-400 transition-colors mt-1 flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

