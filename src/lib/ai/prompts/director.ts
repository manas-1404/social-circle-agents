export const DIRECTOR_SYSTEM_PROMPT = `You are the Director of a multi-agent group chat. Your job is to decide whether any AI participants ("shapes") should respond to the latest event, and if so, who, how, and with what intent.

You are NOT a chat participant. You are infrastructure. You output structured JSON only.

CRITICAL RULES (violating any of these is a failure):

1. Maximum 2 responders per call.
2. "Empty responders" with a skip_reason is a valid and frequent output.
3. If the last 2 messages were both from shapes, return empty responders with skip_reason "shape_to_shape_throttle" UNLESS the human just spoke or a long pause has elapsed.
4. If the user message is purely transactional ("ok", "lol", emoji-only, single word), strongly prefer empty responders unless a shape is directly addressed.
5. Each responder's strategy must be one of: validate, tease, ask_question, disagree, share_anecdote, summarize, redirect, bridge_perspectives, proactive_check_in, keep_silent.
6. addressing must be "user:{id}", "shape:{id}", or "room".
7. Order responders by ascending delay_ms. The second responder will see the first one's reply before drafting.
8. Avoid echo chamber: if shape A is set to "validate", do not also set shape B to "validate" with similar intent.
9. delay_ms should reflect personality: extrovert (300-1500), normal (800-2500), shy (1500-4000), thinker (2000-5000). Use integers only.
10. For proactive triggers (idle events), only schedule if a specific shape's free_will rules genuinely match the situation.`;

export function buildDirectorUserMessage(params: {
  roomMode: string;
  activeHumanIds: string[];
  activeShapeIds: string[];
  secondsSinceLastMessage: number;
  triggerEvent: string;
  triggerEventJson: string;
  recentMessages: Array<{ time: string; sender: string; type: "shape" | "human"; content: string }>;
  shapes: Array<{
    id: string;
    slug: string;
    summary: string;
    talkativeness: number;
    lastSpoke: string;
    messagesThisHour: number;
    reactivityKeywords: string[];
  }>;
}): string {
  const messageLog = params.recentMessages
    .map((m) => `[${m.time}] @${m.sender} (${m.type}): ${m.content}`)
    .join("\n");

  const shapesBlock = params.shapes
    .map((s) => {
      const cooldownNote =
        s.lastSpoke === "just now" ? "  ← in cooldown, do not pick" : "";
      return `${s.slug} (id: ${s.id})
  Personality summary: ${s.summary}
  Talkativeness: ${s.talkativeness}
  Last spoke: ${s.lastSpoke}
  Messages this hour: ${s.messagesThisHour} / 15
  Reactivity keywords: [${s.reactivityKeywords.join(", ")}]${cooldownNote}`;
    })
    .join("\n\n");

  return `=== ROOM STATE ===
Room mode: ${params.roomMode}
Active humans online: [${params.activeHumanIds.join(", ")}]
Active shapes: [${params.activeShapeIds.join(", ")}]
Time since last message: ${params.secondsSinceLastMessage}s
Trigger event: ${params.triggerEvent}

=== TRIGGER ===
${params.triggerEventJson}

=== RECENT MESSAGES (last 20, oldest first) ===
${messageLog}

=== SHAPES IN ROOM ===

${shapesBlock}

=== YOUR DECISION ===
Output JSON matching the schema. Empty responders + skip_reason is valid.`;
}
