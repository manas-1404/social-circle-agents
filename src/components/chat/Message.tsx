"use client";

import { useState } from "react";
import type { Message as MessageType } from "@/lib/db/schema";
import { containsProfanity, PROFANITY_ERROR } from "@/lib/profanity-filter";

type MessageProps = {
  message: MessageType & {
    sender_display_name?: string;
    sender_avatar?: string | null;
  };
  isOwnMessage: boolean;
  onEdit?: (messageId: string, newContent: string) => Promise<void>;
};

export function Message({ message, isOwnMessage, onEdit }: MessageProps) {
  const isShape = !!message.sender_shape_id;
  const isOwnHuman = isOwnMessage && !isShape;
  const name = message.sender_display_name ?? (isShape ? "Shape" : isOwnHuman ? "You" : "User");
  const initial = name[0]?.toUpperCase();
  const time = message.created_at
    ? new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  async function handleSaveEdit() {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === message.content) { setEditing(false); return; }

    if (containsProfanity(trimmed)) {
      setEditError(PROFANITY_ERROR);
      return;
    }

    setSaving(true);
    setEditError(null);
    try {
      await onEdit?.(message.id, trimmed);
      setEditing(false);
    } catch {
      setEditError("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    setEditing(false);
    setEditValue(message.content);
    setEditError(null);
  }

  return (
    <div className={`flex gap-3 px-4 py-2 group ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}>
      <div className="flex-shrink-0 mt-0.5">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
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

      <div className={`flex flex-col max-w-[80%] ${isOwnMessage ? "items-end" : "items-start"}`}>
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-sm font-semibold ${
              isShape ? "text-violet-300" : isOwnMessage ? "text-zinc-300" : "text-emerald-300"
            }`}
          >
            {name}
          </span>
          {isShape && (
            <span className="text-xs text-violet-400 bg-violet-950/60 border border-violet-900/40 rounded px-1.5 py-px">
              AI
            </span>
          )}
          <span className="text-xs text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">{time}</span>
          {isOwnHuman && !editing && onEdit && (
            <button
              onClick={() => { setEditValue(message.content); setEditing(true); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-zinc-300"
              title="Edit message"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          )}
        </div>

        {editing ? (
          <div className="w-full">
            <textarea
              value={editValue}
              onChange={(e) => { setEditValue(e.target.value); if (editError) setEditError(null); }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSaveEdit(); }
                if (e.key === "Escape") handleCancelEdit();
              }}
              rows={2}
              autoFocus
              className="w-full rounded-lg bg-zinc-800 border border-zinc-600 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-400 resize-none"
            />
            {editError && <p className="text-xs text-red-400 mt-1">{editError}</p>}
            <div className="flex items-center gap-2 mt-1.5">
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="text-xs px-2.5 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                onClick={handleCancelEdit}
                className="text-xs px-2.5 py-1 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-300 transition-colors"
              >
                Cancel
              </button>
              <span className="text-xs text-zinc-600">Esc to cancel</span>
            </div>
          </div>
        ) : (
          <div
            className={`rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
              isOwnMessage
                ? "bg-zinc-800 text-zinc-100 rounded-tr-sm"
                : isShape
                ? "bg-violet-950/50 text-zinc-100 rounded-tl-sm border border-violet-900/40"
                : "bg-zinc-800/70 text-zinc-100 rounded-tl-sm border border-zinc-700/50"
            }`}
          >
            {message.content}
            {message.is_edited && (
              <span className="ml-1.5 text-xs text-zinc-500">(edited)</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
