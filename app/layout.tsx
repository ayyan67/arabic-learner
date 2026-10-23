import type { Metadata } from "next";
import "./globals.css";
import "@fontsource/amiri-quran/400.css";
import "@fontsource/noto-naskh-arabic/400.css";
import "@fontsource/noto-naskh-arabic/700.css";
import "@fontsource/noto-sans-arabic/400.css";
import "@fontsource/noto-sans-arabic/500.css";
import "@fontsource/noto-sans-arabic/700.css";
import { ReviewProvider } from "@/lib/store";
import { ProgressProvider } from "@/lib/progress";
import { SettingsProvider } from "@/lib/settings";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Arabic Learner — read, understand, review",
  description:
    "A contextual Arabic learning app: Salah mode, a Qurʾan reader with morphology, interactive iʿrāb, and spaced repetition.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{ fontFamily: "var(--font-arabic-ui), system-ui, sans-serif" }}
      >
        <SettingsProvider>
        <ReviewProvider>
         <ProgressProvider>
          <Navbar />
          <main className="mx-auto max-w-5xl px-4 pb-16 pt-6">{children}</main>
          <footer className="mx-auto max-w-5xl px-4 pb-10 pt-4 text-xs leading-relaxed text-ink-faint">
            <div className="border-t border-[#ece3d2] pt-4">
              Qurʾan text &amp; word-by-word translation via{" "}
              <a className="underline" href="https://quran.com" target="_blank" rel="noreferrer">
                Quran.com
              </a>{" "}
              (Saheeh International). Morphology (root, lemma, POS, case) from the{" "}
              <a className="underline" href="https://corpus.quran.com" target="_blank" rel="noreferrer">
                Quranic Arabic Corpus
              </a>{" "}
              (Kais Dukes). Recitation by Mishary al-ʿAfāsy via{" "}
              <a className="underline" href="https://everyayah.com" target="_blank" rel="noreferrer">
                everyayah.com
              </a>
              . The Qurʾan text is canonical and is never modified. For personal study.
            </div>
          </footer>
         </ProgressProvider>
        </ReviewProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
