"use client";

import Link from "next/link";
import { useState } from "react";
import { LEVELS, TOTAL_LESSONS, TOTAL_MINUTES, TOTAL_QUESTIONS, FEATURE_HOOKS, getLesson } from "@/lib/learn/curriculum";
import { GLOSSARY } from "@/lib/learn/glossary";
import { useProgress, levelProgress, lessonStatus } from "@/lib/learn/progress";
import { isLessonUnlocked, furthestUnlocked } from "@/lib/learn/curriculum";
import { LearnTopBar } from "./LearnTopBar";
import { ProgressBar, StatTile, StatusBadge, DifficultyTag } from "./LearnPieces";

/* The Learn landing — the first screen of the site. Everything above the
   level list answers one question: where am I, and what do I open next? */
export function LearnHome() {
  const { progress, hydrated, stats, resetProgress } = useProgress();
  const [confirmReset, setConfirmReset] = useState(false);

  const next = hydrated ? furthestUnlocked(progress.completed) : getLesson(stats.nextLesson);
  const started = stats.lessonsCompleted > 0 || stats.questionsAnswered > 0;

  return (
    <>
    <LearnTopBar />
    <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
      {/* ---------- hero ---------- */}
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-(--color-brand-500)">
          StockSense Learn
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-(--color-fg) sm:text-4xl lg:text-[2.75rem]">
          Learn to read a company
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-(--color-fg-muted)">
          Seven levels, {TOTAL_LESSONS} short lessons. Start with what a share actually is and finish
          able to read a company&apos;s numbers, compare two businesses fairly, and hold a position
          through a bad month. Every example uses invented companies — this is education, not advice.
        </p>
      </header>

      {/* ---------- progress summary ---------- */}
      <section aria-label="Your progress" className="mt-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label="Overall progress"
            value={hydrated ? `${stats.percent}%` : "—"}
            hint={hydrated ? `${stats.lessonsCompleted} of ${TOTAL_LESSONS} lessons` : "Loading"}
          />
          <StatTile
            label="Lessons completed"
            value={hydrated ? `${stats.lessonsCompleted}` : "—"}
            hint={`${TOTAL_LESSONS} in the course`}
          />
          <StatTile
            label="Time remaining"
            value={hydrated ? `${stats.minutesRemaining} min` : `${TOTAL_MINUTES} min`}
            hint={`${TOTAL_MINUTES} min in total`}
          />
          <StatTile
            label="Questions correct"
            value={hydrated ? `${stats.questionsCorrect}/${stats.questionsAnswered}` : "—"}
            hint={
              hydrated && stats.questionsAnswered > 0
                ? `${stats.accuracy}% accuracy`
                : `${TOTAL_QUESTIONS} available`
            }
          />
        </div>
        <ProgressBar
          percent={hydrated ? stats.percent : 0}
          label="Course progress"
          className="mt-4"
        />
      </section>

      {/* ---------- start here ---------- */}
      {next && (
        <section
          aria-label="Recommended next lesson"
          className="mt-8 rounded-2xl border border-(--color-brand-200) bg-(--color-brand-50) p-5 sm:p-6 dark:bg-(--color-surface-2)"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-(--color-brand-600)">
                {started ? "Continue where you left off" : "Start here"}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-(--color-fg)">{next.title}</h2>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-(--color-fg-muted)">
                {next.goal}
              </p>
              <p className="mt-2 text-xs text-(--color-fg-subtle)">
                Level {next.levelId} · {next.minutes} min read
              </p>
            </div>
            <Link
              href={`/learn/${next.slug}/`}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-(--color-brand-500) px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-(--color-brand-600) focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-brand-500)"
            >
              {started ? "Continue" : "Start learning"}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      )}

      {/* ---------- levels ---------- */}
      <section aria-label="Course levels" className="mt-12">
        <h2 className="text-lg font-semibold text-(--color-fg)">The course</h2>
        <div className="mt-4 grid gap-4">
          {LEVELS.map((level) => {
            const slugs = level.lessons.map((l) => l.slug);
            const lp = levelProgress(progress, slugs);
            return (
              <article
                key={level.id}
                className="overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface)"
              >
                <div className="flex flex-wrap items-start gap-4 border-b border-(--color-border) p-5 sm:p-6">
                  <span
                    aria-hidden="true"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-(--color-surface-2) text-sm font-semibold tabular-nums text-(--color-fg-muted)"
                  >
                    {String(level.id).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <h3 className="text-lg font-semibold text-(--color-fg)">
                        Level {level.id} — {level.title}
                      </h3>
                      {hydrated && <StatusBadge status={lp.status} />}
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-(--color-fg-muted)">
                      {level.blurb}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-(--color-fg-subtle)">
                      <span>{level.lessons.length} lessons</span>
                      <span>
                        {level.lessons.reduce((s, l) => s + l.minutes, 0)} min
                      </span>
                      <span>
                        {hydrated ? `${lp.completed}/${lp.total} done` : `${lp.total} lessons`}
                      </span>
                    </div>
                    <ProgressBar
                      percent={hydrated ? lp.percent : 0}
                      label={`Level ${level.id} progress`}
                      className="mt-3 max-w-sm"
                    />
                  </div>
                </div>

                <ul className="divide-y divide-(--color-border)">
                  {level.lessons.map((lesson) => {
                    const status = hydrated ? lessonStatus(progress, lesson.slug) : "not-started";
                    // lessons open in order — a locked row is shown, not hidden,
                    // so the reader can see what is coming and why it is shut
                    const unlocked = !hydrated || isLessonUnlocked(lesson.slug, progress.completed);
                    const action =
                      status === "completed"
                        ? "Review"
                        : status === "in-progress"
                          ? "Continue"
                          : "Start";

                    const body = (
                      <>
                        <span className="w-6 shrink-0 text-xs tabular-nums text-(--color-fg-muted)">
                          {lesson.order}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block text-sm font-medium ${
                              unlocked ? "text-(--color-fg)" : "text-(--color-fg-muted)"
                            }`}
                          >
                            {lesson.title}
                          </span>
                          <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-(--color-fg-muted)">
                            <span>{lesson.minutes} min</span>
                            <DifficultyTag difficulty={lesson.difficulty} />
                          </span>
                        </span>
                        {hydrated && unlocked && <StatusBadge status={status} />}
                        <span
                          className={`shrink-0 text-sm font-medium ${
                            unlocked ? "text-(--color-brand-500)" : "text-(--color-fg-muted)"
                          }`}
                        >
                          {unlocked ? `${action} →` : "Locked"}
                        </span>
                      </>
                    );

                    return (
                      <li key={lesson.slug}>
                        {unlocked ? (
                          <Link
                            href={`/learn/${lesson.slug}/`}
                            className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5 transition-colors hover:bg-(--color-surface-2) sm:px-6"
                          >
                            {body}
                          </Link>
                        ) : (
                          <div
                            aria-disabled="true"
                            title="Finish the previous lesson to unlock this one"
                            className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5 opacity-60 sm:px-6"
                          >
                            {body}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      {/* ---------- glossary ---------- */}
      <section aria-label="Reference" className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-(--color-fg)">Reference</h2>
            <p className="mt-1 text-sm text-(--color-fg-muted)">
              Plain-language definitions for the terms this course uses.
            </p>
          </div>
          <Link
            href="/learn/glossary/"
            className="text-sm font-medium text-(--color-brand-500) hover:underline"
          >
            Open glossary →
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {GLOSSARY.slice(0, 8).map((term) => (
            <Link
              key={term.term}
              href="/learn/glossary/"
              className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4 transition-colors hover:border-(--color-brand-300)"
            >
              <p className="text-sm font-semibold text-(--color-fg)">{term.term}</p>
              <p className="mt-1 text-xs leading-relaxed text-(--color-fg-muted)">{term.short}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- where this connects ---------- */}
      <section aria-label="Apply what you learn" className="mt-12">
        <h2 className="text-lg font-semibold text-(--color-fg)">Apply it in the app</h2>
        <p className="mt-1 text-sm text-(--color-fg-muted)">
          The course is built to hand off into the rest of StockSense.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {FEATURE_HOOKS.map((hook) =>
            hook.ready ? (
              <Link
                key={hook.id}
                href={hook.href}
                className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4 transition-colors hover:border-(--color-brand-300)"
              >
                <p className="text-sm font-semibold text-(--color-fg)">{hook.label} →</p>
                <p className="mt-1 text-xs leading-relaxed text-(--color-fg-muted)">
                  {hook.description}
                </p>
              </Link>
            ) : (
              <div
                key={hook.id}
                className="rounded-xl border border-dashed border-(--color-border) p-4 opacity-70"
              >
                <p className="text-sm font-semibold text-(--color-fg-muted)">
                  {hook.label}
                  <span className="ml-2 rounded-full border border-(--color-border) px-2 py-0.5 text-[10px] uppercase tracking-wide">
                    Soon
                  </span>
                </p>
                <p className="mt-1 text-xs leading-relaxed text-(--color-fg-subtle)">
                  {hook.description}
                </p>
              </div>
            )
          )}
        </div>
      </section>

      {/* ---------- reset ---------- */}
      <section aria-label="Manage progress" className="mt-12 border-t border-(--color-border) pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-(--color-fg-subtle)">
            Progress is saved in this browser only. No account needed, nothing uploaded.
          </p>
          {confirmReset ? (
            <span className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  resetProgress();
                  setConfirmReset(false);
                }}
                className="rounded-lg border border-(--color-down) px-3 py-1.5 text-xs font-semibold text-(--color-down) hover:bg-(--color-down-soft)"
              >
                Yes, erase everything
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="rounded-lg border border-(--color-border) px-3 py-1.5 text-xs font-medium text-(--color-fg-muted) hover:bg-(--color-surface-2)"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="rounded-lg border border-(--color-border) px-3 py-1.5 text-xs font-medium text-(--color-fg-muted) hover:bg-(--color-surface-2)"
            >
              Reset progress
            </button>
          )}
        </div>
      </section>
    </div>
    </>
  );
}