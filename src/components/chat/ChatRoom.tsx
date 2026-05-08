"use client";

import { useEffect, useState, useCallback } from "react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { PresenceList } from "./PresenceList";
import { InviteButton } from "./InviteButton";
import { UnreadDot } from "@/components/UnreadDot";
import { subscribeToRoom } from "@/lib/pusher/client";
import type { Message } from "@/lib/db/schema";
import type { TypingShape } from "./TypingIndicator";
import Link from "next/link";

type ShapeMember = { id: string; display_name: string; avatar_url?: string | null };
type HumanMember = { id: string; display_name: string };
type RoomSummary = { id: string; name: string; lastMessageAt: string | null };

type ChatRoomProps = {
  roomId: string;
  roomName: string;
  inviteCode?: string | null;
  initialMessages: (Message & { sender_display_name?: string; sender_avatar?: string | null })[];
  currentUserId: string;
  shapes: ShapeMember[];
  humans: HumanMember[];
  rooms: RoomSummary[];
};

export function ChatRoom({
  roomId,
  roomName,
  inviteCode,
  initialMessages,
  currentUserId,
  shapes: initialShapes,
  humans: initialHumans,
  rooms,
}: ChatRoomProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [typers, setTypers] = useState<TypingShape[]>([]);
  const [shapes, setShapes] = useState<ShapeMember[]>(initialShapes);
  const [humans, setHumans] = useState<HumanMember[]>(initialHumans);
  const [hasMore, setHasMore] = useState(initialMessages.length >= 25);

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
      onMessageUpdated: (data) => {
        const { id, content, is_edited } = data as { id: string; content: string; is_edited: boolean };
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, content, is_edited } : m))
        );
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

  const handleEdit = useCallback(async (messageId: string, newContent: string) => {
    const res = await fetch(`/api/rooms/${roomId}/messages/${messageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newContent }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Failed to edit message");
    }
  }, [roomId]);

  const handleLoadMore = useCallback(async () => {
    const oldest = messages[0];
    if (!oldest) return;
    const res = await fetch(
      `/api/rooms/${roomId}/messages?before=${oldest.created_at?.toISOString()}`
    );
    if (!res.ok) return;
    const older: typeof messages = await res.json();
    if (older.length < 25) setHasMore(false);
    if (older.length > 0) setMessages((prev) => [...older, ...prev]);
  }, [messages, roomId]);

  return (
    <div className="flex h-full overflow-hidden bg-zinc-950">

      {/* ── Left sidebar: rooms list ── */}
      <div className="hidden lg:flex flex-col w-64 flex-shrink-0 border-r border-zinc-800/60">

        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800/40 flex-shrink-0">
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Chats</span>
          <Link
            href="/rooms"
            className="w-6 h-6 rounded flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
            title="All chats"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </Link>
        </div>

        {/* Rooms list */}
        <div className="flex-1 overflow-y-auto py-2">
          {rooms.map((room) => {
            const isActive = room.id === roomId;
            return (
              <Link
                key={room.id}
                href={`/rooms/${room.id}`}
                className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg transition-all group ${
                  isActive
                    ? "bg-violet-950/70 border border-violet-800/50"
                    : "hover:bg-zinc-800/60 border border-transparent"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
                    isActive
                      ? "bg-violet-800/70 border border-violet-700/50 text-violet-100"
                      : "bg-zinc-800 border border-zinc-700/40 text-zinc-400 group-hover:text-zinc-200"
                  }`}
                >
                  {room.name[0].toUpperCase()}
                </div>
                <span
                  className={`text-sm font-medium flex-1 truncate transition-colors ${
                    isActive ? "text-zinc-100" : "text-zinc-400 group-hover:text-zinc-200"
                  }`}
                >
                  {room.name}
                </span>
                {!isActive && (
                  <UnreadDot roomId={room.id} lastMessageAt={room.lastMessageAt} />
                )}
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Center: messages + input ── */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">

        {/* Top bar — always visible, houses room name + invite */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800/60 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-zinc-100 truncate">{roomName}</h1>
            <p className="text-xs text-zinc-500">
              {shapes.length} shape{shapes.length !== 1 ? "s" : ""} · {humans.length} human{humans.length !== 1 ? "s" : ""}
            </p>
          </div>
          {inviteCode && <InviteButton inviteCode={inviteCode} />}
        </div>

        {/* No shapes banner */}
        {shapes.length === 0 && (
          <div className="mx-4 mt-3 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/60 px-4 py-3 flex items-start gap-3 flex-shrink-0">
            <span className="text-violet-400 mt-0.5">✦</span>
            <div>
              <p className="text-sm font-semibold text-zinc-200">No shapes in this room yet</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Add a shape from the panel on the right or{" "}
                <Link href="/shapes/new" className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors">
                  create one
                </Link>.
              </p>
            </div>
          </div>
        )}

        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          typers={typers}
          onLoadMore={hasMore ? handleLoadMore : undefined}
          onEdit={handleEdit}
        />

        <MessageInput onSend={handleSend} />
      </div>

      {/* ── Right sidebar: presence ── */}
      <div className="hidden md:flex flex-col w-64 flex-shrink-0 border-l border-zinc-800/60 overflow-y-auto">
        <div className="px-4 pt-4 pb-3 border-b border-zinc-800/40 flex-shrink-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600">Members</p>
        </div>
        <PresenceList roomId={roomId} shapes={shapes} humans={humans} currentUserId={currentUserId} />
      </div>

    </div>
  );
}
