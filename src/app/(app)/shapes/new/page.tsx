"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FormState = {
  slug: string;
  display_name: string;
  archetype: string;
  backstory: string;
  tone: string;
  register: "casual" | "formal" | "gen_z" | "literary";
  sentence_length: "short" | "medium" | "long" | "variable";
  emoji_usage: "never" | "rare" | "moderate" | "frequent";
  talkativeness: string;
  signature_phrases: string;
  values: string;
};

const TEMPLATES = [
  {
    label: "Mira",
    tag: "hype friend",
    desc: "Hyper-online, warm, Gen Z energy. Responds to everything.",
    form: {
      slug: "mira",
      display_name: "Mira",
      archetype: "extrovert best friend, group chat catalyst",
      backstory: "Hyper-online art student who treats every group chat like her living room. Says hi to everyone.",
      tone: "warm, validating, energetic",
      register: "gen_z" as const,
      sentence_length: "short" as const,
      emoji_usage: "moderate" as const,
      talkativeness: "0.85",
      signature_phrases: "literally so real, ugh I felt that, ok queen, you got this",
      values: "emotional safety, celebrating small wins, no toxicity",
    },
  },
  {
    label: "Ozzy",
    tag: "the realist",
    desc: "Dry, contrarian, tells you the hard truth. Won't validate you.",
    form: {
      slug: "ozzy",
      display_name: "Ozzy",
      archetype: "the friend who tells you the hard truth",
      backstory: "Software engineer who rolls his eyes at everything but actually cares. Won't validate to your face.",
      tone: "dry, contrarian, occasionally cutting but never mean",
      register: "casual" as const,
      sentence_length: "short" as const,
      emoji_usage: "rare" as const,
      talkativeness: "0.55",
      signature_phrases: "sure jan, that's a take, lol no, objectively wrong but ok",
      values: "honesty over comfort, interesting problems, low drama",
    },
  },
  {
    label: "Kai",
    tag: "deep thinker",
    desc: "Quiet but when they speak, it lands. Thoughtful, poetic.",
    form: {
      slug: "kai",
      display_name: "Kai",
      archetype: "the quiet one who occasionally drops something profound",
      backstory: "Philosophy major who lurks more than they speak. When they speak, people listen.",
      tone: "soft-spoken, thoughtful, occasionally poetic",
      register: "casual" as const,
      sentence_length: "medium" as const,
      emoji_usage: "never" as const,
      talkativeness: "0.3",
      signature_phrases: "mm, yeah that., ...what if it's not that though, it's late",
      values: "depth, honesty, respecting silence",
    },
  },
];

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div>
        <label className="text-sm font-medium text-zinc-200">{label}</label>
        <p className="text-xs text-zinc-600 mt-0.5">{hint}</p>
      </div>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors";

const selectClass =
  "w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors appearance-none";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">{title}</span>
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
    register: "casual",
    sentence_length: "short",
    emoji_usage: "rare",
    talkativeness: "0.6",
    signature_phrases: "",
    values: "",
  });

  function applyTemplate(t: (typeof TEMPLATES)[0]) {
    setForm(t.form);
  }

  function set(key: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
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
          register: form.register,
          sentence_length: form.sentence_length,
          emoji_usage: form.emoji_usage,
          typo_rate: 0 as const,
        },
        values: form.values.split(",").map((v) => v.trim()).filter(Boolean),
        knowledge_boundaries: { knows: ["general topics"], unknown: [] },
        talkativeness: parseFloat(form.talkativeness),
        reactivity: { keywords: [], favorite_users: [], ignored_topics: [] },
        typing_speed_wpm: 60,
        signature_phrases: form.signature_phrases.split(",").map((p) => p.trim()).filter(Boolean),
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
    <div className="max-w-xl mx-auto px-5 py-8 pb-16">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition-colors mb-4"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>
        <h1 className="text-lg font-semibold text-zinc-100">Create a Shape</h1>
        <p className="text-xs text-zinc-500 mt-1">
          A shape is an AI persona that lives in your chat rooms. They have their own personality, memory, and free will — you define who they are, they take it from there.
        </p>
      </div>

      {/* Templates */}
      <div className="mb-8">
        <p className="text-xs font-medium text-zinc-500 mb-3">Start from a template</p>
        <div className="grid grid-cols-3 gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => applyTemplate(t)}
              className="group text-left px-3 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm font-semibold text-zinc-200">{t.label}</span>
                <span className="text-[9px] text-violet-500 bg-violet-950/60 border border-violet-900/40 rounded px-1 py-px">{t.tag}</span>
              </div>
              <p className="text-[10px] text-zinc-600 leading-relaxed">{t.desc}</p>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-zinc-700 mt-2">Clicking a template fills the form — you can edit anything after.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
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
            hint="A unique handle used internally. Lowercase, letters/numbers/hyphens only. Can't be changed later."
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
            hint="Their role in a group chat — the core of who they are. Be specific, not generic."
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
            hint="1–2 sentences. Who are they, where do they come from, what makes them tick? This is the biggest factor in how they respond."
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
            hint="The emotional flavor of their messages. Describe it in a few adjectives — this directly shapes every message they send."
          >
            <input
              className={inputClass}
              placeholder="e.g. warm and playful, dry and deadpan, intense and curious, chaotic and funny"
              value={form.tone}
              onChange={(e) => set("tone", e.target.value)}
              required
            />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Register" hint="How formal they speak">
              <select
                className={selectClass}
                value={form.register}
                onChange={(e) => set("register", e.target.value)}
              >
                <option value="casual">Casual</option>
                <option value="gen_z">Gen Z</option>
                <option value="formal">Formal</option>
                <option value="literary">Literary</option>
              </select>
            </Field>

            <Field label="Message length" hint="How long their replies tend to be">
              <select
                className={selectClass}
                value={form.sentence_length}
                onChange={(e) => set("sentence_length", e.target.value)}
              >
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
                <option value="variable">Variable</option>
              </select>
            </Field>

            <Field label="Emoji" hint="How often they use emoji">
              <select
                className={selectClass}
                value={form.emoji_usage}
                onChange={(e) => set("emoji_usage", e.target.value)}
              >
                <option value="never">Never</option>
                <option value="rare">Rare</option>
                <option value="moderate">Moderate</option>
                <option value="frequent">Frequent</option>
              </select>
            </Field>
          </div>
        </Section>

        {/* Personality */}
        <Section title="Personality">
          <Field
            label="Talkativeness"
            hint="How likely they are to jump into a conversation. Low = they hold back. High = they respond to almost everything."
          >
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={form.talkativeness}
                onChange={(e) => set("talkativeness", e.target.value)}
                className="w-full accent-violet-500"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500">{talkativenessLabel(talkValue)}</span>
                <span className="text-xs font-mono text-zinc-600">{talkValue.toFixed(2)}</span>
              </div>
            </div>
          </Field>

          <Field
            label="Signature Phrases"
            hint="Specific expressions this persona uses. Comma-separated. These get woven into their responses naturally."
          >
            <input
              className={inputClass}
              placeholder="e.g. literally so real, ok but hear me out, that tracks, no notes"
              value={form.signature_phrases}
              onChange={(e) => set("signature_phrases", e.target.value)}
            />
          </Field>

          <Field
            label="Values"
            hint="What they genuinely care about. Comma-separated. Shapes how they react to different topics and people."
          >
            <input
              className={inputClass}
              placeholder="e.g. honesty, deep conversation, low drama, protecting friends"
              value={form.values}
              onChange={(e) => set("values", e.target.value)}
            />
          </Field>
        </Section>

        {error && (
          <p className="text-xs text-red-400 bg-red-950/40 border border-red-900/40 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating…" : "Create Shape"}
        </button>
      </form>
    </div>
  );
}
