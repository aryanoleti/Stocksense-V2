"use client";

import { useCallback, useEffect, useState } from "react";
import { EMPTY_PROGRESS, type LessonStatus, type Progress } from "./types";
import { ALL_LESSONS, TOTAL_LESSONS, lessonQuestionIds, getLesson } from "./curriculum";

/* Progress lives in the browser only. No account is needed to learn, and
   nothing here is sent anywhere.

   All reads and writes go through one subscribable store rather than each
   component owning its own copy, so a checkpoint answered in the reader
   updates the level cards behind it immediately. */

const KEY = "stocksense.learn.progress.v2";

let current: Progress = EMPTY_PROGRESS;
let loaded = false;
const listeners = new Set<() => void>();

function read(): Progress {
  if (typeof window === "undefined") return EMPTY_PROGRESS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY_PROGRESS;
    const parsed = JSON.parse(raw) as Progress;
    // a saved file from an older shape is discarded rather than migrated
    if (parsed?.version !== 2) return EMPTY_PROGRESS;
    return {
      version: 2,
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      gates: parsed.gates && typeof parsed.gates === "object" ? parsed.gates : {},
      placement: parsed.placement ?? null,
      placementSeen: parsed.placementSeen === true,
      answers: parsed.answers && typeof parsed.answers === "object" ? parsed.answers : {},
      currentLesson: typeof parsed.currentLesson === "string" ? parsed.currentLesson : null,
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : 0,
    };
  } catch {
    // corrupted or unavailable storage must never break the lesson
    return EMPTY_PROGRESS;
  }
}

function write(next: Progress): void {
  current = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode or a full quota — progress still works for this session */
  }
  listeners.forEach((fn) => fn());
}

function ensureLoaded(): void {
  if (loaded) return;
  loaded = true;
  current = read();
}

/* ------------------------------------------------------------------ */
/* Derived views over the raw progress record. */

export type LearnStats = {
  lessonsCompleted: number;
  totalLessons: number;
  percent: number;
  questionsAnswered: number;
  questionsCorrect: number;
  accuracy: number;
  minutesRemaining: number;
  /** where "Continue" should send the reader */
  nextLesson: string;
};

export function computeStats(p: Progress): LearnStats {
  const answered = Object.values(p.answers);
  const correct = answered.filter((a) => a.correct).length;
  const done = new Set(p.completed);
  const remaining = ALL_LESSONS.filter((l) => !done.has(l.slug));
  return {
    lessonsCompleted: p.completed.length,
    totalLessons: TOTAL_LESSONS,
    percent: TOTAL_LESSONS === 0 ? 0 : Math.round((p.completed.length / TOTAL_LESSONS) * 100),
    questionsAnswered: answered.length,
    questionsCorrect: correct,
    accuracy: answered.length === 0 ? 0 : Math.round((correct / answered.length) * 100),
    minutesRemaining: remaining.reduce((sum, l) => sum + l.minutes, 0),
    // continue where they left off, else the first unfinished lesson
    nextLesson:
      p.currentLesson && !done.has(p.currentLesson)
        ? p.currentLesson
        : (remaining[0]?.slug ?? ALL_LESSONS[0].slug),
  };
}

export function lessonStatus(p: Progress, slug: string): LessonStatus {
  if (p.completed.includes(slug)) return "completed";
  const lesson = getLesson(slug);
  if (!lesson) return "not-started";
  // any answered question in the lesson counts as started
  const started = lessonQuestionIds(lesson).some((id) => p.answers[id]);
  return started || p.currentLesson === slug ? "in-progress" : "not-started";
}

export function levelProgress(p: Progress, lessonSlugs: string[]): {
  completed: number;
  total: number;
  percent: number;
  status: LessonStatus;
} {
  const completed = lessonSlugs.filter((s) => p.completed.includes(s)).length;
  const anyStarted = lessonSlugs.some((s) => lessonStatus(p, s) !== "not-started");
  return {
    completed,
    total: lessonSlugs.length,
    percent: lessonSlugs.length === 0 ? 0 : Math.round((completed / lessonSlugs.length) * 100),
    status:
      completed === lessonSlugs.length && lessonSlugs.length > 0
        ? "completed"
        : anyStarted
          ? "in-progress"
          : "not-started",
  };
}

/* ------------------------------------------------------------------ */
/* React binding. */

export function useProgress() {
  const [state, setState] = useState<Progress>(EMPTY_PROGRESS);
  /* hydration flag: the server cannot know what is in localStorage, so the
     first client render must match the server's empty state and only then
     swap in the saved progress */
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    ensureLoaded();
    const sync = () => setState({ ...current });
    // Deferred so the state swap does not run synchronously in the effect body.
    // A timer, not rAF: rAF never fires while a tab is in the background, which
    // would leave saved progress hidden until the tab was focused.
    const id = window.setTimeout(() => {
      sync();
      setHydrated(true);
    }, 0);
    listeners.add(sync);
    // keep multiple tabs in step
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) {
        current = read();
        sync();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.clearTimeout(id);
      listeners.delete(sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const recordAnswer = useCallback((questionId: string, picked: number, correct: boolean) => {
    ensureLoaded();
    write({
      ...current,
      answers: { ...current.answers, [questionId]: { picked, correct } },
      updatedAt: Date.now(),
    });
  }, []);

  const openLesson = useCallback((slug: string) => {
    ensureLoaded();
    if (current.currentLesson === slug) return;
    write({ ...current, currentLesson: slug, updatedAt: Date.now() });
  }, []);

  /* Record an attempt at a lesson gate. Passing marks the lesson complete
     and unlocks the next one; failing twice leaves the reader to restart. */
  const recordGateAttempt = useCallback((slug: string, passed: boolean) => {
    ensureLoaded();
    const prev = current.gates[slug] ?? { attempts: 0, passed: false };
    if (prev.passed) return;
    const gates = {
      ...current.gates,
      [slug]: { attempts: prev.attempts + 1, passed },
    };
    write({
      ...current,
      gates,
      completed: passed && !current.completed.includes(slug)
        ? [...current.completed, slug]
        : current.completed,
      currentLesson: slug,
      updatedAt: Date.now(),
    });
  }, []);

  /* Restart a lesson after both attempts failed: the gate is cleared so the
     reader can try again, and the inline checkpoint answers are dropped so
     the lesson is genuinely re-read rather than skimmed. */
  const restartLesson = useCallback((slug: string, questionIds: string[]) => {
    ensureLoaded();
    const gates = { ...current.gates };
    delete gates[slug];
    const answers = { ...current.answers };
    questionIds.forEach((id) => delete answers[id]);
    write({ ...current, gates, answers, currentLesson: slug, updatedAt: Date.now() });
  }, []);

  const savePlacement = useCallback((result: Progress["placement"]) => {
    ensureLoaded();
    write({ ...current, placement: result, placementSeen: true, updatedAt: Date.now() });
  }, []);

  const skipPlacement = useCallback(() => {
    ensureLoaded();
    write({ ...current, placementSeen: true, updatedAt: Date.now() });
  }, []);

  const resetProgress = useCallback(() => {
    ensureLoaded();
    write({ ...EMPTY_PROGRESS, updatedAt: Date.now() });
  }, []);

  return {
    progress: state,
    hydrated,
    stats: computeStats(state),
    recordAnswer,
    openLesson,
    recordGateAttempt,
    restartLesson,
    savePlacement,
    skipPlacement,
    resetProgress,
  };
}
