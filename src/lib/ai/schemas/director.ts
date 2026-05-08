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

export const responderSchema = z.preprocess(
  (val) => {
    if (val && typeof val === "object") {
      const v = val as Record<string, unknown>;
      return { ...v, shape_id: v.shape_id ?? v.shapeId };
    }
    return val;
  },
  z.object({
    shape_id: z.string().describe("The UUID from the 'id:' field of the shape — NOT the slug"),
    delay_ms: z.number().int(),
    addressing: z.string(),
    strategy: z.enum(STRATEGIES),
    intent: z.string().optional().default("respond naturally"),
  })
);

export const directorOutputSchema = z.object({
  responders: z.array(responderSchema),
  skip_reason: z.string().nullable().optional().default(null),
});

export type DirectorOutput = z.infer<typeof directorOutputSchema>;
export type Responder = z.infer<typeof responderSchema>;
