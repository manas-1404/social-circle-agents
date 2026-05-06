import { inngest, EVENTS } from "../client";
import { runPrefilter } from "@/lib/prefilter";
import { db } from "@/lib/db";
import { rooms, room_members, shapes } from "@/lib/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";
import { getRecentMessages, getShapesInRoom } from "@/lib/db/queries";
import { echoChambertCheck } from "@/lib/ai/safety/echo-chamber";
import type { DirectorOutput } from "@/lib/ai/schemas/director";

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET ?? "dev-internal-secret-123";
const BASE_URL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

async function callInternal(path: string, body: unknown) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": INTERNAL_SECRET,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Internal call ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

export const onMessageSent = inngest.createFunction(
  {
    id: "on-message-sent",
    retries: 3,
    concurrency: { limit: 2, key: "event.data.roomId" },
    debounce: { key: "event.data.roomId", period: "4s" },
    triggers: [{ event: EVENTS.MESSAGE_SENT }],
  },
  async ({ event, step }: { event: { data: Record<string, unknown> }; step: { run: <T>(id: string, fn: () => Promise<T>) => Promise<T>; sleep: (id: string, duration: string) => Promise<void> } }) => {
    const { roomId, senderId } = event.data as { roomId: string; senderId: string; messageId?: string; content?: string };
    console.log("[on-message-sent] start", { roomId, senderId });

    const room = await step.run("fetch-room", async () => {
      return db.query.rooms.findFirst({ where: eq(rooms.id, roomId) });
    });

    if (!room || !room.free_will_enabled) {
      console.log("[on-message-sent] skipped — free_will_disabled or room not found", { roomId });
      return { skipped: true, reason: "free_will_disabled" };
    }

    const humanPresent = await step.run("check-humans", async () => {
      const member = await db.query.room_members.findFirst({
        where: and(eq(room_members.room_id, roomId), isNotNull(room_members.user_id)),
      });
      return !!member;
    });
    console.log("[on-message-sent] humanPresent:", humanPresent);

    const shapesInRoom = await step.run("get-shapes", async () => getShapesInRoom(roomId));
    console.log("[on-message-sent] shapesInRoom:", shapesInRoom.map((s) => s.shape.slug));

    const prefilterResult = await step.run("prefilter", async () => {
      return runPrefilter({
        roomId,
        triggerEvent: "message.sent",
        humanOnline: humanPresent,
        userInQuietHours: false,
        shapeIds: shapesInRoom.map((s) => s.shape.id),
        dailyTokenBudget: room.daily_token_budget ?? 500_000,
      });
    });
    console.log("[on-message-sent] prefilter:", prefilterResult);

    if (!prefilterResult.pass) {
      console.log("[on-message-sent] skipped — prefilter blocked:", prefilterResult.reason);
      return { skipped: true, reason: prefilterResult.reason };
    }

    const recentMessages = await step.run("fetch-recent-messages", async () =>
      getRecentMessages(roomId, 20)
    );

    const secondsSinceLast =
      recentMessages.length > 0
        ? Math.floor(
            (Date.now() -
              new Date(recentMessages[recentMessages.length - 1].created_at ?? Date.now()).getTime()) /
              1000
          )
        : 0;

    console.log("[on-message-sent] calling director, secondsSinceLast:", secondsSinceLast);
    const directorOutput: DirectorOutput = await step.run("run-director", async () =>
      callInternal("/api/internal/director/run", {
        roomId,
        triggerEvent: "message.sent",
        triggerMessageId: (event.data as { messageId?: string }).messageId,
        roomMode: room.mode,
        activeHumanIds: [senderId],
        secondsSinceLastMessage: secondsSinceLast,
      })
    );
    console.log("[on-message-sent] director output:", JSON.stringify(directorOutput));

    if (!directorOutput.responders?.length) {
      console.log("[on-message-sent] skipped — director chose no responders, reason:", directorOutput.skip_reason);
      return { skipped: true, reason: directorOutput.skip_reason };
    }

    const shapeNameMap = Object.fromEntries(
      shapesInRoom.map(({ shape }) => [shape.id, shape.persona_kernel.identity.display_name])
    );

    const chatHistoryStr = recentMessages
      .map((m) => {
        const sender = m.sender_shape_id
          ? (shapeNameMap[m.sender_shape_id] ?? `shape_${m.sender_shape_id.slice(0, 6)}`)
          : `user_${m.sender_user_id?.slice(0, 6)}`;
        return `[${new Date(m.created_at ?? Date.now()).toISOString().slice(11, 19)}] @${sender}: ${m.content}`;
      })
      .join("\n");

    const earlierResponders: { shapeName: string; text: string }[] = [];

    for (const responder of directorOutput.responders) {
      console.log("[on-message-sent] drafting for shape:", responder.shape_id, "strategy:", responder.strategy);
      const draftResult = await step.run(`draft-${responder.shape_id}`, async () =>
        callInternal("/api/internal/draft/run", {
          roomId,
          shapeId: responder.shape_id,
          strategy: responder.strategy,
          intent: responder.intent,
          addressing: responder.addressing,
          delayMs: responder.delay_ms,
          chatHistory: chatHistoryStr,
          earlierResponders,
        })
      );
      console.log("[on-message-sent] draft result for", responder.shape_id, ":", JSON.stringify(draftResult));

      if (!draftResult.silence && draftResult.message) {
        const shapeName = await step.run(`get-shape-name-${responder.shape_id}`, async () => {
          const s = await db.query.shapes.findFirst({
            where: eq(shapes.id, responder.shape_id),
          });
          return s?.persona_kernel.identity.display_name ?? "shape";
        });

        earlierResponders.push({ shapeName, text: draftResult.message.content });
      }
    }

    if (earlierResponders.length >= 2) {
      await step.run("echo-chamber-check", async () =>
        echoChambertCheck(earlierResponders.map((r) => ({ shapeId: r.shapeName, text: r.text })))
      );
    }

    await step.sleep("wait-before-idle-schedule", "5s");
    await step.run("schedule-idle-timer", async () =>
      callInternal("/api/internal/timer/idle", { roomId, elapsed: "30s" })
    );

    // Consolidate memories for each human in the room after conversation
    await step.run("consolidate-memories", async () =>
      callInternal("/api/internal/memory/consolidate-room", { roomId, senderId })
    );

    return { processed: true, responders: directorOutput.responders.length };
  }
);
