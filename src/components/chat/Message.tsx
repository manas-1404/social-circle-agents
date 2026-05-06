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
  const isOwnHuman = isOwnMessage && !isShape;
  const name = message.sender_display_name ?? (isShape ? "Shape" : isOwnHuman ? "You" : "User");
  const initial = name[0]?.toUpperCase();
  const time = message.created_at
    ? new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className={`flex gap-2.5 px-4 py-1.5 group ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}>
      <div className="flex-shrink-0 mt-0.5">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
            isShape
              ? "bg-violet-900/70 text-violet-300 border border-violet-800/50"
              : isOwnMessage
              ? "bg-zinc-700 text-zinc-200"
              : "bg-emerald-900/60 text-emerald-300 border border-emerald-800/40"
          }`}
        >
          {initial}
        </div>
      </div>

      <div className={`flex flex-col max-w-xs md:max-w-md ${isOwnMessage ? "items-end" : "items-start"}`}>
        <div className="flex items-center gap-1.5 mb-1">
          <span
            className={`text-[11px] font-semibold ${
              isShape ? "text-violet-400" : isOwnMessage ? "text-zinc-400" : "text-emerald-400"
            }`}
          >
            {name}
          </span>
          {isShape && (
            <span className="text-[9px] text-violet-500/80 bg-violet-950/60 border border-violet-900/40 rounded px-1 py-px">
              AI
            </span>
          )}
          <span className="text-[10px] text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity">{time}</span>
        </div>
        <div
          className={`rounded-xl px-3.5 py-2 text-sm leading-relaxed ${
            isOwnMessage
              ? "bg-zinc-800 text-zinc-100 rounded-tr-sm"
              : isShape
              ? "bg-violet-950/50 text-zinc-100 rounded-tl-sm border border-violet-900/40"
              : "bg-zinc-800/70 text-zinc-100 rounded-tl-sm border border-zinc-700/50"
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
