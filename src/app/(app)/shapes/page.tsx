import { db } from "@/lib/db";
import { shapes } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, or } from "drizzle-orm";
import { headers } from "next/headers";
import Link from "next/link";

export default async function ShapesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const publicShapes = await db
    .select()
    .from(shapes)
    .where(
      or(
        eq(shapes.is_public, true),
        session ? eq(shapes.creator_id, session.user.id) : undefined
      )
    );

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Shapes</h1>
        <Link
          href="/shapes/new"
          className="rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 text-sm font-semibold hover:opacity-80 transition-opacity"
        >
          + Create Shape
        </Link>
      </div>

      <ul className="space-y-3">
        {publicShapes.map((shape) => (
          <li key={shape.id} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-200 dark:bg-violet-800 flex items-center justify-center text-sm font-semibold text-violet-700 dark:text-violet-200 flex-shrink-0">
                {shape.display_name[0]}
              </div>
              <div>
                <p className="font-medium">{shape.display_name}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {shape.persona_kernel.identity.archetype}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  {shape.persona_kernel.identity.backstory_short}
                </p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {shape.persona_kernel.signature_phrases.slice(0, 3).map((phrase) => (
                    <span
                      key={phrase}
                      className="text-xs bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 rounded-full px-2 py-0.5"
                    >
                      {phrase}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
