"use client";

import type { Message as MessageType } from "@/lib/db/schema";

type MessageProps = {
  message: MessageType & {
    sender_display_name?: string;
    sender_avatar?: string | null;
  };
  isOwnMessage: boolean;
};

function ShapeIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="inline-block">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
  );
}

function HumanIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="inline-block">
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  );
}

export function Message({ message, isOwnMessage }: MessageProps) {
  const isShape = !!message.sender_shape_id;
  const name = message.sender_display_name ?? (isShape ? "Shape" : "You");
  const initial = name[0]?.toUpperCase();
  const time = message.created_at
    ? new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className={`flex gap-3 px-4 py-2 ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className="flex-shrink-0 flex flex-col items-center gap-1">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            isShape
              ? "bg-violet-200 dark:bg-violet-800 text-violet-700 dark:text-violet-200"
              : isOwnMessage
              ? "bg-blue-500 text-white"
              : "bg-emerald-200 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-200"
          }`}
        >
          {initial}
        </div>
        {/* Type badge under avatar */}
        <span
          className={`text-[9px] font-semibold tracking-wide flex items-center gap-0.5 ${
            isShape ? "text-violet-500 dark:text-violet-400" : "text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {isShape ? <ShapeIcon /> : <HumanIcon />}
          {isShape ? "AI" : "you"}
        </span>
      </div>

      {/* Bubble */}
      <div className={`flex flex-col max-w-xs md:max-w-md ${isOwnMessage ? "items-end" : "items-start"}`}>
        <div className="flex items-baseline gap-2 mb-1">
          <span
            className={`text-xs font-semibold ${
              isShape
                ? "text-violet-600 dark:text-violet-400"
                : isOwnMessage
                ? "text-blue-600 dark:text-blue-400"
                : "text-emerald-700 dark:text-emerald-400"
            }`}
          >
            {name}
          </span>
          {isShape && (
            <span className="text-[10px] bg-violet-100 dark:bg-violet-900/50 text-violet-500 dark:text-violet-400 rounded-full px-1.5 py-0.5 font-medium">
              shape
            </span>
          )}
          <span className="text-xs text-zinc-400">{time}</span>
        </div>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isOwnMessage
              ? "bg-blue-600 text-white rounded-tr-sm"
              : isShape
              ? "bg-violet-50 dark:bg-violet-900/30 text-zinc-900 dark:text-zinc-100 rounded-tl-sm border border-violet-200 dark:border-violet-800"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-sm"
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
