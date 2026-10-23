"use client";

import { useMemo, useState } from "react";
import { useReview, Rating } from "@/lib/store";
import { useProgress } from "@/lib/progress";
import type { ReviewCard } from "@/lib/types";

const RATINGS: { rating: Rating; label: string; cls: string }[] = [
  { rating: Rating.Again, label: "Again", cls: "bg-red-500 hover:bg-red-600" },
  { rating: Rating.Hard, label: "Hard", cls: "bg-amber-500 hover:bg-amber-600" },
  { rating: Rating.Good, label: "Good", cls: "bg-sage hover:bg-sage-soft" },
  { rating: Rating.Easy, label: "Easy", cls: "bg-sky-600 hover:bg-sky-700" },
];

export function ReviewSession() {
  const { cards, ready, dueCards, gradeCard, previewIntervals, stats, exportAnki, removeCard } =
    useReview();
  const { recordReview } = useProgress();
  const [queue, setQueue] = useState<string[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(0);
  const [showDeck, setShowDeck] = useState(false);

  const startSession = (mode: "due" | "all") => {
    const ids =
      mode === "due"
        ? dueCards().map((c) => c.id)
        : cards.map((c) => c.id);
    setQueue(ids);
    setIdx(0);
    setRevealed(false);
    setDone(0);
  };

  const currentId = queue ? queue[idx] : null;
  const current = useMemo<ReviewCard | null>(
    () => (currentId ? cards.find((c) => c.id === currentId) ?? null : null),
    [currentId, cards]
  );
  const intervals = currentId ? previewIntervals(currentId) : null;

  const grade = (rating: Rating) => {
    if (!currentId) return;
    gradeCard(currentId, rating);
    recordReview();
    setDone((d) => d + 1);
    setRevealed(false);
    setIdx((i) => i + 1);
  };

  if (!ready) {
    return <p className="text-ink-faint">Loading your deck…</p>;
  }

  // ---- Empty deck --------------------------------------------------------
  if (cards.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#d9ccb2] bg-white/60 p-8 text-center">
        <div className="text-4xl">🪶</div>
        <h2 className="mt-3 text-lg font-bold text-ink">Your review deck is empty</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-ink-soft">
          Tap words in the Reader or Salah mode and hit <b>Save to review</b>, or
          save a whole ayah or grammar concept. Saved items appear here for
          spaced-repetition review (FSRS).
        </p>
      </div>
    );
  }

  // ---- Active session ----------------------------------------------------
  if (queue && current) {
    const c = current;
    return (
      <div>
        <div className="mb-4 flex items-center justify-between text-sm text-ink-faint">
          <span>
            Card {idx + 1} of {queue.length}
          </span>
          <button
            onClick={() => setQueue(null)}
            className="rounded-lg px-2 py-1 hover:bg-[#f0e8d8]"
          >
            End session
          </button>
        </div>

        <div className="rounded-2xl border border-[#ece3d2] bg-parchment-card p-8 text-center shadow-sm">
          <div className="flex items-center justify-center gap-2">
            <span className="rounded-full bg-[#f0e8d8] px-2 py-0.5 text-xs font-medium text-ink-soft">
              {c.content.register} · {c.content.source}
            </span>
            {c.content.variant && c.content.variant !== "recognition" && (
              <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs font-medium text-gold">
                {c.content.variant === "production" ? "Produce" : "Root"}
              </span>
            )}
          </div>

          <CardPrompt card={c} />
          {revealed && <CardAnswer card={c} />}
        </div>

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="mt-4 w-full rounded-xl bg-ink py-3 font-semibold text-parchment hover:bg-[#332c24]"
          >
            Show answer
          </button>
        ) : (
          <div className="mt-4 grid grid-cols-4 gap-2">
            {RATINGS.map((r) => (
              <button
                key={r.rating}
                onClick={() => grade(r.rating)}
                className={`rounded-xl py-3 text-sm font-semibold text-white transition ${r.cls}`}
              >
                {r.label}
                {intervals && (
                  <span className="mt-0.5 block text-[10px] font-normal opacity-90">
                    {intervals[r.rating]}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ---- Session finished --------------------------------------------------
  if (queue && !current) {
    return (
      <div className="rounded-2xl border border-[#ece3d2] bg-parchment-card p-8 text-center shadow-sm">
        <div className="text-4xl">✅</div>
        <h2 className="mt-3 text-lg font-bold text-ink">
          Reviewed {done} card{done === 1 ? "" : "s"}
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          {stats.due > 0
            ? `${stats.due} still due.`
            : "Nothing left due — come back later."}
        </p>
        <button
          onClick={() => setQueue(null)}
          className="mt-4 rounded-xl bg-ink px-5 py-2.5 font-semibold text-parchment hover:bg-[#332c24]"
        >
          Back to overview
        </button>
      </div>
    );
  }

  // ---- Overview ----------------------------------------------------------
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total" value={stats.total} />
        <Stat label="Due now" value={stats.due} accent />
        <Stat label="New" value={stats.fresh} />
        <Stat label="In review" value={stats.review} />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={() => startSession("due")}
          disabled={stats.due === 0}
          className="rounded-xl bg-sage px-5 py-2.5 font-semibold text-white transition hover:bg-sage-soft disabled:cursor-not-allowed disabled:opacity-40"
        >
          Review {stats.due} due
        </button>
        <button
          onClick={() => startSession("all")}
          className="rounded-xl border border-[#e3d8c2] bg-white px-5 py-2.5 font-semibold text-ink-soft hover:border-gold"
        >
          Practice all {stats.total}
        </button>
        <button
          onClick={exportAnki}
          className="rounded-xl border border-[#e3d8c2] bg-white px-5 py-2.5 font-semibold text-ink-soft hover:border-gold"
        >
          Export to Anki
        </button>
        <button
          onClick={() => setShowDeck((v) => !v)}
          className="ml-auto rounded-xl px-3 py-2.5 text-sm font-medium text-ink-faint hover:bg-[#f0e8d8]"
        >
          {showDeck ? "Hide deck" : "Browse deck"}
        </button>
      </div>

      {Object.keys(stats.byRegister).length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(stats.byRegister).map(([reg, n]) => (
            <span
              key={reg}
              className="rounded-full bg-[#f0e8d8] px-3 py-1 text-xs font-medium text-ink-soft"
            >
              {reg}: {n}
            </span>
          ))}
        </div>
      )}

      {showDeck && (
        <div className="mt-5 space-y-2">
          {cards.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 rounded-xl border border-[#f0e8d8] bg-white p-3"
            >
              <span className="arabic font-quran text-2xl text-ink">
                {c.content.front}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-ink-soft">{c.content.back}</div>
                <div className="text-xs text-ink-faint">
                  {c.content.register} · {c.content.source}
                </div>
              </div>
              <button
                onClick={() => removeCard(c.id)}
                className="shrink-0 rounded-lg px-2 py-1 text-xs text-red-500 hover:bg-red-50"
              >
                remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CardPrompt({ card }: { card: ReviewCard }) {
  const v = card.content.variant ?? "recognition";
  if (v === "production") {
    return (
      <div className="mt-5">
        <div className="text-xs uppercase tracking-wide text-ink-faint">
          Say it in Arabic
        </div>
        <div className="mt-2 text-2xl font-semibold text-ink">
          {card.content.back}
        </div>
      </div>
    );
  }
  if (v === "root") {
    return (
      <div className="mt-5">
        <div className="arabic font-quran text-4xl leading-snug text-ink">
          {card.content.front}
        </div>
        <div className="mt-2 text-xs uppercase tracking-wide text-ink-faint">
          What is the root?
        </div>
      </div>
    );
  }
  return (
    <div className="arabic font-quran mt-5 text-5xl leading-snug text-ink">
      {card.content.front}
    </div>
  );
}

function CardAnswer({ card }: { card: ReviewCard }) {
  const v = card.content.variant ?? "recognition";
  if (v === "production") {
    return (
      <div className="slide-up mt-5 border-t border-[#f0e8d8] pt-5">
        <div className="arabic font-quran text-4xl text-ink">
          {card.content.front}
        </div>
        {card.content.transliteration && (
          <div className="mt-1 text-sm italic text-ink-faint">
            {card.content.transliteration}
          </div>
        )}
      </div>
    );
  }
  if (v === "root") {
    return (
      <div className="slide-up mt-5 border-t border-[#f0e8d8] pt-5">
        <div className="arabic font-naskh text-3xl tracking-widest text-gold">
          {card.content.root}
        </div>
        <div className="mt-2 text-sm text-ink-soft">{card.content.back}</div>
        {card.content.grammar && (
          <div className="mt-1 text-xs text-ink-faint">{card.content.grammar}</div>
        )}
      </div>
    );
  }
  return (
    <div className="slide-up mt-5 border-t border-[#f0e8d8] pt-5">
      {card.content.transliteration && (
        <div className="text-sm italic text-ink-faint">
          {card.content.transliteration}
        </div>
      )}
      <div className="text-lg font-medium text-ink">{card.content.back}</div>
      {card.content.root && (
        <div className="mt-2 text-sm text-ink-soft">
          Root:{" "}
          <span className="arabic font-naskh tracking-widest text-gold">
            {card.content.root}
          </span>
        </div>
      )}
      {card.content.grammar && (
        <div className="mt-1 text-xs text-ink-faint">{card.content.grammar}</div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 text-center ${
        accent
          ? "border-sage/40 bg-sage/10"
          : "border-[#ece3d2] bg-parchment-card"
      }`}
    >
      <div className={`text-2xl font-bold ${accent ? "text-sage" : "text-ink"}`}>
        {value}
      </div>
      <div className="text-xs text-ink-faint">{label}</div>
    </div>
  );
}
