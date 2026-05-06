import { NextRequest, NextResponse } from "next/server";
import { runDirector } from "@/lib/ai/director";
import { db } from "@/lib/db";
import { director_runs } from "@/lib/db/schema";
import { getRecentMessages, getShapesInRoom } from "@/lib/db/queries";
import { renderPersonaSummary } from "@/lib/persona/render";
import { getShapeMessageCount, getLastShapeSpokeAt } from "@/lib/redis";

function requireInternalSecret(req: NextRequest): boolean {
  return req.headers.get("x-internal-secret") === process.env.INTERNAL_API_SECRET;
}

export async function POST(req: NextRequest) {
  if (!requireInternalSecret(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { roomId, triggerEvent, triggerMessageId, roomMode, activeHumanIds, secondsSinceLastMessage } = body;

  const recentMessages = await getRecentMessages(roomId, 20);
  const shapesInRoom = await getShapesInRoom(roomId);

  const shapeParams = await Promise.all(
    shapesInRoom.map(async ({ shape }) => {
      const msgCount = await getShapeMessageCount(shape.id, roomId);
      const lastSpokeMs = await getLastShapeSpokeAt(roomId);
      const secondsAgo = lastSpokeMs ? Math.floor((Date.now() - lastSpokeMs) / 1000) : 999;
      const lastSpokeLabel =
        secondsAgo < 10 ? "just now" : secondsAgo < 60 ? `${secondsAgo}s ago` : `${Math.floor(secondsAgo / 60)} min ago`;

      return {
        id: shape.id,
        slug: shape.slug,
        summary: renderPersonaSummary(shape.persona_kernel),
        talkativeness: shape.persona_kernel.talkativeness,
        lastSpoke: lastSpokeLabel,
        messagesThisHour: msgCount,
        reactivityKeywords: shape.persona_kernel.reactivity.keywords,
      };
    })
  );

  const msgLog = recentMessages.map((m) => ({
    time: m.created_at?.toISOString().slice(11, 19) ?? "",
    sender: m.sender_shape_id
      ? (shapesInRoom.find((s) => s.shape.id === m.sender_shape_id)?.shape.slug ?? "shape")
      : `user_${m.sender_user_id?.slice(0, 6)}`,
    type: (m.sender_shape_id ? "shape" : "human") as "shape" | "human",
    content: m.content,
  }));

  const { output, tokensUsed, latencyMs } = await runDirector({
    roomMode: roomMode ?? "casual",
    activeHumanIds: activeHumanIds ?? [],
    activeShapeIds: shapesInRoom.map((s) => s.shape.id),
    secondsSinceLastMessage: secondsSinceLastMessage ?? 0,
    triggerEvent,
    triggerEventJson: JSON.stringify(body),
    recentMessages: msgLog,
    shapes: shapeParams,
  });

  await db.insert(director_runs).values({
    room_id: roomId,
    trigger_event: triggerEvent,
    trigger_message_id: triggerMessageId ?? null,
    decision: output,
    skip_reason: output.skip_reason,
    prefilter_decision: "pass",
    latency_ms: latencyMs,
    tokens_used: tokensUsed,
  });

  return NextResponse.json(output);
}
