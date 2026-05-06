"use client";

import { useEffect, useRef } from "react";
import { Message } from "./Message";
import { TypingIndicator, type TypingShape } from "./TypingIndicator";
import type { Message as MessageType } from "@/lib/db/schema";

type MessageListProps = {
  messages: (MessageType & { sender_display_name?: string; sender_avatar?: string | null })[];
  currentUserId: string;
  typers: TypingShape[];
  onLoadMore?: () => void;
};

export function MessageList({ messages, currentUserId, typers, onLoadMore }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, typers.length]);

  return (
    <div className="flex-1 overflow-y-auto py-4 space-y-1">
      {onLoadMore && (
        <div className="text-center py-2">
          <button
            onClick={onLoadMore}
            className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 underline"
          >
            Load older messages
          </button>
        </div>
      )}
      {messages.map((msg) => (
        <Message
          key={msg.id}
          message={msg}
          isOwnMessage={msg.sender_user_id === currentUserId}
        />
      ))}
      <TypingIndicator typers={typers} />
      <div ref={bottomRef} />
    </div>
  );
}
