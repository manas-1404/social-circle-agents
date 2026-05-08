import { auth } from "@/lib/auth";
import { getRoomWithMembers, getRecentMessages, getShapesInRoom, getUserRooms } from "@/lib/db/queries";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { ChatRoom } from "@/components/chat/ChatRoom";
import { db } from "@/lib/db";
import { room_members, users } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: roomId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  // Verify membership
  const member = await db.query.room_members.findFirst({
    where: and(eq(room_members.room_id, roomId), eq(room_members.user_id, session.user.id)),
  });
  if (!member) notFound();

  const data = await getRoomWithMembers(roomId);
  if (!data) notFound();

  const initialMessages = await getRecentMessages(roomId, 50);
  const shapesInRoom = await getShapesInRoom(roomId);

  const shapes = shapesInRoom.map(({ shape }) => ({
    id: shape.id,
    display_name: shape.persona_kernel.identity.display_name,
    avatar_url: shape.avatar_url,
  }));

  const humanMemberIds = data.members
    .filter((m) => m.user_id)
    .map((m) => m.user_id as string);

  const humanUsers = humanMemberIds.length > 0
    ? await db.select({ id: users.id, name: users.name }).from(users).where(inArray(users.id, humanMemberIds))
    : [];

  const humans = humanUsers.map((u) => ({ id: u.id, display_name: u.name }));

  const allRooms = await getUserRooms(session.user.id);
  const roomList = allRooms.map(({ room, lastMessageAt }) => ({
    id: room.id,
    name: room.name,
    lastMessageAt: lastMessageAt ? String(lastMessageAt) : null,
  }));

  return (
    <ChatRoom
      roomId={roomId}
      roomName={data.room.name}
      inviteCode={data.room.invite_code}
      initialMessages={initialMessages}
      currentUserId={session.user.id}
      shapes={shapes}
      humans={humans}
      rooms={roomList}
    />
  );
}
