import type { CardContent, CardVariant, QuranWord, SalahWord } from "./types";

// A unified shape the TapPanel can render, regardless of source.
export interface WordDetail {
  arabic: string;
  transliteration?: string;
  translation: string;
  root?: string | null;
  lemma?: string | null;
  pos?: string | null;
  form?: string | null;
  grammar?: string[];
  case?: string | null;
  segments?: string[];
  context?: string;
  contextTranslation?: string;
  source: string;
  register: string;
}

export function fromQuranWord(
  w: QuranWord,
  ayahKey: string,
  ayahArabic: string,
  ayahTranslation: string
): WordDetail {
  return {
    arabic: w.arabic,
    transliteration: w.transliteration,
    translation: w.translation,
    root: w.morph?.root ?? null,
    lemma: w.morph?.lemma ?? null,
    pos: w.morph?.pos ?? null,
    form: w.morph?.form ?? null,
    grammar: w.morph?.grammar ?? [],
    case: w.morph?.case ?? null,
    segments: w.morph?.segments ?? [],
    context: ayahArabic,
    contextTranslation: ayahTranslation,
    source: `Qurʾan ${ayahKey}`,
    register: "Qurʾanic",
  };
}

export function fromSalahWord(
  w: SalahWord,
  phraseTitle: string,
  phraseArabic: string,
  phraseTranslation: string
): WordDetail {
  return {
    arabic: w.arabic,
    transliteration: w.translit,
    translation: w.translation,
    root: w.root ?? null,
    pos: w.pos ?? null,
    grammar: [],
    context: phraseArabic,
    contextTranslation: phraseTranslation,
    source: phraseTitle,
    register: "Salah",
  };
}

export function toCardContent(d: WordDetail): CardContent {
  const grammarBits = [
    d.pos,
    d.form,
    ...(d.grammar || []),
    d.case ? `case: ${d.case}` : null,
  ].filter(Boolean);
  return {
    front: d.arabic,
    back: d.translation,
    transliteration: d.transliteration,
    root: d.root ?? undefined,
    grammar: grammarBits.join(" · ") || undefined,
    context: d.context,
    source: d.source,
    register: d.register,
    variant: "recognition",
  };
}

// Build a specific drill variant from a tapped word.
export function variantCardContent(
  d: WordDetail,
  variant: CardVariant
): CardContent {
  return { ...toCardContent(d), variant };
}
