export function typingDurationMs(text: string, wpm: number): number {
  const charsPerMs = (wpm * 5) / 60 / 1000;
  return Math.min(8000, Math.max(500, text.length / charsPerMs));
}
