import { NextRequest, NextResponse } from "next/server";
import { draftShapeResponse } from "@/lib/ai/drafter";
import { db } from "@/lib/db";
import { shapes, messages } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
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
    userId,
    strategy,
    intent,
    addressing,
    delayMs,
    chatHistory,
    earlierResponders = [],
  } = body;

  // Wait the personality-based delay
  if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));

  console.log("[draft] start for shape:", shapeId, "room:", roomId, "strategy:", strategy);
  const shape = await db.query.shapes.findFirst({ where: eq(shapes.id, shapeId) });
  if (!shape) {
    console.log("[draft] shape not found:", shapeId);
    return NextResponse.json({ error: "Shape not found" }, { status: 404 });
  }

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  // Show typing indicator
  const persona = shape.persona_kernel;
  await triggerTypingStart(roomId, persona.identity.display_name, shapeId);

  // Generate draft — shape self-directs memory retrieval via search_memory tool
  const draft = await draftShapeResponse({
    persona,
    chatHistory,
    strategy,
    intent,
    addressing,
    shapeId,
    userId,
    earlierResponders,
  });

  console.log("[draft] generated text (silence:", draft.silence, "):", draft.text?.slice(0, 80));
  if (draft.silence) {
    console.log("[draft] shape chose silence");
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
    console.log("[draft] loop detected for shape:", shapeId, "— silencing");
    await triggerTypingStop(roomId, shapeId);
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

  console.log("[draft] message sent for shape:", shapeId, "tokens:", draft.tokensUsed);
  return NextResponse.json({ message, tokensUsed: draft.tokensUsed });
}
