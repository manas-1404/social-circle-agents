"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FormState = {
  slug: string;
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
    form: {
      slug: "mira",
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
    desc: "Dry, contrarian, tells the hard truth.",
    form: {
      slug: "ozzy",
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
    desc: "Quiet, thoughtful, says something profound.",
    form: {
      slug: "kai",
      display_name: "Kai",
      archetype: "the quiet one who occasionally drops something profound",
      backstory: "Philosophy major who lurks more than they speak. When they speak, people listen.",
      tone: "soft-spoken, thoughtful, occasionally poetic",
      talkativeness: "0.3",
    },
  },
];

const inputClass =
  "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-base text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors";

function Field({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div>
        <label className="text-base font-semibold text-zinc-200">{label}</label>
        <p className="text-sm text-zinc-500 mt-0.5">{hint}</p>
      </div>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold uppercase tracking-widest text-zinc-500">{title}</span>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>
      {children}
    </div>
  );
}

const talkativenessLabel = (v: number) => {
  if (v <= 0.2) return "Very quiet — rarely joins in";
  if (v <= 0.4) return "Reserved — picks their moments";
  if (v <= 0.6) return "Balanced — responds when it fits";
  if (v <= 0.8) return "Chatty — jumps in often";
  return "Very chatty — responds to almost everything";
};

export default function NewShapePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>({
    slug: "",
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
        body: JSON.stringify({ slug: form.slug, display_name: form.display_name, persona_kernel }),
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
    <div className="max-w-xl mx-auto px-5 py-8 pb-20">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100">Create a Shape</h1>
        <p className="text-base text-zinc-400 mt-2">
          A shape is an AI persona with its own personality and memory. Define who they are — they take it from there.
        </p>
      </div>

      {/* Templates */}
      <div className="mb-10">
        <p className="text-base font-semibold text-zinc-300 mb-3">Start from a template</p>
        <div className="grid grid-cols-3 gap-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => applyTemplate(t)}
              className="group text-left px-4 py-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 transition-all"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base font-bold text-zinc-100">{t.label}</span>
              </div>
              <span className="inline-block text-xs text-violet-400 bg-violet-950/60 border border-violet-900/40 rounded px-1.5 py-0.5 mb-2">{t.tag}</span>
              <p className="text-sm text-zinc-500 leading-snug">{t.desc}</p>
            </button>
          ))}
        </div>
        <p className="text-sm text-zinc-600 mt-2">Clicking a template fills the form — you can edit anything.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Identity */}
        <Section title="Identity">
          <Field
            label="Display Name"
            hint="The name shown in chat. Whatever feels right for this persona."
          >
            <input
              className={inputClass}
              placeholder="e.g. Alex, Nova, Remy"
              value={form.display_name}
              onChange={(e) => set("display_name", e.target.value)}
              required
            />
          </Field>

          <Field
            label="Slug"
            hint="Unique handle used internally. Lowercase letters, numbers, hyphens only. Can't be changed later."
          >
            <input
              className={inputClass}
              placeholder="e.g. alex, cool-ai, nova-v2"
              value={form.slug}
              onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              required
            />
          </Field>

          <Field
            label="Archetype"
            hint="Their role in a group chat. Be specific — this is the core of who they are."
          >
            <input
              className={inputClass}
              placeholder="e.g. the supportive best friend, the contrarian who grows on you, the quiet observer"
              value={form.archetype}
              onChange={(e) => set("archetype", e.target.value)}
              required
            />
          </Field>

          <Field
            label="Backstory"
            hint="1–2 sentences. Who are they and what makes them tick? This is the biggest factor in how they respond to everything."
          >
            <textarea
              className={`${inputClass} resize-none`}
              rows={3}
              placeholder="e.g. A burned-out grad student who found peace in cooking and now responds to everything through the lens of food metaphors."
              value={form.backstory}
              onChange={(e) => set("backstory", e.target.value)}
              required
            />
          </Field>
        </Section>

        {/* Voice */}
        <Section title="Voice">
          <Field
            label="Tone"
            hint="The emotional flavor of their messages. A few adjectives — this directly shapes every message they send."
          >
            <input
              className={inputClass}
              placeholder="e.g. warm and playful, dry and deadpan, intense and curious, chaotic and funny"
              value={form.tone}
              onChange={(e) => set("tone", e.target.value)}
              required
            />
          </Field>

          <Field
            label="Talkativeness"
            hint="How likely they are to jump into a conversation. Low = they hold back. High = they respond to almost everything."
          >
            <div className="space-y-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={form.talkativeness}
                onChange={(e) => set("talkativeness", e.target.value)}
                className="w-full accent-violet-500 h-2"
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">{talkativenessLabel(talkValue)}</span>
                <span className="text-sm font-mono text-zinc-500">{talkValue.toFixed(2)}</span>
              </div>
            </div>
          </Field>
        </Section>

        {error && (
          <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/40 rounded-lg px-4 py-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-base font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating…" : "Create Shape"}
        </button>
      </form>
    </div>
  );
}
