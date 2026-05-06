import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "ai-agent-chat",
  eventKey: process.env.INNGEST_EVENT_KEY ?? "local",
  signingKey: process.env.INNGEST_SIGNING_KEY ?? "signkey-local-dev",
  isDev: process.env.NODE_ENV !== "production",
});

export const EVENTS = {
  MESSAGE_SENT: "chat/message.sent",
  TIME_ELAPSED: "chat/time.elapsed",
  IDLE_CONSOLIDATE: "chat/idle.consolidate",
} as const;
