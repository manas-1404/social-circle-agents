import { generateText } from "ai";
import { gateway } from "./gateway";
import { renderPersonaSystemPrompt, renderPersonaUserMessage } from "@/lib/persona/render";
import type { PersonaKernel } from "@/lib/persona/schema";
import { withRetry } from "./retry";

export type DraftParams = {
  persona: PersonaKernel;
  chatHistory: string;
  strategy: string;
  intent: string;
  addressing: string;
  retrievedMemories: string[];
  earlierResponders: { shapeName: string; text: string }[];
};

export type DraftResult = {
  text: string;
  silence: boolean;
  tokensUsed: number;
};

export async function draftShapeResponse(params: DraftParams): Promise<DraftResult> {
  const system = renderPersonaSystemPrompt(
    params.persona,
    params.retrievedMemories,
    params.strategy,
    params.intent,
    params.addressing
  );
  const userMessage = renderPersonaUserMessage(
    params.chatHistory,
    params.earlierResponders
  );

  const { text, usage } = await withRetry(() =>
    generateText({
      model: gateway("anthropic/claude-sonnet-4-6"),
      system,
      prompt: userMessage,
      maxOutputTokens: 200,
    })
  );

  const cleaned = text.trim().replace(/^["']|["']$/g, "");

  if (cleaned === "[SILENCE]" || cleaned.trim() === "") {
    return { text: "", silence: true, tokensUsed: usage?.totalTokens ?? 0 };
  }

  return { text: cleaned, silence: false, tokensUsed: usage?.totalTokens ?? 0 };
}
