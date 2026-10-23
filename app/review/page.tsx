import { ReviewSession } from "@/components/ReviewSession";

export default function ReviewPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Review</h1>
        <p className="mt-1 text-ink-soft">
          Spaced repetition (FSRS) over everything you saved. Your deck lives in
          this browser.
        </p>
      </header>
      <ReviewSession />
    </div>
  );
}
