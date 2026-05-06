"use client";

import { useState, useRef, type KeyboardEvent } from "react";

type MessageInputProps = {
  onSend: (content: string) => Promise<void>;
  onSleep?: () => void;
  disabled?: boolean;
};

export function MessageInput({ onSend, onSleep, disabled }: MessageInputProps) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleSend() {
    const content = value.trim();
    if (!content || sending) return;
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

  return (
    <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message… (Enter to send, Shift+Enter for newline)"
          disabled={disabled || sending}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          style={{ maxHeight: "120px", overflowY: "auto" }}
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || sending}
          className="flex-shrink-0 rounded-xl bg-blue-600 text-white px-4 py-2.5 text-sm font-medium disabled:opacity-40 hover:bg-blue-700 transition-colors"
        >
          {sending ? "…" : "Send"}
        </button>
        {onSleep && (
          <button
            onClick={onSleep}
            title="Save memories and sleep"
            className="flex-shrink-0 rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-2.5 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            💤
          </button>
        )}
      </div>
    </div>
  );
}
