import { generateJson } from "./providers";
import { memoryOutputSchema, type MemoryOutput } from "./schemas/memory";
import { buildMemoryConsolidationPrompt } from "./prompts/memory-consolidate";

export async function consolidateMemories(params: {
  shapeName: string;
  userName: string;
  conversation: string;
  existingMemories: string[];
}): Promise<MemoryOutput> {
  const prompt = buildMemoryConsolidationPrompt(params);

  const { object } = await generateJson({
    schema: memoryOutputSchema,
    prompt,
  });

  // Clamp salience to [0,1] since we can't use min/max in Zod with Anthropic
  object.memories = object.memories.map((m) => ({
    ...m,
    salience: Math.max(0, Math.min(1, m.salience)),
  }));

  return object;
}
