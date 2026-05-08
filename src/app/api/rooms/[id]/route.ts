import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getRoomWithMembers, getRecentMessages } from "@/lib/db/queries";
import { rooms, room_members, messages, director_runs, memories, shape_state } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { cleanupRoomRedisKeys } from "@/lib/redis";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;

  const member = await db.query.room_members.findFirst({
    where: and(eq(room_members.room_id, id), eq(room_members.user_id, session.user.id)),
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const data = await getRoomWithMembers(id);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const recentMessages = await getRecentMessages(id, 50);
  return NextResponse.json({ ...data, messages: recentMessages });
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;

  const room = await db.query.rooms.findFirst({ where: eq(rooms.id, id) });
  if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (room.owner_id !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.delete(shape_state).where(eq(shape_state.room_id, id));
  await db.delete(director_runs).where(eq(director_runs.room_id, id));
  await db.delete(memories).where(eq(memories.room_id, id));
  await db.delete(messages).where(eq(messages.room_id, id));
  await db.delete(room_members).where(eq(room_members.room_id, id));
  await db.delete(rooms).where(eq(rooms.id, id));

  await cleanupRoomRedisKeys(id);

  return new NextResponse(null, { status: 204 });
}
