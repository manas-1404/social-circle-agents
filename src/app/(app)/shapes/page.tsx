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
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Shapes</h1>
          <p className="text-xs text-zinc-500 mt-0.5">{myShapes.length} persona{myShapes.length !== 1 ? "s" : ""}</p>
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
            <li key={shape.id} className="group flex items-start gap-3 px-4 py-3.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-transparent hover:border-zinc-700 transition-all">
              <div className="w-9 h-9 rounded-lg bg-violet-900/60 border border-violet-800/50 flex items-center justify-center text-sm font-bold text-violet-300 flex-shrink-0">
                {shape.display_name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-zinc-200">{shape.display_name}</p>
                  <span className="text-[10px] text-violet-500 bg-violet-950/60 border border-violet-900/50 rounded px-1.5 py-px capitalize">
                    {shape.persona_kernel.identity.archetype}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">
                  {shape.persona_kernel.identity.backstory_short}
                </p>
                {shape.persona_kernel.signature_phrases.length > 0 && (
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {shape.persona_kernel.signature_phrases.slice(0, 2).map((phrase) => (
                      <span key={phrase} className="text-[10px] text-zinc-500 bg-zinc-800 rounded px-1.5 py-px">
                        "{phrase}"
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

