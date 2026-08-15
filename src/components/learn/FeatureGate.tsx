"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { FEATURE_REQUIREMENTS, featureUnlocked, getLevel } from "@/lib/learn/curriculum";
import { useProgress, levelProgress } from "@/lib/learn/progress";

/* Gates a tool behind the level of the course that explains how to read it.

   The point is not to withhold the product — it is that a workbench full of
   P/E, ROE and debt ratios is misleading to someone who has not been told
   what those numbers can and cannot say. The gate names exactly what unlocks
   it and links straight there.

   Progress is per-browser, so this is a teaching sequence rather than a
   security boundary; clearing site data resets it. */
export function FeatureGate({
  feature,
  children,
}: {
  feature: keyof typeof FEATURE_REQUIREMENTS | string;
  children: ReactNode;
}) {
  const { progress, hydrated } = useProgress();
  const req = FEATURE_REQUIREMENTS[feature];

  // unknown features are never gated; before hydration assume unlocked so the
  // page does not flash a lock at someone who has already earned it
  if (!req || !hydrated || featureUnlocked(feature, progress.completed)) {
    return <>{children}</>;
  }

  const level = getLevel(req.level);
  if (!level) return <>{children}</>;

  const lp = levelProgress(progress, level.lessons.map((l) => l.slug));
  const nextLesson =
    level.lessons.find((l) => !progress.completed.includes(l.slug)) ?? level.lessons[0];

  return (
    <div className="mx-auto max-w-2xl py-10">
      <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-(--color-brand-500)">
          Locked · needs Level {req.level}
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-(--color-fg)">
          {req.label} opens after Level {req.level}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-(--color-fg-muted)">{req.why}</p>

        <div className="mt-6 rounded-xl border border-(--color-border) bg-(--color-surface-2) p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-(--color-fg)">
              Level {req.level} — {level.title}
            </p>
            <span className="shrink-0 text-xs tabular-nums text-(--color-fg-muted)">
              {lp.completed}/{lp.total} lessons
            </span>
          </div>
          <div
            className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-(--color-surface-3)"
            role="progressbar"
            aria-valuenow={lp.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Level ${req.level} progress`}
          >
            <div
              className="h-full rounded-full bg-(--color-brand-400) transition-[width] duration-500"
              style={{ width: `${lp.percent}%` }}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/learn/${nextLesson.slug}/`}
            className="rounded-lg bg-(--color-brand-500) px-5 py-2.5 text-sm font-semibold text-white hover:bg-(--color-brand-600)"
          >
            {lp.completed > 0 ? "Continue Level " + req.level : "Start Level " + req.level}
          </Link>
          <Link
            href="/learn"
            className="rounded-lg border border-(--color-border) px-5 py-2.5 text-sm font-medium text-(--color-fg) hover:bg-(--color-surface-2)"
          >
            See the course
          </Link>
          <Link
            href="/dashboard/"
            className="rounded-lg border border-(--color-border) px-5 py-2.5 text-sm font-medium text-(--color-fg-muted) hover:bg-(--color-surface-2)"
          >
            Back to the dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
