"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Message } from "./Message";
import { TypingIndicator, type TypingShape } from "./TypingIndicator";
import type { Message as MessageType } from "@/lib/db/schema";

const GAP_THRESHOLD_MS = 5 * 60 * 1000;

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
  onLoadMore?: () => Promise<void>;
  onEdit?: (messageId: string, newContent: string) => Promise<void>;
};

export function MessageList({ messages, currentUserId, typers, onLoadMore, onEdit }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const savedScrollHeight = useRef(0);
  const prevFirstId = useRef<string | undefined>(undefined);
  const prevLastId = useRef<string | undefined>(undefined);
  const isLoadingRef = useRef(false);
  const [showSpinner, setShowSpinner] = useState(false);

  // Initial scroll to bottom (instant, before first paint)
  useLayoutEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" as ScrollBehavior });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to bottom when a new message is appended (last ID changed)
  useEffect(() => {
    const lastId = messages[messages.length - 1]?.id;
    if (lastId && lastId !== prevLastId.current) {
      // Only smooth-scroll if this isn't the initial population
      if (prevLastId.current !== undefined) {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
      prevLastId.current = lastId;
    }
  }, [messages]);

  // Scroll to bottom when typing indicators appear
  useEffect(() => {
    if (typers.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [typers.length]);

  // After prepending older messages, restore scroll position so the view doesn't jump
  useLayoutEffect(() => {
    const firstId = messages[0]?.id;
    if (prevFirstId.current && firstId !== prevFirstId.current && scrollRef.current) {
      const newScrollHeight = scrollRef.current.scrollHeight;
      scrollRef.current.scrollTop = newScrollHeight - savedScrollHeight.current;
    }
    prevFirstId.current = firstId;
  }, [messages]);

  // IntersectionObserver: load more when sentinel near top becomes visible
  useEffect(() => {
    if (!onLoadMore) return;
    const sentinel = sentinelRef.current;
    const scroller = scrollRef.current;
    if (!sentinel || !scroller) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting || isLoadingRef.current) return;
        isLoadingRef.current = true;
        setShowSpinner(true);
        savedScrollHeight.current = scroller.scrollHeight;
        await onLoadMore();
        isLoadingRef.current = false;
        setShowSpinner(false);
      },
      { root: scroller, rootMargin: "120px", threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [onLoadMore]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto py-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600"
    >
      {/* Sentinel — watched by IntersectionObserver */}
      <div ref={sentinelRef} className="h-px" />

      {/* Spinner while fetching older messages */}
      {showSpinner && (
        <div className="flex justify-center py-4">
          <svg className="animate-spin w-4 h-4 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </div>
      )}

      {/* Beginning-of-history marker */}
      {!onLoadMore && messages.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 mb-1">
          <div className="flex-1 h-px bg-zinc-800/50" />
          <span className="text-xs text-zinc-700 flex-shrink-0">Beginning of conversation</span>
          <div className="flex-1 h-px bg-zinc-800/50" />
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
