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
      className="rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 text-sm font-semibold hover:opacity-80 transition-opacity disabled:opacity-50"
    >
      {loading ? "Creating…" : "+ New Chat"}
    </button>
  );
}
