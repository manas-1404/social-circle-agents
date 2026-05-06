import { NextRequest, NextResponse } from "next/server";
import { draftShapeResponse } from "@/lib/ai/drafter";
import { db } from "@/lib/db";
import { shapes, messages, memories } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { embedText, cosineSimilarity } from "@/lib/ai/embeddings";
import { checkContentSafety, CRISIS_REDIRECT, DEPENDENCY_REDIRECT } from "@/lib/ai/safety/content-safety";
import { detectLoop } from "@/lib/ai/safety/loop-detection";
import { triggerRoomEvent, triggerTypingStart, triggerTypingStop } from "@/lib/pusher/server";
import { setLastShapeSpokeAt, incrementShapeMessageCount, pushLastMessage, incrementRoomTokensRedis } from "@/lib/redis";
import { upsertShapeState } from "@/lib/db/queries";

function requireInternalSecret(req: NextRequest): boolean {
  return req.headers.get("x-internal-secret") === process.env.INTERNAL_API_SECRET;
}

export async function POST(req: NextRequest) {
  if (!requireInternalSecret(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const {
    roomId,
    shapeId,
    strategy,
    intent,
    addressing,
    delayMs,
    chatHistory,
    earlierResponders = [],
  } = body;

  // Wait the personality-based delay
  if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));

  const shape = await db.query.shapes.findFirst({ where: eq(shapes.id, shapeId) });
  if (!shape) return NextResponse.json({ error: "Shape not found" }, { status: 404 });

  // Retrieve top-3 memories by cosine similarity (simplified: get recent memories)
  const recentMemories = await db
    .select()
    .from(memories)
    .where(and(eq(memories.shape_id, shapeId)))
    .orderBy(desc(memories.created_at))
    .limit(10);

  const retrievedMemories = recentMemories.slice(0, 3).map((m) => m.content);

  // Show typing indicator
  const persona = shape.persona_kernel;
  await triggerTypingStart(roomId, persona.identity.display_name, shapeId);

  // Generate draft
  const draft = await draftShapeResponse({
    persona,
    chatHistory,
    strategy,
    intent,
    addressing,
    retrievedMemories,
    earlierResponders,
  });

  if (draft.silence) {
    await triggerTypingStop(roomId, shapeId);
    return NextResponse.json({ silence: true });
  }

  // Safety checks on generated text
  const safety = checkContentSafety(draft.text);
  let finalText = draft.text;

  if (safety.crisis) {
    finalText = CRISIS_REDIRECT;
  } else if (safety.dependency) {
    finalText = DEPENDENCY_REDIRECT;
  } else if (safety.therapistClaim) {
    await triggerTypingStop(roomId, shapeId);
    return NextResponse.json({ silence: true, reason: "therapist_claim_blocked" });
  }

  // Loop detection
  const shapeRecentMessages = await db
    .select({ content: messages.content })
    .from(messages)
    .where(and(eq(messages.room_id, roomId), eq(messages.sender_shape_id, shapeId)))
    .orderBy(desc(messages.created_at))
    .limit(5);

  if (detectLoop(finalText, shapeRecentMessages.map((m) => m.content), [])) {
    await triggerTypingStop(roomId, shapeId);
    // Put shape on 5-min cooldown
    await upsertShapeState(shapeId, roomId, { cooldown_until: new Date(Date.now() + 5 * 60 * 1000) });
    return NextResponse.json({ silence: true, reason: "loop_detected" });
  }

  // Typing duration simulation: chars / (WPM * 5 / 60) ms
  const typingDurationMs = Math.min(
    8000,
    (finalText.length / ((persona.typing_speed_wpm * 5) / 60)) * 1000
  );
  await new Promise((r) => setTimeout(r, typingDurationMs));

  await triggerTypingStop(roomId, shapeId);

  // Persist message
  const [message] = await db
    .insert(messages)
    .values({
      room_id: roomId,
      sender_shape_id: shapeId,
      content: finalText,
      addressing,
      strategy,
      tokens_used: draft.tokensUsed,
    })
    .returning();

  // Publish to Pusher
  await triggerRoomEvent(roomId, "message.sent", {
    ...message,
    sender_display_name: persona.identity.display_name,
    sender_avatar: shape.avatar_url,
  });

  // Update state
  await setLastShapeSpokeAt(roomId);
  await incrementShapeMessageCount(shapeId, roomId);
  await pushLastMessage(roomId, `shape:${shapeId}`);
  await incrementRoomTokensRedis(roomId, draft.tokensUsed);
  await upsertShapeState(shapeId, roomId, { last_spoke_at: new Date() });

  return NextResponse.json({ message, tokensUsed: draft.tokensUsed });
}
