import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { onMessageSent } from "@/lib/inngest/functions/on-message-sent";
import { onTimeElapsed } from "@/lib/inngest/functions/on-time-elapsed";
import { onIdleConsolidate } from "@/lib/inngest/functions/on-idle-consolidate";
import { reviveIdleRooms } from "@/lib/inngest/functions/revive-idle-rooms";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [onMessageSent, onTimeElapsed, onIdleConsolidate, reviveIdleRooms],
});
