"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Star, TrendingUp, TrendingDown, ArrowRight, Plus } from "lucide-react";
import { useWatchlist } from "@/hooks/use-watchlist";
import { cn } from "@/lib/utils";

interface Quote {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
  change: number;
}

function useWatchlistQuotes(tickers: string[]) {
  return useQuery<Quote[]>({
    queryKey: ["watchlist-quotes", tickers.join(",")],
    queryFn: async () => {
      if (tickers.length === 0) return [];
      const results = await Promise.allSettled(
        tickers.map((t) =>
          fetch(`/api/stocks/${t}/quote`).then((r) => r.json())
        )
      );
      return results
        .filter((r): r is PromiseFulfilledResult<Quote> => r.status === "fulfilled")
        .map((r) => r.value);
    },
    enabled: tickers.length > 0,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}

export function WatchlistWidget() {
  const { items, isLoading: wlLoading } = useWatchlist();
  const tickers = items.map((i) => i.ticker);
  const { data: quotes = [], isLoading: quotesLoading } = useWatchlistQuotes(tickers);

  const isLoading = wlLoading || quotesLoading;

  return (
    <div className="card-glass p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400" />
          <h3 className="text-sm font-semibold text-foreground">Watchlist</h3>
          {items.length > 0 && (
            <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
              {items.length}
            </span>
          )}
        </div>
        <Link href="/stocks" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
          Add stocks <Plus className="w-3 h-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-6 text-center">
          <Star className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Your watchlist is empty</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Click the star icon on any stock page
          </p>
          <Link
            href="/stocks"
            className="inline-flex items-center gap-1 mt-3 text-xs text-primary hover:underline"
          >
            Browse stocks <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      ) : (
        <div className="space-y-1">
          <AnimatePresence>
            {quotes.map((q, i) => {
              const isUp = q.changePercent >= 0;
              return (
                <motion.div
                  key={q.ticker}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    href={`/stock/${q.ticker}`}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors flex-shrink-0">
                        {q.ticker.replace(".NS", "").slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-mono font-semibold text-foreground truncate">
                          {q.ticker.replace(".NS", "")}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-24">
                          {q.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-xs font-mono font-semibold text-foreground">
                        ₹{q.price?.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </p>
                      <p className={cn(
                        "text-xs font-mono flex items-center justify-end gap-0.5",
                        isUp ? "text-green-400" : "text-red-400"
                      )}>
                        {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                        {isUp ? "+" : ""}{q.changePercent?.toFixed(2)}%
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
