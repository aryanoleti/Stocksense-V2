"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Lesson } from "@/lib/learn/types";
import { getLevel, lessonNeighbours, lessonQuestionIds } from "@/lib/learn/curriculum";
import { useProgress } from "@/lib/learn/progress";
import { CheckpointBlock } from "./CheckpointBlock";
import { Breadcrumb, DifficultyTag, ExampleCard, ProgressBar } from "./LearnPieces";

/* The lesson reader. Content arrives as steps rather than one long article,
   so the page reads as a sequence of small ideas with a check after each. */
export function LessonReader({ lesson }: { lesson: Lesson }) {
  const { progress, hydrated, recordAnswer, openLesson, completeLesson } = useProgress();
  const level = getLevel(lesson.levelId);
  const { previous, next, position } = useMemo(
    () => lessonNeighbours(lesson.slug),
    [lesson.slug]
  );
  const questionIds = useMemo(() => lessonQuestionIds(lesson), [lesson]);
  const [justCompleted, setJustCompleted] = useState(false);

  // mark the lesson as the current one as soon as it is opened
  useEffect(() => {
    openLesson(lesson.slug);
  }, [lesson.slug, openLesson]);

  const answered = questionIds.filter((id) => progress.answers[id]).length;
  const isComplete = progress.completed.includes(lesson.slug);
  const readingPercent = questionIds.length === 0 ? 0 : Math.round((answered / questionIds.length) * 100);

  return (
    <article className="mx-auto w-full max-w-3xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
      <Breadcrumb
        items={[
          { label: "Learn", href: "/" },
          { label: `Level ${lesson.levelId} — ${level?.title ?? ""}`, href: "/#levels" },
          { label: lesson.title },
        ]}
      />

      <header className="mt-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-(--color-fg-subtle)">
          <span>Lesson {position} of 27</span>
          <span aria-hidden="true">·</span>
          <span>{lesson.minutes} min</span>
          <span aria-hidden="true">·</span>
          <DifficultyTag difficulty={lesson.difficulty} />
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-(--color-fg) sm:text-4xl">
          {lesson.title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-(--color-fg-muted)">{lesson.goal}</p>
      </header>

      <div className="sticky top-0 z-10 -mx-4 mt-6 bg-(--color-bg)/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-3">
          <ProgressBar
            percent={hydrated ? readingPercent : 0}
            label="Checkpoints answered in this lesson"
          />
          <span className="shrink-0 text-xs tabular-nums text-(--color-fg-subtle)">
            {hydrated ? `${answered}/${questionIds.length}` : `0/${questionIds.length}`}
          </span>
        </div>
      </div>

      {/* ---------- steps ---------- */}
      <div className="mt-6">
        {lesson.steps.map((step, i) => (
          <section key={step.heading} className="mb-10">
            <h2 className="flex items-baseline gap-3 text-xl font-semibold text-(--color-fg)">
              <span
                aria-hidden="true"
                className="text-sm font-semibold tabular-nums text-(--color-fg-subtle)"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              {step.heading}
            </h2>
            <div className="mt-3 space-y-4">
              {step.body.map((para) => (
                <p
                  key={para.slice(0, 30)}
                  className="text-[15px] leading-[1.75] text-(--color-fg-muted)"
                >
                  {para}
                </p>
              ))}
            </div>
            {step.example && <ExampleCard example={step.example} />}
            {step.checkpoint && (
              <CheckpointBlock
                checkpoint={step.checkpoint}
                saved={progress.answers[step.checkpoint.id]}
                onAnswer={(picked, correct) =>
                  recordAnswer(step.checkpoint!.id, picked, correct)
                }
              />
            )}
          </section>
        ))}
      </div>

      {/* ---------- recap ---------- */}
      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface-2) p-5 sm:p-6">
        <h2 className="text-base font-semibold text-(--color-fg)">Recap</h2>
        <ul className="mt-3 space-y-2">
          {lesson.recap.map((point) => (
            <li key={point.slice(0, 24)} className="flex gap-3 text-sm leading-relaxed text-(--color-fg-muted)">
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-(--color-brand-400)" />
              {point}
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- final quiz ---------- */}
      <CheckpointBlock
        checkpoint={lesson.finalQuiz}
        saved={progress.answers[lesson.finalQuiz.id]}
        onAnswer={(picked, correct) => recordAnswer(lesson.finalQuiz.id, picked, correct)}
        label="Final check"
      />

      {/* ---------- complete ---------- */}
      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 sm:p-6">
        {isComplete ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-(--color-up)">
              {justCompleted ? "Lesson complete. Nice work." : "You have completed this lesson."}
            </p>
            {next && (
              <Link
                href={`/learn/${next.slug}/`}
                className="inline-flex items-center gap-2 rounded-lg bg-(--color-brand-500) px-4 py-2 text-sm font-semibold text-white hover:bg-(--color-brand-600)"
              >
                Next lesson <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-(--color-fg-muted)">
              Finished reading? Mark it done to track your progress.
            </p>
            <button
              type="button"
              onClick={() => {
                completeLesson(lesson.slug);
                setJustCompleted(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-(--color-brand-500) px-4 py-2 text-sm font-semibold text-white hover:bg-(--color-brand-600) focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-brand-500)"
            >
              Mark as complete
            </button>
          </div>
        )}
      </section>

      {/* ---------- pager ---------- */}
      <nav aria-label="Lesson navigation" className="mt-8 grid gap-3 sm:grid-cols-2">
        {previous ? (
          <Link
            href={`/learn/${previous.slug}/`}
            className="rounded-xl border border-(--color-border) p-4 transition-colors hover:border-(--color-brand-300)"
          >
            <span className="text-xs text-(--color-fg-subtle)">← Previous</span>
            <span className="mt-1 block text-sm font-medium text-(--color-fg)">
              {previous.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/learn/${next.slug}/`}
            className="rounded-xl border border-(--color-border) p-4 text-right transition-colors hover:border-(--color-brand-300)"
          >
            <span className="text-xs text-(--color-fg-subtle)">Next →</span>
            <span className="mt-1 block text-sm font-medium text-(--color-fg)">{next.title}</span>
          </Link>
        ) : (
          <Link
            href="/"
            className="rounded-xl border border-(--color-border) p-4 text-right transition-colors hover:border-(--color-brand-300)"
          >
            <span className="text-xs text-(--color-fg-subtle)">Course complete</span>
            <span className="mt-1 block text-sm font-medium text-(--color-fg)">
              Back to the course
            </span>
          </Link>
        )}
      </nav>

      <p className="mt-10 text-xs leading-relaxed text-(--color-fg-subtle)">
        Educational content only — not investment advice. Every company, figure and scenario in this
        course is invented for teaching.
      </p>
    </article>
  );
}
