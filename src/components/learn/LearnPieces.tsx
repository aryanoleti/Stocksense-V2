import Link from "next/link";
import { COMPANIES } from "@/lib/learn/companies";
import type { Difficulty, LessonStatus, WorkedExample } from "@/lib/learn/types";

/* Small shared pieces used across the Learn pages. Kept together because each
   is a few lines and they are always used in combination. */

export function ProgressBar({
  percent,
  label,
  className = "",
}: {
  percent: number;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`h-1.5 w-full overflow-hidden rounded-full bg-(--color-surface-3) ${className}`}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? "Progress"}
    >
      <div
        className="h-full rounded-full bg-(--color-brand-400) transition-[width] duration-500 ease-out"
        style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
      />
    </div>
  );
}

const STATUS_STYLES: Record<LessonStatus, string> = {
  "not-started": "border-(--color-border) text-(--color-fg-subtle)",
  "in-progress": "border-(--color-brand-300) bg-(--color-brand-50) text-(--color-brand-600)",
  completed: "border-(--color-up) bg-(--color-up-soft) text-(--color-up)",
};

const STATUS_LABELS: Record<LessonStatus, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  completed: "Completed",
};

export function StatusBadge({ status }: { status: LessonStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  intro: "Intro",
  core: "Core",
  applied: "Applied",
};

export function DifficultyTag({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className="text-[11px] font-medium uppercase tracking-wide text-(--color-fg-muted)">
      {DIFFICULTY_LABELS[difficulty]}
    </span>
  );
}

/* A worked example. Every figure comes from the invented company universe —
   the footnote says so on every card, so it can never be mistaken for real
   market data. */
export function ExampleCard({ example }: { example: WorkedExample }) {
  const company = COMPANIES[example.company];
  return (
    <figure className="my-6 overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface)">
      <figcaption className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-(--color-border) bg-(--color-surface-2) px-4 py-2.5 sm:px-5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-(--color-brand-500)">
          Worked example
        </span>
        <span className="text-[11px] text-(--color-fg-subtle)">
          {company.name} · {company.sector} · fictional
        </span>
      </figcaption>
      <div className="px-4 py-4 sm:px-5">
        <p className="text-sm font-semibold text-(--color-fg)">{example.title}</p>
        {example.rows && example.rows.length > 0 && (
          <dl className="mt-3 divide-y divide-(--color-border) border-y border-(--color-border)">
            {example.rows.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-4 py-2">
                <dt className="text-sm text-(--color-fg-muted)">{row.label}</dt>
                <dd className="shrink-0 text-sm font-semibold tabular-nums text-(--color-fg)">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
        <p className="mt-3 text-sm leading-relaxed text-(--color-fg-muted)">{example.note}</p>
      </div>
    </figure>
  );
}

export function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-(--color-fg-subtle)">
        {label}
      </p>
      <p className="mt-1.5 text-2xl font-semibold tabular-nums text-(--color-fg)">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-(--color-fg-muted)">{hint}</p>}
    </div>
  );
}

export function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-(--color-fg-subtle)">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-(--color-fg) hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className="text-(--color-fg-muted)">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
