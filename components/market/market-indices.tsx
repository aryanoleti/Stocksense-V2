"use client";

import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Index {
  name: string;
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
}

export function MarketIndices({ indices: initial }: { indices: Index[] }) {
  const { data: indices = initial, dataUpdatedAt } = useQuery({
    queryKey: ["market-indices"],
    queryFn: () => fetch("/api/market/indices").then((r) => r.json()),
    initialData: initial,
    refetchInterval: 15_000,
  });

  const isMarketOpen = (() => {
    const now = new Date();
    const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const h = ist.getHours(), m = ist.getMinutes(), day = ist.getDay();
    if (day === 0 || day === 6) return false;
    const totalMin = h * 60 + m;
    return totalMin >= 9 * 60 + 15 && totalMin < 15 * 60 + 30;
  })();

  return (
    <div>
      {/* Status bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Activity className="w-3.5 h-3.5" />
          <span>Market Indices</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className={cn(
            "inline-block w-1.5 h-1.5 rounded-full",
            isMarketOpen ? "bg-green-400 animate-pulse" : "bg-muted-foreground"
          )} />
          <span className="text-muted-foreground">
            {isMarketOpen ? "Market open" : "Market closed"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {indices.map((index: Index, i: number) => {
          const isUp = index.changePercent >= 0;
          return (
            <motion.div
              key={`${index.ticker}-${dataUpdatedAt}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "card-glass p-4 flex items-center justify-between group",
                "hover:border-primary/20 transition-all"
              )}
            >
              <div>
                <p className="text-xs text-muted-foreground font-medium">{index.name}</p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={index.price}
                    initial={{ opacity: 0.7, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-xl font-bold text-foreground mt-0.5 font-mono"
                  >
                    {index.price > 0
                      ? index.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })
                      : "—"}
                  </motion.p>
                </AnimatePresence>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  {index.ticker.replace("^", "")}
                </p>
              </div>
              <div className={cn(
                "flex flex-col items-end gap-1",
                isUp ? "text-green-400" : "text-red-400"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  isUp ? "bg-green-400/10" : "bg-red-400/10"
                )}>
                  {isUp
                    ? <TrendingUp className="w-4 h-4" />
                    : <TrendingDown className="w-4 h-4" />}
                </div>
                <span className="text-sm font-semibold font-mono">
                  {isUp ? "+" : ""}{index.changePercent?.toFixed(2)}%
                </span>
                <span className="text-xs opacity-75 font-mono">
                  {isUp ? "+" : ""}{index.change?.toFixed(2)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
