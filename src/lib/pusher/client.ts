"use client";

import PusherJs from "pusher-js";

let pusherClient: PusherJs | null = null;

export function getPusherClient(): PusherJs {
  if (!pusherClient) {
    pusherClient = new PusherJs(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: "/api/pusher/auth",
    });
  }
  return pusherClient;
}

export function subscribeToRoom(
  roomId: string,
  handlers: {
    onMessage?: (data: unknown) => void;
    onMessageUpdated?: (data: unknown) => void;
    onTypingStart?: (data: unknown) => void;
    onTypingStop?: (data: unknown) => void;
    onMemberJoined?: (data: unknown) => void;
    onMemberLeft?: (data: unknown) => void;
  }
) {
  const client = getPusherClient();
  const channel = client.subscribe(`private-room-${roomId}`);

  if (handlers.onMessage) channel.bind("message.sent", handlers.onMessage);
  if (handlers.onMessageUpdated) channel.bind("message.updated", handlers.onMessageUpdated);
  if (handlers.onTypingStart) channel.bind("typing.start", handlers.onTypingStart);
  if (handlers.onTypingStop) channel.bind("typing.stop", handlers.onTypingStop);
  if (handlers.onMemberJoined) channel.bind("member.joined", handlers.onMemberJoined);
  if (handlers.onMemberLeft) channel.bind("member.left", handlers.onMemberLeft);

  return () => client.unsubscribe(`private-room-${roomId}`);
}
