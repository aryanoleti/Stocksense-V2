"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, TrendingUp, TrendingDown, ArrowUpDown, Star, Filter } from "lucide-react";
import type { StockQuote } from "@/services/stock.service";
import { formatCurrency, formatLargeNumber, cn } from "@/lib/utils";
import { useWatchlist } from "@/hooks/use-watchlist";

interface Props {
  initialStocks: StockQuote[];
}

type SortKey = "name" | "price" | "changePercent" | "marketCap" | "volume";

const SECTOR_LABELS: Record<string, string> = {
  "Energy Minerals": "Energy",
  "Finance": "Finance",
  "Technology Services": "Technology",
  "Consumer Non-Durables": "FMCG",
  "Electronic Technology": "Electronics",
  "Process Industries": "Chemicals",
  "Producer Manufacturing": "Manufacturing",
  "Commercial Services": "Services",
  "Retail Trade": "Retail",
  "Health Technology": "Healthcare",
};

export function StockBrowser({ initialStocks }: Props) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("changePercent");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedSector, setSelectedSector] = useState("All");
  const { isWatched, toggle } = useWatchlist();

  // Derive available sectors
  const sectors = useMemo(() => {
    const s = new Set(initialStocks.map((st) => st.sector).filter(Boolean));
    return ["All", ...Array.from(s).sort()] as string[];
  }, [initialStocks]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return initialStocks
      .filter((s) => {
        if (q && !s.name.toLowerCase().includes(q) && !s.ticker.toLowerCase().includes(q)) return false;
        if (selectedSector !== "All" && s.sector !== selectedSector) return false;
        return true;
      })
      .sort((a, b) => {
        const av = (a as any)[sortKey] ?? 0;
        const bv = (b as any)[sortKey] ?? 0;
        if (typeof av === "string") return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
        return sortDir === "asc" ? av - bv : bv - av;
      });
  }, [initialStocks, search, sortKey, sortDir, selectedSector]);

  const colHeader = (label: string, key: SortKey, className = "") => (
    <th
      onClick={() => handleSort(key)}
      className={cn(
        "px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground transition-colors select-none",
        className
      )}
    >
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown className={cn("w-3 h-3", sortKey === key && "text-primary")} />
      </span>
    </th>
  );

  return (
    <div className="card-glass overflow-hidden">
      {/* Controls */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-48 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter stocks..."
              className="w-full bg-muted border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Sector filter */}
          {sectors.length > 2 && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
              >
                {sectors.map((s) => (
                  <option key={s} value={s}>{SECTOR_LABELS[s] || s}</option>
                ))}
              </select>
            </div>
          )}

          <span className="text-xs text-muted-foreground ml-auto">
            {filtered.length} stocks
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {colHeader("Company", "name")}
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground transition-colors select-none" onClick={() => handleSort("price")}>
                <span className="flex items-center justify-end gap-1">Price <ArrowUpDown className={cn("w-3 h-3", sortKey === "price" && "text-primary")} /></span>
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground transition-colors select-none" onClick={() => handleSort("changePercent")}>
                <span className="flex items-center justify-end gap-1">Change <ArrowUpDown className={cn("w-3 h-3", sortKey === "changePercent" && "text-primary")} /></span>
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground transition-colors select-none hidden md:table-cell" onClick={() => handleSort("marketCap")}>
                <span className="flex items-center justify-end gap-1">Mkt Cap <ArrowUpDown className={cn("w-3 h-3", sortKey === "marketCap" && "text-primary")} /></span>
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground transition-colors select-none hidden lg:table-cell" onClick={() => handleSort("volume")}>
                <span className="flex items-center justify-end gap-1">Volume <ArrowUpDown className={cn("w-3 h-3", sortKey === "volume" && "text-primary")} /></span>
              </th>
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((stock, i) => {
              const isUp = stock.changePercent >= 0;
              const watched = isWatched(stock.ticker);
              return (
                <motion.tr
                  key={stock.ticker}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.015 }}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link href={`/stock/${stock.ticker}`} className="flex items-center gap-3 group">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors flex-shrink-0">
                        {stock.ticker.replace(".NS", "").slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {stock.name || stock.ticker}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">{stock.ticker}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-foreground">
                    {formatCurrency(stock.price)}
                  </td>
                  <td className={cn("px-4 py-3 text-right font-medium", isUp ? "text-green-400" : "text-red-400")}>
                    <span className="flex items-center justify-end gap-1">
                      {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {isUp ? "+" : ""}{stock.changePercent.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell">
                    {stock.marketCap ? formatLargeNumber(stock.marketCap) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground hidden lg:table-cell">
                    {formatLargeNumber(stock.volume)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggle(stock.ticker)}
                      title={watched ? "Remove from watchlist" : "Add to watchlist"}
                      className={cn(
                        "w-7 h-7 flex items-center justify-center rounded-lg transition-all",
                        watched
                          ? "text-yellow-400 hover:text-yellow-300"
                          : "text-muted-foreground/30 hover:text-muted-foreground"
                      )}
                    >
                      <Star className={cn("w-3.5 h-3.5", watched && "fill-yellow-400")} />
                    </button>
                  </td>
                </motion.tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground text-sm">
                  No stocks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
