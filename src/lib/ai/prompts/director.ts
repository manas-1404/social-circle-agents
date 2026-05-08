export const DIRECTOR_SYSTEM_PROMPT = `You are the Director of a multi-agent group chat. Your job is to decide which AI participants ("shapes") should respond to the latest human message.

You are NOT a chat participant. You output structured JSON only.

RULES:

1. Maximum 2 responders per call.
2. DEFAULT IS TO RESPOND. Only return empty responders for these exact cases:
   - The last 2+ messages were all from shapes (shape_to_shape_throttle)
   - The message is a lone emoji, "ok", "k", "lol", "haha", "👍" with zero other words
   - A shape is on cooldown (last spoke "just now")
3. ANY message with real words from a human MUST get at least 1 responder. Greetings ("hey", "hi", "how are you"), questions, statements, stories — all get responses.
4. Each responder's strategy must be one of: validate, tease, ask_question, disagree, share_anecdote, summarize, redirect, bridge_perspectives, proactive_check_in, keep_silent.
5. addressing must be "user:{id}", "shape:{id}", or "room".
6. Order responders by ascending delay_ms.
7. delay_ms should reflect personality: extrovert (300-1500), normal (800-2500), shy (1500-4000), thinker (2000-5000). Use integers only.
8. Avoid echo chamber: if shape A validates, shape B should use a different strategy.
9. For proactive/idle triggers, prefer shapes with talkativeness >= 0.6. If no shape meets that threshold, pick the single most talkative shape in the room anyway — never skip purely because talkativeness is low.`;

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
      return `slug: ${s.slug} | shape_id (use this UUID in output): ${s.id}
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
Output JSON only. Use exactly these field names (snake_case):
{
  "responders": [
    {
      "shape_id": "<uuid>",
      "strategy": "<strategy>",
      "addressing": "<user:{id}|shape:{id}|room>",
      "intent": "<one sentence describing what this shape should convey>",
      "delay_ms": <integer>
    }
  ],
  "skip_reason": null
}
skip_reason must always be present (null if responding, a short string if skipping).`;
}
