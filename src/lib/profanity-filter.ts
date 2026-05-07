import leoProfanity from "leo-profanity";

// Insults/scolding not in the default list
leoProfanity.add([
  "idiot", "moron", "dumb", "stupid", "loser",
  "garbage", "trash", "worthless", "useless", "pathetic",
]);

export function containsProfanity(text: string): boolean {
  return leoProfanity.check(text);
}

export const PROFANITY_ERROR =
  "Your message contains language that isn't allowed here. Please rephrase it.";
