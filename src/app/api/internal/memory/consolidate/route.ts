import { NextRequest, NextResponse } from "next/server";
import { consolidateMemories } from "@/lib/ai/memory";
import { embedTexts } from "@/lib/ai/embeddings";
import { db } from "@/lib/db";
import { memories, shapes, users, messages } from "@/lib/db/schema";
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

  // Get session messages
  const sessionMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.room_id, roomId))
    .orderBy(desc(messages.created_at))
    .limit(100);

  const conversation = sessionMessages
    .reverse()
    .map((m) =>
      m.sender_shape_id
        ? `${shape.persona_kernel.identity.display_name}: ${m.content}`
        : `${user.display_name ?? user.name}: ${m.content}`
    )
    .join("\n");

  // Get existing memories to avoid duplication
  const existingMemories = await db
    .select()
    .from(memories)
    .where(and(eq(memories.shape_id, shapeId), eq(memories.user_id, userId)))
    .orderBy(desc(memories.created_at))
    .limit(20);

  const result = await consolidateMemories({
    shapeName: shape.persona_kernel.identity.display_name,
    userName: user.display_name ?? user.name,
    conversation,
    existingMemories: existingMemories.map((m) => m.content),
  });

  if (result.memories.length === 0) {
    return NextResponse.json({ created: 0 });
  }

  // Embed new memories
  const embeddings = await embedTexts(result.memories.map((m) => m.content));

  const created = await db
    .insert(memories)
    .values(
      result.memories.map((m, i) => ({
        shape_id: shapeId,
        user_id: userId,
        room_id: roomId,
        scope: "private",
        type: m.type,
        content: m.content,
        metadata: { salience: m.salience },
        embedding: embeddings[i],
      }))
    )
    .returning();

  return NextResponse.json({ created: created.length });
}
