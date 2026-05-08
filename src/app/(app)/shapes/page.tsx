import { db } from "@/lib/db";
import { shapes, user_memories } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { ShapesPanel } from "@/components/shapes/ShapesPanel";

export default async function ShapesPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  const rows = await db
    .select({
      id: shapes.id,
      slug: shapes.slug,
      display_name: shapes.display_name,
      avatar_url: shapes.avatar_url,
      creator_id: shapes.creator_id,
      persona_kernel: shapes.persona_kernel,
      is_public: shapes.is_public,
      created_at: shapes.created_at,
      memory_profile: user_memories.profile,
      memory_updated_at: user_memories.updated_at,
    })
    .from(shapes)
    .leftJoin(
      user_memories,
      and(
        eq(user_memories.shape_id, shapes.id),
        eq(user_memories.user_id, session!.user.id)
      )
    )
    .where(eq(shapes.creator_id, session!.user.id));

  const shapesWithMemory = rows.map((r) => ({
    ...r,
    created_at: r.created_at ? r.created_at.toISOString() : null,
    memory_updated_at: r.memory_updated_at ? r.memory_updated_at.toISOString() : null,
  }));

  return <ShapesPanel shapes={shapesWithMemory} />;
}
