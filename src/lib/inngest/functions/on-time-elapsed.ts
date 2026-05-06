import { inngest, EVENTS } from "../client";
import { runPrefilter } from "@/lib/prefilter";
import { db } from "@/lib/db";
import { rooms, room_members } from "@/lib/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";
import { getShapesInRoom, getRecentMessages } from "@/lib/db/queries";
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
  if (!res.ok) throw new Error(`Internal call ${path} failed: ${res.status}`);
  return res.json();
}

export const onTimeElapsed = inngest.createFunction(
  {
    id: "on-time-elapsed",
    retries: 2,
    triggers: [{ event: EVENTS.TIME_ELAPSED }],
  },
  async ({ event, step }: { event: { data: Record<string, unknown> }; step: { run: <T>(id: string, fn: () => Promise<T>) => Promise<T> } }) => {
    const { roomId, elapsed } = event.data as { roomId: string; elapsed: string };

    const room = await step.run("fetch-room", async () =>
      db.query.rooms.findFirst({ where: eq(rooms.id, roomId) })
    );

    if (!room || !room.free_will_enabled) return { skipped: true };

    const humanPresent = await step.run("check-humans", async () => {
      const member = await db.query.room_members.findFirst({
        where: and(eq(room_members.room_id, roomId), isNotNull(room_members.user_id)),
      });
      return !!member;
    });

    if (!humanPresent) return { skipped: true, reason: "no_humans" };

    const shapesInRoom = await step.run("get-shapes", async () => getShapesInRoom(roomId));

    const prefilterResult = await step.run("prefilter", async () =>
      runPrefilter({
        roomId,
        triggerEvent: `time.elapsed.${elapsed}`,
        humanOnline: true,
        userInQuietHours: false,
        shapeIds: shapesInRoom.map((s) => s.shape.id),
        dailyTokenBudget: room.daily_token_budget ?? 500_000,
      })
    );

    if (!prefilterResult.pass) return { skipped: true, reason: prefilterResult.reason };

    const recentMessages = await step.run("fetch-messages", async () =>
      getRecentMessages(roomId, 20)
    );

    const secondsSinceLast =
      recentMessages.length > 0
        ? Math.floor(
            (Date.now() -
              new Date(recentMessages[recentMessages.length - 1].created_at ?? Date.now()).getTime()) /
              1000
          )
        : 999;

    const directorOutput: DirectorOutput = await step.run("run-director", async () =>
      callInternal("/api/internal/director/run", {
        roomId,
        triggerEvent: `time.elapsed.${elapsed}`,
        roomMode: room.mode,
        activeHumanIds: [],
        secondsSinceLastMessage: secondsSinceLast,
      })
    );

    if (!directorOutput.responders?.length) return { skipped: true, reason: directorOutput.skip_reason };

    const chatHistoryStr = recentMessages
      .map((m) => `@${m.sender_shape_id ? "shape" : "user"}: ${m.content}`)
      .join("\n");

    for (const responder of directorOutput.responders) {
      await step.run(`draft-idle-${responder.shape_id}`, async () =>
        callInternal("/api/internal/draft/run", {
          roomId,
          shapeId: responder.shape_id,
          strategy: responder.strategy,
          intent: responder.intent,
          addressing: responder.addressing,
          delayMs: responder.delay_ms,
          chatHistory: chatHistoryStr,
          earlierResponders: [],
        })
      );
    }

    return { processed: true };
  }
);
