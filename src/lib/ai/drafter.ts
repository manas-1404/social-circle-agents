import { generateText } from "ai";
import { getLLM } from "./providers";
import { renderPersonaSystemPrompt, renderPersonaUserMessage } from "@/lib/persona/render";
import type { PersonaKernel } from "@/lib/persona/schema";
import { withRetry } from "./retry";

export type DraftParams = {
  persona: PersonaKernel;
  chatHistory: string;
  strategy: string;
  intent: string;
  addressing: string;
  shapeId: string;
  userId: string;
  userProfile?: string | null;
  earlierResponders: { shapeName: string; text: string }[];
};

export type DraftResult = {
  text: string;
  silence: boolean;
  tokensUsed: number;
};

export async function draftShapeResponse(params: DraftParams): Promise<DraftResult> {
  const baseSystem = renderPersonaSystemPrompt(
    params.persona,
    params.strategy,
    params.intent,
    params.addressing
  );

  const system = params.userProfile
    ? `${baseSystem}\n\n# What you know about this person\n${params.userProfile}`
    : baseSystem;

  const userMessage = renderPersonaUserMessage(
    params.chatHistory,
    params.earlierResponders
  );

  console.log("[draft] drafting for shape:", params.shapeId, "user:", params.userId, "hasProfile:", !!params.userProfile);

  const { text, usage } = await withRetry(() =>
    generateText({
      model: getLLM(),
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
