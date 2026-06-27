"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Clock, Trash2, History } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Stock {
  ticker: string;
  name?: string;
  price: number;
  change: number;
  changePercent: number;
  viewedAt: Date | string;
}

interface Props {
  stocks: Stock[];
}

export function RecentlyViewedList({ stocks: initial }: Props) {
  const [stocks, setStocks] = useState(initial);
  const [clearing, setClearing] = useState(false);
  const router = useRouter();

  async function clearAll() {
    setClearing(true);
    await fetch("/api/recently-viewed", { method: "DELETE" });
    setStocks([]);
    setClearing(false);
  }

  if (stocks.length === 0) {
    return (
      <div className="card-glass p-12 text-center">
        <History className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground font-medium">No recently viewed stocks</p>
        <p className="text-sm text-muted-foreground/60 mt-1">
          Visit stock pages and they'll appear here
        </p>
        <Link
          href="/stocks"
          className="inline-block mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Browse Stocks
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{stocks.length} stocks</span>
        <button
          onClick={clearAll}
          disabled={clearing}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear history
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <AnimatePresence>
          {stocks.map((stock, i) => {
            const isUp = stock.changePercent >= 0;
            return (
              <motion.div
                key={stock.ticker}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  href={`/stock/${stock.ticker}`}
                  className="card-glass p-4 block hover:border-primary/30 transition-all hover:shadow-lg group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {stock.ticker.replace(".NS", "").slice(0, 2)}
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isUp ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"}`}>
                      {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {isUp ? "+" : ""}{stock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                  <div className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">
                    {stock.name || stock.ticker}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">{stock.ticker}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="font-mono font-semibold text-foreground">
                      {stock.price > 0 ? formatCurrency(stock.price) : "—"}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(stock.viewedAt), { addSuffix: true })}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
