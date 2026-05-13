"use client";

import { useState } from "react";
import Link from "next/link";
import type { PersonaKernel } from "@/lib/persona/schema";
import { HowItWorks } from "@/components/HowItWorks";

export type ShapeWithMemory = {
  id: string;
  slug: string;
  display_name: string;
  avatar_url: string | null;
  creator_id: string | null;
  persona_kernel: PersonaKernel;
  is_public: boolean | null;
  created_at: string | null;
  memory_profile: string | null;
  memory_updated_at: string | null;
};

const registerLabels: Record<string, string> = {
  casual: "Casual", gen_z: "Gen Z", formal: "Formal", literary: "Literary",
};
const sentenceLengthLabels: Record<string, string> = {
  short: "Short", medium: "Medium", long: "Long", variable: "Variable",
};
const emojiLabels: Record<string, string> = {
  never: "Never", rare: "Rare", moderate: "Moderate", frequent: "Frequent",
};

function talkativenessLabel(v: number): string {
  if (v <= 0.2) return "Very quiet";
  if (v <= 0.4) return "Reserved";
  if (v <= 0.6) return "Balanced";
  if (v <= 0.8) return "Chatty";
  return "Very chatty";
}

function relativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return new Date(dateStr).toLocaleDateString();
}

// Deterministic color from name
const AVATAR_COLORS = [
  "from-violet-700 to-violet-900",
  "from-fuchsia-700 to-fuchsia-900",
  "from-blue-700 to-blue-900",
  "from-emerald-700 to-emerald-900",
  "from-rose-700 to-rose-900",
  "from-amber-700 to-amber-900",
];
function avatarColor(name: string) {
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center px-4 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
      <span className="text-base font-bold text-zinc-100">{value}</span>
      <span className="text-[10px] text-zinc-500 mt-0.5 uppercase tracking-wider">{label}</span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-4 py-3 border-b border-zinc-800/40 last:border-0">
      <span className="text-xs text-zinc-500 w-28 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-zinc-300 flex-1">{value}</span>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-xs bg-zinc-800 border border-zinc-700/40 text-zinc-300 rounded-lg px-2.5 py-1 mr-1.5 mb-1.5">
      {children}
    </span>
  );
}

function BrainIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  );
}

function ShapeDetail({ shape, onBack }: { shape: ShapeWithMemory; onBack: () => void }) {
  const pk = shape.persona_kernel;
  const talkativeness = pk.talkativeness ?? 0.5;
  const gradient = avatarColor(shape.display_name);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Profile hero */}
      <div className="relative border-b border-zinc-800/60 overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-10" />
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10`} />
        <div className="relative px-6 pt-6 pb-8">
          <button
            onClick={onBack}
            className="md:hidden flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition-colors mb-5"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            All shapes
          </button>

          <div className="flex items-start gap-5">
            {/* Big avatar */}
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-4xl font-black text-white/90 flex-shrink-0 shadow-xl`}>
              {shape.display_name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <h2 className="text-2xl font-black tracking-tight text-zinc-100">{shape.display_name}</h2>
              <span className="inline-block text-xs text-violet-300 bg-violet-950/60 border border-violet-900/50 rounded-full px-2.5 py-0.5 mt-1 capitalize">
                {pk.identity.archetype}
              </span>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed max-w-lg">{pk.identity.backstory_short}</p>
            </div>
          </div>

          {/* Stats strip */}
          <div className="flex gap-3 mt-6">
            <StatPill label="Talkativeness" value={`${Math.round(talkativeness * 100)}%`} />
            <StatPill label="Style" value={sentenceLengthLabels[pk.voice.sentence_length] ?? pk.voice.sentence_length} />
            <StatPill label="Register" value={registerLabels[pk.voice.register] ?? pk.voice.register} />
            <StatPill label="Emoji" value={emojiLabels[pk.voice.emoji_usage] ?? pk.voice.emoji_usage} />
          </div>
        </div>
      </div>

      {/* Content: config left + memory right */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-0 divide-x divide-zinc-800/40">

        {/* Left: config */}
        <div className="px-6 py-6 space-y-6">
          {/* Voice */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
              Voice
              <span className="flex-1 h-px bg-zinc-800/80 inline-block" />
            </p>
            <div className="bg-zinc-900/40 rounded-xl border border-zinc-800/50 px-4 divide-y divide-zinc-800/40">
              <InfoRow label="Tone" value={pk.voice.tone} />
              <InfoRow label="Register" value={registerLabels[pk.voice.register] ?? pk.voice.register} />
              <InfoRow label="Sentences" value={sentenceLengthLabels[pk.voice.sentence_length] ?? pk.voice.sentence_length} />
              <InfoRow label="Emoji" value={emojiLabels[pk.voice.emoji_usage] ?? pk.voice.emoji_usage} />
            </div>
          </div>

          {/* Talkativeness bar */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">Eagerness to respond</p>
            <div className="bg-zinc-900/40 rounded-xl border border-zinc-800/50 p-4">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-sm text-zinc-300 font-medium">{talkativenessLabel(talkativeness)}</span>
                <span className="text-xs font-mono text-zinc-600">{talkativeness.toFixed(2)}</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full"
                  style={{ width: `${talkativeness * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-zinc-700">Silent</span>
                <span className="text-[10px] text-zinc-700">Always on</span>
              </div>
            </div>
          </div>

          {/* Values / phrases */}
          {(pk.values.length > 0 || pk.signature_phrases.length > 0) && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">Character</p>
              <div className="bg-zinc-900/40 rounded-xl border border-zinc-800/50 px-4 divide-y divide-zinc-800/40">
                {pk.values.length > 0 && (
                  <InfoRow label="Values" value={<div className="flex flex-wrap -mb-1.5">{pk.values.map((v) => <Tag key={v}>{v}</Tag>)}</div>} />
                )}
                {pk.signature_phrases.length > 0 && (
                  <InfoRow label="Phrases" value={<div className="flex flex-wrap -mb-1.5">{pk.signature_phrases.map((p) => <Tag key={p}>&ldquo;{p}&rdquo;</Tag>)}</div>} />
                )}
              </div>
            </div>
          )}

          <p className="text-xs text-zinc-700 pt-2">
            Only you can see this. Others in shared rooms see {shape.display_name} by name only.
          </p>
        </div>

        {/* Right: memory */}
        <div className="px-6 py-6">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
            Memory
            <span className="flex-1 h-px bg-zinc-800/80 inline-block" />
          </p>

          {shape.memory_profile ? (
            <div className="rounded-xl border border-fuchsia-900/30 bg-fuchsia-950/10 overflow-hidden">
              <div className="px-5 py-4 border-b border-fuchsia-900/20 flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-fuchsia-950/60 border border-fuchsia-900/50 flex items-center justify-center flex-shrink-0">
                  <BrainIcon className="text-fuchsia-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-200">What {shape.display_name} knows about you</p>
                  {shape.memory_updated_at && (
                    <p className="text-xs text-zinc-600 mt-0.5">Updated {relativeTime(shape.memory_updated_at)}</p>
                  )}
                </div>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{shape.memory_profile}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-800 p-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
                <BrainIcon className="text-zinc-700" />
              </div>
              <p className="text-sm font-semibold text-zinc-400 mb-2">No memories yet</p>
              <p className="text-xs text-zinc-600 leading-relaxed max-w-xs mx-auto">
                Chat with {shape.display_name} and they&apos;ll start building a profile about you over time.
              </p>
              <Link href="/rooms" className="inline-block mt-4 text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium">
                Go to a chat room →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ShapesPanel({ shapes }: { shapes: ShapeWithMemory[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(
    shapes.length > 0 ? shapes[0].id : null
  );

  const selectedShape = shapes.find((s) => s.id === selectedId) ?? null;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: shape list */}
      <div className={`${selectedId ? "hidden md:flex" : "flex"} flex-col w-full md:w-72 border-r border-zinc-800/60 flex-shrink-0 overflow-hidden`}>

        {/* List header */}
        <div className="relative border-b border-zinc-800/60 overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 to-transparent pointer-events-none" />
          <div className="relative flex items-center justify-between px-4 py-4">
            <div>
              <h2 className="text-sm font-bold text-zinc-100">My Shapes</h2>
              <p className="text-xs text-zinc-500 mt-0.5">{shapes.length} persona{shapes.length !== 1 ? "s" : ""}</p>
            </div>
            <Link
              href="/shapes/new"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New
            </Link>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          {shapes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4 py-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-violet-950/30 border border-violet-900/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-violet-600 text-xl">✦</span>
              </div>
              <p className="text-sm font-semibold text-zinc-400 mb-1">No shapes yet</p>
              <p className="text-xs text-zinc-600 leading-relaxed mb-4">Create an AI persona with its own personality and memory.</p>
              <Link href="/shapes/new" className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors">
                Create your first shape
              </Link>
            </div>
          ) : (
            <ul className="space-y-1">
              {shapes.map((shape) => {
                const isSelected = shape.id === selectedId;
                const gradient = avatarColor(shape.display_name);
                return (
                  <li key={shape.id}>
                    <button
                      onClick={() => setSelectedId(shape.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left ${
                        isSelected
                          ? "bg-violet-950/60 border border-violet-800/50"
                          : "border border-transparent hover:bg-zinc-900/60"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-sm font-black text-white flex-shrink-0`}>
                        {shape.display_name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isSelected ? "text-zinc-100" : "text-zinc-300"}`}>
                          {shape.display_name}
                        </p>
                        <p className="text-xs text-zinc-600 truncate capitalize">
                          {shape.persona_kernel.identity.archetype}
                        </p>
                      </div>
                      {shape.memory_profile && (
                        <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 flex-shrink-0" title="Has memories" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Right: detail */}
      <div className={`${selectedId ? "flex" : "hidden md:flex"} flex-1 overflow-hidden flex-col bg-zinc-950`}>
        {selectedShape ? (
          <ShapeDetail shape={selectedShape} onBack={() => setSelectedId(null)} />
        ) : shapes.length === 0 ? (
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="max-w-2xl">
              <div className="w-14 h-14 rounded-2xl bg-violet-950/30 border border-violet-900/20 flex items-center justify-center mb-5">
                <span className="text-violet-600 text-2xl">✦</span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-zinc-100 mb-1">Welcome to Shapes</h2>
              <p className="text-sm text-zinc-400 mb-8">
                Shapes are AI personas with their own personality, voice, and memory. Here&apos;s how to get started.
              </p>
              <HowItWorks defaultOpen={true} />
              <Link
                href="/shapes/new"
                className="inline-flex items-center gap-2 mt-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-violet-900/40"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Create your first shape
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-violet-950/20 border border-violet-900/20 flex items-center justify-center mx-auto mb-5">
              <span className="text-3xl text-violet-800">✦</span>
            </div>
            <p className="text-sm font-semibold text-zinc-400 mb-1">Select a shape</p>
            <p className="text-xs text-zinc-600">Pick one to see its personality and what it remembers about you.</p>
          </div>
        )}
      </div>
    </div>
  );
}
