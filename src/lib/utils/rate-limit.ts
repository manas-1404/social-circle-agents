import { redis } from "@/lib/redis";

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }
  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
  };
}

export async function checkMessageRateLimit(userId: string): Promise<boolean> {
  const key = `rate:user:${userId}:messages`;
  const { allowed } = await checkRateLimit(key, 10, 60);
  return allowed;
}
