import {
  getLastMessages,
  getShapeMessageCount,
  getLastShapeSpokeAt,
  getRoomTokensToday,
} from "@/lib/redis";

export type PrefilterResult =
  | { pass: true }
  | { pass: false; reason: string };

export type PrefilterParams = {
  roomId: string;
  triggerEvent: string;
  humanOnline: boolean;
  userInQuietHours: boolean;
  shapeIds: string[];
  dailyTokenBudget: number;
};

export async function runPrefilter(params: PrefilterParams): Promise<PrefilterResult> {
  const now = Date.now();

  // Rule 1: Recent shape reply throttle — if any shape spoke <2s ago, drop event
  const lastShapeSpokeAt = await getLastShapeSpokeAt(params.roomId);
  if (lastShapeSpokeAt && now - lastShapeSpokeAt < 2000) {
    return { pass: false, reason: "recent_shape_throttle" };
  }

  // Rule 2: Shape-to-shape loop guard — if last 2 messages both from shapes, block
  const lastSenders = await getLastMessages(params.roomId, 2);
  const isHumanTrigger = params.triggerEvent === "message.sent" || params.triggerEvent === "user.joined_room";
  const secondsSinceLastShape = lastShapeSpokeAt ? (now - lastShapeSpokeAt) / 1000 : Infinity;

  if (
    lastSenders.length >= 2 &&
    lastSenders.every((s) => s.startsWith("shape:")) &&
    !isHumanTrigger &&
    secondsSinceLastShape < 30
  ) {
    return { pass: false, reason: "shape_to_shape_loop_guard" };
  }

  // Rule 3: Per-shape hourly cap — shapes on cooldown are excluded (handled in director context)
  // Director is told which shapes are over quota; no hard block here

  // Rule 4: Per-room daily token budget
  const tokensToday = await getRoomTokensToday(params.roomId);
  if (tokensToday >= params.dailyTokenBudget) {
    return { pass: false, reason: "daily_token_budget_exceeded" };
  }

  // Rule 5: Quiet hours — no proactive triggers
  if (params.userInQuietHours && params.triggerEvent !== "message.sent") {
    return { pass: false, reason: "quiet_hours" };
  }

  // Rule 6: Empty room guard — if no humans online, do nothing
  if (!params.humanOnline) {
    return { pass: false, reason: "no_humans_online" };
  }

  return { pass: true };
}
