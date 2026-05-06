import { z } from "zod";

export const STRATEGIES = [
  "validate",
  "tease",
  "ask_question",
  "disagree",
  "share_anecdote",
  "summarize",
  "redirect",
  "bridge_perspectives",
  "proactive_check_in",
  "keep_silent",
] as const;

export type Strategy = (typeof STRATEGIES)[number];

export const responderSchema = z.object({
  shape_id: z.string(),
  delay_ms: z.number().int(),
  addressing: z.string(),
  strategy: z.enum(STRATEGIES),
  intent: z.string(),
});

export const directorOutputSchema = z.object({
  responders: z.array(responderSchema),
  skip_reason: z.string().nullable(),
});

export type DirectorOutput = z.infer<typeof directorOutputSchema>;
export type Responder = z.infer<typeof responderSchema>;
