"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { WordDetail } from "./worddetail";

const STORAGE_KEY = "arabic-learner.progress.v1";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

interface ProgressState {
  wordsTapped: string[]; // `${source}|${arabic}`
  rootsSeen: string[]; // normalized roots
  ayahsRead: string[]; // verse keys
  surahsOpened: number[];
  quiz: Record<string, { picked: number; correct: boolean }>;
  reviewsByDay: Record<string, number>;
  activeDays: string[]; // YYYY-MM-DD
}

const EMPTY: ProgressState = {
  wordsTapped: [],
  rootsSeen: [],
  ayahsRead: [],
  surahsOpened: [],
  quiz: {},
  reviewsByDay: {},
  activeDays: [],
};

interface ProgressContextValue {
  ready: boolean;
  state: ProgressState;
  recordTap: (d: WordDetail) => void;
  recordSurahOpen: (id: number) => void;
  recordQuiz: (id: string, picked: number, correct: boolean) => void;
  quizResult: (id: string) => { picked: number; correct: boolean } | null;
  recordReview: () => void;
  streak: number;
  reset: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

function computeStreak(activeDays: string[]): number {
  if (activeDays.length === 0) return 0;
  const set = new Set(activeDays);
  const d = new Date();
  // Allow the streak to count if today OR yesterday is active.
  const todayStr = d.toISOString().slice(0, 10);
  if (!set.has(todayStr)) {
    d.setDate(d.getDate() - 1);
    if (!set.has(d.toISOString().slice(0, 10))) return 0;
  }
  let streak = 0;
  while (set.has(d.toISOString().slice(0, 10))) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...EMPTY, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, ready]);

  const markActive = (s: ProgressState): ProgressState => {
    const t = today();
    return s.activeDays.includes(t)
      ? s
      : { ...s, activeDays: [...s.activeDays, t] };
  };

  const recordTap = useCallback((d: WordDetail) => {
    setState((prev) => {
      let next = { ...prev };
      const wKey = `${d.source}|${d.arabic}`;
      if (!next.wordsTapped.includes(wKey))
        next.wordsTapped = [...next.wordsTapped, wKey];
      if (d.root) {
        const r = d.root.replace(/\s+/g, "");
        if (r && !next.rootsSeen.includes(r))
          next.rootsSeen = [...next.rootsSeen, r];
      }
      if (d.register === "Qurʾanic") {
        const key = d.source.replace(/^Qurʾan\s+/, "");
        if (/^\d+:\d+$/.test(key) && !next.ayahsRead.includes(key))
          next.ayahsRead = [...next.ayahsRead, key];
      }
      return markActive(next);
    });
  }, []);

  const recordSurahOpen = useCallback((id: number) => {
    setState((prev) =>
      prev.surahsOpened.includes(id)
        ? prev
        : markActive({ ...prev, surahsOpened: [...prev.surahsOpened, id] })
    );
  }, []);

  const recordQuiz = useCallback(
    (id: string, picked: number, correct: boolean) => {
      setState((prev) =>
        markActive({ ...prev, quiz: { ...prev.quiz, [id]: { picked, correct } } })
      );
    },
    []
  );

  const quizResult = useCallback(
    (id: string) => state.quiz[id] ?? null,
    [state.quiz]
  );

  const recordReview = useCallback(() => {
    setState((prev) => {
      const t = today();
      return markActive({
        ...prev,
        reviewsByDay: {
          ...prev.reviewsByDay,
          [t]: (prev.reviewsByDay[t] || 0) + 1,
        },
      });
    });
  }, []);

  const reset = useCallback(() => setState(EMPTY), []);

  const streak = useMemo(() => computeStreak(state.activeDays), [state.activeDays]);

  const value: ProgressContextValue = {
    ready,
    state,
    recordTap,
    recordSurahOpen,
    recordQuiz,
    quizResult,
    recordReview,
    streak,
    reset,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
