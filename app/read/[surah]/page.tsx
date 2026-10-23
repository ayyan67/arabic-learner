import { notFound } from "next/navigation";
import Link from "next/link";
import { getSurah, getSurahIndex, getIrab } from "@/lib/data";
import { Reader } from "@/components/Reader";
import type { IrabData } from "@/lib/types";

export function generateStaticParams() {
  return getSurahIndex().map((s) => ({ surah: String(s.id) }));
}

export default async function SurahPage({
  params,
}: {
  params: Promise<{ surah: string }>;
}) {
  const { surah: surahParam } = await params;
  const surah = await getSurah(surahParam);
  if (!surah) notFound();

  // Collect any iʿrāb data we have for ayahs in this surah.
  const irab: Record<string, IrabData> = {};
  for (const ayah of surah.ayahs) {
    const d = getIrab(ayah.key);
    if (d) irab[ayah.key] = d;
  }

  const index = getSurahIndex();
  const pos = index.findIndex((s) => s.id === surah.id);
  const prev = pos > 0 ? index[pos - 1] : null;
  const next = pos < index.length - 1 ? index[pos + 1] : null;

  return (
    <div>
      <Reader surah={surah} irab={irab} />

      <nav className="mt-8 flex items-center justify-between border-t border-[#ece3d2] pt-4 text-sm">
        {prev ? (
          <Link href={`/read/${prev.id}`} className="text-gold hover:underline">
            ← {prev.name}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/read/${next.id}`} className="text-gold hover:underline">
            {next.name} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
