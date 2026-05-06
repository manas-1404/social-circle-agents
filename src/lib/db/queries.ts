import { db } from "./index";
import { messages, rooms, room_members, shapes, shape_state, users } from "./schema";
import { eq, and, desc, gt, sql, max } from "drizzle-orm";

export async function getRecentMessages(roomId: string, limit = 20) {
  const rows = await db
    .select({
      id: messages.id,
      room_id: messages.room_id,
      sender_user_id: messages.sender_user_id,
      sender_shape_id: messages.sender_shape_id,
      content: messages.content,
      addressing: messages.addressing,
      strategy: messages.strategy,
      reply_to_message_id: messages.reply_to_message_id,
      director_run_id: messages.director_run_id,
      tokens_used: messages.tokens_used,
      created_at: messages.created_at,
      sender_display_name: sql<string>`COALESCE(${shapes.display_name}, ${users.name})`,
      sender_avatar: shapes.avatar_url,
    })
    .from(messages)
    .leftJoin(shapes, eq(messages.sender_shape_id, shapes.id))
    .leftJoin(users, eq(messages.sender_user_id, users.id))
    .where(eq(messages.room_id, roomId))
    .orderBy(desc(messages.created_at))
    .limit(limit);

  return rows.reverse();
}

export async function getRoomWithMembers(roomId: string) {
  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, roomId),
  });
  if (!room) return null;

  const members = await db
    .select({
      id: room_members.id,
      user_id: room_members.user_id,
      shape_id: room_members.shape_id,
      role: room_members.role,
    })
    .from(room_members)
    .where(eq(room_members.room_id, roomId));

  return { room, members };
}

export async function getShapesInRoom(roomId: string) {
  return db
    .select({ shape: shapes })
    .from(room_members)
    .innerJoin(shapes, eq(room_members.shape_id, shapes.id))
    .where(eq(room_members.room_id, roomId));
}

export async function getShapeState(shapeId: string, roomId: string) {
  return db.query.shape_state.findFirst({
    where: and(
      eq(shape_state.shape_id, shapeId),
      eq(shape_state.room_id, roomId)
    ),
  });
}

export async function upsertShapeState(
  shapeId: string,
  roomId: string,
  updates: Partial<typeof shape_state.$inferInsert>
) {
  const existing = await getShapeState(shapeId, roomId);
  if (existing) {
    return db
      .update(shape_state)
      .set(updates)
      .where(
        and(
          eq(shape_state.shape_id, shapeId),
          eq(shape_state.room_id, roomId)
        )
      );
  }
  return db.insert(shape_state).values({
    shape_id: shapeId,
    room_id: roomId,
    ...updates,
  });
}

export async function incrementRoomTokens(roomId: string, tokens: number) {
  await db
    .update(rooms)
    .set({ daily_tokens_used: sql`${rooms.daily_tokens_used} + ${tokens}` })
    .where(eq(rooms.id, roomId));
}

export async function getUserRooms(userId: string) {
  return db
    .select({
      room: rooms,
      lastMessageAt: max(messages.created_at),
    })
    .from(room_members)
    .innerJoin(rooms, eq(room_members.room_id, rooms.id))
    .leftJoin(messages, eq(messages.room_id, rooms.id))
    .where(eq(room_members.user_id, userId))
    .groupBy(rooms.id);
}
