"use client";

import Link from "next/link";
import { useProgress } from "@/lib/learn/progress";
import { FEATURE_REQUIREMENTS, featureUnlocked, getLevel } from "@/lib/learn/curriculum";

/* Persistent bar across the Learn section. It exists so the course never
   feels like a walled garden: the app is one click away at all times, and
   the tools that are still locked say what unlocks them. */
export function LearnTopBar() {
  const { progress, hydrated } = useProgress();

  const tools = Object.entries(FEATURE_REQUIREMENTS).map(([key, req]) => ({
    key,
    href: `/${key}/`,
    label: req.label,
    level: req.level,
    unlocked: !hydrated || featureUnlocked(key, progress.completed),
  }));

  return (
    <div className="sticky top-0 z-30 border-b border-(--color-border) bg-(--color-bg)/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2.5 sm:px-6">
        <Link
          href="/learn"
          className="text-sm font-semibold tracking-tight text-(--color-fg) hover:text-(--color-brand-500)"
        >
          StockSense Learn
        </Link>

        <nav aria-label="Open the app" className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-1">
          {tools.map((tool) =>
            tool.unlocked ? (
              <Link
                key={tool.key}
                href={tool.href}
                className="text-xs font-medium text-(--color-fg-muted) hover:text-(--color-brand-500)"
              >
                {tool.label}
              </Link>
            ) : (
              <span
                key={tool.key}
                title={`Unlocks after Level ${tool.level} — ${getLevel(tool.level)?.title ?? ""}`}
                className="cursor-default text-xs font-medium text-(--color-fg-muted) opacity-45"
              >
                {tool.label} · L{tool.level}
              </span>
            )
          )}
          <Link
            href="/dashboard/"
            className="rounded-lg bg-(--color-brand-500) px-3 py-1.5 text-xs font-semibold text-white hover:bg-(--color-brand-600)"
          >
            Open the app →
          </Link>
        </nav>
      </div>
    </div>
  );
}
