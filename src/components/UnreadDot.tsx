"use client";

import { useEffect, useState } from "react";

type Props = {
  roomId: string;
  lastMessageAt: string | null;
};

export function UnreadDot({ roomId, lastMessageAt }: Props) {
  const [unread, setUnread] = useState(false);

  useEffect(() => {
    if (!lastMessageAt) return;
    const key = `room_visited_${roomId}`;
    const lastVisited = localStorage.getItem(key);
    if (!lastVisited) {
      setUnread(true);
      return;
    }
    setUnread(new Date(lastMessageAt) > new Date(lastVisited));
  }, [roomId, lastMessageAt]);

  if (!unread) return null;

  return (
    <span className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0" />
  );
}
