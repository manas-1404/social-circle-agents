"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FormState = {
  display_name: string;
  archetype: string;
  backstory: string;
  tone: string;
  talkativeness: string;
};

const TEMPLATES = [
  {
    label: "Mira",
    tag: "hype friend",
    desc: "Warm, energetic, Gen Z. Responds to everything.",
    color: "violet",
    form: {
      display_name: "Mira",
      archetype: "extrovert best friend, group chat catalyst",
      backstory: "Hyper-online art student who treats every group chat like her living room. Says hi to everyone.",
      tone: "warm, validating, energetic",
      talkativeness: "0.85",
    },
  },
  {
    label: "Ozzy",
    tag: "the realist",
    desc: "Dry, contrarian, tells you the hard truth.",
    color: "blue",
    form: {
      display_name: "Ozzy",
      archetype: "the friend who tells you the hard truth",
      backstory: "Software engineer who rolls his eyes at everything but actually cares. Won't validate to your face.",
      tone: "dry, contrarian, occasionally cutting but never mean",
      talkativeness: "0.55",
    },
  },
  {
    label: "Kai",
    tag: "deep thinker",
    desc: "Quiet, thoughtful, drops something profound.",
    color: "emerald",
    form: {
      display_name: "Kai",
      archetype: "the quiet one who occasionally drops something profound",
      backstory: "Philosophy major who lurks more than they speak. When they speak, people listen.",
      tone: "soft-spoken, thoughtful, occasionally poetic",
      talkativeness: "0.3",
    },
  },
];

const inputClass =
  "w-full rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600/30 transition-colors";

const talkativenessLabel = (v: number) => {
  if (v <= 0.2) return "Very quiet — rarely joins in";
  if (v <= 0.4) return "Reserved — picks their moments";
  if (v <= 0.6) return "Balanced — responds when it fits";
  if (v <= 0.8) return "Chatty — jumps in often";
  return "Very chatty — responds to almost everything";
};

const colorMap = {
  violet: {
    top: "bg-gradient-to-br from-violet-700 to-violet-900",
    badge: "bg-violet-950/60 text-violet-300 border-violet-800/40",
    hover: "hover:border-violet-700/50",
  },
  blue: {
    top: "bg-gradient-to-br from-blue-700 to-blue-900",
    badge: "bg-blue-950/60 text-blue-300 border-blue-800/40",
    hover: "hover:border-blue-700/50",
  },
  emerald: {
    top: "bg-gradient-to-br from-emerald-700 to-emerald-900",
    badge: "bg-emerald-950/60 text-emerald-300 border-emerald-800/40",
    hover: "hover:border-emerald-700/50",
  },
};

export default function NewShapePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    display_name: "",
    archetype: "",
    backstory: "",
    tone: "",
    talkativeness: "0.6",
  });

  function set(key: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function applyTemplate(t: (typeof TEMPLATES)[0]) {
    setForm(t.form);
    setActiveTemplate(t.label);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const persona_kernel = {
        identity: {
          display_name: form.display_name,
          age: "unknown",
          archetype: form.archetype,
          backstory_short: form.backstory,
        },
        voice: {
          tone: form.tone,
          register: "casual" as const,
          sentence_length: "short" as const,
          emoji_usage: "rare" as const,
          typo_rate: 0 as const,
        },
        values: [],
        knowledge_boundaries: { knows: ["general topics"], unknown: [] },
        talkativeness: parseFloat(form.talkativeness),
        reactivity: { keywords: [], favorite_users: [], ignored_topics: [] },
        typing_speed_wpm: 60,
        signature_phrases: [],
        response_distribution: { fast_p: 0.3, normal_p: 0.5, slow_p: 0.2 },
      };

      const res = await fetch("/api/shapes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: form.display_name, persona_kernel }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to create shape");
      }
      router.push("/shapes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const talkValue = parseFloat(form.talkativeness);

  return (
    <div className="min-h-full">
      {/* ── Page header ── */}
      <div className="relative border-b border-zinc-800/60 overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div className="absolute top-0 right-1/4 w-64 h-24 bg-violet-700/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl mx-auto px-6 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition-colors mb-5"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-black tracking-tight text-zinc-100">Create a Shape</h1>
          <p className="text-sm text-zinc-400 mt-1.5">
            Define who they are — they take it from there.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 pb-20">

        {/* ── Templates ── */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">Start from a template</p>
          <div className="grid grid-cols-3 gap-3">
            {TEMPLATES.map((t) => {
              const c = colorMap[t.color as keyof typeof colorMap];
              const isActive = activeTemplate === t.label;
              return (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => applyTemplate(t)}
                  className={`text-left rounded-2xl overflow-hidden border transition-all ${
                    isActive ? "border-zinc-600 shadow-lg" : `border-zinc-800/60 ${c.hover}`
                  }`}
                >
                  {/* Colored top bar */}
                  <div className={`${c.top} px-4 py-3 flex items-center justify-between`}>
                    <span className="text-lg font-black text-white">{t.label[0]}</span>
                    <span className="text-xs font-bold text-white/70">{t.label}</span>
                  </div>
                  <div className="bg-zinc-900/80 px-4 py-3">
                    <span className={`inline-block text-[10px] border rounded-full px-2 py-0.5 mb-2 font-medium ${c.badge}`}>{t.tag}</span>
                    <p className="text-xs text-zinc-400 leading-snug">{t.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Identity card */}
          <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800/60 flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-violet-900/60 border border-violet-800/40 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-violet-400" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <span className="text-sm font-semibold text-zinc-200">Identity</span>
            </div>
            <div className="px-5 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">Display Name</label>
                <input
                  className={inputClass}
                  placeholder="e.g. Alex, Nova, Remy"
                  value={form.display_name}
                  onChange={(e) => set("display_name", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Archetype</label>
                <p className="text-xs text-zinc-600 mb-2">Their role in a group chat — be specific.</p>
                <input
                  className={inputClass}
                  placeholder="e.g. the supportive best friend, the contrarian who grows on you"
                  value={form.archetype}
                  onChange={(e) => set("archetype", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Backstory</label>
                <p className="text-xs text-zinc-600 mb-2">1–2 sentences. Who are they and what makes them tick?</p>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={3}
                  placeholder="e.g. A burned-out grad student who found peace in cooking and now responds to everything through food metaphors."
                  value={form.backstory}
                  onChange={(e) => set("backstory", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Voice card */}
          <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800/60 flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-fuchsia-900/60 border border-fuchsia-800/40 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-fuchsia-400" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <span className="text-sm font-semibold text-zinc-200">Voice</span>
            </div>
            <div className="px-5 py-5 space-y-5">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Tone</label>
                <p className="text-xs text-zinc-600 mb-2">A few adjectives that describe how they speak.</p>
                <input
                  className={inputClass}
                  placeholder="e.g. warm and playful, dry and deadpan, intense and curious"
                  value={form.tone}
                  onChange={(e) => set("tone", e.target.value)}
                  required
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-zinc-400">Talkativeness</label>
                  <span className="text-xs font-mono text-zinc-600">{talkValue.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={form.talkativeness}
                  onChange={(e) => set("talkativeness", e.target.value)}
                  className="w-full accent-violet-500 h-1.5"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-zinc-600">Silent</span>
                  <span className="text-xs text-zinc-400">{talkativenessLabel(talkValue)}</span>
                  <span className="text-xs text-zinc-600">Always on</span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/40 rounded-xl px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-violet-900/40 active:scale-[0.99]"
          >
            {loading ? "Creating…" : "Create Shape →"}
          </button>
        </form>
      </div>
    </div>
  );
}
