import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { messages, room_members } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { triggerRoomEvent } from "@/lib/pusher/server";
import { pushRoomEvent, pushLastMessage } from "@/lib/redis";
import { inngest, EVENTS } from "@/lib/inngest/client";
import { eq, and, desc, lt } from "drizzle-orm";
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

  const query = db
    .select()
    .from(messages)
    .where(
      before
        ? and(eq(messages.room_id, id), lt(messages.created_at, new Date(before)))
        : eq(messages.room_id, id)
    )
    .orderBy(desc(messages.created_at))
    .limit(50);

  const rows = await query;
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
