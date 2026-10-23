// Builds a root → occurrences index from the already-fetched surah JSON.
// Offline: reads lib/data/quran/*.json, writes lib/data/roots.json.
// Powers the ṣarf "word family" feature in the tap panel.

import { readFile, writeFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, "..", "lib", "data", "quran");

const normalize = (r) => (r || "").replace(/\s+/g, "");

async function main() {
  const files = (await readdir(DIR)).filter(
    (f) => f.endsWith(".json") && f !== "index.json"
  );
  // root -> { key, surah, surahName, word, transliteration, translation }[]
  const index = {};

  for (const f of files) {
    const surah = JSON.parse(await readFile(join(DIR, f), "utf8"));
    for (const ayah of surah.ayahs) {
      for (const w of ayah.words) {
        const root = normalize(w.morph?.root);
        if (!root) continue;
        (index[root] ||= []).push({
          key: ayah.key,
          surah: surah.id,
          surahName: surah.name,
          word: w.arabic,
          transliteration: w.transliteration,
          translation: w.translation,
        });
      }
    }
  }

  // Sort each family by surah/ayah for stable display.
  for (const root of Object.keys(index)) {
    index[root].sort((a, b) => {
      const [as, aa] = a.key.split(":").map(Number);
      const [bs, ba] = b.key.split(":").map(Number);
      return as - bs || aa - ba;
    });
  }

  await writeFile(
    join(DIR, "..", "roots.json"),
    JSON.stringify(index, null, 0),
    "utf8"
  );

  const roots = Object.keys(index);
  const total = roots.reduce((n, r) => n + index[r].length, 0);
  console.log(
    `Wrote lib/data/roots.json — ${roots.length} roots, ${total} occurrences.`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
