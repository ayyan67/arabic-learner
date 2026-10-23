// Progressive vocalization control.
// Levels mirror the classical "remove the harakāt gradually" teaching method.

export type TashkilLevel = "full" | "no-end" | "minimal" | "none";

export const TASHKIL_LEVELS: { id: TashkilLevel; label: string; hint: string }[] = [
  { id: "full", label: "Full", hint: "All vowels shown" },
  { id: "no-end", label: "No endings", hint: "Hide case endings (iʿrāb)" },
  { id: "minimal", label: "Minimal", hint: "Keep only shaddah" },
  { id: "none", label: "Bare", hint: "No vowels at all" },
];

// All harakāt incl. dagger alef, EXCLUDING shaddah (ّ).
const NON_SHADDA = /[ً-ِْٰ]/g;
// Everything incl. shaddah.
const ALL_MARKS = /[ً-ْٰ]/g;
// Trailing marks at the end of a token (the case ending).
const TRAILING = /[ً-ْٰ]+$/u;

export function stripTashkil(text: string, level: TashkilLevel): string {
  if (!text) return text;
  switch (level) {
    case "full":
      return text;
    case "minimal":
      return text.replace(NON_SHADDA, "");
    case "none":
      return text.replace(ALL_MARKS, "");
    case "no-end":
      return text
        .split(/(\s+)/)
        .map((tok) => (/\s/.test(tok) ? tok : tok.replace(TRAILING, "")))
        .join("");
    default:
      return text;
  }
}
