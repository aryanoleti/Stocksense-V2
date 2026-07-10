"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Sparkles, Newspaper, Filter, ExternalLink, Loader2 } from "lucide-react";
import { Card, CardEyebrow } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { getMarketNews, type FinnhubArticle } from "@/lib/api/finnhub";
import { generate, hasGeminiKey } from "@/lib/api/gemini";

type Sentiment = "Positive" | "Neutral" | "Negative";

type Article = {
  id: string;
  title: string;
  source: string;
  time: string;
  url: string;
  sentiment: Sentiment;
  topic: string;
  summary: string;
  tickers: string[];
};

const POSITIVE_RX = /\b(surge|jump|gain|rally|rise|beat|record|growth|profit|upgrade|win|approve|launch|expand)\w*/i;
const NEGATIVE_RX = /\b(fall|drop|plunge|loss|miss|cut|downgrade|warn|fraud|probe|delay|recall|ban|sue|crash)\w*/i;

function classify(text: string): Sentiment {
  if (POSITIVE_RX.test(text)) return "Positive";
  if (NEGATIVE_RX.test(text)) return "Negative";
  return "Neutral";
}

function formatTime(unix: number): string {
  const d = new Date(unix * 1000);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toArticle(a: FinnhubArticle): Article {
  const combined = `${a.headline} ${a.summary}`;
  return {
    id: String(a.id ?? a.url),
    title: a.headline,
    source: a.source,
    time: formatTime(a.datetime),
    url: a.url,
    sentiment: classify(combined),
    topic: a.category?.replace(/^\w/, (c) => c.toUpperCase()) || "Markets",
    summary: a.summary || a.headline,
    tickers: a.related ? a.related.split(/[,\s]+/).filter(Boolean).slice(0, 5) : [],
  };
}

const SENTIMENTS: Sentiment[] = ["Positive", "Neutral", "Negative"];

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [filter, setFilter] = useState<Sentiment | "All">("All");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const data = await getMarketNews("general");
      if (cancelled) return;
      setArticles(data.slice(0, 20).map(toArticle));
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!articles) return [];
    return filter === "All" ? articles : articles.filter((n) => n.sentiment === filter);
  }, [articles, filter]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-(--color-fg-subtle)">
            News
          </p>
          <h1 className="mt-1 text-[28px] font-semibold tracking-tight">Market headlines</h1>
          <p className="mt-1 text-[13.5px] text-(--color-fg-muted)">
            Live stories from Finnhub with AI-generated context on demand.
          </p>
        </div>
        <Badge tone="brand">
          <Sparkles className="h-3 w-3" /> AI summarised
        </Badge>
      </header>

      <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-(--color-border) bg-(--color-surface) px-3 py-2">
        <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.1em] font-semibold text-(--color-fg-subtle)">
          <Filter className="h-3.5 w-3.5" />
          Filter
        </span>
        {(["All", ...SENTIMENTS] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={cn(
              "rounded-full px-3 py-1.5 text-[12px] font-semibold",
              filter === s
                ? "bg-(--color-brand-700) text-white"
                : "text-(--color-fg-muted) hover:bg-(--color-surface-2)",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {articles === null ? (
        <NewsSkeleton />
      ) : articles.length === 0 ? (
        <Card>
          <p className="text-[14px] text-(--color-fg-muted)">
            No headlines available right now. Check that NEXT_PUBLIC_FINNHUB_KEY is set.
          </p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {filtered.map((n, i) => (
            <NewsItem key={n.id} item={n} defaultOpen={i === 0} />
          ))}
        </ul>
      )}
    </div>
  );
}

function NewsSkeleton() {
  return (
    <ul className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <li key={i} className="h-24 animate-pulse rounded-2xl border border-(--color-border) bg-(--color-surface)" />
      ))}
    </ul>
  );
}

function NewsItem({ item, defaultOpen }: { item: Article; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const [aiTake, setAiTake] = useState<string | null>(null);
  const [loadingTake, setLoadingTake] = useState(false);
  const tone = item.sentiment === "Positive" ? "up" : item.sentiment === "Negative" ? "down" : "neutral";

  useEffect(() => {
    if (!open || aiTake || loadingTake || !hasGeminiKey()) return;
    let cancelled = false;
    async function getTake() {
      setLoadingTake(true);
      const prompt = `Write a 2-3 sentence "why it matters" analysis of this news for Indian retail investors. Be specific and balanced; no buy/sell advice.

Headline: ${item.title}
Summary: ${item.summary}
Source: ${item.source}`;
      const text = await generate([{ role: "user", parts: [{ text: prompt }] }], { temperature: 0.5 });
      if (cancelled) return;
      setAiTake(text ?? "Couldn't generate context for this story right now.");
      setLoadingTake(false);
    }
    getTake();
    return () => {
      cancelled = true;
    };
  }, [open, aiTake, loadingTake, item]);

  return (
    <Card padding="none" className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-(--color-brand-50) text-(--color-brand-700)">
            <Newspaper className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[15px] font-semibold tracking-tight text-(--color-fg)">{item.title}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11.5px] text-(--color-fg-subtle)">
              <span>{item.source}</span>
              <span>·</span>
              <span>{item.time}</span>
              <Badge tone={tone}>{item.sentiment}</Badge>
              <Badge tone="outline">{item.topic}</Badge>
            </div>
          </div>
        </div>
        <ChevronDown className={cn("mt-2 h-4 w-4 shrink-0 text-(--color-fg-subtle) transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="border-t border-(--color-border) bg-(--color-surface-2)/60 px-5 py-4">
          <p className="text-[14px] leading-relaxed text-(--color-fg)">{item.summary}</p>
          <div className="mt-4 rounded-xl border border-(--color-brand-100) bg-(--color-brand-50)/50 p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-(--color-brand-700)" />
              <CardEyebrow className="text-(--color-brand-700)">Why it matters</CardEyebrow>
            </div>
            {loadingTake ? (
              <p className="mt-2 inline-flex items-center gap-2 text-[13.5px] text-(--color-fg-muted)">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Asking Gemini…
              </p>
            ) : aiTake ? (
              <p className="mt-2 text-[13.5px] leading-relaxed text-(--color-fg)">{aiTake}</p>
            ) : (
              <p className="mt-2 text-[13.5px] leading-relaxed text-(--color-fg-muted)">
                Add a Gemini key to see AI-generated context here.
              </p>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            {item.tickers.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11.5px] text-(--color-fg-subtle)">Tickers:</span>
                {item.tickers.map((t) => (
                  <a
                    key={t}
                    href={`/stocks/${t.replace(/\..+$/, "")}`}
                    className="rounded-full border border-(--color-border) bg-(--color-surface) px-2.5 py-0.5 text-[11.5px] font-semibold text-(--color-fg-muted) hover:border-(--color-brand-300) hover:text-(--color-brand-700)"
                  >
                    {t}
                  </a>
                ))}
              </div>
            )}
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-(--color-brand-700) hover:underline"
            >
              Read original <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}
    </Card>
  );
}
