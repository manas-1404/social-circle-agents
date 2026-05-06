import { inngest, EVENTS } from "../client";
import { db } from "@/lib/db";
import { rooms, room_members, messages } from "@/lib/db/schema";
import { eq, and, isNotNull, desc } from "drizzle-orm";

// Only revive if chat has been silent for at least this long
const SILENCE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
// Don't revive if a human sent a message within this window (active convo)
const ACTIVE_CHAT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export const reviveIdleRooms = inngest.createFunction(
  { id: "revive-idle-rooms", retries: 0, triggers: [{ cron: "*/5 * * * *" }] },
  async ({ step }) => {
    const activeRooms = await step.run("find-active-rooms", async () => {
      return db
        .select({ id: rooms.id, name: rooms.name })
        .from(rooms)
        .where(eq(rooms.free_will_enabled, true));
    });

    if (!activeRooms.length) return { skipped: true, reason: "no_rooms" };

    const now = Date.now();
    const cutoff = new Date(now - SILENCE_THRESHOLD_MS);
    const activeChatCutoff = new Date(now - ACTIVE_CHAT_WINDOW_MS);
    const revived: string[] = [];

    for (const room of activeRooms) {
      await step.run(`check-room-${room.id}`, async () => {
        // Must have at least one human and one shape
        const humanMember = await db.query.room_members.findFirst({
          where: and(eq(room_members.room_id, room.id), isNotNull(room_members.user_id)),
        });
        if (!humanMember) return;

        const shapeMember = await db.query.room_members.findFirst({
          where: and(eq(room_members.room_id, room.id), isNotNull(room_members.shape_id)),
        });
        if (!shapeMember) return;

        // Fetch last 2 messages to check activity
        const lastMessages = await db
          .select({ created_at: messages.created_at, sender_user_id: messages.sender_user_id })
          .from(messages)
          .where(eq(messages.room_id, room.id))
          .orderBy(desc(messages.created_at))
          .limit(2);

        if (!lastMessages.length) return;

        const lastAt = new Date(lastMessages[0].created_at ?? 0);

        // Skip if chat is still active (last message within silence threshold)
        if (lastAt >= cutoff) return;

        // Skip if a human sent a message recently — that means it's an active
        // conversation where a shape already responded and humans are reading/thinking
        const recentHumanMessage = lastMessages.find(
          (m) => m.sender_user_id && new Date(m.created_at ?? 0) >= activeChatCutoff
        );
        if (recentHumanMessage) return;

        await inngest.send({
          name: EVENTS.TIME_ELAPSED,
          data: { roomId: room.id, elapsed: "2m", triggeredAt: new Date().toISOString() },
        });

        revived.push(room.id);
      });
    }

    return { revived: revived.length, roomIds: revived };
  }
);
