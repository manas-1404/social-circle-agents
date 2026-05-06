import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { messages, room_members, shapes, users } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { triggerRoomEvent } from "@/lib/pusher/server";
import { pushRoomEvent, pushLastMessage } from "@/lib/redis";
import { inngest, EVENTS } from "@/lib/inngest/client";
import { eq, and, desc, lt, sql } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const before = req.nextUrl.searchParams.get("before");

  const member = await db.query.room_members.findFirst({
    where: and(eq(room_members.room_id, id), eq(room_members.user_id, session.user.id)),
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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
    .where(
      before
        ? and(eq(messages.room_id, id), lt(messages.created_at, new Date(before)))
        : eq(messages.room_id, id)
    )
    .orderBy(desc(messages.created_at))
    .limit(50);

  return NextResponse.json(rows.reverse());
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: roomId } = await ctx.params;

  const member = await db.query.room_members.findFirst({
    where: and(eq(room_members.room_id, roomId), eq(room_members.user_id, session.user.id)),
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { content } = body;
  if (!content?.trim()) return NextResponse.json({ error: "content required" }, { status: 400 });

  const [message] = await db
    .insert(messages)
    .values({
      room_id: roomId,
      sender_user_id: session.user.id,
      content: content.trim(),
    })
    .returning();

  // Fan-out to other clients immediately
  await triggerRoomEvent(roomId, "message.sent", {
    ...message,
    sender_display_name: session.user.name,
  });

  // Record last sender for loop guard
  await pushLastMessage(roomId, `user:${session.user.id}`);

  // Push to Redis stream → Inngest picks up
  await pushRoomEvent(roomId, {
    type: EVENTS.MESSAGE_SENT,
    roomId,
    messageId: message.id,
    senderId: session.user.id,
    content: content.trim(),
  });

  // Send to Inngest directly as well (belt-and-suspenders)
  await inngest.send({
    name: EVENTS.MESSAGE_SENT,
    data: {
      roomId,
      messageId: message.id,
      senderId: session.user.id,
      content: content.trim(),
    },
  });

  return NextResponse.json(message, { status: 201 });
}
