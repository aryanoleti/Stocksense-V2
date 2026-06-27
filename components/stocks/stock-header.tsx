"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { StockQuote } from "@/services/stock.service";
import { WatchlistButton } from "@/components/stocks/watchlist-button";

export function StockHeader({ quote: initial }: { quote: StockQuote }) {
  const { data: quote = initial } = useQuery<StockQuote>({
    queryKey: ["quote", initial.ticker],
    queryFn: () => fetch(`/api/stocks/${initial.ticker}/quote`).then((r) => r.json()),
    initialData: initial,
    refetchInterval: 15_000,
  });

  const isUp = quote.changePercent >= 0;

  return (
    <div className="card-glass p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        {/* Left: logo + name */}
        <div className="flex items-center gap-4">
          {quote.logo ? (
            <div className="w-12 h-12 rounded-xl border border-border overflow-hidden bg-card flex-shrink-0">
              <Image
                src={quote.logo}
                alt={quote.name}
                width={48}
                height={48}
                className="w-full h-full object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-base font-bold text-primary flex-shrink-0">
              {quote.ticker.replace(".NS", "").slice(0, 2)}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-foreground">{quote.name}</h1>
              <span className="ticker-badge">{quote.ticker.replace(".NS", "")}</span>
              {quote.exchange && (
                <span className="text-xs text-muted-foreground">{quote.exchange}</span>
              )}
            </div>
            {quote.sector && (
              <p className="text-sm text-muted-foreground mt-0.5">{quote.sector}</p>
            )}
          </div>
        </div>

        {/* Right: price + actions */}
        <div className="flex flex-col items-end gap-3">
          <div className="text-right">
            <motion.p
              key={quote.price}
              initial={{ scale: 1.06 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold font-mono text-foreground"
            >
              ₹{quote.price?.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </motion.p>
            <div className={cn(
              "flex items-center justify-end gap-1.5 mt-1",
              isUp ? "text-green-400" : "text-red-400"
            )}>
              {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="font-semibold font-mono text-sm">
                {isUp ? "+" : ""}{quote.change?.toFixed(2)} ({isUp ? "+" : ""}{quote.changePercent?.toFixed(2)}%)
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-end gap-1.5">
              Live · 15s refresh
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <WatchlistButton ticker={quote.ticker} />
            {quote.logo && (
              <a
                href={`https://finance.yahoo.com/quote/${quote.ticker}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-border text-muted-foreground hover:text-foreground hover:border-border/80 bg-muted transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                Yahoo Finance
              </a>
            )}
          </div>
        </div>
      </div>

      {quote.description && (
        <p className="text-sm text-muted-foreground mt-4 leading-relaxed line-clamp-2">
          {quote.description}
        </p>
      )}
    </div>
  );
}
