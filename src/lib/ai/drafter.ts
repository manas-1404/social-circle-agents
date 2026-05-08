import { generateText, tool, stepCountIs } from "ai";
import { z } from "zod";
import { getLLM } from "./providers";
import { renderPersonaSystemPrompt, renderPersonaUserMessage } from "@/lib/persona/render";
import type { PersonaKernel } from "@/lib/persona/schema";
import { withRetry } from "./retry";
import { db } from "@/lib/db";
import { user_memories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export type DraftParams = {
  persona: PersonaKernel;
  chatHistory: string;
  strategy: string;
  intent: string;
  addressing: string;
  shapeId: string;
  userId: string;
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
    params.strategy,
    params.intent,
    params.addressing
  );
  const userMessage = renderPersonaUserMessage(
    params.chatHistory,
    params.earlierResponders
  );

  const tools = {
    get_user_profile: tool({
      description:
        "Retrieve your long-term memory about this person. Call this when the user references their past, personal context, relationships, or ongoing topics that may not be in the current chat history.",
      inputSchema: z.object({}),
      execute: async (): Promise<{ profile: string | null }> => {
        console.log("[get_user_profile] called for shape:", params.shapeId, "user:", params.userId);
        try {
          const record = await db.query.user_memories.findFirst({
            where: and(
              eq(user_memories.shape_id, params.shapeId),
              eq(user_memories.user_id, params.userId)
            ),
          });
          console.log("[get_user_profile] profile found:", !!record?.profile);
          return { profile: record?.profile ?? null };
        } catch (err) {
          console.log("[get_user_profile] error for shape:", params.shapeId, err);
          return { profile: null };
        }
      },
    }),
  };

  console.log("[draft] get_user_profile tool active for shape:", params.shapeId, "user:", params.userId);

  const { text, usage } = await withRetry(() =>
    generateText({
      model: getLLM(),
      system,
      prompt: userMessage,
      maxOutputTokens: 200,
      tools,
      stopWhen: stepCountIs(2),
    })
  );

  const cleaned = text.trim().replace(/^["']|["']$/g, "");

  if (cleaned === "[SILENCE]" || cleaned.trim() === "") {
    return { text: "", silence: true, tokensUsed: usage?.totalTokens ?? 0 };
  }

  return { text: cleaned, silence: false, tokensUsed: usage?.totalTokens ?? 0 };
}
