"use client";

import { useEffect, useState } from "react";
import type { Surah, IrabData, Ayah } from "@/lib/types";
import { stripTashkil, TASHKIL_LEVELS, type TashkilLevel } from "@/lib/tashkil";
import { fromQuranWord, type WordDetail } from "@/lib/worddetail";
import { useReview, makeCardId } from "@/lib/store";
import { useProgress } from "@/lib/progress";
import { useSettings } from "@/lib/settings";
import { TapPanel } from "./TapPanel";
import { IrabPanel } from "./IrabPanel";
import { AudioButton } from "./AudioButton";

const BISMILLAH = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";

function Toggle({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
        on
          ? "bg-ink text-parchment"
          : "border border-[#e3d8c2] bg-white text-ink-soft hover:border-gold"
      }`}
    >
      {children}
    </button>
  );
}

export function Reader({
  surah,
  irab,
}: {
  surah: Surah;
  irab: Record<string, IrabData>;
}) {
  const [showTranslation, setShowTranslation] = useState(true);
  const [showWords, setShowWords] = useState(true);
  const [tashkil, setTashkil] = useState<TashkilLevel>("full");
  const [openIrab, setOpenIrab] = useState<string | null>(null);
  const [detail, setDetail] = useState<WordDetail | null>(null);
  const { recordSurahOpen } = useProgress();
  const { canReadArabic, setCanReadArabic } = useSettings();

  useEffect(() => {
    recordSurahOpen(surah.id);
  }, [surah.id, recordSurahOpen]);

  return (
    <div>
      {/* Controls */}
      <div className="sticky top-[49px] z-20 -mx-4 mb-5 border-b border-[#ece3d2] bg-parchment/90 px-4 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <Toggle on={showTranslation} onClick={() => setShowTranslation((v) => !v)}>
            Translation
          </Toggle>
          <Toggle on={showWords} onClick={() => setShowWords((v) => !v)}>
            Word-by-word
          </Toggle>
          <Toggle
            on={canReadArabic}
            onClick={() => setCanReadArabic(!canReadArabic)}
          >
            I can read Arabic
          </Toggle>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-xs font-medium text-ink-faint">
              {canReadArabic ? "Test grammar:" : "Vowels:"}
            </span>
            <div className="flex items-center gap-1 rounded-lg border border-[#e3d8c2] bg-white p-0.5">
              {TASHKIL_LEVELS.map((lvl) => (
                <button
                  key={lvl.id}
                  title={
                    canReadArabic && lvl.id === "no-end"
                      ? "Hide case endings — can you supply the iʿrāb?"
                      : lvl.hint
                  }
                  onClick={() => setTashkil(lvl.id)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                    tashkil === lvl.id
                      ? "bg-gold text-white"
                      : "text-ink-soft hover:bg-[#f0e8d8]"
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-2 text-xs text-ink-faint">
          {canReadArabic
            ? "Transliteration is off. Tap any word for meaning, root, and grammar. Switch tashkīl to “No endings” to test whether you know the case endings (iʿrāb)."
            : "Tap any word for its root, pattern, and grammar — then save it to your review deck."}
        </p>
      </div>

      {/* Surah header */}
      <div className="mb-6 text-center">
        <div className="arabic font-quran text-3xl text-ink">{surah.nameArabic}</div>
        <h1 className="mt-1 text-xl font-bold text-ink">
          {surah.id}. {surah.name}
        </h1>
        <p className="text-sm text-ink-faint">
          {surah.translatedName} · {surah.versesCount} verses · {surah.revelationPlace}
        </p>
        {surah.bismillah && (
          <div className="arabic font-quran mt-4 text-2xl text-ink-soft">
            {stripTashkil(BISMILLAH, tashkil)}
          </div>
        )}
      </div>

      {/* Ayahs */}
      <div className="space-y-4">
        {surah.ayahs.map((ayah) => (
          <AyahBlock
            key={ayah.key}
            ayah={ayah}
            showTranslation={showTranslation}
            showWords={showWords}
            hideTranslit={canReadArabic}
            tashkil={tashkil}
            hasIrab={ayah.key in irab}
            irabOpen={openIrab === ayah.key}
            onToggleIrab={() =>
              setOpenIrab(openIrab === ayah.key ? null : ayah.key)
            }
            irabData={irab[ayah.key]}
            onWord={(w) =>
              setDetail(fromQuranWord(w, ayah.key, ayah.arabic, ayah.translation))
            }
          />
        ))}
      </div>

      <TapPanel detail={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

function AyahBlock({
  ayah,
  showTranslation,
  showWords,
  hideTranslit,
  tashkil,
  hasIrab,
  irabOpen,
  onToggleIrab,
  irabData,
  onWord,
}: {
  ayah: Ayah;
  showTranslation: boolean;
  showWords: boolean;
  hideTranslit: boolean;
  tashkil: TashkilLevel;
  hasIrab: boolean;
  irabOpen: boolean;
  onToggleIrab: () => void;
  irabData?: IrabData;
  onWord: (w: Ayah["words"][number]) => void;
}) {
  const { toggleCard, isSaved } = useReview();
  const ayahCard = {
    front: ayah.arabic,
    back: ayah.translation,
    context: ayah.arabic,
    source: `Qurʾan ${ayah.key}`,
    register: "Qurʾanic",
  };
  const ayahSaved = isSaved(makeCardId(ayahCard));
  const [surahNum, ayahNum] = ayah.key.split(":");

  return (
    <article className="rounded-2xl border border-[#ece3d2] bg-parchment-card p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-7 min-w-7 place-items-center rounded-full bg-[#f0e8d8] px-2 text-xs font-bold text-gold">
          {ayah.number}
        </span>
        <AudioButton src={ayah.audio} />
        <div className="ml-auto flex items-center gap-1.5">
          {hasIrab && (
            <button
              onClick={onToggleIrab}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                irabOpen
                  ? "bg-sage text-white"
                  : "border border-[#e3d8c2] bg-white text-ink-soft hover:border-sage"
              }`}
            >
              iʿrāb
            </button>
          )}
          <button
            onClick={() => toggleCard("ayah", ayahCard)}
            title="Save this ayah to review"
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              ayahSaved
                ? "bg-sage text-white"
                : "border border-[#e3d8c2] bg-white text-ink-soft hover:border-gold"
            }`}
          >
            {ayahSaved ? "✓ saved" : "+ ayah"}
          </button>
          <a
            href={`https://quran.com/${surahNum}/${ayahNum}/tafsirs`}
            target="_blank"
            rel="noopener noreferrer"
            title="Read tafsīr on Quran.com"
            className="rounded-lg border border-[#e3d8c2] bg-white px-2.5 py-1 text-xs font-semibold text-ink-soft hover:border-gold"
          >
            tafsīr ↗
          </a>
        </div>
      </div>

      {/* Arabic words */}
      <div
        className="arabic font-quran flex flex-wrap justify-end gap-x-1 gap-y-1 text-right text-[2rem] leading-[2.4]"
        dir="rtl"
      >
        {ayah.words.map((w) => (
          <button
            key={w.position}
            onClick={() => onWord(w)}
            className="word flex flex-col items-center"
          >
            <span>{stripTashkil(w.arabic, tashkil)}</span>
            {showWords && (
              <span className="mt-0.5 flex flex-col items-center leading-tight">
                {!hideTranslit && (
                  <span
                    className="text-[0.6rem] italic text-ink-faint"
                    style={{ fontFamily: "var(--font-arabic-ui)" }}
                    dir="ltr"
                  >
                    {w.transliteration}
                  </span>
                )}
                <span
                  className="max-w-[7rem] text-[0.62rem] text-ink-soft"
                  style={{ fontFamily: "var(--font-arabic-ui)" }}
                  dir="ltr"
                >
                  {w.translation}
                </span>
              </span>
            )}
          </button>
        ))}
      </div>

      {showTranslation && (
        <p className="mt-3 border-t border-[#f0e8d8] pt-3 text-[0.95rem] leading-relaxed text-ink-soft">
          {ayah.translation}
        </p>
      )}

      {irabOpen && irabData && <IrabPanel data={irabData} />}
    </article>
  );
}
