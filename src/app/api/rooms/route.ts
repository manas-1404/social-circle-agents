import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rooms, room_members } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { getUserRooms } from "@/lib/db/queries";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userRooms = await getUserRooms(session.user.id);
  return NextResponse.json(userRooms.map((r) => r.room));
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, mode = "casual" } = body;
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const [room] = await db
    .insert(rooms)
    .values({ name, owner_id: session.user.id, mode })
    .returning();

  await db.insert(room_members).values({
    room_id: room.id,
    user_id: session.user.id,
    role: "owner",
  });

  return NextResponse.json(room, { status: 201 });
}
