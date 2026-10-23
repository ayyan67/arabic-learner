export interface Morph {
  root: string | null;
  lemma: string | null;
  pos: string | null;
  form: string | null;
  grammar: string[];
  case: string | null;
  segments: string[];
}

export interface QuranWord {
  position: number;
  arabic: string;
  transliteration: string;
  translation: string;
  morph: Morph | null;
}

export interface Ayah {
  key: string;
  number: number;
  arabic: string;
  translation: string;
  audio: string;
  words: QuranWord[];
}

export interface Surah {
  id: number;
  name: string;
  nameArabic: string;
  translatedName: string;
  versesCount: number;
  revelationPlace: string;
  bismillah: boolean;
  ayahs: Ayah[];
}

export interface SurahMeta {
  id: number;
  name: string;
  nameArabic: string;
  translatedName: string;
  versesCount: number;
  revelationPlace: string;
}

export interface SalahWord {
  arabic: string;
  translit: string;
  translation: string;
  root?: string;
  pos?: string;
}

export interface SalahPhrase {
  id: string;
  title: string;
  when: string;
  arabic: string;
  translation: string;
  reference: string;
  words: SalahWord[];
}

export interface SalahGroup {
  id: string;
  title: string;
  phrases: SalahPhrase[];
}

export interface SalahData {
  title: string;
  subtitle: string;
  note: string;
  groups: SalahGroup[];
}

export interface LessonExample {
  arabic: string;
  translit: string;
  translation: string;
  kind?: string;
  note?: string;
  ref?: string;
}

export interface QuizItem {
  q: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  level: string;
  title: string;
  concept: string;
  explanation: string;
  keyPoints: string[];
  examples: LessonExample[];
  quiz: QuizItem[];
}

export interface IrabWord {
  arabic: string;
  role: string;
  case: string;
  explanation: string;
}

export interface IrabData {
  key: string;
  arabic: string;
  translation: string;
  words: IrabWord[];
  questions: QuizItem[];
}

// ---- Review cards ----------------------------------------------------------
export type CardType = "word" | "ayah" | "phrase" | "concept";

export type CardVariant = "recognition" | "production" | "root";

export interface CardContent {
  front: string;        // Arabic prompt
  back: string;         // meaning / answer
  transliteration?: string;
  root?: string;
  grammar?: string;
  context?: string;     // ayah / phrase context
  source: string;       // e.g. "Qurʾan 1:2" or "Tashahhud"
  register: string;     // "Qurʾanic" | "Salah" | "Grammar"
  variant?: CardVariant; // how the card is drilled (default recognition)
}

export interface ReviewCard {
  id: string;
  type: CardType;
  content: CardContent;
  // ts-fsrs card state is stored as a plain object
  fsrs: Record<string, unknown>;
  createdAt: number;
}
