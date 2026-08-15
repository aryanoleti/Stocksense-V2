"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PLACEMENT_QUESTIONS, VERDICT_COPY, gradePlacement } from "@/lib/learn/placement";
import { shuffleCheckpoint } from "@/lib/learn/shuffle";
import { LEVELS, getLevel } from "@/lib/learn/curriculum";
import { useProgress } from "@/lib/learn/progress";
import { LearnTopBar } from "./LearnTopBar";

/* Shown once after signing in. It recommends where to start and never blocks:
   every screen here has a way out, and the result screen lets the reader
   ignore the recommendation entirely. */
export function PlacementQuiz() {
  const { progress, savePlacement, skipPlacement } = useProgress();
  const [picks, setPicks] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  // options are shuffled here too, so the quiz cannot be pattern-matched
  const questions = useMemo(
    () => PLACEMENT_QUESTIONS.map((q) => ({ ...shuffleCheckpoint(q, 0), level: q.level })),
    []
  );

  const answeredCount = questions.filter((q) => picks[q.id] !== undefined).length;
  const allAnswered = answeredCount === questions.length;

  const result = useMemo(() => {
    if (!submitted) return null;
    // map display picks back to original indices before grading
    const original: Record<string, number> = {};
    questions.forEach((q) => {
      const display = picks[q.id];
      if (display !== undefined) original[q.id] = q.toOriginal[display];
    });
    return gradePlacement(original);
  }, [submitted, picks, questions]);

  const shown = result ?? progress.placement;

  if (shown) {
    const copy = VERDICT_COPY[shown.verdict];
    const recommended = shown.recommended
      .map((id) => getLevel(id))
      .filter((l): l is NonNullable<typeof l> => Boolean(l));
    const firstLesson = recommended[0]?.lessons[0] ?? LEVELS[0].lessons[0];

    return (
      <>
        <LearnTopBar />
        <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-10 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-(--color-brand-500)">
            Your result
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-(--color-fg) sm:text-4xl">
            {copy.headline}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-(--color-fg-muted)">
            You answered <span className="font-semibold text-(--color-fg)">{shown.score} of {shown.total}</span>{" "}
            correctly. {copy.detail}
          </p>

          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-(--color-fg-muted)">
              Suggested for you
            </h2>
            <ul className="mt-3 space-y-2">
              {recommended.map((level) => (
                <li
                  key={level.id}
                  className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4"
                >
                  <p className="text-sm font-semibold text-(--color-fg)">
                    Level {level.id} — {level.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-(--color-fg-muted)">
                    {level.blurb}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/learn/${firstLesson.slug}/`}
              className="rounded-lg bg-(--color-brand-500) px-5 py-2.5 text-sm font-semibold text-white hover:bg-(--color-brand-600)"
            >
              Start the course
            </Link>
            <Link
              href="/learn"
              className="rounded-lg border border-(--color-border) px-5 py-2.5 text-sm font-medium text-(--color-fg) hover:bg-(--color-surface-2)"
            >
              See all levels
            </Link>
            <Link
              href="/dashboard/"
              className="rounded-lg border border-(--color-border) px-5 py-2.5 text-sm font-medium text-(--color-fg-muted) hover:bg-(--color-surface-2)"
            >
              Skip for now, open the app
            </Link>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-(--color-fg-muted)">
            This is a suggestion, not a requirement — you can take any level in any order from the
            course page. Some tools in the app do stay locked until the level that explains them is
            finished.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <LearnTopBar />
      <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-10 sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-(--color-brand-500)">
          Before you start
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-(--color-fg) sm:text-4xl">
          Where should you begin?
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-(--color-fg-muted)">
          Eight questions, about three minutes. Nothing is graded and nothing is stored beyond this
          browser — the answers only decide which levels get recommended. Guessing is fine.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <div
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-(--color-surface-3)"
            role="progressbar"
            aria-valuenow={answeredCount}
            aria-valuemin={0}
            aria-valuemax={questions.length}
            aria-label="Questions answered"
          >
            <div
              className="h-full rounded-full bg-(--color-brand-400) transition-[width] duration-300"
              style={{ width: `${(answeredCount / questions.length) * 100}%` }}
            />
          </div>
          <span className="text-xs tabular-nums text-(--color-fg-muted)">
            {answeredCount}/{questions.length}
          </span>
        </div>

        <div className="mt-8 space-y-8">
          {questions.map((q, i) => (
            <fieldset key={q.id}>
              <legend className="text-base font-semibold text-(--color-fg)">
                {i + 1}. {q.question}
              </legend>
              <div className="mt-3 grid gap-2">
                {q.options.map((option, oi) => {
                  const chosen = picks[q.id] === oi;
                  return (
                    <label
                      key={option}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${
                        chosen
                          ? "border-(--color-brand-400) bg-(--color-brand-50) dark:bg-(--color-surface-2)"
                          : "border-(--color-border) hover:border-(--color-brand-300)"
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        checked={chosen}
                        onChange={() => setPicks((p) => ({ ...p, [q.id]: oi }))}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-(--color-brand-500)"
                      />
                      <span className="text-(--color-fg)">{option}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!allAnswered}
            onClick={() => {
              const original: Record<string, number> = {};
              questions.forEach((q) => {
                const display = picks[q.id];
                if (display !== undefined) original[q.id] = q.toOriginal[display];
              });
              savePlacement(gradePlacement(original));
              setSubmitted(true);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="rounded-lg bg-(--color-brand-500) px-5 py-2.5 text-sm font-semibold text-white hover:bg-(--color-brand-600) disabled:cursor-not-allowed disabled:opacity-45"
          >
            {allAnswered ? "See my result" : `Answer all ${questions.length} questions`}
          </button>
          <Link
            href="/learn"
            onClick={skipPlacement}
            className="rounded-lg border border-(--color-border) px-5 py-2.5 text-sm font-medium text-(--color-fg-muted) hover:bg-(--color-surface-2)"
          >
            Skip the quiz
          </Link>
          <Link
            href="/dashboard/"
            onClick={skipPlacement}
            className="text-sm font-medium text-(--color-fg-muted) hover:text-(--color-fg) hover:underline"
          >
            Go straight to the app
          </Link>
        </div>
      </div>
    </>
  );
}
