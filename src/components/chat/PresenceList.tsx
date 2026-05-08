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
    <div className="flex flex-col gap-5 px-4 py-4">
      {/* Humans */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-3">People</p>
        {humans.map((h) => (
          <div key={h.id} className="flex items-center gap-2.5 mb-2">
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-200">
                {h.display_name[0]?.toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-zinc-950" />
            </div>
            <span className="text-sm text-zinc-200">
              {h.display_name}
              {h.id === currentUserId && (
                <span className="text-xs text-zinc-500 ml-1">(you)</span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Shapes */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-3">Shapes</p>
        {shapes.length === 0 && (
          <p className="text-sm text-zinc-600 italic mb-2">No shapes yet</p>
        )}
        {shapes.map((s) => (
          <div key={s.id} className="flex items-center gap-2.5 mb-2">
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-violet-900/60 border border-violet-800/50 flex items-center justify-center text-sm font-bold text-violet-300">
                {s.display_name[0].toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-zinc-950" />
            </div>
            <span className="text-sm text-zinc-200">{s.display_name}</span>
          </div>
        ))}

        <button
          onClick={openPicker}
          disabled={adding}
          className="mt-2 flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors disabled:opacity-50"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add shape
        </button>

        {showPicker && (
          <div className="mt-2 flex flex-col gap-1 bg-zinc-900 rounded-lg border border-zinc-800 p-2">
            {allShapes.length === 0 ? (
              <p className="text-sm text-zinc-500 px-2 py-1">No more shapes available</p>
            ) : (
              allShapes.map((s) => (
                <button
                  key={s.id}
                  onClick={() => addShape(s.id)}
                  className="text-left text-sm px-2 py-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 transition-colors"
                >
                  {s.display_name}
                </button>
              ))
            )}
            <button
              onClick={() => setShowPicker(false)}
              className="text-sm text-zinc-600 hover:text-zinc-400 text-left px-2 py-1 mt-1 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
