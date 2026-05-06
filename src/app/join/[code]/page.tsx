import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { rooms, room_members } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { triggerRoomEvent } from "@/lib/pusher/server";

export default async function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect(`/sign-in?next=/join/${code}`);
  }

  const room = await db.query.rooms.findFirst({
    where: eq(rooms.invite_code, code),
  });

  if (!room) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">Invalid or expired invite link.</p>
      </div>
    );
  }

  // Check if already a member
  const existing = await db.query.room_members.findFirst({
    where: and(
      eq(room_members.room_id, room.id),
      eq(room_members.user_id, session.user.id)
    ),
  });

  if (!existing) {
    await db.insert(room_members).values({
      room_id: room.id,
      user_id: session.user.id,
      role: "member",
    });
    await triggerRoomEvent(room.id, "member.joined", {
      type: "user",
      id: session.user.id,
      display_name: session.user.name,
    });
  }

  redirect(`/rooms/${room.id}`);
}
