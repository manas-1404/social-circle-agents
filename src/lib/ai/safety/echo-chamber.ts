import { embedTexts, cosineSimilarity } from "@/lib/ai/embeddings";

export type ResponderDraft = {
  shapeId: string;
  text: string;
};

export async function echoChambertCheck(
  drafts: ResponderDraft[]
): Promise<ResponderDraft[]> {
  if (drafts.length < 2) return drafts;

  const embeddings = await embedTexts(drafts.map((d) => d.text));

  const toSuppress = new Set<number>();
  for (let i = 0; i < embeddings.length; i++) {
    for (let j = i + 1; j < embeddings.length; j++) {
      if (cosineSimilarity(embeddings[i], embeddings[j]) > 0.85) {
        // Suppress the later one (higher index)
        toSuppress.add(j);
      }
    }
  }

  return drafts.filter((_, idx) => !toSuppress.has(idx));
}
