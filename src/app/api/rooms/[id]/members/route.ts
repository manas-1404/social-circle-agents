import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { room_members, rooms, shapes, users } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { triggerRoomEvent } from "@/lib/pusher/server";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: roomId } = await ctx.params;

  // Only owner can add members
  const ownerMember = await db.query.room_members.findFirst({
    where: and(
      eq(room_members.room_id, roomId),
      eq(room_members.user_id, session.user.id),
      eq(room_members.role, "owner")
    ),
  });
  if (!ownerMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { user_id, shape_id } = body;
  if (!user_id && !shape_id) {
    return NextResponse.json({ error: "user_id or shape_id required" }, { status: 400 });
  }

  const [member] = await db
    .insert(room_members)
    .values({ room_id: roomId, user_id, shape_id, role: "member" })
    .returning();

  // Broadcast to all room members so their UI updates live
  if (shape_id) {
    const shape = await db.query.shapes.findFirst({ where: eq(shapes.id, shape_id) });
    if (shape) {
      await triggerRoomEvent(roomId, "member.joined", {
        type: "shape",
        id: shape.id,
        display_name: shape.persona_kernel.identity.display_name,
        avatar_url: shape.avatar_url,
      });
    }
  } else if (user_id) {
    const user = await db.query.users.findFirst({ where: eq(users.id, user_id) });
    if (user) {
      await triggerRoomEvent(roomId, "member.joined", {
        type: "user",
        id: user.id,
        display_name: user.name,
      });
    }
  }

  return NextResponse.json(member, { status: 201 });
}
