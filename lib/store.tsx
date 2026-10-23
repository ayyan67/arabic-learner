"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating,
  State,
  type Card as FsrsCard,
} from "ts-fsrs";
import type { CardContent, ReviewCard } from "./types";

const STORAGE_KEY = "arabic-learner.cards.v1";
const scheduler = fsrs(generatorParameters({ enable_fuzz: true }));

export function makeCardId(c: CardContent): string {
  // Recognition keeps the legacy id (no suffix) for backward compatibility.
  const v = c.variant && c.variant !== "recognition" ? `|${c.variant}` : "";
  return `${c.register}|${c.source}|${c.front}${v}`;
}

function reviveFsrs(raw: Record<string, unknown>): FsrsCard {
  return {
    ...(raw as unknown as FsrsCard),
    due: new Date(raw.due as string),
    last_review: raw.last_review ? new Date(raw.last_review as string) : undefined,
  };
}

interface ReviewStats {
  total: number;
  due: number;
  fresh: number;
  review: number;
  byRegister: Record<string, number>;
}

interface ReviewContextValue {
  cards: ReviewCard[];
  ready: boolean;
  isSaved: (id: string) => boolean;
  addCard: (type: ReviewCard["type"], content: CardContent) => void;
  toggleCard: (type: ReviewCard["type"], content: CardContent) => void;
  removeCard: (id: string) => void;
  gradeCard: (id: string, rating: Rating) => void;
  dueCards: () => ReviewCard[];
  previewIntervals: (id: string) => Record<number, string> | null;
  stats: ReviewStats;
  exportAnki: () => void;
}

const ReviewContext = createContext<ReviewContextValue | null>(null);

export function ReviewProvider({ children }: { children: React.ReactNode }) {
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCards(JSON.parse(raw));
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch {
      /* ignore quota errors */
    }
  }, [cards, ready]);

  const isSaved = useCallback(
    (id: string) => cards.some((c) => c.id === id),
    [cards]
  );

  const addCard = useCallback(
    (type: ReviewCard["type"], content: CardContent) => {
      const id = makeCardId(content);
      setCards((prev) => {
        if (prev.some((c) => c.id === id)) return prev;
        const fsrsCard = createEmptyCard();
        return [
          ...prev,
          {
            id,
            type,
            content,
            fsrs: JSON.parse(JSON.stringify(fsrsCard)),
            createdAt: Date.now(),
          },
        ];
      });
    },
    []
  );

  const removeCard = useCallback((id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const toggleCard = useCallback(
    (type: ReviewCard["type"], content: CardContent) => {
      const id = makeCardId(content);
      setCards((prev) => {
        if (prev.some((c) => c.id === id)) {
          return prev.filter((c) => c.id !== id);
        }
        const fsrsCard = createEmptyCard();
        return [
          ...prev,
          {
            id,
            type,
            content,
            fsrs: JSON.parse(JSON.stringify(fsrsCard)),
            createdAt: Date.now(),
          },
        ];
      });
    },
    []
  );

  const gradeCard = useCallback((id: string, rating: Rating) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const current = reviveFsrs(c.fsrs);
        const log = scheduler.repeat(current, new Date()) as unknown as Record<
          number,
          { card: FsrsCard }
        >;
        const next = log[rating].card;
        return { ...c, fsrs: JSON.parse(JSON.stringify(next)) };
      })
    );
  }, []);

  const dueCards = useCallback(() => {
    const now = Date.now();
    return cards
      .filter((c) => new Date(c.fsrs.due as string).getTime() <= now)
      .sort(
        (a, b) =>
          new Date(a.fsrs.due as string).getTime() -
          new Date(b.fsrs.due as string).getTime()
      );
  }, [cards]);

  const previewIntervals = useCallback(
    (id: string) => {
      const card = cards.find((c) => c.id === id);
      if (!card) return null;
      const current = reviveFsrs(card.fsrs);
      const log = scheduler.repeat(current, new Date()) as unknown as Record<
        number,
        { card: FsrsCard }
      >;
      const fmt = (d: Date) => {
        const days = Math.max(
          0,
          Math.round((d.getTime() - Date.now()) / 86400000)
        );
        if (days >= 1) return `${days}d`;
        const mins = Math.max(
          1,
          Math.round((d.getTime() - Date.now()) / 60000)
        );
        return mins >= 60 ? `${Math.round(mins / 60)}h` : `${mins}m`;
      };
      return {
        [Rating.Again]: fmt(log[Rating.Again].card.due),
        [Rating.Hard]: fmt(log[Rating.Hard].card.due),
        [Rating.Good]: fmt(log[Rating.Good].card.due),
        [Rating.Easy]: fmt(log[Rating.Easy].card.due),
      };
    },
    [cards]
  );

  const stats = useMemo<ReviewStats>(() => {
    const now = Date.now();
    const byRegister: Record<string, number> = {};
    let due = 0;
    let fresh = 0;
    let review = 0;
    for (const c of cards) {
      byRegister[c.content.register] =
        (byRegister[c.content.register] || 0) + 1;
      if (new Date(c.fsrs.due as string).getTime() <= now) due += 1;
      if ((c.fsrs.state as number) === State.New) fresh += 1;
      else review += 1;
    }
    return { total: cards.length, due, fresh, review, byRegister };
  }, [cards]);

  const exportAnki = useCallback(() => {
    const esc = (s: string) => (s || "").replace(/\t/g, " ").replace(/\n/g, "<br>");
    const rows = cards.map((c) =>
      [
        c.content.front,
        c.content.back,
        c.content.transliteration || "",
        c.content.root || "",
        c.content.grammar || "",
        c.content.context || "",
        c.content.source,
        c.content.register,
      ]
        .map(esc)
        .join("\t")
    );
    const header =
      "#separator:tab\n#html:true\n#columns:Arabic\tMeaning\tTransliteration\tRoot\tGrammar\tContext\tSource\tRegister\n";
    const blob = new Blob([header + rows.join("\n")], {
      type: "text/tab-separated-values;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "arabic-learner-anki.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [cards]);

  const value: ReviewContextValue = {
    cards,
    ready,
    isSaved,
    addCard,
    toggleCard,
    removeCard,
    gradeCard,
    dueCards,
    previewIntervals,
    stats,
    exportAnki,
  };

  return (
    <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>
  );
}

export function useReview(): ReviewContextValue {
  const ctx = useContext(ReviewContext);
  if (!ctx) throw new Error("useReview must be used within ReviewProvider");
  return ctx;
}

export { Rating };
