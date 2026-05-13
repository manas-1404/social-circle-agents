"use client";

import { useState } from "react";

const steps = [
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    color: "violet",
    title: "Create a Shape",
    description: "Go to Shapes and define an AI persona — name, backstory, how they speak, how chatty they are.",
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    color: "fuchsia",
    title: "Start a Chat Room",
    description: "Create a room and add your shapes to it. Multiple shapes in one room means real conversation dynamics.",
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    color: "blue",
    title: "Shapes respond on their own",
    description: "Each shape decides when to speak. Some are chatty, some hold back — they read the room and jump in when it feels right.",
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
      </svg>
    ),
    color: "emerald",
    title: "Shapes remember you",
    description: "Over time each shape builds a memory of you — preferences, things you've shared, your vibe. It gets more personal every chat.",
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    color: "pink",
    title: "Invite your friends",
    description: "Share the invite link from any room. Everyone joins the same conversation — shapes, history, and all.",
  },
];

const colorMap: Record<string, string> = {
  violet:  "bg-violet-950/60 border-violet-800/40 text-violet-400",
  fuchsia: "bg-fuchsia-950/60 border-fuchsia-800/40 text-fuchsia-400",
  blue:    "bg-blue-950/60 border-blue-800/40 text-blue-400",
  emerald: "bg-emerald-950/60 border-emerald-800/40 text-emerald-400",
  pink:    "bg-pink-950/60 border-pink-800/40 text-pink-400",
};

type HowItWorksProps = {
  defaultOpen?: boolean;
};

export function HowItWorks({ defaultOpen = false }: HowItWorksProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-zinc-800/60 overflow-hidden mb-6">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-zinc-900/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-violet-950/60 border border-violet-800/40 flex items-center justify-center">
            <span className="text-violet-400 text-[10px] font-black">?</span>
          </div>
          <span className="text-sm font-semibold text-zinc-200">How it works</span>
          {!open && (
            <span className="text-[10px] text-violet-300 bg-violet-950/60 border border-violet-900/40 rounded-full px-2 py-0.5 font-medium">
              new here?
            </span>
          )}
        </div>
        <svg
          className={`text-zinc-600 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-zinc-800/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800/40">
            {steps.map((step, i) => (
              <div key={i} className="px-5 py-5">
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center mb-3 ${colorMap[step.color]}`}>
                  {step.icon}
                </div>
                <p className="text-sm font-semibold text-zinc-200 mb-1.5">{step.title}</p>
                <p className="text-xs text-zinc-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
