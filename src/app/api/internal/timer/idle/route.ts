import { NextRequest, NextResponse } from "next/server";
import { inngest, EVENTS } from "@/lib/inngest/client";
import { db } from "@/lib/db";
import { rooms, room_members } from "@/lib/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";

function requireInternalSecret(req: NextRequest): boolean {
  return req.headers.get("x-internal-secret") === process.env.INTERNAL_API_SECRET;
}

export async function POST(req: NextRequest) {
  if (!requireInternalSecret(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { roomId, elapsed } = await req.json();

  // Verify room has humans
  const humanMember = await db.query.room_members.findFirst({
    where: and(eq(room_members.room_id, roomId), isNotNull(room_members.user_id)),
  });

  if (!humanMember) {
    return NextResponse.json({ skipped: true, reason: "no_humans" });
  }

  await inngest.send({
    name: EVENTS.TIME_ELAPSED,
    data: { roomId, elapsed, triggeredAt: new Date().toISOString() },
  });

  return NextResponse.json({ ok: true });
}
