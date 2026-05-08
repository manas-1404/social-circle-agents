"use client";

import { useState } from "react";
import Link from "next/link";
import type { PersonaKernel } from "@/lib/persona/schema";

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
  casual: "Casual",
  gen_z: "Gen Z",
  formal: "Formal",
  literary: "Literary",
};

const sentenceLengthLabels: Record<string, string> = {
  short: "Short",
  medium: "Medium",
  long: "Long",
  variable: "Variable",
};

const emojiLabels: Record<string, string> = {
  never: "Never",
  rare: "Rare",
  moderate: "Moderate",
  frequent: "Frequent",
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

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-4 py-3 border-b border-zinc-800/60 last:border-0">
      <span className="text-sm text-zinc-500 w-36 flex-shrink-0">{label}</span>
      <span className="text-sm text-zinc-200 flex-1">{value}</span>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-sm bg-zinc-800 text-zinc-300 rounded px-2.5 py-1 mr-1.5 mb-1.5">
      {children}
    </span>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-xs font-semibold uppercase tracking-widest text-zinc-600">{title}</span>
      <div className="flex-1 h-px bg-zinc-800" />
    </div>
  );
}

function BrainIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  );
}

function MemoryPanel({ shape }: { shape: ShapeWithMemory }) {
  return (
    <div>
      <SectionHeader title="Memory" />
      {shape.memory_profile ? (
        <div className="bg-zinc-900/80 rounded-xl border border-violet-900/40 p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-7 h-7 rounded-lg bg-violet-950 border border-violet-900/60 flex items-center justify-center flex-shrink-0">
              <BrainIcon className="text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-200">
                What {shape.display_name} knows about you
              </p>
              {shape.memory_updated_at && (
                <p className="text-xs text-zinc-600 mt-0.5">
                  Updated {relativeTime(shape.memory_updated_at)}
                </p>
              )}
            </div>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {shape.memory_profile}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center">
          <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3">
            <BrainIcon className="text-zinc-700" />
          </div>
          <p className="text-sm font-medium text-zinc-400 mb-1.5">No memories yet</p>
          <p className="text-xs text-zinc-600 leading-relaxed max-w-xs mx-auto">
            Chat with {shape.display_name} in a room and they&apos;ll start building a profile about you over time.
          </p>
        </div>
      )}
    </div>
  );
}

function ShapeDetail({ shape, onBack }: { shape: ShapeWithMemory; onBack: () => void }) {
  const pk = shape.persona_kernel;
  const talkativeness = pk.talkativeness ?? 0.5;

  return (
    <div className="px-6 py-6 w-full max-w-6xl mx-auto">
      {/* Mobile back */}
      <button
        onClick={onBack}
        className="md:hidden flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        All shapes
      </button>

      {/* Hero — full width */}
      <div className="flex items-start gap-4 mb-6 p-5 rounded-xl bg-zinc-900 border border-zinc-800">
        <div className="w-14 h-14 rounded-xl bg-violet-900/60 border border-violet-800/50 flex items-center justify-center text-2xl font-bold text-violet-300 flex-shrink-0">
          {shape.display_name[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-zinc-100">{shape.display_name}</h2>
            <span className="text-sm text-violet-400 bg-violet-950/60 border border-violet-900/50 rounded px-2 py-0.5 capitalize">
              {pk.identity.archetype}
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">{pk.identity.backstory_short}</p>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-xs text-zinc-600">/{shape.slug}</span>
            <span className="text-xs text-zinc-700">·</span>
            <span className="text-xs text-zinc-600">
              Created {shape.created_at ? new Date(shape.created_at).toLocaleDateString() : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Config + Memory side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6 items-start">

        {/* Left: shape config */}
        <div>
          <div className="mb-6">
            <SectionHeader title="Voice" />
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 px-4 divide-y divide-zinc-800/60">
              <Row label="Tone" value={pk.voice.tone} />
              <Row label="Register" value={registerLabels[pk.voice.register] ?? pk.voice.register} />
              <Row label="Message length" value={sentenceLengthLabels[pk.voice.sentence_length] ?? pk.voice.sentence_length} />
              <Row label="Emoji usage" value={emojiLabels[pk.voice.emoji_usage] ?? pk.voice.emoji_usage} />
            </div>
          </div>

          <div className="mb-6">
            <SectionHeader title="Personality" />
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 px-4 divide-y divide-zinc-800/60">
              <Row
                label="Talkativeness"
                value={
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-500 rounded-full"
                        style={{ width: `${talkativeness * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-zinc-400 flex-shrink-0">
                      {talkativenessLabel(talkativeness)} ({talkativeness.toFixed(2)})
                    </span>
                  </div>
                }
              />
              {pk.values.length > 0 && (
                <Row
                  label="Values"
                  value={
                    <div className="flex flex-wrap -mb-1.5">
                      {pk.values.map((v) => <Tag key={v}>{v}</Tag>)}
                    </div>
                  }
                />
              )}
              {pk.signature_phrases.length > 0 && (
                <Row
                  label="Phrases"
                  value={
                    <div className="flex flex-wrap -mb-1.5">
                      {pk.signature_phrases.map((p) => <Tag key={p}>&ldquo;{p}&rdquo;</Tag>)}
                    </div>
                  }
                />
              )}
            </div>
          </div>

          {(pk.knowledge_boundaries.knows.length > 0 || pk.knowledge_boundaries.unknown.length > 0) && (
            <div className="mb-6">
              <SectionHeader title="Knowledge" />
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 px-4 divide-y divide-zinc-800/60">
                {pk.knowledge_boundaries.knows.length > 0 && (
                  <Row
                    label="Knows about"
                    value={
                      <div className="flex flex-wrap -mb-1.5">
                        {pk.knowledge_boundaries.knows.map((k) => <Tag key={k}>{k}</Tag>)}
                      </div>
                    }
                  />
                )}
                {pk.knowledge_boundaries.unknown.length > 0 && (
                  <Row
                    label="Doesn&apos;t know"
                    value={
                      <div className="flex flex-wrap -mb-1.5">
                        {pk.knowledge_boundaries.unknown.map((k) => <Tag key={k}>{k}</Tag>)}
                      </div>
                    }
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: memory — sticky while config scrolls */}
        <div className="lg:sticky lg:top-6">
          <MemoryPanel shape={shape} />
        </div>
      </div>

      <p className="text-xs text-zinc-700 text-center pt-2 pb-4">
        Only you can see this. Other users in shared rooms see {shape.display_name} by name only.
      </p>
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
      <div
        className={`${
          selectedId ? "hidden md:flex" : "flex"
        } flex-col w-full md:w-72 border-r border-zinc-800 flex-shrink-0 overflow-hidden`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800 flex-shrink-0">
          <div>
            <h1 className="text-sm font-bold text-zinc-100">My Shapes</h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              {shapes.length} persona{shapes.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/shapes/new"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New
          </Link>
        </div>

        {/* Shape cards */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {shapes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4 py-10 text-center">
              <p className="text-2xl mb-2 text-violet-800">✦</p>
              <p className="text-sm font-medium text-zinc-400 mb-1">No shapes yet</p>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Create an AI persona with its own personality and memory.
              </p>
              <Link
                href="/shapes/new"
                className="mt-4 px-4 py-2 rounded-md bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors"
              >
                Create your first shape
              </Link>
            </div>
          ) : (
            <ul className="space-y-0.5">
              {shapes.map((shape) => {
                const isSelected = shape.id === selectedId;
                return (
                  <li key={shape.id}>
                    <button
                      onClick={() => setSelectedId(shape.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left group ${
                        isSelected
                          ? "bg-violet-950/60 border border-violet-800/50"
                          : "border border-transparent hover:bg-zinc-800/60"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          isSelected
                            ? "bg-violet-800/60 border border-violet-700/50 text-violet-200"
                            : "bg-violet-900/40 border border-violet-900/20 text-violet-400"
                        }`}
                      >
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
                        <div
                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            isSelected ? "bg-violet-400" : "bg-violet-600"
                          }`}
                          title="Has memories about you"
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Right: detail + memory */}
      <div
        className={`${
          selectedId ? "flex" : "hidden md:flex"
        } flex-1 overflow-y-auto flex-col bg-zinc-950`}
      >
        {selectedShape ? (
          <ShapeDetail shape={selectedShape} onBack={() => setSelectedId(null)} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <p className="text-5xl text-violet-900 mb-4">✦</p>
            <p className="text-sm font-medium text-zinc-400 mb-1">Select a shape</p>
            <p className="text-xs text-zinc-600">
              Pick a shape from the list to view its personality and what it remembers about you.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
