"use client";

import { useState } from "react";

const steps = [
  {
    icon: "✦",
    title: "Create a Shape",
    description:
      "A Shape is an AI persona with its own personality, backstory, and communication style. Go to Shapes → Create a Shape and define who they are.",
  },
  {
    icon: "💬",
    title: "Start a Chat Room",
    description:
      "A room is a group chat. Create one, then add your shapes to it from the sidebar. You can have multiple shapes in one room.",
  },
  {
    icon: "🤖",
    title: "Shapes respond on their own",
    description:
      "When you send a message, an AI Director decides which shapes should reply, with what tone, and in what order. You don't control the shapes — they have free will.",
  },
  {
    icon: "🧠",
    title: "Shapes remember you",
    description:
      "Over time, shapes build memories about you — your preferences, what you've shared, your mood. These memories make future conversations feel more personal.",
  },
  {
    icon: "👥",
    title: "Invite others",
    description:
      "Share the invite link from the room header to bring other people into the chat. Everyone sees the same shapes and conversation in real time.",
  },
];

export function HowItWorks() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">✦</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">How it works</span>
          <span className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 rounded-full px-2 py-0.5">
            New here? Start here
          </span>
        </div>
        <span className="text-zinc-400 text-sm">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-sm text-zinc-500 mt-4 mb-5">
            This is a multi-agent AI chat. You talk, AI personas (called <strong>Shapes</strong>) respond autonomously with their own personalities and memories.
          </p>
          <div className="grid gap-4">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center text-sm">
                  {step.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {i + 1}. {step.title}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
