import { generateJson, getDirectorLLM } from "./providers";
import { directorOutputSchema, type DirectorOutput } from "./schemas/director";
import { DIRECTOR_SYSTEM_PROMPT, buildDirectorUserMessage } from "./prompts/director";
import { withRetry } from "./retry";

export type DirectorParams = Parameters<typeof buildDirectorUserMessage>[0];

export async function runDirector(params: DirectorParams): Promise<{
  output: DirectorOutput;
  tokensUsed: number;
  latencyMs: number;
}> {
  const start = Date.now();
  const userMessage = buildDirectorUserMessage(params);

  try {
    const { object, usage } = await withRetry(() =>
      generateJson({
        schema: directorOutputSchema,
        system: DIRECTOR_SYSTEM_PROMPT,
        prompt: userMessage,
        model: getDirectorLLM(),
      })
    );

    // Enforce max 2 responders (belt-and-suspenders, schema allows array but we cap here)
    const capped = { ...object, responders: object.responders.slice(0, 2) };

    // Clamp delay_ms to valid range [200, 8000] since we can't use min/max in Zod with Anthropic
    capped.responders = capped.responders.map((r) => ({
      ...r,
      delay_ms: Math.max(200, Math.min(8000, r.delay_ms)),
    }));

    // Sort by delay_ms ascending
    capped.responders.sort((a, b) => a.delay_ms - b.delay_ms);

    return {
      output: capped,
      tokensUsed: (usage?.totalTokens ?? 0),
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    console.error("[Director] Error:", err);
    // Fail safe: return empty responders rather than crashing the pipeline
    return {
      output: { responders: [], skip_reason: "director_error" },
      tokensUsed: 0,
      latencyMs: Date.now() - start,
    };
  }
}
