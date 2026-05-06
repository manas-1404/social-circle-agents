export function buildMemoryConsolidationPrompt(params: {
  shapeName: string;
  userName: string;
  conversation: string;
  existingMemories: string[];
}): string {
  return `You are creating a structured memory summary for ${params.shapeName} from a conversation with ${params.userName}.

CONVERSATION:
${params.conversation}

EXISTING MEMORIES (do not duplicate):
${params.existingMemories.join("\n") || "(none yet)"}

Generate up to 5 NEW memories. Each is one of:
- episodic: a specific moment ("On [date], [user] said [quote] when we were talking about [topic]")
- semantic: a fact about the user ("[user]'s cat is named Benji" / "[user] works as a software engineer")

Rules:
- Skip generic information already obvious from the persona.
- Prefer specifics over generalities. Include exact quotes for episodic memories.
- Do not extract sensitive info (medical, financial, government IDs, passwords) unless directly relevant.
- Do not record information about THIRD parties without explicit relevance.
- salience is a number from 0.0 to 1.0 indicating how often this should resurface.`;
}
