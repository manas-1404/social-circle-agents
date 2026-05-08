import { NextRequest, NextResponse } from "next/server";
import { consolidateMemories } from "@/lib/ai/memory";
import { db } from "@/lib/db";
import { user_memories, shapes, users, messages } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

function requireInternalSecret(req: NextRequest): boolean {
  return req.headers.get("x-internal-secret") === process.env.INTERNAL_API_SECRET;
}

export async function POST(req: NextRequest) {
  if (!requireInternalSecret(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { roomId, shapeId, userId } = await req.json();

  const shape = await db.query.shapes.findFirst({ where: eq(shapes.id, shapeId) });
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!shape || !user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const sessionMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.room_id, roomId))
    .orderBy(desc(messages.created_at))
    .limit(10);

  const conversation = sessionMessages
    .reverse()
    .map((m) =>
      m.sender_shape_id
        ? `${shape.persona_kernel.identity.display_name}: ${m.content}`
        : `${user.display_name ?? user.name}: ${m.content}`
    )
    .join("\n");

  const existing = await db.query.user_memories.findFirst({
    where: and(eq(user_memories.shape_id, shapeId), eq(user_memories.user_id, userId)),
  });

  const result = await consolidateMemories({
    shapeName: shape.persona_kernel.identity.display_name,
    userName: user.display_name ?? user.name,
    conversation,
    existingProfile: existing?.profile ?? null,
  });

  if (!result.should_update || !result.profile) {
    return NextResponse.json({ updated: false });
  }

  await db
    .insert(user_memories)
    .values({ shape_id: shapeId, user_id: userId, profile: result.profile, updated_at: new Date() })
    .onConflictDoUpdate({
      target: [user_memories.shape_id, user_memories.user_id],
      set: { profile: result.profile, updated_at: new Date() },
    });

  return NextResponse.json({ updated: true });
}
