"use client";

import { useState } from "react";
import Link from "next/link";
import type { SalahData, SalahPhrase } from "@/lib/types";
import { fromSalahWord, type WordDetail } from "@/lib/worddetail";
import { useReview, makeCardId } from "@/lib/store";
import { TapPanel } from "./TapPanel";

export function SalahView({ data }: { data: SalahData }) {
  const [detail, setDetail] = useState<WordDetail | null>(null);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-ink">{data.title}</h1>
        <p className="mt-1 text-ink-soft">{data.subtitle}</p>
        <div className="mt-3 rounded-xl border border-[#e7dcc6] bg-[#fdfaf3] p-3 text-sm text-ink-soft">
          {data.note}{" "}
          <Link href="/read/1" className="font-semibold text-gold underline">
            Open Al-Fātiḥah →
          </Link>
        </div>
      </header>

      <div className="space-y-8">
        {data.groups.map((group) => (
          <section key={group.id}>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gold">
              <span className="h-px flex-1 bg-[#e7dcc6]" />
              {group.title}
              <span className="h-px flex-1 bg-[#e7dcc6]" />
            </h2>
            <div className="space-y-4">
              {group.phrases.map((p) => (
                <PhraseCard key={p.id} phrase={p} onWord={(w) => setDetail(w)} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <TapPanel detail={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

function PhraseCard({
  phrase,
  onWord,
}: {
  phrase: SalahPhrase;
  onWord: (d: WordDetail) => void;
}) {
  const { toggleCard, isSaved } = useReview();
  const phraseCard = {
    front: phrase.arabic,
    back: phrase.translation,
    context: phrase.arabic,
    source: phrase.title,
    register: "Salah",
  };
  const saved = isSaved(makeCardId(phraseCard));

  return (
    <article className="rounded-2xl border border-[#ece3d2] bg-parchment-card p-5 shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-ink">{phrase.title}</h3>
          <p className="text-xs text-ink-faint">{phrase.when}</p>
        </div>
        <button
          onClick={() => toggleCard("phrase", phraseCard)}
          className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
            saved
              ? "bg-sage text-white"
              : "border border-[#e3d8c2] bg-white text-ink-soft hover:border-gold"
          }`}
        >
          {saved ? "✓ saved" : "+ save"}
        </button>
      </div>

      <div
        className="arabic font-quran my-3 flex flex-wrap justify-end gap-x-1.5 gap-y-1 text-[1.9rem] leading-[2.3]"
        dir="rtl"
      >
        {phrase.words.map((w, i) => (
          <button
            key={i}
            onClick={() =>
              onWord(
                fromSalahWord(w, phrase.title, phrase.arabic, phrase.translation)
              )
            }
            className="word"
          >
            {w.arabic}
          </button>
        ))}
      </div>

      <p className="border-t border-[#f0e8d8] pt-2 text-sm leading-relaxed text-ink-soft">
        {phrase.translation}
      </p>
      <p className="mt-1 text-xs text-ink-faint">{phrase.reference}</p>
    </article>
  );
}
