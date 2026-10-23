// Server-side data access. JSON is imported statically and typed.
import indexJson from "./data/quran/index.json";
import salahJson from "./data/salah.json";
import curriculumJson from "./data/curriculum.json";
import irabJson from "./data/irab.json";
import type {
  Surah,
  SurahMeta,
  SalahData,
  Lesson,
  IrabData,
} from "./types";

const surahModules: Record<string, () => Promise<{ default: Surah }>> = {
  "1": () => import("./data/quran/1.json") as Promise<{ default: Surah }>,
  "105": () => import("./data/quran/105.json") as Promise<{ default: Surah }>,
  "106": () => import("./data/quran/106.json") as Promise<{ default: Surah }>,
  "107": () => import("./data/quran/107.json") as Promise<{ default: Surah }>,
  "108": () => import("./data/quran/108.json") as Promise<{ default: Surah }>,
  "109": () => import("./data/quran/109.json") as Promise<{ default: Surah }>,
  "110": () => import("./data/quran/110.json") as Promise<{ default: Surah }>,
  "111": () => import("./data/quran/111.json") as Promise<{ default: Surah }>,
  "112": () => import("./data/quran/112.json") as Promise<{ default: Surah }>,
  "113": () => import("./data/quran/113.json") as Promise<{ default: Surah }>,
  "114": () => import("./data/quran/114.json") as Promise<{ default: Surah }>,
};

export function getSurahIndex(): SurahMeta[] {
  return indexJson as SurahMeta[];
}

export async function getSurah(id: number | string): Promise<Surah | null> {
  const loader = surahModules[String(id)];
  if (!loader) return null;
  const mod = await loader();
  return mod.default;
}

export function getSalah(): SalahData {
  return salahJson as SalahData;
}

export function getCurriculum(): { title: string; subtitle: string; lessons: Lesson[] } {
  return curriculumJson as { title: string; subtitle: string; lessons: Lesson[] };
}

export function getIrab(key: string): IrabData | null {
  const all = irabJson as Record<string, IrabData>;
  return all[key] ?? null;
}

export function hasIrab(key: string): boolean {
  return key in (irabJson as Record<string, unknown>);
}
