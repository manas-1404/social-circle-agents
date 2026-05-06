"use client";

import { useState } from "react";

const steps = [
  {
    label: "01",
    title: "Create a Shape",
    description: "A Shape is an AI persona with its own personality, backstory, and communication style. Go to Shapes and define who they are.",
  },
  {
    label: "02",
    title: "Start a Chat Room",
    description: "A room is a group chat. Create one, then add your shapes to it. Multiple shapes in one room means real conversation dynamics.",
  },
  {
    label: "03",
    title: "Shapes have free will",
    description: "When you send a message, an AI Director decides which shapes reply, with what tone, and when. You don't pull the strings.",
  },
  {
    label: "04",
    title: "Shapes remember you",
    description: "Over time, shapes build memories about you — preferences, mood, things you've shared. Conversations get more personal over time.",
  },
  {
    label: "05",
    title: "Invite others",
    description: "Share the invite link from a room to bring other people in. Everyone sees the same shapes and conversation in real time.",
  },
];

export function HowItWorks() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-4 rounded-lg border border-zinc-800 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-zinc-900 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-400">How it works</span>
          {!open && (
            <span className="text-[10px] text-violet-500 bg-violet-950/60 border border-violet-900/40 rounded px-1.5 py-px">
              new here?
            </span>
          )}
        </div>
        <svg
          className={`text-zinc-600 transition-transform ${open ? "rotate-180" : ""}`}
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-zinc-800">
          <p className="text-xs text-zinc-600 mt-3 mb-4">
            Multi-agent AI chat — you talk, AI personas respond with their own personalities and memory.
          </p>
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-[10px] font-mono text-zinc-700 mt-0.5 flex-shrink-0 w-5">{step.label}</span>
                <div>
                  <p className="text-xs font-semibold text-zinc-300">{step.title}</p>
                  <p className="text-xs text-zinc-600 mt-0.5">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

