/* Schema for the Learn course system.

   Everything the course renders — levels, lessons, steps, checkpoints,
   worked examples, glossary entries and saved progress — is described here,
   so new lessons are a data change rather than a code change. */

export type Difficulty = "intro" | "core" | "applied";

export type LessonStatus = "not-started" | "in-progress" | "completed";

/** A multiple-choice checkpoint. `answer` indexes into `options`. */
export type Checkpoint = {
  /** stable id — progress is keyed on it, so never renumber an existing one */
  id: string;
  question: string;
  options: string[];
  answer: number;
  /** shown after answering, whether right or wrong */
  explain: string;
};

/** One of the five fictional companies used throughout the course. */
export type CompanyId = "kirana" | "lumen" | "ironvale" | "coral" | "meridian";

export type WorkedExample = {
  company: CompanyId;
  title: string;
  /** label/value pairs rendered as a small figure table */
  rows?: { label: string; value: string }[];
  /** the point the numbers are making */
  note: string;
};

export type Step = {
  heading: string;
  /** short paragraphs — the reader is a sequence of small steps, not an essay */
  body: string[];
  example?: WorkedExample;
  checkpoint?: Checkpoint;
};

export type Lesson = {
  slug: string;
  levelId: number;
  /** position within its level, 1-based */
  order: number;
  title: string;
  /** one sentence: what the reader will be able to do afterwards */
  goal: string;
  minutes: number;
  difficulty: Difficulty;
  steps: Step[];
  recap: string[];
  finalQuiz: Checkpoint;
};

export type Level = {
  id: number;
  title: string;
  theme: string;
  blurb: string;
  lessons: Lesson[];
};

export type GlossaryTerm = {
  term: string;
  short: string;
  /** plain-language explanation, no jargon that is not itself defined here */
  long: string;
  formula?: string;
  example?: string;
  /** related lesson slugs, so the glossary links back into the course */
  seeAlso?: string[];
};

/* ---------------------------------------------------------------- */
/* Saved progress. Browser-only: no account is needed to learn. */

export type StoredAnswer = {
  picked: number;
  correct: boolean;
};

export type Progress = {
  /** bumped when the shape changes so old saves can be discarded safely */
  version: 1;
  /** lesson slugs the reader has finished */
  completed: string[];
  /** checkpoint id → what they picked */
  answers: Record<string, StoredAnswer>;
  /** last lesson opened, used by "Continue" */
  currentLesson: string | null;
  updatedAt: number;
};

export const EMPTY_PROGRESS: Progress = {
  version: 1,
  completed: [],
  answers: {},
  currentLesson: null,
  updatedAt: 0,
};

/* Hooks for features this course will connect to later. Kept as data so the
   navigation can render them before the integrations exist. */
export type FeatureHook = {
  id: "simulator" | "analysis" | "profile" | "dashboard";
  label: string;
  description: string;
  href: string;
  /** false until the connection is actually built */
  ready: boolean;
};
