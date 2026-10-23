// Build-time data pipeline.
// Joins Quran.com API v4 (Arabic text, translation, word-by-word, audio)
// with the Quranic Arabic Corpus morphology (root / lemma / POS / form / case).
// Output: lib/data/quran/<surah>.json + lib/data/quran/index.json
//
// Sources & licenses (see DATA_SOURCES.md):
//   - Quran.com / Quran Foundation API v4  (text, translation 20 = Saheeh International, audio)
//   - Quranic Arabic Corpus (Kais Dukes) via mustafa0x/quran-morphology  (GPL; attribution + link to corpus.quran.com required)
//   - Verse audio: everyayah.com (Alafasy 128kbps)

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "lib", "data", "quran");

// Al-Fatihah + the last 10 surahs.
const SURAHS = [1, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114];

const CORPUS_URL =
  "https://raw.githubusercontent.com/mustafa0x/quran-morphology/master/quran-morphology.txt";

// ---- POS / feature code → human label -------------------------------------
const POS_GROUP = { N: "noun", V: "verb", P: "particle" };
const CASE_LABEL = {
  NOM: "nominative — مرفوع",
  ACC: "accusative — منصوب",
  GEN: "genitive — مجرور",
};
const FEATURE_LABEL = {
  PN: "proper noun",
  ADJ: "adjective",
  ACT_PCPL: "active participle (ism fāʿil)",
  PASS_PCPL: "passive participle (ism mafʿūl)",
  VN: "verbal noun (maṣdar)",
  DET: "definite article (al-)",
  PRON: "pronoun",
  REL: "relative pronoun",
  DEM: "demonstrative",
  IMPV: "imperative",
  IMPF: "imperfect (present)",
  PERF: "perfect (past)",
  ACT: "active voice",
  PASS: "passive voice",
  DEF: "definite",
  INDEF: "indefinite",
};
const FORM_LABEL = {
  1: "Form I", 2: "Form II", 3: "Form III", 4: "Form IV",
  5: "Form V", 6: "Form VI", 7: "Form VII", 8: "Form VIII",
  9: "Form IX", 10: "Form X", 11: "Form XI", 12: "Form XII",
};

function stripHtml(s) {
  if (!s) return "";
  return s
    .replace(/<sup[^>]*>.*?<\/sup>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ---- Corpus parsing --------------------------------------------------------
// Returns Map "sura:aya:word" -> aggregated morphology for that word.
async function loadCorpus() {
  console.log("Downloading Quranic Arabic Corpus morphology …");
  const res = await fetch(CORPUS_URL);
  if (!res.ok) throw new Error("Corpus download failed: " + res.status);
  const text = await res.text();
  const byWord = new Map();

  for (const line of text.split("\n")) {
    if (!line.trim() || line.startsWith("#")) continue;
    const [loc, form, posGroup, featStr] = line.split("\t");
    if (!loc) continue;
    const [sura, aya, word] = loc.split(":").map(Number);
    const key = `${sura}:${aya}:${word}`;
    const feats = (featStr || "").split("|");

    let entry = byWord.get(key);
    if (!entry) {
      entry = {
        segments: [],
        root: null,
        lemma: null,
        posGroup: null,
        gram: new Set(),
        form: null,
        caseTag: null,
      };
      byWord.set(key, entry);
    }
    entry.segments.push(form);

    const isPrefix = feats.includes("PREF") || feats.includes("DET");
    // Stem segment carries root/lemma/case; capture it as the primary.
    for (const f of feats) {
      if (f.startsWith("ROOT:")) entry.root = f.slice(5);
      else if (f.startsWith("LEM:") && !isPrefix) entry.lemma = f.slice(4);
      else if (f.startsWith("VF:")) entry.form = Number(f.slice(3));
      else if (CASE_LABEL[f]) entry.caseTag = f;
      else if (FEATURE_LABEL[f]) entry.gram.add(f);
    }
    if (!isPrefix && POS_GROUP[posGroup] && !entry.posGroup) {
      entry.posGroup = posGroup;
    }
  }
  return byWord;
}

function buildMorph(entry) {
  if (!entry) return null;
  const parts = [];
  if (entry.posGroup) parts.push(POS_GROUP[entry.posGroup]);
  for (const g of entry.gram) parts.push(FEATURE_LABEL[g]);
  const morph = {
    root: entry.root || null,
    lemma: entry.lemma || null,
    pos: entry.posGroup ? POS_GROUP[entry.posGroup] : null,
    form: entry.form ? FORM_LABEL[entry.form] || `Form ${entry.form}` : null,
    grammar: parts,
    case: entry.caseTag ? CASE_LABEL[entry.caseTag] : null,
    segments: entry.segments,
  };
  return morph;
}

// ---- Quran.com fetch -------------------------------------------------------
async function fetchSurah(n, corpus) {
  const url =
    `https://api.quran.com/api/v4/verses/by_chapter/${n}` +
    `?language=en&words=true&translations=20&fields=text_uthmani` +
    `&word_fields=text_uthmani,transliteration,translation&per_page=300`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Surah ${n} fetch failed: ${res.status}`);
  const data = await res.json();

  const ayahs = data.verses.map((v) => {
    const [sura, aya] = v.verse_key.split(":").map(Number);
    const sss = String(sura).padStart(3, "0");
    const aaa = String(aya).padStart(3, "0");
    let wordPos = 0;
    const words = v.words
      .filter((w) => w.char_type_name === "word")
      .map((w) => {
        wordPos += 1;
        const morph = buildMorph(corpus.get(`${sura}:${aya}:${wordPos}`));
        return {
          position: wordPos,
          arabic: w.text_uthmani || w.text,
          transliteration: w.transliteration?.text || "",
          translation: w.translation?.text || "",
          morph,
        };
      });
    return {
      key: v.verse_key,
      number: aya,
      arabic: (v.text_uthmani || "").trim(),
      translation: stripHtml(v.translations?.[0]?.text),
      audio: `https://everyayah.com/data/Alafasy_128kbps/${sss}${aaa}.mp3`,
      words,
    };
  });

  return ayahs;
}

// ---- Surah metadata (names) ------------------------------------------------
async function fetchChapters() {
  const res = await fetch("https://api.quran.com/api/v4/chapters?language=en");
  const data = await res.json();
  const map = {};
  for (const c of data.chapters) {
    map[c.id] = {
      id: c.id,
      name: c.name_simple,
      nameArabic: c.name_arabic,
      translatedName: c.translated_name?.name || "",
      versesCount: c.verses_count,
      revelationPlace: c.revelation_place,
    };
  }
  return map;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const corpus = await loadCorpus();
  const chapters = await fetchChapters();
  const index = [];

  for (const n of SURAHS) {
    console.log(`Fetching surah ${n} …`);
    const ayahs = await fetchSurah(n, corpus);
    const meta = chapters[n];
    const surah = { ...meta, bismillah: n !== 1 && n !== 9, ayahs };
    await writeFile(
      join(OUT_DIR, `${n}.json`),
      JSON.stringify(surah, null, 2),
      "utf8"
    );
    index.push({
      id: meta.id,
      name: meta.name,
      nameArabic: meta.nameArabic,
      translatedName: meta.translatedName,
      versesCount: meta.versesCount,
      revelationPlace: meta.revelationPlace,
    });
  }

  await writeFile(
    join(OUT_DIR, "index.json"),
    JSON.stringify(index, null, 2),
    "utf8"
  );
  console.log(`\nDone. Wrote ${SURAHS.length} surahs + index to lib/data/quran/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
