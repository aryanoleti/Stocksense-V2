"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ExternalLink, Search, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { NewsArticle } from "@/services/news.service";

const SENTIMENTS = ["all", "positive", "neutral", "negative"] as const;
type Sentiment = typeof SENTIMENTS[number];

const SentimentConfig = {
  positive: { label: "Positive", color: "text-green-400", bg: "bg-green-400/10 border-green-400/20", icon: TrendingUp },
  neutral: { label: "Neutral", color: "text-muted-foreground", bg: "bg-muted border-border", icon: Minus },
  negative: { label: "Negative", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20", icon: TrendingDown },
};

export function NewsFeed({ initialArticles }: { initialArticles: NewsArticle[] }) {
  const [query, setQuery] = useState("");
  const [sentiment, setSentiment] = useState<Sentiment>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: articles = initialArticles, isFetching, refetch } = useQuery({
    queryKey: ["news", query],
    queryFn: () =>
      fetch(`/api/news?q=${encodeURIComponent(query || "India stock market NSE BSE")}`)
        .then((r) => r.json()),
    initialData: initialArticles,
    refetchInterval: 300_000,
  });

  const filtered = articles.filter((a: NewsArticle) =>
    (sentiment === "all" || a.sentiment === sentiment) &&
    (query === "" || a.title.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Market News</h1>
          <p className="text-sm text-muted-foreground">AI sentiment analysis on latest market news</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className={cn("w-3 h-3", isFetching && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search news..."
            className="w-full bg-muted border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
        </div>
        <div className="flex gap-1.5">
          {SENTIMENTS.map((s) => (
            <button
              key={s}
              onClick={() => setSentiment(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition-all",
                sentiment === s
                  ? s === "all"
                    ? "bg-primary/15 text-primary border-primary/20"
                    : SentimentConfig[s as keyof typeof SentimentConfig]?.bg + " " +
                      SentimentConfig[s as keyof typeof SentimentConfig]?.color
                  : "bg-transparent border-border text-muted-foreground hover:border-primary/20 hover:text-foreground"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((article: NewsArticle, i: number) => {
          const cfg = SentimentConfig[article.sentiment];
          const SIcon = cfg.icon;
          const isExpanded = expanded === article.id;

          return (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="card-glass p-4 cursor-pointer hover:border-border/60 transition-all"
              onClick={() => setExpanded(isExpanded ? null : article.id)}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-sm font-medium text-foreground leading-snug line-clamp-2 flex-1">
                  {article.title}
                </h3>
                <span className={cn(
                  "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border flex-shrink-0",
                  cfg.bg, cfg.color
                )}>
                  <SIcon className="w-2.5 h-2.5" />
                  {cfg.label}
                </span>
              </div>

              {isExpanded && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-xs text-muted-foreground mb-3 leading-relaxed"
                >
                  {article.summary}
                </motion.p>
              )}

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{article.source}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
                </div>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No articles found matching your filters.
        </div>
      )}
    </div>
  );
}
