"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Activity, Star } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useWatchlist } from "@/hooks/use-watchlist";

const TABS = [
  { id: "gainers", label: "Gainers", icon: TrendingUp, color: "text-green-400" },
  { id: "losers", label: "Losers", icon: TrendingDown, color: "text-red-400" },
  { id: "mostActive", label: "Active", icon: Activity, color: "text-blue-400" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export function TopMovers({ data: initial }: { data: any }) {
  const [tab, setTab] = useState<Tab>("gainers");
  const { isWatched, toggle } = useWatchlist();

  const { data = initial } = useQuery({
    queryKey: ["top-movers"],
    queryFn: () => fetch("/api/market/movers").then((r) => r.json()),
    initialData: initial,
    refetchInterval: 30_000,
  });

  const stocks: any[] = data[tab] || [];

  return (
    <div className="card-glass p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                tab === t.id
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <t.icon className={cn("w-3 h-3", tab === t.id && t.color)} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-0.5">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {stocks.map((stock: any, i: number) => {
              const isUp = stock.changePercent >= 0;
              const watched = isWatched(stock.ticker);
              return (
                <div
                  key={stock.ticker}
                  className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <Link
                    href={`/stock/${stock.ticker}`}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <span className="text-xs text-muted-foreground w-5 flex-shrink-0 text-center">{i + 1}</span>
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors flex-shrink-0">
                      {stock.ticker.replace(".NS", "").slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                        {stock.ticker.replace(".NS", "")}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-32">{stock.name}</p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    <div className="text-right">
                      <p className="font-mono text-sm font-semibold text-foreground">
                        ₹{stock.price?.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </p>
                      <p className={cn(
                        "text-xs font-semibold font-mono",
                        isUp ? "text-green-400" : "text-red-400"
                      )}>
                        {isUp ? "+" : ""}{stock.changePercent?.toFixed(2)}%
                      </p>
                    </div>
                    <button
                      onClick={() => toggle(stock.ticker)}
                      title={watched ? "Remove from watchlist" : "Add to watchlist"}
                      className={cn(
                        "w-6 h-6 flex items-center justify-center rounded transition-all opacity-0 group-hover:opacity-100",
                        watched ? "opacity-100 text-yellow-400" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Star className={cn("w-3.5 h-3.5", watched && "fill-yellow-400")} />
                    </button>
                  </div>
                </div>
              );
            })}
            {stocks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">Loading market data…</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
