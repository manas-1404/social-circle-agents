export async function withRetry<T>(
  fn: () => Promise<T>,
  { maxAttempts = 4, baseDelayMs = 1000 }: { maxAttempts?: number; baseDelayMs?: number } = {}
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;

      const isRateLimit =
        (err instanceof Error && err.message.includes("429")) ||
        (typeof err === "object" && err !== null && "status" in err && (err as { status: number }).status === 429);

      if (!isRateLimit || attempt === maxAttempts) throw err;

      const delay = baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 500;
      console.warn(`[AI] Rate limited, retrying in ${Math.round(delay)}ms (attempt ${attempt}/${maxAttempts})`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError;
}
