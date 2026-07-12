"use client";

// Grid of the stocks the user actually opened (recorded by StockDetailView
// into localStorage). Works for the whole universe, not just the Nifty 50.

import Link from "next/link";
import { ArrowRight, History } from "lucide-react";
import { useRecent } from "@/lib/persist";
import { useLivePrices } from "@/lib/use-live-prices";
import { lookupInstrument } from "@/lib/universe";
import { NIFTY_50 } from "@/lib/mock-data";
import { Delta } from "@/components/ui/Delta";
import { formatINR } from "@/lib/format";

type Entry = { symbol: string; name: string; sector: string; basePrice: number };

function resolve(symbol: string): Entry {
  const curated = NIFTY_50.find((s) => s.symbol === symbol);
  if (curated) return { symbol, name: curated.name, sector: curated.sector, basePrice: curated.basePrice };
  const inst = lookupInstrument(symbol);
  return {
    symbol,
    name: inst?.name ?? symbol,
    sector: inst?.kind === "etf" ? "ETF" : inst?.industry ?? "NSE",
    basePrice: 0,
  };
}

export function RecentGrid({ limit = 24, compact = false }: { limit?: number; compact?: boolean }) {
  const recent = useRecent(limit);
  const entries = recent.map(resolve);
  const prices = useLivePrices(entries.map((e) => ({ symbol: e.symbol, basePrice: e.basePrice })));

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) px-6 py-12 text-center">
        <History className="mx-auto h-7 w-7 text-(--color-fg-subtle)" />
        <p className="mt-3 text-[14.5px] font-semibold text-(--color-fg)">Nothing here yet</p>
        <p className="mt-1 text-[13px] text-(--color-fg-muted)">Stocks you open will appear here automatically.</p>
      </div>
    );
  }

  return (
    <ul className={`grid gap-3 sm:grid-cols-2 ${compact ? "lg:grid-cols-3" : "lg:grid-cols-3"}`}>
      {entries.map((s) => {
        const tick = prices[s.symbol];
        const price = tick?.price || s.basePrice;
        return (
          <li key={s.symbol}>
            <Link
              href={`/stocks/${s.symbol}`}
              className="group block rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 transition-all hover:-translate-y-0.5 hover:border-(--color-brand-300) hover:shadow-[0_18px_38px_-22px_rgba(13,31,23,0.14)]"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-[14.5px] font-semibold tracking-tight text-(--color-fg)">{s.symbol}</p>
                  <p className="mt-0.5 truncate text-[12px] text-(--color-fg-subtle)">{s.name}</p>
                </div>
                <span className="ml-2 shrink-0 rounded-full bg-(--color-surface-2) px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-(--color-fg-muted)">
                  {s.sector}
                </span>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <p className="text-[22px] font-semibold tabular tracking-tight">
                  {price ? `₹${formatINR(price, { decimals: 2 })}` : "—"}
                </p>
                <Delta value={tick?.changePct ?? 0} />
              </div>
              <p className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-(--color-brand-700) opacity-0 transition-opacity group-hover:opacity-100">
                Open detail <ArrowRight className="h-3 w-3" />
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
