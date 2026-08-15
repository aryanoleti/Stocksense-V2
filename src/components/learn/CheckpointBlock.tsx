"use client";

import { useState } from "react";
import type { Checkpoint } from "@/lib/learn/types";

/* An inline checkpoint. Answering reveals the explanation whether the reader
   was right or wrong — being told why a wrong answer is wrong is the part
   that teaches, so there is no penalty and no retry gate. */
export function CheckpointBlock({
  checkpoint,
  saved,
  onAnswer,
  label = "Checkpoint",
}: {
  checkpoint: Checkpoint;
  saved?: { picked: number; correct: boolean };
  onAnswer: (picked: number, correct: boolean) => void;
  label?: string;
}) {
  const [picked, setPicked] = useState<number | null>(saved ? saved.picked : null);
  const answered = picked !== null;
  const correct = answered && picked === checkpoint.answer;

  const choose = (i: number) => {
    if (answered) return;
    setPicked(i);
    onAnswer(i, i === checkpoint.answer);
  };

  return (
    <section
      className="my-8 rounded-xl border border-(--color-border) bg-(--color-surface-2) p-5 sm:p-6"
      aria-labelledby={`${checkpoint.id}-q`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-(--color-fg-subtle)">
        {label}
      </p>
      <p id={`${checkpoint.id}-q`} className="mt-2 text-base font-semibold text-(--color-fg)">
        {checkpoint.question}
      </p>

      <div role="group" aria-labelledby={`${checkpoint.id}-q`} className="mt-4 grid gap-2">
        {checkpoint.options.map((option, i) => {
          const isPicked = picked === i;
          const isAnswer = i === checkpoint.answer;
          // after answering, always mark the correct option so the reader
          // leaves knowing which one it was
          const tone = !answered
            ? "border-(--color-border) hover:border-(--color-brand-400) hover:bg-(--color-surface)"
            : isAnswer
              ? "border-(--color-up) bg-(--color-up-soft) text-(--color-fg)"
              : isPicked
                ? "border-(--color-down) bg-(--color-down-soft) text-(--color-fg)"
                : "border-(--color-border) opacity-55";

          return (
            <button
              key={option}
              type="button"
              onClick={() => choose(i)}
              disabled={answered}
              aria-pressed={isPicked}
              className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors disabled:cursor-default ${tone}`}
            >
              <span
                aria-hidden="true"
                className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-current text-[10px] font-semibold"
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span>{option}</span>
              {answered && isAnswer && (
                <span className="ml-auto shrink-0 text-xs font-semibold text-(--color-up)">
                  Correct
                </span>
              )}
              {answered && isPicked && !isAnswer && (
                <span className="ml-auto shrink-0 text-xs font-semibold text-(--color-down)">
                  You chose
                </span>
              )}
            </button>
          );
        })}
      </div>

      {answered && (
        <div
          role="status"
          className="mt-4 rounded-lg border border-(--color-border) bg-(--color-surface) p-4"
        >
          <p className="text-sm font-semibold text-(--color-fg)">
            {correct ? "That's right." : "Not quite."}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-(--color-fg-muted)">
            {checkpoint.explain}
          </p>
        </div>
      )}
    </section>
  );
}
