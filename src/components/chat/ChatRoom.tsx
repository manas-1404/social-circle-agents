"use client";

import { useEffect, useState, useCallback } from "react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { PresenceList } from "./PresenceList";
import { InviteButton } from "./InviteButton";
import { subscribeToRoom } from "@/lib/pusher/client";
import type { Message } from "@/lib/db/schema";
import type { TypingShape } from "./TypingIndicator";

type ShapeMember = { id: string; display_name: string; avatar_url?: string | null };
type HumanMember = { id: string; display_name: string };

type ChatRoomProps = {
  roomId: string;
  roomName: string;
  inviteCode?: string | null;
  initialMessages: (Message & { sender_display_name?: string; sender_avatar?: string | null })[];
  currentUserId: string;
  shapes: ShapeMember[];
  humans: HumanMember[];
};

export function ChatRoom({
  roomId,
  roomName,
  inviteCode,
  initialMessages,
  currentUserId,
  shapes: initialShapes,
  humans: initialHumans,
}: ChatRoomProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [typers, setTypers] = useState<TypingShape[]>([]);
  const [shapes, setShapes] = useState<ShapeMember[]>(initialShapes);
  const [humans, setHumans] = useState<HumanMember[]>(initialHumans);

  useEffect(() => {
    localStorage.setItem(`room_visited_${roomId}`, new Date().toISOString());
  }, [roomId]);

  useEffect(() => {
    const unsub = subscribeToRoom(roomId, {
      onMessage: (data) => {
        const msg = data as Message & { sender_display_name?: string; sender_avatar?: string | null };
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
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
      onMemberJoined: (data) => {
        const member = data as { type: "shape" | "user"; id: string; display_name: string; avatar_url?: string | null };
        if (member.type === "shape") {
          setShapes((prev) => {
            if (prev.some((s) => s.id === member.id)) return prev;
            return [...prev, { id: member.id, display_name: member.display_name, avatar_url: member.avatar_url }];
          });
        } else {
          setHumans((prev) => {
            if (prev.some((h) => h.id === member.id)) return prev;
            return [...prev, { id: member.id, display_name: member.display_name }];
          });
        }
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
    <div className="flex h-full max-h-full bg-zinc-950 overflow-hidden">
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b border-zinc-800/60 px-4 py-3 flex items-center gap-3 bg-zinc-950">
          <div className="flex flex-col flex-1">
            <h1 className="text-base font-bold text-zinc-100">{roomName}</h1>
            <span className="text-sm text-zinc-500">
              {shapes.length} shape{shapes.length !== 1 ? "s" : ""} · {humans.length} human{humans.length !== 1 ? "s" : ""}
            </span>
          </div>
          {inviteCode && <InviteButton inviteCode={inviteCode} />}
        </div>

        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          typers={typers}
          onLoadMore={messages.length >= 50 ? handleLoadMore : undefined}
        />

        <MessageInput onSend={handleSend} />
      </div>

      <div className="hidden md:block w-52 border-l border-zinc-800/60 overflow-y-auto bg-zinc-950">
        <PresenceList roomId={roomId} shapes={shapes} humans={humans} currentUserId={currentUserId} />
      </div>
    </div>
  );
}
