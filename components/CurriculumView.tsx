"use client";

import { useState } from "react";
import type { Lesson, QuizItem } from "@/lib/types";
import { useReview, makeCardId } from "@/lib/store";
import { useProgress } from "@/lib/progress";

export function CurriculumView({
  lessons,
  title,
  subtitle,
}: {
  lessons: Lesson[];
  title: string;
  subtitle: string;
}) {
  const [openId, setOpenId] = useState<string>(lessons[0]?.id ?? "");

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        <p className="mt-1 text-ink-soft">{subtitle}</p>
      </header>

      <div className="grid gap-3 md:grid-cols-[220px_1fr]">
        {/* Lesson list */}
        <nav className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
          {lessons.map((l) => (
            <button
              key={l.id}
              onClick={() => setOpenId(l.id)}
              className={`shrink-0 rounded-xl border px-3 py-2 text-left text-sm transition md:shrink ${
                openId === l.id
                  ? "border-gold bg-gold/10 text-ink"
                  : "border-[#ece3d2] bg-white text-ink-soft hover:border-gold"
              }`}
            >
              <div className="font-semibold">{l.title}</div>
              <div className="text-xs text-ink-faint">{l.level}</div>
            </button>
          ))}
        </nav>

        <div>
          {lessons
            .filter((l) => l.id === openId)
            .map((l) => (
              <LessonView key={l.id} lesson={l} />
            ))}
        </div>
      </div>
    </div>
  );
}

function LessonView({ lesson }: { lesson: Lesson }) {
  const { toggleCard, isSaved } = useReview();
  const conceptCard = {
    front: lesson.title.replace(/^\d+\.\s*/, ""),
    back: lesson.concept,
    context: lesson.explanation,
    source: "Curriculum",
    register: "Grammar",
  };
  const saved = isSaved(makeCardId(conceptCard));

  return (
    <article className="rounded-2xl border border-[#ece3d2] bg-parchment-card p-6 shadow-sm">
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gold">
        {lesson.level}
      </div>
      <h2 className="text-xl font-bold text-ink">{lesson.title}</h2>
      <p className="mt-2 rounded-lg bg-[#fdfaf3] p-3 text-[0.95rem] font-medium text-ink">
        {lesson.concept}
      </p>
      <p className="mt-3 leading-relaxed text-ink-soft">{lesson.explanation}</p>

      <ul className="mt-4 space-y-1.5">
        {lesson.keyPoints.map((k, i) => (
          <li key={i} className="flex gap-2 text-sm text-ink-soft">
            <span className="mt-1 text-gold">◆</span>
            <span className="arabic-allowed" dir="auto">
              {k}
            </span>
          </li>
        ))}
      </ul>

      <h3 className="mt-5 text-sm font-bold text-ink">Examples from your reading</h3>
      <div className="mt-2 space-y-2">
        {lesson.examples.map((ex, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 rounded-xl border border-[#f0e8d8] bg-white p-3"
          >
            <div>
              <span className="arabic font-quran text-2xl text-ink">
                {ex.arabic}
              </span>
              <span className="ml-2 text-sm italic text-ink-faint">
                {ex.translit}
              </span>
              <div className="text-sm text-ink-soft">
                {ex.translation}
                {ex.note && (
                  <span className="text-ink-faint"> — {ex.note}</span>
                )}
              </div>
            </div>
            {ex.ref && (
              <a
                href={`/read/${ex.ref.split(":")[0]}`}
                className="shrink-0 rounded-md bg-[#f0e8d8] px-2 py-1 text-xs font-medium text-gold"
              >
                {ex.ref} →
              </a>
            )}
          </div>
        ))}
      </div>

      <h3 className="mt-5 text-sm font-bold text-ink">Check yourself</h3>
      <div className="mt-2 space-y-3">
        {lesson.quiz.map((q, i) => (
          <Quiz key={i} id={`${lesson.id}:${i}`} item={q} />
        ))}
      </div>

      <div className="mt-5 border-t border-[#f0e8d8] pt-4">
        <button
          onClick={() => toggleCard("concept", conceptCard)}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            saved
              ? "bg-sage text-white"
              : "bg-ink text-parchment hover:bg-[#332c24]"
          }`}
        >
          {saved ? "✓ Concept saved to review" : "+ Save this concept to review"}
        </button>
      </div>
    </article>
  );
}

function Quiz({ id, item }: { id: string; item: QuizItem }) {
  const { recordQuiz, quizResult } = useProgress();
  const stored = quizResult(id);
  // Local pick takes precedence; otherwise fall back to the stored answer
  // (which may load from localStorage after the first render).
  const [localPick, setLocalPick] = useState<number | null>(null);
  const picked = localPick !== null ? localPick : stored ? stored.picked : null;

  const pick = (i: number) => {
    setLocalPick(i);
    recordQuiz(id, i, i === item.answer);
  };

  return (
    <div className="rounded-xl border border-[#f0e8d8] bg-white p-3">
      <div className="mb-2 text-sm font-medium text-ink arabic-allowed" dir="auto">
        {item.q}
      </div>
      <div className="flex flex-wrap gap-2">
        {item.options.map((o, i) => {
          const correct = i === item.answer;
          let cls = "border-[#e3d8c2] bg-white text-ink-soft hover:border-gold";
          if (picked !== null && correct) cls = "border-sage bg-sage/10 text-sage";
          else if (picked === i && !correct)
            cls = "border-red-300 bg-red-50 text-red-700";
          return (
            <button
              key={i}
              onClick={() => pick(i)}
              dir="auto"
              className={`rounded-lg border px-3 py-1.5 text-sm transition ${cls}`}
            >
              {o}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <p className="mt-2 text-xs text-ink-soft">
          {picked === item.answer ? "✓ Correct. " : "Not quite. "}
          {item.explanation}
        </p>
      )}
    </div>
  );
}
