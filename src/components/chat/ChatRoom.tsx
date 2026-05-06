"use client";

import { useEffect, useState, useCallback } from "react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { PresenceList } from "./PresenceList";
import { subscribeToRoom } from "@/lib/pusher/client";
import type { Message } from "@/lib/db/schema";
import type { TypingShape } from "./TypingIndicator";

type ChatRoomProps = {
  roomId: string;
  roomName: string;
  initialMessages: (Message & { sender_display_name?: string; sender_avatar?: string | null })[];
  currentUserId: string;
  shapes: { id: string; display_name: string; avatar_url?: string | null }[];
};

export function ChatRoom({
  roomId,
  roomName,
  initialMessages,
  currentUserId,
  shapes,
}: ChatRoomProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [typers, setTypers] = useState<TypingShape[]>([]);

  useEffect(() => {
    const unsub = subscribeToRoom(roomId, {
      onMessage: (data) => {
        const msg = data as Message & { sender_display_name?: string; sender_avatar?: string | null };
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        // Remove from typers if shape just sent
        if (msg.sender_shape_id) {
          setTypers((prev) => prev.filter((t) => t.shapeId !== msg.sender_shape_id));
        }
      },
      onTypingStart: (data) => {
        const { shape_id, shape_name } = data as { shape_id: string; shape_name: string };
        setTypers((prev) => {
          if (prev.some((t) => t.shapeId === shape_id)) return prev;
          return [...prev, { shapeId: shape_id, shapeName: shape_name }];
        });
      },
      onTypingStop: (data) => {
        const { shape_id } = data as { shape_id: string };
        setTypers((prev) => prev.filter((t) => t.shapeId !== shape_id));
      },
    });
    return unsub;
  }, [roomId]);

  const handleSend = useCallback(
    async (content: string) => {
      const res = await fetch(`/api/rooms/${roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to send message");
    },
    [roomId]
  );

  const handleSleep = useCallback(async () => {
    await fetch(`/api/rooms/${roomId}/sleep`, { method: "POST" });
  }, [roomId]);

  const handleLoadMore = useCallback(async () => {
    const oldest = messages[0];
    if (!oldest) return;
    const res = await fetch(
      `/api/rooms/${roomId}/messages?before=${oldest.created_at?.toISOString()}`
    );
    if (!res.ok) return;
    const older = await res.json();
    setMessages((prev) => [...older, ...prev]);
  }, [messages, roomId]);

  return (
    <div className="flex h-full">
      {/* Chat area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-3">
          <div className="flex flex-col">
            <h1 className="font-semibold text-zinc-900 dark:text-zinc-100">{roomName}</h1>
            <span className="text-xs text-zinc-500">
              {shapes.length} shape{shapes.length !== 1 ? "s" : ""} active
            </span>
          </div>
        </div>

        {/* Messages */}
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          typers={typers}
          onLoadMore={messages.length >= 50 ? handleLoadMore : undefined}
        />

        {/* Input */}
        <MessageInput onSend={handleSend} onSleep={handleSleep} />
      </div>

      {/* Sidebar */}
      <div className="hidden md:block w-56 border-l border-zinc-200 dark:border-zinc-800 overflow-y-auto">
        <PresenceList roomId={roomId} shapes={shapes} />
      </div>
    </div>
  );
}
