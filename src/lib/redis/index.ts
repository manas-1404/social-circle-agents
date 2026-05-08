import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function pushRoomEvent(roomId: string, event: unknown) {
  return redis.xadd(`stream:room:${roomId}`, "*", {
    data: JSON.stringify(event),
  });
}

export async function getLastMessages(roomId: string, count = 5): Promise<string[]> {
  const key = `room:${roomId}:last_messages`;
  const items = await redis.lrange(key, 0, count - 1);
  return items as string[];
}

export async function pushLastMessage(roomId: string, senderId: string) {
  const key = `room:${roomId}:last_messages`;
  await redis.lpush(key, senderId);
  await redis.ltrim(key, 0, 9);
  await redis.expire(key, 1800);
}

export async function getShapeMessageCount(shapeId: string, roomId: string): Promise<number> {
  const key = `shape:${shapeId}:room:${roomId}:hour_count`;
  const val = await redis.get<number>(key);
  return val ?? 0;
}

export async function incrementShapeMessageCount(shapeId: string, roomId: string) {
  const key = `shape:${shapeId}:room:${roomId}:hour_count`;
  await redis.incr(key);
  await redis.expire(key, 1800);
}

export async function getLastShapeSpokeAt(roomId: string): Promise<number | null> {
  const val = await redis.get<number>(`room:${roomId}:last_shape_spoke_at`);
  return val;
}

export async function setLastShapeSpokeAt(roomId: string) {
  await redis.set(`room:${roomId}:last_shape_spoke_at`, Date.now(), { ex: 1800 });
}

export async function getRoomTokensToday(roomId: string): Promise<number> {
  const val = await redis.get<number>(`room:${roomId}:tokens_today`);
  return val ?? 0;
}

export async function incrementRoomUserMessageCount(roomId: string, userId: string): Promise<number> {
  const key = `room:${roomId}:user:${userId}:msg_count_since_consolidation`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 604800);
  return count;
}

export async function resetRoomUserMessageCount(roomId: string, userId: string): Promise<void> {
  await redis.set(`room:${roomId}:user:${userId}:msg_count_since_consolidation`, 0);
}

export async function incrementRoomTokensRedis(roomId: string, tokens: number) {
  const key = `room:${roomId}:tokens_today`;
  await redis.incrby(key, tokens);
  const ttl = await redis.ttl(key);
  if (ttl < 0) {
    const secondsUntilMidnight = 86400 - (Date.now() / 1000) % 86400;
    await redis.expire(key, Math.floor(secondsUntilMidnight));
  }
}
