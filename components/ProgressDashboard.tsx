"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress";
import { useReview } from "@/lib/store";
import surahIndex from "@/lib/data/quran/index.json";
import curriculum from "@/lib/data/curriculum.json";
import roots from "@/lib/data/roots.json";
import type { SurahMeta, Lesson } from "@/lib/types";

const SURAHS = surahIndex as SurahMeta[];
const LESSONS = (curriculum as { lessons: Lesson[] }).lessons;
const TOTAL_ROOTS = Object.keys(roots as Record<string, unknown>).length;
const TOTAL_AYAHS = SURAHS.reduce((n, s) => n + s.versesCount, 0);

function last14Days(): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = 13; i >= 0; i--) {
    const x = new Date(d);
    x.setDate(d.getDate() - i);
    out.push(x.toISOString().slice(0, 10));
  }
  return out;
}

export function ProgressDashboard() {
  const { ready, state, streak, reset } = useProgress();
  const { stats } = useReview();

  if (!ready) return <p className="text-ink-faint">Loading your progress…</p>;

  const ayahsRead = state.ayahsRead.length;
  const wordsExplored = state.wordsTapped.length;
  const rootsSeen = state.rootsSeen.length;
  const openedSet = new Set(state.surahsOpened);

  const lessonsDone = LESSONS.filter((l) =>
    l.quiz.every((_, i) => state.quiz[`${l.id}:${i}`]?.correct)
  );

  const days = last14Days();
  const counts = days.map((d) => state.reviewsByDay[d] || 0);
  const maxCount = Math.max(1, ...counts);

  return (
    <div className="space-y-8">
      {/* Streak hero */}
      <div className="flex items-center gap-4 rounded-2xl border border-[#ece3d2] bg-gradient-to-br from-[#fffdf8] to-parchment-deep p-5">
        <div className="text-5xl">🔥</div>
        <div>
          <div className="text-3xl font-bold text-ink">
            {streak} day{streak === 1 ? "" : "s"}
          </div>
          <div className="text-sm text-ink-soft">
            {streak === 0
              ? "Study or review today to start a streak."
              : "Keep it going — review at least one card a day."}
          </div>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat value={wordsExplored} label="Words explored" />
        <Stat value={`${rootsSeen}/${TOTAL_ROOTS}`} label="Roots encountered" />
        <Stat value={`${ayahsRead}/${TOTAL_AYAHS}`} label="Ayahs studied" />
        <Stat value={stats.total} label="Cards saved" accent />
      </div>

      {/* Review activity */}
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-faint">
          Review activity — last 14 days
        </h2>
        <div className="flex items-end gap-1.5 rounded-2xl border border-[#ece3d2] bg-parchment-card p-4">
          {days.map((d, i) => (
            <div key={d} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-sage/80"
                style={{
                  height: `${6 + (counts[i] / maxCount) * 70}px`,
                  opacity: counts[i] === 0 ? 0.18 : 1,
                }}
                title={`${counts[i]} reviews on ${d}`}
              />
              <span className="text-[9px] text-ink-faint">
                {["S", "M", "T", "W", "T", "F", "S"][new Date(d + "T00:00").getDay()]}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Surah completion */}
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-faint">
          Surahs opened ({openedSet.size}/{SURAHS.length})
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {SURAHS.map((s) => {
            const opened = openedSet.has(s.id);
            return (
              <Link
                key={s.id}
                href={`/read/${s.id}`}
                className={`flex items-center gap-2 rounded-xl border p-2.5 transition ${
                  opened
                    ? "border-sage/40 bg-sage/10"
                    : "border-[#ece3d2] bg-white hover:border-gold"
                }`}
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded text-[11px] font-bold ${
                    opened ? "bg-sage text-white" : "bg-[#f0e8d8] text-gold"
                  }`}
                >
                  {opened ? "✓" : s.id}
                </span>
                <span className="truncate text-sm text-ink">{s.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Lessons */}
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-faint">
          Lessons mastered ({lessonsDone.length}/{LESSONS.length})
        </h2>
        <div className="space-y-2">
          {LESSONS.map((l) => {
            const done = lessonsDone.includes(l);
            return (
              <Link
                key={l.id}
                href="/curriculum"
                className="flex items-center gap-3 rounded-xl border border-[#ece3d2] bg-white p-3 hover:border-gold"
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs ${
                    done ? "bg-sage text-white" : "border border-[#e3d8c2] text-ink-faint"
                  }`}
                >
                  {done ? "✓" : ""}
                </span>
                <span className="flex-1 text-sm text-ink">{l.title}</span>
                <span className="text-xs text-ink-faint">{l.level}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-t border-[#ece3d2] pt-4">
        <button
          onClick={() => {
            if (confirm("Reset all progress (reading, quizzes, streak)? Your saved review cards are kept."))
              reset();
          }}
          className="text-xs text-red-500 hover:underline"
        >
          Reset progress
        </button>
      </section>
    </div>
  );
}

function Stat({
  value,
  label,
  accent,
}: {
  value: number | string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 text-center ${
        accent ? "border-gold/40 bg-gold/10" : "border-[#ece3d2] bg-parchment-card"
      }`}
    >
      <div className={`text-2xl font-bold ${accent ? "text-gold" : "text-ink"}`}>
        {value}
      </div>
      <div className="text-xs text-ink-faint">{label}</div>
    </div>
  );
}
