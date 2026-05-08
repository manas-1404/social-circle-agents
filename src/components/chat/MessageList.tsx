"use client";

import { useEffect, useRef } from "react";
import { Message } from "./Message";
import { TypingIndicator, type TypingShape } from "./TypingIndicator";
import type { Message as MessageType } from "@/lib/db/schema";

const GAP_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

function formatGap(ms: number): string {
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} later`;
  const hrs = Math.floor(mins / 60);
  return `${hrs} hour${hrs !== 1 ? "s" : ""} later`;
}

function GapDivider({ ms }: { ms: number }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex-1 h-px bg-zinc-800" />
      <span className="text-xs text-zinc-600 flex items-center gap-1.5 flex-shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-violet-700 inline-block" />
        {formatGap(ms)}
      </span>
      <div className="flex-1 h-px bg-zinc-800" />
    </div>
  );
}

type MessageListProps = {
  messages: (MessageType & { sender_display_name?: string; sender_avatar?: string | null })[];
  currentUserId: string;
  typers: TypingShape[];
  onLoadMore?: () => void;
  onEdit?: (messageId: string, newContent: string) => Promise<void>;
};

export function MessageList({ messages, currentUserId, typers, onLoadMore, onEdit }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, typers.length]);

  return (
    <div className="flex-1 overflow-y-auto py-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600">
      {onLoadMore && (
        <div className="text-center py-2">
          <button
            onClick={onLoadMore}
            className="text-sm text-zinc-500 hover:text-zinc-300 underline"
          >
            Load older messages
          </button>
        </div>
      )}
      {messages.map((msg, i) => {
        const prev = messages[i - 1];
        const gap = prev
          ? new Date(msg.created_at ?? 0).getTime() - new Date(prev.created_at ?? 0).getTime()
          : 0;
        const showGap = gap >= GAP_THRESHOLD_MS;

        return (
          <div key={msg.id}>
            {showGap && <GapDivider ms={gap} />}
            <Message
              message={msg}
              isOwnMessage={msg.sender_user_id === currentUserId}
              onEdit={onEdit}
            />
          </div>
        );
      })}
      <TypingIndicator typers={typers} />
      <div ref={bottomRef} />
    </div>
  );
}
