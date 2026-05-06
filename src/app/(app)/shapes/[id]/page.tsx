import { db } from "@/lib/db";
import { shapes } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-600">{title}</span>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>
      {children}
    </div>
  );
}

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

const talkativenessLabel = (v: number) => {
  if (v <= 0.2) return "Very quiet";
  if (v <= 0.4) return "Reserved";
  if (v <= 0.6) return "Balanced";
  if (v <= 0.8) return "Chatty";
  return "Very chatty";
};

export default async function ShapeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const shape = await db.query.shapes.findFirst({
    where: eq(shapes.id, id),
  });

  if (!shape) notFound();

  // Only the creator can view the detail page
  if (shape.creator_id !== session.user.id) notFound();

  const pk = shape.persona_kernel;
  const talkativeness = pk.talkativeness ?? 0.5;

  return (
    <div className="max-w-xl mx-auto px-5 py-8">
      {/* Back */}
      <Link
        href="/shapes"
        className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        All shapes
      </Link>

      {/* Hero */}
      <div className="flex items-start gap-4 mb-8 p-5 rounded-xl bg-zinc-900 border border-zinc-800">
        <div className="w-14 h-14 rounded-xl bg-violet-900/60 border border-violet-800/50 flex items-center justify-center text-2xl font-bold text-violet-300 flex-shrink-0">
          {shape.display_name[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-zinc-100">{shape.display_name}</h1>
            <span className="text-sm text-violet-400 bg-violet-950/60 border border-violet-900/50 rounded px-2 py-0.5">
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

      {/* Voice */}
      <Section title="Voice">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 px-4 divide-y divide-zinc-800/60">
          <Row label="Tone" value={pk.voice.tone} />
          <Row label="Register" value={registerLabels[pk.voice.register] ?? pk.voice.register} />
          <Row label="Message length" value={sentenceLengthLabels[pk.voice.sentence_length] ?? pk.voice.sentence_length} />
          <Row label="Emoji usage" value={emojiLabels[pk.voice.emoji_usage] ?? pk.voice.emoji_usage} />
        </div>
      </Section>

      {/* Personality */}
      <Section title="Personality">
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
                  {pk.signature_phrases.map((p) => (
                    <Tag key={p}>&ldquo;{p}&rdquo;</Tag>
                  ))}
                </div>
              }
            />
          )}
        </div>
      </Section>

      {/* Knowledge */}
      {(pk.knowledge_boundaries.knows.length > 0 || pk.knowledge_boundaries.unknown.length > 0) && (
        <Section title="Knowledge">
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
                label="Doesn't know"
                value={
                  <div className="flex flex-wrap -mb-1.5">
                    {pk.knowledge_boundaries.unknown.map((k) => <Tag key={k}>{k}</Tag>)}
                  </div>
                }
              />
            )}
          </div>
        </Section>
      )}

      {/* Privacy notice */}
      <p className="text-sm text-zinc-600 text-center mt-2">
        Only you can see this. Other users in shared rooms see {shape.display_name} only by name.
      </p>
    </div>
  );
}
