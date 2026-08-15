import type { Checkpoint, FeatureHook, Level, Lesson } from "./types";
import { SECOND_QUESTIONS } from "./unitChecks";
import { LEVEL_1_LESSONS } from "./levels/level1";
import { LEVEL_2_LESSONS } from "./levels/level2";
import { LEVEL_3_LESSONS } from "./levels/level3";
import { LEVEL_4_LESSONS } from "./levels/level4";
import { LEVEL_5_LESSONS } from "./levels/level5";
import { LEVEL_6_LESSONS } from "./levels/level6";
import { LEVEL_7_LESSONS } from "./levels/level7";

/* The curriculum map. Adding a lesson means editing one level file and
   nothing else — counts, progress and routing all derive from here. */

export const LEVELS: Level[] = [
  {
    id: 1,
    title: "Financial Foundations",
    theme: "Shares, markets, risk and diversification",
    blurb:
      "Start from zero. What you own when you own a share, how a price gets set, and why spreading money reduces risk.",
    lessons: LEVEL_1_LESSONS,
  },
  {
    id: 2,
    title: "Understanding Companies",
    theme: "Revenue, profit, debt and cash flow",
    blurb:
      "Follow money through a business — from what customers pay to what actually reaches the owners.",
    lessons: LEVEL_2_LESSONS,
  },
  {
    id: 3,
    title: "Reading the Numbers",
    theme: "EPS, P/E, ROE, debt-to-equity and margins",
    blurb:
      "The core ratios, each derived by hand so you can check the arithmetic rather than trust a formula.",
    lessons: LEVEL_3_LESSONS,
  },
  {
    id: 4,
    title: "Analyzing Companies",
    theme: "Fair comparison and evidence-based decisions",
    blurb:
      "Put two businesses side by side without rigging the question, and write a case you can be graded on.",
    lessons: LEVEL_4_LESSONS,
  },
  {
    id: 5,
    title: "Build Your Portfolio",
    theme: "Allocation, sizing and rebalancing",
    blurb:
      "Decide how much to put where, using virtual money, so that being wrong stays survivable.",
    lessons: LEVEL_5_LESSONS,
  },
  {
    id: 6,
    title: "Survive the Market",
    theme: "Drawdowns, surprises and staying rational",
    blurb:
      "Rehearse the hard moments — falls, shocks and bad news — before you meet them for real.",
    lessons: LEVEL_6_LESSONS,
  },
  {
    id: 7,
    title: "Think Like an Investor",
    theme: "Defending, reviewing and improving decisions",
    blurb:
      "Turn everything above into a repeatable process that gets better each time you use it.",
    lessons: LEVEL_7_LESSONS,
  },
];

/** Every lesson in course order — the reading sequence. */
export const ALL_LESSONS: Lesson[] = LEVELS.flatMap((l) => l.lessons);

export const TOTAL_LESSONS = ALL_LESSONS.length;

export const TOTAL_MINUTES = ALL_LESSONS.reduce((sum, l) => sum + l.minutes, 0);

/** Every checkpoint and final quiz across the course. */
export const TOTAL_QUESTIONS = ALL_LESSONS.reduce(
  (sum, l) => sum + l.steps.filter((s) => s.checkpoint).length + 1,
  0
);

const BY_SLUG = new Map(ALL_LESSONS.map((l) => [l.slug, l]));

export function getLesson(slug: string): Lesson | undefined {
  return BY_SLUG.get(slug);
}

export function getLevel(id: number): Level | undefined {
  return LEVELS.find((l) => l.id === id);
}

/** Position in the overall reading order, used for next/previous links. */
export function lessonNeighbours(slug: string): {
  previous: Lesson | null;
  next: Lesson | null;
  position: number;
} {
  const i = ALL_LESSONS.findIndex((l) => l.slug === slug);
  if (i === -1) return { previous: null, next: null, position: 0 };
  return {
    previous: i > 0 ? ALL_LESSONS[i - 1] : null,
    next: i < ALL_LESSONS.length - 1 ? ALL_LESSONS[i + 1] : null,
    position: i + 1,
  };
}

/** Questions inside one lesson: one per checkpoint, plus the final quiz. */
export function lessonQuestionIds(lesson: Lesson): string[] {
  return [
    ...lesson.steps.filter((s) => s.checkpoint).map((s) => s.checkpoint!.id),
    lesson.finalQuiz.id,
  ];
}

/* Where the course will plug into the rest of the product. Rendered now,
   wired later — `ready` gates the link so nothing points at a dead end. */
export const FEATURE_HOOKS: FeatureHook[] = [
  {
    id: "analysis",
    label: "Company analysis",
    description: "Apply Level 3 ratios to live NSE companies in the quant workbench.",
    href: "/quant/",
    ready: true,
  },
  {
    id: "simulator",
    label: "Portfolio simulator",
    description: "Practise Level 5 allocation with ₹5,00,000 of virtual capital.",
    href: "/portfolio/",
    ready: true,
  },
  {
    id: "dashboard",
    label: "Market dashboard",
    description: "Watch the market you have been reading about.",
    href: "/dashboard/",
    ready: true,
  },
  {
    id: "profile",
    label: "Investor profile",
    description: "A record of your process, rules and reviews. Coming later.",
    href: "#",
    ready: false,
  },
];

/* ------------------------------------------------------------------ */
/* Unit checks: the two-question gate at the end of every lesson.
   Question 1 restates the lesson's main idea; question 2 comes from
   unitChecks.ts and is deliberately harder, scaling with the level. */

export function unitCheck(lesson: Lesson): Checkpoint[] {
  const second = SECOND_QUESTIONS[lesson.slug];
  return second ? [lesson.finalQuiz, second] : [lesson.finalQuiz];
}

/** Lessons unlock in order: a lesson opens once the one before it is passed. */
export function isLessonUnlocked(slug: string, passed: string[]): boolean {
  const i = ALL_LESSONS.findIndex((l) => l.slug === slug);
  if (i <= 0) return true;
  return passed.includes(ALL_LESSONS[i - 1].slug);
}

/** The furthest lesson the reader is allowed to open. */
export function furthestUnlocked(passed: string[]): Lesson {
  for (const lesson of ALL_LESSONS) {
    if (!passed.includes(lesson.slug)) return lesson;
  }
  return ALL_LESSONS[ALL_LESSONS.length - 1];
}

/* Which level a given app feature requires. Gating is by level, not by
   individual lesson, so a reader unlocks a tool by finishing the block of
   teaching that explains how to read it. */
export const FEATURE_REQUIREMENTS: Record<string, { level: number; label: string; why: string }> = {
  quant: {
    level: 3,
    label: "Quant engine",
    why: "The workbench reports P/E, EPS, ROE, debt-to-equity and margins. Level 3 teaches what each one means and how it can mislead.",
  },
  compare: {
    level: 4,
    label: "Compare desk",
    why: "Comparing two companies fairly is exactly what Level 4 covers — including how the choice of metric can decide the winner in advance.",
  },
  portfolio: {
    level: 5,
    label: "Portfolio desk",
    why: "Level 5 covers position sizing, spreading risk and rebalancing, which is what the simulator asks you to do.",
  },
};

/** True when every lesson in the required level has been passed. */
export function featureUnlocked(feature: string, passed: string[]): boolean {
  const req = FEATURE_REQUIREMENTS[feature];
  if (!req) return true;
  const level = getLevel(req.level);
  if (!level) return true;
  return level.lessons.every((l) => passed.includes(l.slug));
}
