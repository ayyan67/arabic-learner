# Data Sources & Licensing Dossier

Verified June 2026 against live APIs, repos, and license pages. This is the
sourcing reference for the app. **What the MVP actually uses today is marked ✅
USING.** Everything else is vetted and staged for later phases.

Guiding principles: canonical Qurʾan text is **immutable** (display only, never
edited); **self-host & pin** content rather than depend on a runtime API; honor
every **attribution / no-modification** clause; **isolate GPL** behind a process
boundary.

---

## 1. Qurʾan Arabic text

| Source | License (key clause) | Verdict |
|---|---|---|
| **Tanzil.net** | "copy and distribute verbatim … changing the text is not allowed" + attribution + link-back | Best clean self-host source for the raw text |
| **Quran.com / Quran Foundation API v4** ✅ USING | QF Developer Terms: display-only, no raw-data redistribution; OAuth2 on the new host (legacy `api.quran.com/api/v4` still open) | Used at build time for text + WBW + audio refs |
| **QUL (Tarteel)** | Per-resource; tooling MIT | Best redistributable bulk dataset; verify each resource |
| **fawazahmed0/quran-api** | Unlicense (public domain) | AVOID as canonical — maintainer notes OCR/uncertified text |
| **AlQuran.cloud** | Opaque/undocumented provenance | Prototype convenience only |

**MVP choice:** Build-time fetch from Quran.com v4 (`text_uthmani`) for surahs 1 +
105–114, stored immutably as JSON. For a fully license-clean self-host later,
swap to **Tanzil** Uthmani + Simple. The canonical text is never mutated — tashkīl
levels only *hide* marks at render time.

## 2. Translation

- **Saheeh International** ✅ USING — fetched via Quran.com v4 `translations=20`
  (resource 131 "Clear Quran" is **not** on the legacy host; 20 = Saheeh is).
  Footnote `<sup>` tags are stripped at build time.
- **QuranEnc.com** (`english_saheeh`) — cleanest explicit license for translations
  (7 conditions: no-modification, attribution, version tracking, must update to
  latest). Use if self-hosting translations.

## 3. Word morphology — root / lemma / POS / form / case ✅ USING

- **Quranic Arabic Corpus** (Kais Dukes) via **`mustafa0x/quran-morphology`** —
  the `quran-morphology.txt` file gives, per segment: ROOT, LEM, POS group (N/V/P),
  derived verb form (I–XII), participle/maṣdar tags, and case (NOM/ACC/GEN). The
  build script aggregates segments → per-word morphology and joins to Quran.com's
  word list by position.
  - **License:** GPL-framed **data** license — "copy verbatim … changing it is not
    allowed" + **mandatory attribution and a visible link to corpus.quran.com**.
    It is a *data* license, so it does **not** force the app code open. The app
    footer carries the required corpus.quran.com link.
- **QUL SQLite** (root/lemma/grammar tables, MIT tooling) — cleaner path if you
  later want a database instead of parsing the text file.
- **Quran.com API does NOT return root/POS** — confirmed (issue quran.com-api#185).
  That's why morphology comes from the Corpus, not the API.

## 4. Iʿrāb (grammatical role) — hand-authored for MVP

- The downloadable Corpus morphology gives **case** (NOM/ACC/GEN) but **not** full
  role labels (mubtadaʾ, fāʿil, muḍāf…). Those live in the web-only treebank.
- **MVP:** iʿrāb Q&A is **hand-authored** (`lib/data/irab.json`) for al-Fātiḥah 1:2,
  1:5, and al-Ikhlāṣ 112:1 — accurate and pedagogical for the flagship ayahs.
- **Scale later with:** **NoorBayan/Quranic "The Quranic Treebank"** (MIT, full
  Qurʾan, Arabic dependency-relation labels, CoNLL-X) — the only openly-licensed,
  downloadable, full-Qurʾan iʿrāb-bearing dataset.

## 5. General (non-Qurʾan) MSA morphology — later phase

- **CAMeL Tools** (code MIT) for root/pattern/clitic/POS on arbitrary MSA.
  ⚠️ Its default DB **`calima-msa-r13` is GPL v2** (and the better `s31` needs an
  LDC license). Run it as a **separate Python microservice** (network boundary) or
  precompute offline — never bundle the GPL DB into the app. Qurʾan mode needs none
  of this, so the GPL touchpoint stays out of the core path.

## 6. Fonts

| Need | Font | License | Delivery |
|---|---|---|---|
| Qurʾan display ✅ USING | **Amiri Quran** | OFL (free to self-host/subset) | `@fontsource/amiri-quran` |
| General Arabic reading ✅ USING | **Noto Naskh Arabic** | OFL | `@fontsource/noto-naskh-arabic` |
| UI ✅ USING | **Noto Sans Arabic** | OFL | `@fontsource/noto-sans-arabic` |
| Byte-exact Madinah mushaf (optional) | KFGQPC Uthmanic Hafs | Custom: use/distribute OK, **no modification → no subsetting** | self-host whole woff2 |
| Page-faithful mushaf (defer) | QCF V1/V2 glyph fonts | KFGQPC; 604 files + `code_v1/v2` rendering | only for a true page view |

**Subsetting caution:** Google Fonts' auto-subsetting can drop harakāt. Fontsource
ships the full Arabic face, so tashkīl renders correctly — that's why the app uses
Fontsource, not `next/font/google`, for Arabic.

## 7. Audio

- **Per-ayah recitation** ✅ USING — **everyayah.com** (Mishary al-ʿAfāsy 128 kbps),
  URL pattern `data/Alafasy_128kbps/SSSAAA.mp3`. Reliable, ubiquitous.
- **Cleanest per-ayah CDN** — `cdn.islamic.network/quran/audio/{bitrate}/{edition}/{globalAyah}.mp3`
  (alquran.cloud) has the most explicit "use as required" grant (uses 1–6236 global
  numbering).
- **Word-level highlighting (later)** — Quran.com v4 `chapter_recitations/{id}/{n}?segments=true`
  returns `[word_index, start_ms, end_ms]`; underlying timing data is **QUL (MIT)**.
- **Salah adhkār audio** — no clean open CDN; self-host a small curated set later.
- **License reality:** all Qurʾan-audio aggregators serve reciters' copyrighted
  recordings. For personal/local use this is fine; **self-host before any public
  deployment.**

## 8. Tafsir — deep-linked for MVP

- **MVP** links out to **`quran.com/{surah}/{ayah}/tafsirs`** (honest, no embedding).
- **Embed later with:** **spa5k/tafsir_api** (static per-ayah JSON on jsDelivr, MIT
  code; pin a commit) — `en-tafisr-ibn-kathir` + `ar-tafsir-muyassar` are the
  learner-friendly default pair. **QuranEnc** for an explicitly-licensed al-Muyassar.

## 9. Salah / adhkār / duʿāʾ — hand-authored for MVP

- **MVP:** `lib/data/salah.json` is **hand-authored** (Arabic + transliteration +
  translation + word-level roots + hadith reference) for the ~10 core in-prayer
  phrases — small, fixed, and worth getting exactly right.
- **Scale later with:** **sunnah.com Hisn al-Muslim** (`/hisn`, bilingual + graded —
  the in-prayer phrases) and **dua-dhikr / fitrahive** (MIT API — after-salah +
  morning/evening adhkār with `arabic`/`latin`/`translation`/`source`).

## 10. Hadith (immersion, later)

- **fawazahmed0/hadith-api** (Unlicense, CDN, no key) for dev; **sunnah.com API**
  (free `X-API-Key` on request) for production where citation/grading must be exact.

---

## The immersion-stack landscape (Sottaku / Yomu / Donkuri / Yomitan)

What to borrow when extending toward arbitrary-text mining (the later "Immersion"
mode):

- **Sottaku** (Air Katakana) — **closed-source, paid**; design reference only. Its
  doctrine is SRS-quiz-first (anti-immersion), so a weak conceptual fit. Only
  takeaway: use FSRS (already done via `ts-fsrs`).
- **ts-fsrs** ✅ USING — MIT, TypeScript, FSRS-6. The review engine.
- **Yomu** (`HRussellZFAC023/yomu-reader`, MIT, TS) — study its **PDF.js text-layer
  → popup → mine** pipeline and OCR-overlay pattern when adding PDF/image reading.
- **Yomitan** (GPL-3.0) — reference popup+Anki engine; already ships first-class
  Arabic (surface affix-stripping, **no root/pattern**). Don't fork (GPL); you can
  author an Arabic dictionary for it as a prototype. Root/pattern lookup is net-new.
- **asbplayer** (MIT) — mirror its Sentence/Word/Definition/Image/Audio/Source card
  schema for subtitle mining.
- **Lute** (`LuteOrg/lute-v3`, MIT) — proven **RTL/Arabic** term-status reader; reuse
  the data model, reimplement in TS.
- **ankipack** (MIT, TS) — to generate downloadable `.apkg` later (avoid
  `genanki-js` — AGPL). MVP currently exports **Anki-importable TSV** instead.
- **Donkuri** — the playbook prose is **not** openly licensed; re-author the staged
  immersion ladder in our own words for Arabic source tiers.

---

## Attribution shown in-app (required)

The footer credits **Quran.com** (text + Saheeh International translation), the
**Quranic Arabic Corpus / corpus.quran.com** (morphology — link-back required by its
license), and **everyayah.com** (recitation), and states the Qurʾan text is canonical
and unmodified. Keep this footer if you change the data sources.
