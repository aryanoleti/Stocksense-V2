import type { Metadata } from "next";
import Link from "next/link";
import { GLOSSARY } from "@/lib/learn/glossary";
import { getLesson } from "@/lib/learn/curriculum";
import { Breadcrumb } from "@/components/learn/LearnPieces";

export const metadata: Metadata = {
  title: "Glossary — StockSense Learn",
  description:
    "Plain-language definitions of the terms used in the course: P/E, EPS, ROE, debt-to-equity, free cash flow, diversification, volatility and drawdown.",
};

export default function GlossaryPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
      <Breadcrumb items={[{ label: "Learn", href: "/" }, { label: "Glossary" }]} />
      <header className="mt-5">
        <h1 className="text-3xl font-semibold tracking-tight text-(--color-fg) sm:text-4xl">
          Glossary
        </h1>
        <p className="mt-3 text-base leading-relaxed text-(--color-fg-muted)">
          Every term the course uses, written so it makes sense on its own. Examples use the
          invented companies from the lessons.
        </p>
      </header>

      <dl className="mt-10 space-y-8">
        {GLOSSARY.map((term) => (
          <div
            key={term.term}
            id={term.term.toLowerCase().replace(/[^a-z]+/g, "-")}
            className="border-b border-(--color-border) pb-8 last:border-0"
          >
            <dt className="text-xl font-semibold text-(--color-fg)">{term.term}</dt>
            <dd className="mt-2">
              <p className="text-sm font-medium text-(--color-fg-muted)">{term.short}</p>
              <p className="mt-3 text-[15px] leading-[1.75] text-(--color-fg-muted)">{term.long}</p>
              {term.formula && (
                <p className="mt-3 rounded-lg border border-(--color-border) bg-(--color-surface-2) px-4 py-2.5 font-mono text-sm text-(--color-fg)">
                  {term.formula}
                </p>
              )}
              {term.example && (
                <p className="mt-2 text-sm text-(--color-fg-muted)">Example: {term.example}</p>
              )}
              {term.seeAlso && term.seeAlso.length > 0 && (
                <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <span className="text-xs uppercase tracking-wide text-(--color-fg-subtle)">
                    Taught in
                  </span>
                  {term.seeAlso.map((slug) => {
                    const lesson = getLesson(slug);
                    if (!lesson) return null;
                    return (
                      <Link
                        key={slug}
                        href={`/learn/${slug}/`}
                        className="font-medium text-(--color-brand-500) hover:underline"
                      >
                        {lesson.title}
                      </Link>
                    );
                  })}
                </p>
              )}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-12 text-xs leading-relaxed text-(--color-fg-subtle)">
        Educational content only — not investment advice.
      </p>
    </div>
  );
}
