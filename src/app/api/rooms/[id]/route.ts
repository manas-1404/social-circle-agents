import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getRoomWithMembers, getRecentMessages } from "@/lib/db/queries";
import { room_members } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

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
