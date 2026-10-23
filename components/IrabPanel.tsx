"use client";

import { useState } from "react";
import type { IrabData } from "@/lib/types";
import { useProgress } from "@/lib/progress";

export function IrabPanel({ data }: { data: IrabData }) {
  const [active, setActive] = useState<number | null>(null);
  const words = data.arabic.split(/\s+/).filter(Boolean);

  return (
    <div className="mt-3 rounded-xl border border-[#e7dcc6] bg-[#fdfaf3] p-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gold">
        Interactive iʿrāb — tap each word for its grammatical role
      </div>

      <div
        className="arabic font-quran mb-3 flex flex-wrap justify-end gap-x-3 gap-y-2 text-3xl leading-loose"
        dir="rtl"
      >
        {data.words.map((w, i) => (
          <button
            key={i}
            onClick={() => setActive(active === i ? null : i)}
            className={`rounded-lg px-1.5 transition ${
              active === i
                ? "bg-gold text-white"
                : "hover:bg-[#f1e4c6] text-ink"
            }`}
          >
            {w.arabic}
          </button>
        ))}
      </div>

      {active !== null && data.words[active] && (
        <div className="slide-up mb-3 rounded-lg border border-[#ece0c6] bg-white p-3 text-sm">
          <div className="arabic font-quran text-2xl text-ink">
            {data.words[active].arabic}
          </div>
          <div className="mt-1">
            <span className="font-semibold text-sage">
              {data.words[active].role}
            </span>
            <span className="text-ink-faint"> · {data.words[active].case}</span>
          </div>
          <p className="mt-1 text-ink-soft">{data.words[active].explanation}</p>
        </div>
      )}

      <IrabQuestions data={data} />
    </div>
  );
}

function IrabQuestions({ data }: { data: IrabData }) {
  return (
    <div className="space-y-3">
      {data.questions.map((q, qi) => (
        <AskBack
          key={qi}
          id={`irab:${data.key}:${qi}`}
          q={q.q}
          options={q.options}
          answer={q.answer}
          explanation={q.explanation}
        />
      ))}
    </div>
  );
}

function AskBack({
  id,
  q,
  options,
  answer,
  explanation,
}: {
  id: string;
  q: string;
  options: string[];
  answer: number;
  explanation: string;
}) {
  const { recordQuiz, quizResult } = useProgress();
  const stored = quizResult(id);
  const [localPick, setLocalPick] = useState<number | null>(null);
  const picked = localPick !== null ? localPick : stored ? stored.picked : null;
  const pick = (i: number) => {
    setLocalPick(i);
    recordQuiz(id, i, i === answer);
  };
  return (
    <div className="rounded-lg bg-white/70 p-3">
      <div className="mb-2 text-sm font-medium text-ink">{q}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((o, i) => {
          const isPicked = picked === i;
          const correct = i === answer;
          let cls = "border-[#e3d8c2] bg-white text-ink-soft hover:border-gold";
          if (picked !== null && correct)
            cls = "border-sage bg-sage/10 text-sage";
          else if (isPicked && !correct)
            cls = "border-red-300 bg-red-50 text-red-700";
          return (
            <button
              key={i}
              onClick={() => pick(i)}
              className={`arabic-allowed rounded-lg border px-3 py-1.5 text-sm transition ${cls}`}
              dir="auto"
            >
              {o}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <p className="mt-2 text-xs text-ink-soft">
          {picked === answer ? "✓ Correct. " : "Not quite. "}
          {explanation}
        </p>
      )}
    </div>
  );
}
