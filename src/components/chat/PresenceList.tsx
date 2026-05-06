"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PresenceListProps = {
  roomId: string;
  shapes: { id: string; display_name: string; avatar_url?: string | null }[];
  humans: { id: string; display_name: string }[];
  currentUserId: string;
};

export function PresenceList({ roomId, shapes, humans, currentUserId }: PresenceListProps) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [allShapes, setAllShapes] = useState<{ id: string; display_name: string }[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  async function openPicker() {
    setAdding(true);
    const res = await fetch("/api/shapes");
    const data = await res.json();
    const currentIds = new Set(shapes.map((s) => s.id));
    setAllShapes(data.filter((s: { id: string }) => !currentIds.has(s.id)));
    setShowPicker(true);
    setAdding(false);
  }

  async function addShape(shapeId: string) {
    setShowPicker(false);
    await fetch(`/api/rooms/${roomId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shape_id: shapeId }),
    });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Humans */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-2">
          People
        </p>
        {humans.map((h) => (
          <div key={h.id} className="flex items-center gap-2 mb-1.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-xs font-semibold text-blue-700 dark:text-blue-200">
                {h.display_name[0]?.toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white dark:border-zinc-950" />
            </div>
            <span className="text-sm text-zinc-700 dark:text-zinc-300">
              {h.display_name}
              {h.id === currentUserId && (
                <span className="text-xs text-zinc-400 ml-1">(you)</span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Shapes */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-2">
          Shapes
        </p>
        {shapes.length === 0 && (
          <p className="text-xs text-zinc-400 italic mb-1">No shapes yet</p>
        )}
        {shapes.map((s) => (
          <div key={s.id} className="flex items-center gap-2 mb-1.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-violet-200 dark:bg-violet-800 flex items-center justify-center text-xs font-semibold text-violet-700 dark:text-violet-200">
                {s.display_name[0]}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white dark:border-zinc-950" />
            </div>
            <span className="text-sm text-zinc-700 dark:text-zinc-300">{s.display_name}</span>
          </div>
        ))}

        <button
          onClick={openPicker}
          disabled={adding}
          className="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline text-left disabled:opacity-50"
        >
          + Add shape
        </button>

        {showPicker && (
          <div className="mt-1 flex flex-col gap-1">
            {allShapes.length === 0 ? (
              <p className="text-xs text-zinc-400">No more shapes available</p>
            ) : (
              allShapes.map((s) => (
                <button
                  key={s.id}
                  onClick={() => addShape(s.id)}
                  className="text-left text-sm px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  {s.display_name}
                </button>
              ))
            )}
            <button
              onClick={() => setShowPicker(false)}
              className="text-xs text-zinc-400 hover:underline text-left mt-1"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
