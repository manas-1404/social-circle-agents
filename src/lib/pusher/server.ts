import Pusher from "pusher";

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export async function triggerRoomEvent(
  roomId: string,
  event: string,
  data: unknown
) {
  return pusherServer.trigger(`private-room-${roomId}`, event, data);
}

export async function triggerTypingStart(roomId: string, shapeName: string, shapeId: string) {
  return triggerRoomEvent(roomId, "typing.start", { shape_id: shapeId, shape_name: shapeName });
}

export async function triggerTypingStop(roomId: string, shapeId: string) {
  return triggerRoomEvent(roomId, "typing.stop", { shape_id: shapeId });
}
