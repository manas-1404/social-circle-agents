import { generateJson, getDirectorLLM } from "./providers";
import { memoryOutputSchema, type MemoryOutput } from "./schemas/memory";
import { buildMemoryConsolidationPrompt } from "./prompts/memory-consolidate";

export async function consolidateMemories(params: {
  shapeName: string;
  userName: string;
  conversation: string;
  existingProfile: string | null;
}): Promise<MemoryOutput> {
  const prompt = buildMemoryConsolidationPrompt(params);

  const { object } = await generateJson({
    schema: memoryOutputSchema,
    prompt,
    model: getDirectorLLM(),
  });

  return object;
}
