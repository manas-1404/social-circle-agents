import { NextRequest, NextResponse } from "next/server";
import { inngest, EVENTS } from "@/lib/inngest/client";
import { resetRoomUserMessageCount } from "@/lib/redis";

function requireInternalSecret(req: NextRequest): boolean {
  return req.headers.get("x-internal-secret") === process.env.INTERNAL_API_SECRET;
}

export async function POST(req: NextRequest) {
  if (!requireInternalSecret(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { roomId, senderId } = await req.json();

  await inngest.send({
    name: EVENTS.IDLE_CONSOLIDATE,
    data: { roomId, userId: senderId },
  });

  await resetRoomUserMessageCount(roomId, senderId);

  return NextResponse.json({ ok: true });
}
