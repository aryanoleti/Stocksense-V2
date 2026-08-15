"use client";

import { useMemo, useState } from "react";
import type { Checkpoint } from "@/lib/learn/types";
import { shuffleCheckpoint } from "@/lib/learn/shuffle";

/* The gate at the end of a lesson.

   Both questions are answered and submitted together, and the result is only
   ever "passed" or "not yet" — which answer was wrong is deliberately not
   revealed. Showing it would let a reader pass the second attempt by
   elimination without having understood anything.

   Two attempts are allowed. After the second failure the answers and
   explanations are shown, and the lesson has to be re-read from the top. */
export function UnitCheck({
  questions,
  attempts,
  passed,
  onSubmit,
  onRestart,
}: {
  questions: Checkpoint[];
  /** attempts already used, 0 or 1 while still answerable */
  attempts: number;
  passed: boolean;
  onSubmit: (correct: boolean) => void;
  onRestart: () => void;
}) {
  const [picks, setPicks] = useState<Record<string, number>>({});
  const [lastResult, setLastResult] = useState<null | "pass" | "fail">(null);

  const exhausted = attempts >= 2 && !passed;
  const locked = passed || exhausted;

  // reshuffled per attempt, so a retry cannot be passed from memory of position
  const shuffled = useMemo(
    () => questions.map((q) => shuffleCheckpoint(q, attempts)),
    [questions, attempts]
  );

  const allAnswered = shuffled.every((q) => picks[q.id] !== undefined);

  const submit = () => {
    if (!allAnswered || locked) return;
    const correct = shuffled.every((q) => picks[q.id] === q.answer);
    setLastResult(correct ? "pass" : "fail");
    setPicks({});
    onSubmit(correct);
  };

  return (
    <section
      aria-labelledby="unit-check-heading"
      className="mt-10 rounded-2xl border-2 border-(--color-border-strong) bg-(--color-surface) p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="unit-check-heading" className="text-lg font-semibold text-(--color-fg)">
            Unit check
          </h2>
          <p className="mt-1 text-sm text-(--color-fg-muted)">
            Answer both questions correctly to finish this lesson and unlock the next one.
          </p>
        </div>
        <span className="rounded-full border border-(--color-border) px-3 py-1 text-xs font-medium tabular-nums text-(--color-fg-muted)">
          {passed ? "Passed" : `Attempt ${Math.min(attempts + 1, 2)} of 2`}
        </span>
      </div>

      {passed ? (
        <p className="mt-5 rounded-lg border border-(--color-up) bg-(--color-up-soft) p-4 text-sm font-medium text-(--color-fg)">
          You passed this unit check. The next lesson is unlocked.
        </p>
      ) : exhausted ? (
        <div className="mt-5">
          <p className="rounded-lg border border-(--color-down) bg-(--color-down-soft) p-4 text-sm text-(--color-fg)">
            <span className="font-semibold">Both attempts used.</span> The answers are below — read
            them, then restart the lesson to try again.
          </p>
          <div className="mt-5 space-y-5">
            {questions.map((q, i) => (
              <div key={q.id} className="rounded-lg border border-(--color-border) p-4">
                <p className="text-sm font-medium text-(--color-fg)">
                  {i + 1}. {q.question}
                </p>
                <p className="mt-2 text-sm font-semibold text-(--color-up)">
                  Correct answer: {q.options[q.answer]}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-(--color-fg-muted)">{q.explain}</p>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onRestart}
            className="mt-5 rounded-lg bg-(--color-brand-500) px-4 py-2 text-sm font-semibold text-white hover:bg-(--color-brand-600)"
          >
            Restart this lesson
          </button>
        </div>
      ) : (
        <>
          {lastResult === "fail" && attempts === 1 && (
            <p
              role="status"
              className="mt-5 rounded-lg border border-(--color-warn) bg-(--color-surface-2) p-4 text-sm text-(--color-fg)"
            >
              <span className="font-semibold">Not quite — one attempt left.</span> Which answer was
              wrong is not shown yet. Re-read the steps above, then try again.
            </p>
          )}

          <div className="mt-5 space-y-6">
            {shuffled.map((q, qi) => (
              <fieldset key={q.id}>
                <legend className="text-sm font-semibold text-(--color-fg)">
                  {qi + 1}. {q.question}
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

          <button
            type="button"
            onClick={submit}
            disabled={!allAnswered}
            className="mt-6 rounded-lg bg-(--color-brand-500) px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-(--color-brand-600) disabled:cursor-not-allowed disabled:opacity-45"
          >
            {allAnswered ? "Submit answers" : "Answer both questions"}
          </button>
        </>
      )}
    </section>
  );
}
