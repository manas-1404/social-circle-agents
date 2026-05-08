"use client";

import { useState, useRef, type KeyboardEvent } from "react";
import { containsProfanity, PROFANITY_ERROR } from "@/lib/profanity-filter";

type MessageInputProps = {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
};

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleSend() {
    const content = value.trim();
    if (!content || sending) return;

    if (containsProfanity(content)) {
      setError(PROFANITY_ERROR);
      return;
    }

    setError(null);
    setSending(true);
    try {
      await onSend(content);
      setValue("");
      textareaRef.current?.focus();
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const canSend = !!value.trim() && !sending && !disabled;

  return (
    <div className="px-4 py-3 bg-zinc-950 border-t border-zinc-800/60">
      <div className={`flex items-end gap-2 bg-zinc-900 border rounded-xl px-3 py-2 focus-within:border-zinc-600 transition-colors ${error ? "border-red-500/60" : "border-zinc-800"}`}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => { setValue(e.target.value); if (error) setError(null); }}
          onKeyDown={handleKeyDown}
          placeholder="Message…"
          disabled={disabled || sending}
          rows={1}
          className="flex-1 resize-none bg-transparent text-base text-zinc-100 placeholder:text-zinc-500 focus:outline-none disabled:opacity-50 py-0.5"
          style={{ maxHeight: "120px", overflowY: "auto" }}
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
            canSend
              ? "bg-violet-600 hover:bg-violet-500 text-white"
              : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
          }`}
        >
          {sending ? (
            <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 19-7z" />
            </svg>
          )}
        </button>
      </div>
      {error ? (
        <p className="text-xs text-red-400 mt-1.5 ml-1">{error}</p>
      ) : (
        <p className="text-xs text-zinc-600 mt-1.5 ml-1">Enter to send · Shift+Enter for newline</p>
      )}
    </div>
  );
}
