import { ProgressDashboard } from "@/components/ProgressDashboard";

export default function ProgressPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Your progress</h1>
        <p className="mt-1 text-ink-soft">
          What you&apos;ve read, the roots and words you&apos;ve met, lessons
          mastered, and your review streak. All stored locally in this browser.
        </p>
      </header>
      <ProgressDashboard />
    </div>
  );
}
