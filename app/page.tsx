import Link from "next/link";
import { getSurahIndex } from "@/lib/data";

const MODES = [
  {
    href: "/salah",
    emoji: "🕌",
    title: "Salah Mode",
    desc: "Understand every word you say in prayer — takbīr, rukūʿ, sujūd, tashahhud, and more.",
  },
  {
    href: "/read/1",
    emoji: "📖",
    title: "Qurʾan Reader",
    desc: "Al-Fātiḥah + the last 10 surahs with translation, word-by-word, root, pattern, and iʿrāb.",
  },
  {
    href: "/curriculum",
    emoji: "🧭",
    title: "Curriculum",
    desc: "Bite-size grammar — nouns/verbs/particles, iḍāfah, roots & patterns — tied to real ayahs.",
  },
  {
    href: "/review",
    emoji: "🔁",
    title: "Review (FSRS)",
    desc: "Everything you save flows into one spaced-repetition deck. Export to Anki anytime.",
  },
];

export default function HomePage() {
  const surahs = getSurahIndex();

  return (
    <div>
      <section className="mb-10 text-center">
        <div className="arabic font-quran text-4xl text-gold">ٱقْرَأْ</div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">
          Read the Qurʾan and understand it
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-ink-soft">
          Tap any word to see its root, pattern, and grammar. Save what matters.
          Review it with spaced repetition. Built around ṣalāh and the short
          surahs you already recite.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {MODES.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="group rounded-2xl border border-[#ece3d2] bg-parchment-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-gold hover:shadow-md"
          >
            <div className="text-3xl">{m.emoji}</div>
            <h2 className="mt-2 text-lg font-bold text-ink group-hover:text-gold">
              {m.title}
            </h2>
            <p className="mt-1 text-sm text-ink-soft">{m.desc}</p>
          </Link>
        ))}
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-faint">
          Jump into a surah
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {surahs.map((s) => (
            <Link
              key={s.id}
              href={`/read/${s.id}`}
              className="flex items-center gap-3 rounded-xl border border-[#ece3d2] bg-white p-3 transition hover:border-gold"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#f0e8d8] text-xs font-bold text-gold">
                {s.id}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-ink">
                  {s.name}
                </span>
                <span className="block truncate text-xs text-ink-faint">
                  {s.translatedName}
                </span>
              </span>
              <span className="arabic font-quran ml-auto text-lg text-ink-soft">
                {s.nameArabic}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
