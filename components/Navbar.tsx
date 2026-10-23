"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useReview } from "@/lib/store";
import { useProgress } from "@/lib/progress";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/salah", label: "Salah" },
  { href: "/read", label: "Reader" },
  { href: "/curriculum", label: "Curriculum" },
  { href: "/review", label: "Review" },
  { href: "/progress", label: "Progress" },
];

export function Navbar() {
  const pathname = usePathname();
  const { stats, ready } = useReview();
  const { streak, ready: pReady } = useProgress();

  return (
    <header className="sticky top-0 z-30 border-b border-[#ece3d2] bg-parchment/85 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center gap-1 px-4 py-2.5">
        <Link href="/" className="mr-3 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-gold to-gold-soft text-sm font-bold text-white">
            ق
          </span>
          <span className="hidden text-sm font-semibold tracking-tight text-ink sm:block">
            Arabic Learner
          </span>
        </Link>
        <div className="flex items-center gap-0.5">
          {LINKS.map((l) => {
            const active =
              l.href === "/"
                ? pathname === "/"
                : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? "bg-ink text-parchment"
                    : "text-ink-soft hover:bg-[#f0e8d8] hover:text-ink"
                }`}
              >
                {l.label}
                {l.href === "/review" && ready && stats.due > 0 && (
                  <span className="ml-1.5 inline-grid h-4 min-w-4 place-items-center rounded-full bg-sage px-1 text-[10px] font-bold text-white">
                    {stats.due}
                  </span>
                )}
                {l.href === "/progress" && pReady && streak > 0 && (
                  <span className="ml-1.5 inline-grid h-4 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-white">
                    🔥{streak}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
