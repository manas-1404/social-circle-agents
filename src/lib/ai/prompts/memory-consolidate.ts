export function buildMemoryConsolidationPrompt(params: {
  shapeName: string;
  userName: string;
  conversation: string;
  existingProfile: string | null;
}): string {
  return `You maintain a personal profile about ${params.userName} for ${params.shapeName}.

EXISTING PROFILE:
${params.existingProfile ?? "(no profile yet)"}

RECENT CONVERSATION (last 10 messages):
${params.conversation}

Decide: does this conversation contain anything new and meaningful about ${params.userName} that is not already captured in the profile? New relationships, life events, strong opinions, recurring themes, personal context.

If YES: rewrite the full profile as a concise collection of facts about ${params.userName}. Free-text, no structure required. Write only facts about the user — never include ${params.shapeName}'s name, reactions, or opinions. Keep it dense and specific. Return should_update: true and the full updated profile text.

If NO: return should_update: false and profile: null. Do not update for small talk, greetings, or anything already captured in the profile.`;
}
