import Link from "next/link";
import { getSurahIndex } from "@/lib/data";

export default function ReadIndexPage() {
  const surahs = getSurahIndex();
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Qurʾan Reader</h1>
        <p className="mt-1 text-ink-soft">
          Al-Fātiḥah and the last 10 surahs. Tap any word for its morphology;
          toggle translation, word-by-word, and vocalization.
        </p>
      </header>
      <div className="grid gap-2 sm:grid-cols-2">
        {surahs.map((s) => (
          <Link
            key={s.id}
            href={`/read/${s.id}`}
            className="flex items-center gap-3 rounded-xl border border-[#ece3d2] bg-parchment-card p-4 transition hover:border-gold"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#f0e8d8] text-sm font-bold text-gold">
              {s.id}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-ink">{s.name}</span>
              <span className="block text-xs text-ink-faint">
                {s.translatedName} · {s.versesCount} verses
              </span>
            </span>
            <span className="arabic font-quran text-2xl text-ink-soft">
              {s.nameArabic}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
