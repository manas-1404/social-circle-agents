import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { generateText } from "ai";
import { z } from "zod";
import { gateway } from "./gateway";

// LLM provider — AWS Bedrock
// To switch models or providers, change only this file.
const bedrockProvider = createAmazonBedrock({
  region: process.env.AWS_REGION ?? "us-east-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// US geo cross-region inference ID — required for Llama 4 Scout (not available as in-region)
export const DEFAULT_LLM_MODEL_ID = "us.meta.llama4-scout-17b-instruct-v1:0";

export function getLLM(modelId: string = DEFAULT_LLM_MODEL_ID) {
  return bedrockProvider(modelId);
}

// Embedding provider — Vercel AI Gateway (OpenAI text-embedding-3-small)
// Kept separate from LLM so each can be migrated independently.
export const embeddingModel = gateway.textEmbeddingModel("openai/text-embedding-3-small");

// generateJson: structured output via generateText + Zod parse.
// Replaces generateObject for models (like Llama 4 on Bedrock) that reject
// toolChoice.any, which the AI SDK sends when using generateObject.
export async function generateJson<T>(params: {
  system?: string;
  prompt: string;
  schema: z.ZodType<T>;
}): Promise<{ object: T; usage: { totalTokens: number } }> {
  // Embed the exact JSON schema so the model knows the required field names and types.
  const jsonSchema = JSON.stringify(z.toJSONSchema(params.schema), null, 2);
  const jsonInstruction = `\n\nYou MUST respond with a single raw JSON object that strictly conforms to this JSON Schema. No markdown, no code fences, no explanation — only the JSON object.\n\nSchema:\n${jsonSchema}`;

  const { text, usage } = await generateText({
    model: getLLM(),
    system: params.system ? params.system + jsonInstruction : jsonInstruction.trim(),
    prompt: params.prompt,
  });

  // Strip markdown code fences if the model adds them anyway
  const clean = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  const parsed = JSON.parse(clean);
  const object = params.schema.parse(parsed);
  return { object, usage: { totalTokens: usage?.totalTokens ?? 0 } };
}
