import { inngest, EVENTS } from "../client";
import { db } from "@/lib/db";
import { room_members } from "@/lib/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET ?? "dev-internal-secret-123";
const BASE_URL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

export const onIdleConsolidate = inngest.createFunction(
  {
    id: "on-idle-consolidate",
    retries: 2,
    triggers: [{ event: EVENTS.IDLE_CONSOLIDATE }],
  },
  async ({ event, step }: { event: { data: Record<string, unknown> }; step: { run: <T>(id: string, fn: () => Promise<T>) => Promise<T> } }) => {
    const { roomId, userId } = event.data as { roomId: string; userId: string };

    const shapeMembers = await step.run("get-shapes", async () =>
      db
        .select({ shape_id: room_members.shape_id })
        .from(room_members)
        .where(and(eq(room_members.room_id, roomId), isNotNull(room_members.shape_id)))
    );

    for (const { shape_id } of shapeMembers) {
      if (!shape_id) continue;
      await step.run(`consolidate-${shape_id}`, async () => {
        const res = await fetch(`${BASE_URL}/api/internal/memory/consolidate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-secret": INTERNAL_SECRET,
          },
          body: JSON.stringify({ roomId, shapeId: shape_id, userId }),
        });
        return res.json();
      });
    }

    return { consolidated: shapeMembers.length };
  }
);
