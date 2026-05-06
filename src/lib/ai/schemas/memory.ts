import { z } from "zod";

export const memoryOutputSchema = z.object({
  memories: z.array(
    z.object({
      type: z.enum(["episodic", "semantic"]),
      content: z.string(),
      salience: z.number(),
    })
  ),
});

export type MemoryOutput = z.infer<typeof memoryOutputSchema>;
