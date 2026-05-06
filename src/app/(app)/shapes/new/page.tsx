"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewShapePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    slug: "",
    display_name: "",
    archetype: "",
    backstory: "",
    tone: "",
    talkativeness: "0.6",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
        values: ["authenticity", "connection"],
        knowledge_boundaries: { knows: ["general topics"], unknown: ["specialized fields"] },
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

      if (!res.ok) throw new Error("Failed to create shape");
      router.push("/shapes");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-8">Create a Shape</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        {[
          { name: "slug", label: "Slug (unique handle)", placeholder: "e.g. cool-ai" },
          { name: "display_name", label: "Display Name", placeholder: "e.g. Alex" },
          { name: "archetype", label: "Archetype", placeholder: "e.g. supportive friend" },
          { name: "backstory", label: "Backstory (1-2 sentences)", placeholder: "Who are they?" },
          { name: "tone", label: "Tone", placeholder: "e.g. warm, playful, sarcastic" },
        ].map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium mb-1">{field.label}</label>
            <input
              type="text"
              placeholder={field.placeholder}
              value={form[field.name as keyof typeof form]}
              onChange={(e) => setForm((f) => ({ ...f, [field.name]: e.target.value }))}
              required
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium mb-1">
            Talkativeness (0 = silent, 1 = very chatty)
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={form.talkativeness}
            onChange={(e) => setForm((f) => ({ ...f, talkativeness: e.target.value }))}
            className="w-full"
          />
          <span className="text-xs text-zinc-500">{form.talkativeness}</span>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-3 text-sm font-semibold disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create Shape"}
        </button>
      </form>
    </div>
  );
}
