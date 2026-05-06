import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { inngest, EVENTS } from "@/lib/inngest/client";
import { room_members } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: roomId } = await ctx.params;

  const member = await db.query.room_members.findFirst({
    where: and(eq(room_members.room_id, roomId), eq(room_members.user_id, session.user.id)),
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await inngest.send({
    name: EVENTS.IDLE_CONSOLIDATE,
    data: { roomId, userId: session.user.id, trigger: "sleep_command" },
  });

  return NextResponse.json({ ok: true });
}
