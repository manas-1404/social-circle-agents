"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateRoomButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    const name = prompt("Room name:");
    if (!name?.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error("Failed");
      const room = await res.json();
      router.push(`/rooms/${room.id}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all disabled:opacity-50 hover:shadow-md hover:shadow-violet-900/40 active:scale-[0.98]"
    >
      {loading ? (
        <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      )}
      {loading ? "Creating…" : "New Chat"}
    </button>
  );
}
