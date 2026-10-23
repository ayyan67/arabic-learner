"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useReview, makeCardId } from "@/lib/store";
import { useProgress } from "@/lib/progress";
import { useSettings } from "@/lib/settings";
import { variantCardContent, type WordDetail } from "@/lib/worddetail";
import type { CardVariant } from "@/lib/types";
import rootsIndex from "@/lib/data/roots.json";

interface Occurrence {
  key: string;
  surah: number;
  surahName: string;
  word: string;
  transliteration: string;
  translation: string;
}
const ROOTS = rootsIndex as Record<string, Occurrence[]>;

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-1.5">
      <div className="w-24 shrink-0 text-xs font-semibold uppercase tracking-wide text-ink-faint">
        {label}
      </div>
      <div className="text-sm text-ink">{children}</div>
    </div>
  );
}

const VARIANTS: { id: CardVariant; label: string; hint: string }[] = [
  { id: "recognition", label: "Recognition", hint: "Arabic → meaning" },
  { id: "production", label: "Production", hint: "Meaning → Arabic" },
  { id: "root", label: "Root", hint: "Identify the root" },
];

export function TapPanel({
  detail,
  onClose,
}: {
  detail: WordDetail | null;
  onClose: () => void;
}) {
  const { toggleCard, isSaved } = useReview();
  const { recordTap } = useProgress();
  const { canReadArabic } = useSettings();

  useEffect(() => {
    if (detail) recordTap(detail);
  }, [detail, recordTap]);

  if (!detail) return null;

  const hasMorph =
    detail.root || detail.pos || detail.form || (detail.grammar?.length ?? 0) > 0;

  // ṣarf word family: other occurrences of the same root in your reading.
  const normRoot = (detail.root || "").replace(/\s+/g, "");
  const family = (ROOTS[normRoot] || []).filter(
    (o) => !(o.key === detail.source.replace(/^Qurʾan\s+/, "") && o.word === detail.arabic)
  );

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
        aria-hidden
      />
      <aside className="slide-up fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-[#ece3d2] bg-parchment-card p-5 shadow-2xl panel-scroll md:bottom-6 md:rounded-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="arabic font-quran text-4xl leading-tight text-ink">
              {detail.arabic}
            </div>
            {detail.transliteration && !canReadArabic && (
              <div className="mt-1 text-sm italic text-ink-soft">
                {detail.transliteration}
              </div>
            )}
            <div className="mt-1 text-lg font-medium text-ink">
              {detail.translation}
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-faint hover:bg-[#f0e8d8]"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="divide-y divide-[#f0e8d8] border-y border-[#f0e8d8]">
          {detail.root && (
            <Row label="Root">
              <span className="arabic font-naskh text-lg tracking-widest text-gold">
                {detail.root}
              </span>
            </Row>
          )}
          {detail.lemma && (
            <Row label="Lemma">
              <span className="arabic font-naskh">{detail.lemma}</span>
            </Row>
          )}
          {detail.pos && <Row label="Part of speech">{detail.pos}</Row>}
          {detail.form && <Row label="Form / pattern">{detail.form}</Row>}
          {detail.grammar && detail.grammar.length > 0 && (
            <Row label="Grammar">{detail.grammar.join(" · ")}</Row>
          )}
          {detail.case && <Row label="Case (iʿrāb)">{detail.case}</Row>}
          {detail.segments && detail.segments.length > 1 && (
            <Row label="Segments">
              <span className="arabic font-naskh">
                {detail.segments.join(" + ")}
              </span>
            </Row>
          )}
          {detail.context && (
            <Row label="Context">
              <div className="arabic font-quran text-lg leading-loose text-ink-soft">
                {detail.context}
              </div>
              {detail.contextTranslation && (
                <div className="mt-1 text-xs text-ink-faint">
                  {detail.contextTranslation}
                </div>
              )}
            </Row>
          )}
        </div>

        {/* ṣarf word family */}
        {detail.root && family.length > 0 && (
          <div className="mt-4 rounded-xl border border-[#e7dcc6] bg-[#fdfaf3] p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gold">
              Same root in your reading
              <span className="rounded-full bg-white px-1.5 text-[10px] text-ink-soft">
                {family.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {family.slice(0, 10).map((o, i) => (
                <Link
                  key={i}
                  href={`/read/${o.surah}`}
                  onClick={onClose}
                  className="group flex items-center gap-1.5 rounded-lg border border-[#ece0c6] bg-white px-2 py-1 hover:border-gold"
                  title={`${o.translation} (${o.key})`}
                >
                  <span className="arabic font-quran text-lg text-ink">
                    {o.word}
                  </span>
                  <span className="text-[10px] text-ink-faint">{o.key}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Save as drill cards */}
        <div className="mt-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Add drill cards
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {VARIANTS.map((v) => {
              if (v.id === "root" && !detail.root) return null;
              const content = variantCardContent(detail, v.id);
              const saved = isSaved(makeCardId(content));
              return (
                <button
                  key={v.id}
                  onClick={() => toggleCard("word", content)}
                  title={v.hint}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                    saved
                      ? "border-sage bg-sage text-white"
                      : "border-[#e3d8c2] bg-white text-ink-soft hover:border-gold"
                  }`}
                >
                  {saved ? "✓ " : "+ "}
                  {v.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-ink-faint">
          <span className="rounded-full bg-[#f0e8d8] px-2 py-0.5 font-medium text-ink-soft">
            {detail.register}
          </span>
          <span>{detail.source}</span>
          {!hasMorph && detail.register === "Qurʾanic" && (
            <span>· morphology n/a</span>
          )}
        </div>
      </aside>
    </>
  );
}
