export function detectLoop(
  newText: string,
  shapeRecentMessages: string[],
  allShapesRecentMessages: string[][]
): boolean {
  const allPrior = [
    ...shapeRecentMessages,
    ...allShapesRecentMessages.flat(),
  ];

  for (const prior of allPrior) {
    if (overlapRatio(newText, prior) > 0.7) {
      return true;
    }
  }
  return false;
}

function overlapRatio(a: string, b: string): number {
  if (!a || !b) return 0;
  const aWords = new Set(a.toLowerCase().split(/\s+/));
  const bWords = new Set(b.toLowerCase().split(/\s+/));
  let overlap = 0;
  for (const word of aWords) {
    if (bWords.has(word)) overlap++;
  }
  return overlap / Math.max(aWords.size, bWords.size);
}
