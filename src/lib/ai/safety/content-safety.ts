const CRISIS_PATTERNS = [
  /\b(suicid|kill myself|end my life|don't want to live|want to die)\b/i,
  /\b(self.harm|cut myself|hurt myself)\b/i,
];

const DEPENDENCY_PATTERNS = [
  /\b(you are my only friend|only one who understands|would die without you|can't live without you)\b/i,
];

const THERAPY_CLAIM_PATTERNS = [
  /\b(as your therapist|as a doctor|i am a licensed|i'm a licensed)\b/i,
];

export type SafetyCheckResult = {
  safe: boolean;
  crisis: boolean;
  dependency: boolean;
  therapistClaim: boolean;
};

export function checkContentSafety(text: string): SafetyCheckResult {
  const crisis = CRISIS_PATTERNS.some((p) => p.test(text));
  const dependency = DEPENDENCY_PATTERNS.some((p) => p.test(text));
  const therapistClaim = THERAPY_CLAIM_PATTERNS.some((p) => p.test(text));

  return {
    safe: !therapistClaim,
    crisis,
    dependency,
    therapistClaim,
  };
}

export function checkCumulativeSafety(last50Messages: string[]): boolean {
  // Detect collusion patterns: escalating disallowed content across messages
  let flagCount = 0;
  for (const msg of last50Messages) {
    if (CRISIS_PATTERNS.some((p) => p.test(msg))) flagCount++;
    if (THERAPY_CLAIM_PATTERNS.some((p) => p.test(msg))) flagCount++;
  }
  return flagCount < 3;
}

export const CRISIS_REDIRECT =
  "Hey, I hear you — that sounds really hard. I'm not the right one to help with this, but please reach out to a real human — a friend, family member, or a crisis line. You deserve real support. 💙";

export const DEPENDENCY_REDIRECT =
  "I'm really glad you feel comfortable here, but I also think the people in your life would love to hear from you. I'm just a chat character — real connections matter more.";
