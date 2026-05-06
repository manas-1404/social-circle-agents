"use client";

import type { Message as MessageType } from "@/lib/db/schema";

type MessageProps = {
  message: MessageType & {
    sender_display_name?: string;
    sender_avatar?: string | null;
  };
  isOwnMessage: boolean;
};

export function Message({ message, isOwnMessage }: MessageProps) {
  const isShape = !!message.sender_shape_id;
  const name = message.sender_display_name ?? (isShape ? "Shape" : "You");
  const time = message.created_at
    ? new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className={`flex gap-3 px-4 py-2 ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}>
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-semibold uppercase">
        {name[0]}
      </div>
      <div className={`flex flex-col max-w-xs md:max-w-md ${isOwnMessage ? "items-end" : "items-start"}`}>
        <div className="flex items-baseline gap-2 mb-1">
          <span className={`text-xs font-medium ${isShape ? "text-violet-600 dark:text-violet-400" : "text-zinc-700 dark:text-zinc-300"}`}>
            {name}
          </span>
          <span className="text-xs text-zinc-400">{time}</span>
        </div>
        <div
          className={`rounded-2xl px-4 py-2 text-sm leading-relaxed ${
            isOwnMessage
              ? "bg-blue-600 text-white rounded-tr-sm"
              : isShape
              ? "bg-violet-100 dark:bg-violet-900/40 text-zinc-900 dark:text-zinc-100 rounded-tl-sm"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-sm"
          }`}
        >
          {message.content}
        </div>
        {isShape && message.strategy && (
          <span className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{message.strategy}</span>
        )}
      </div>
    </div>
  );
}
