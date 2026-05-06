import { NextRequest, NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { room_members } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.text();
  const params = new URLSearchParams(body);
  const socketId = params.get("socket_id")!;
  const channelName = params.get("channel_name")!;

  // Extract room ID from channel name: private-room-{roomId}
  const roomId = channelName.replace("private-room-", "");

  const member = await db.query.room_members.findFirst({
    where: and(eq(room_members.room_id, roomId), eq(room_members.user_id, session.user.id)),
  });

  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const authResponse = pusherServer.authorizeChannel(socketId, channelName);
  return NextResponse.json(authResponse);
}
