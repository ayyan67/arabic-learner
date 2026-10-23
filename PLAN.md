# Arabic Learner — Product & Build Plan

> A contextual Arabic learning platform that teaches the traditional sciences —
> ṣarf, naḥw, iʿrāb, guided reading, and Qurʾanic study — through modern sentence
> mining, spaced repetition, and interactive grammar.
>
> Synthesized from two research documents (not included in this repo): one on the
> modern immersion / SRS-reader tech angle, one on traditional Arabic pedagogy.
>
> This is the original planning document. Section 10 (MVP) is roughly what is built;
> see README.md for the current feature list. Later roadmap phases are not built.

---

## 1. Positioning

**Not "Duolingo for Arabic."** Closer to:

> **Madinah + Ājurrūmiyyah + Quran Corpus + Yomu Reader + Anki + guided reading.**

Target user: the Muslim learner who wants to *understand* ṣalāh, Qurʾan, duʿāʾ, and
classical Islamic texts, and needs modern tooling to make it sustainable.

The durable core loop (from the Japanese immersion stack, bent toward Arabic):

> **read authentic Arabic → tap to see structure + meaning → save the useful unit →
> review adaptively → return to the same text with less help.**

The goal is **not to replace traditional Arabic learning** — it is to make it easier to
sustain, easier to review, and easier to connect to real Qurʾan, ṣalāh, duʿāʾ, ḥadīth,
and fuṣḥā reading.

---

## 2. Locked decisions

| Decision | Choice |
|---|---|
| **Form factor** | Web app — Next.js / React (RTL-first) |
| **MVP content focus** | Salah + short surahs (curated, pre-annotated) |
| **Review engine** | Native FSRS (`ts-fsrs`) **+** one-click Anki export |
| **Build approach** | From scratch (full control over reader, tap panel, data model) |

Rationale for curated-first: starting with **bounded, pre-annotated content** (ṣalāh +
short surahs via the Quranic Arabic Corpus) sidesteps the hardest problem — real-time
morphological disambiguation of arbitrary Arabic — while delivering immediate spiritual
payoff. General immersion/mining comes after the loop is proven.

---

## 3. Core product — four modes, one engine

1. **Salah Mode** *(highest-motivation beginner mode)* — understand what you already say
   daily: Fātiḥah, takbīr, rukūʿ/sujūd adhkār, tashahhud, ṣalawāt, common duʿāʾ, short
   surahs. Phrase-by-phrase + word-by-word + root/pattern for key words.
2. **Qurʾan Reader Mode** — read with **7 toggleable assistance layers**:
   1. Arabic text → 2. Translation → 3. Word-by-word → 4. Root + pattern →
   5. ṣarf breakdown → 6. naḥw/iʿrāb role → 7. tafsīr / reflection note.
   Beginner keeps all on; intermediate hides translation, reveals grammar when stuck.
3. **Curriculum Mode** — Madinah-style progression as the backbone. Each lesson =
   concept + controlled examples + Qurʾan examples + reader examples + drills + review
   cards + short test. Every lesson **unlocks real examples** from Qurʾan/duʿāʾ/ḥadīth/
   readers that use the concept. "Finish the book" → "unlock the language."
4. **Immersion / Sentence-Mining Mode** *(the Yomu part — later phase)* — read graded
   readers, short stories, Qurʾan/ḥadīth/duʿāʾ selections, classical excerpts, modern
   fuṣḥā. Tap a word → save the whole sentence as a card → review.

All four feed **one review queue and one data model.**

---

## 4. The tap panel — the single biggest differentiator

Not "translation on hover" but **real Arabic parsing help**. Every tapped token shows:

- Surface form + **vocalized** form (tashkīl)
- **Root** (ح ق ق) + **pattern/form** (Form I/X, ism fāʿil, maṣdar, …)
- **Clitic split** (و + ب + ال + حق)
- POS + morphological features (definite, genitive, …)
- **iʿrāb role in this sentence** (mubtadaʾ, fāʿil, majrūr, muḍāf, …)
- Gloss (primary + secondary senses)
- Sentence/ayah context + trusted translation
- **Source + register tag** (Qurʾanic / Classical / MSA / Tafsīr / Ḥadīth / Duʿāʾ)
- **Confidence marker** (`morph=high`, `diacritization=medium`) — honesty about automation
- In Qurʾan mode: surah:ayah + Corpus morphology + deep links to tafsīr/translation
- "Find this in my reading" button + related forms from the same root

This one surface is **where the traditional sciences are delivered** — ṣarf, naḥw/iʿrāb,
and vocalization all live here.

---

## 5. Traditional-science features (layered on the tap panel)

- **Matn-as-map** — teach a rule ("speech = noun/verb/particle"), then immediately
  surface real examples from Fātiḥah/adhkār. The matn is the map; the reader is the terrain.
- **ṣarf tables from real words** — click يَسْتَغْفِرُونَ → root غ ف ر, Form X, related forms
  (غَفَرَ، يَغْفِرُ، اِسْتَغْفَرَ، مُسْتَغْفِر، مَغْفِرَة) → cards: identify root / identify form /
  recognize meaning shift / produce past tense / compare Form I vs X.
- **Interactive iʿrāb** — click each word of الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ → see each role,
  then the app **asks back** ("Why is رَبّ majrūr? Which word is the muḍāf? What changes if
  the ending changes?"). Passive explanation → active training with feedback.
- **Dictation / imlāʾ** — hear → type → add tashkīl → compare → explain endings →
  gradually remove vowels.
- **Guided reading / Teacher mode** — shared class text, preload + mark unknowns, teacher
  reveals layers and attaches notes, post-lesson Anki export, confusion dashboard.
- **Hifẓ / recitation support** — word-by-word meaning + root/pattern + grammar role +
  audio loop + memorization tracker; respects that recitation has its own adab/tajwīd/
  transmission (understanding *alongside*, not replacing).

---

## 6. Progressive grammar reveal (anti-overwhelm)

| Level | What the tap panel reveals |
|---|---|
| **Beginner** | meaning, pronunciation, noun/verb/particle, root |
| **Lower-intermediate** | verb form, tense, pronouns, muḍāf/muḍāf ilayh, jār-majrūr, basic iʿrāb |
| **Intermediate** | full ṣarf, case endings, jumlah ismiyyah/fiʿliyyah, naʿt, badal, ḥāl, mafʿūl types |
| **Advanced** | balāghah, tafsīr grammar, classical parsing, poetry, competing analyses |

Plus **progressive tashkīl removal**: full → hide end vowels → hide internal → none,
tied to learner level. (Arabic.ba is the UX precedent.)

---

## 7. Data model

**Two-layer rule:** canonical source content is **immutable & versioned**; learner
annotations live separately. Protects sacred text and simplifies licensing.

### Content / source entity
`source_id` (`quran:2:255`) · `source_type` (`quran`,`tafsir`,`hadith`,`dua`,`msa_article`,
`graded_reader`,`pdf`,`video_sub`) · `source_title` · `text_raw` (immutable) ·
`text_display` (vocalization layers) · `canonical_lock`

### Token / card entity
`token_surface` · `token_vocalized` · `lemma` · `root` · `pattern_or_form` ·
`clitic_segments_json` · `morph_features_json` · `gloss_primary` · `gloss_secondary` ·
`context_text` · `context_translation` · `audio_ref` · `image_ref` · `register_tags` ·
`topic_tags` · `confidence_flags`

### Anki note type (for export)
`HeadwordSurface` · `HeadwordVocalized` · `Lemma` · `Root` · `PatternForm` ·
`CliticSplit` · `POSMorph` · `SentenceOrAyah` · `TrustedTranslation` · `SourceRef` ·
`RegisterTags` · `Audio` · `Image` · `Notes`
Default cards: **recognition + audio-first + optional morphology**. Cloze offered, not default.

---

## 8. Technical stack

| Layer | Choice | Notes |
|---|---|---|
| App | **Next.js (App Router) + React + TypeScript** | RTL-first; Tailwind for styling |
| Review | **`ts-fsrs`** (native) + **Anki export** | Anki itself supports FSRS natively |
| Persistence | SQLite (local-first) → Postgres if/when sync is added | Canonical vs learner data physically separable |
| Morphology — Qurʾan | **Quranic Arabic Corpus / Quran.com data** | Manually annotated; never let a general analyzer *guess* on Qurʾan |
| Morphology — general MSA | **CAMeL Tools + Camel Morph** (later) | MIT; runs as a small analysis service, not a static dict |
| Quran text | **Tanzil / Quran.com** | Verbatim reuse + attribution; **no edits** |
| Translations | **QuranEnc / Quran.com** | Structured, reliable references |
| OCR (later) | **Tesseract + Arabic traineddata** | Apache-2.0; fallback when text isn't selectable |
| Diacritization (assist) | **Mishkal** (GPL-3.0, isolate) / **Shakkala** (review) | Architectural separation for GPL |
| TTS | Browser TTS (MVP) → cloud `ar-XA` → optional local Piper | |

**Key technical insight:** morphology must be a **small analysis service, not a static
dictionary table** — Arabic needs normalization, multiple candidate analyses, contextual
disambiguation, and clitic tokenization. That is the gap between "translation on hover"
and "real Arabic parsing help."

**Licensing posture:** center on MIT/Apache (CAMeL, Tesseract); isolate GPL (Mishkal,
Quran Corpus) and Tanzil's text terms via architectural separation / optional plugins.

---

## 9. Trust & religious-sensitivity (non-negotiable)

- Qurʾan text marked **canonical & immutable**, visually and programmatically.
- Machine vocalization, morphology guesses, and learner notes are **never** rendered as if
  part of canonical text.
- UI clearly distinguishes: verified Qurʾan text · trusted translation · trusted tafsīr ·
  auto-inferred morphology · user notes.
- **Source provenance on every card** (source, register, surah:ayah / book:page).
- Recitation/hifẓ has its own adab — the understanding layer supports, doesn't replace,
  transmission.

---

## 10. MVP scope (ship this first)

1. **Salah Arabic module** (Fātiḥah + adhkār + common duʿāʾ)
2. **Fātiḥah + last 10 surahs reader**, with the 7 toggle layers
3. **Root/pattern hover lookup** (from Corpus data, not live analysis)
4. **Basic interactive iʿrāb** + ask-back questions
5. **Tashkīl toggle** (progressive removal)
6. **Native FSRS review** + **Anki export**
7. **Small guided curriculum** — nouns, verbs, particles, muḍāf, jār-majrūr, basic verb
   forms — each lesson unlocking real ṣalāh/surah examples

Outcome: immediate spiritual payoff, proves the grammar-through-reading model, and lays
the foundation for the larger Qurʾan/fuṣḥā platform.

---

## 11. Roadmap

| Phase | Ships |
|---|---|
| **0 — Foundation** | Next.js scaffold, two-layer data model, ingest Fātiḥah + short surahs (text + translation + Corpus morphology), Anki schema, clickable prototype |
| **1 — Salah MVP** | The 7 MVP items above |
| **2 — Qurʾan Reader** | Full layered reader, more surahs, tafsīr deep links, canonical-lock rules |
| **3 — General Arabic intelligence** | CAMeL-backed lemma/root/POS/clitic for arbitrary fuṣḥā, confidence indicators, saved-item search/browse |
| **4 — Immersion / mining** | Import articles & graded readers, sentence mining, audio cards |
| **5 — Media + dictation + teacher mode** | OCR, imlāʾ flow, guided-reading/teacher features |
| **6 — Native review + analytics** | FSRS dashboards by source/register/root/surah, mastery views |
| **7 — Polish / scale** | Sync, mobile-friendly shell, accessibility, scholar/teacher QA |

---

## 12. Open items to resolve before/at Phase 0

- **Data sourcing**: confirm and download Quranic Arabic Corpus morphology + Tanzil text +
  a translation from QuranEnc for Fātiḥah and the last 10 surahs; verify license terms.
- **iʿrāb data**: decide source of truth for iʿrāb roles in MVP (Corpus syntactic treebank
  vs hand-authored for the small curated set).
- **Curriculum content**: author the small guided curriculum (nouns/verbs/particles/muḍāf/
  jār-majrūr/basic verb forms) and map each lesson to its ṣalāh/surah examples.
- **Audio**: source recitation clips for the curated set (per-ayah/per-phrase).
