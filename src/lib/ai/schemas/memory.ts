import { z } from "zod";

export const memoryOutputSchema = z.object({
  should_update: z.boolean(),
  profile: z.string().nullable(),
});

export type MemoryOutput = z.infer<typeof memoryOutputSchema>;
