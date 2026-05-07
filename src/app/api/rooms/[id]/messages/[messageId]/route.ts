import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { messages, room_members } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { triggerRoomEvent } from "@/lib/pusher/server";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { containsProfanity } from "@/lib/profanity-filter";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string; messageId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: roomId, messageId } = await ctx.params;

  // Verify room membership
  const member = await db.query.room_members.findFirst({
    where: and(eq(room_members.room_id, roomId), eq(room_members.user_id, session.user.id)),
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Verify message belongs to this user
  const message = await db.query.messages.findFirst({
    where: and(eq(messages.id, messageId), eq(messages.sender_user_id, session.user.id)),
  });
  if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 });

  const body = await req.json();
  const { content } = body;
  if (!content?.trim()) return NextResponse.json({ error: "content required" }, { status: 400 });

  if (containsProfanity(content.trim())) {
    return NextResponse.json({ error: "Message contains disallowed content" }, { status: 422 });
  }

  const [updated] = await db
    .update(messages)
    .set({ content: content.trim(), is_edited: true, updated_at: new Date() })
    .where(eq(messages.id, messageId))
    .returning();

  await triggerRoomEvent(roomId, "message.updated", {
    id: updated.id,
    content: updated.content,
    is_edited: true,
  });

  return NextResponse.json(updated);
}
