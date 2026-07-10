"use client";

import Link from "next/link";
import { History, ArrowRight } from "lucide-react";
import { useLivePrices } from "@/lib/use-live-prices";
import { Card, CardEyebrow } from "@/components/ui/Card";
import { NIFTY_50 } from "@/lib/mock-data";
import { Delta } from "@/components/ui/Delta";
import { formatINR } from "@/lib/format";

const RECENT = ["ADANIENT", "SUNPHARMA", "AXISBANK", "BAJFINANCE", "KOTAKBANK", "HCLTECH", "INFY", "TCS", "RELIANCE"];

export default function RecentlyViewedPage() {
  const list = RECENT.map((sym) => NIFTY_50.find((s) => s.symbol === sym)).filter(Boolean) as typeof NIFTY_50;
  const prices = useLivePrices(list.map((s) => ({ symbol: s.symbol, basePrice: s.basePrice })));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-(--color-fg-subtle)">
            Recently viewed
          </p>
          <h1 className="mt-1 text-[28px] font-semibold tracking-tight">Pick up where you left off</h1>
          <p className="mt-1 text-[13.5px] text-(--color-fg-muted)">
            Stocks you opened in the last 7 days. We never share this with anyone.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-[12px] font-medium text-(--color-fg-muted)">
          <History className="h-3.5 w-3.5" /> {list.length} recent
        </span>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => {
          const tick = prices[s.symbol];
          return (
            <li key={s.symbol}>
              <Link
                href={`/stocks/${s.symbol}`}
                className="group block rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 transition-all hover:-translate-y-0.5 hover:border-(--color-brand-300) hover:shadow-[0_18px_38px_-22px_rgba(13,31,23,0.14)]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[14.5px] font-semibold tracking-tight text-(--color-fg)">{s.symbol}</p>
                    <p className="mt-0.5 text-[12px] text-(--color-fg-subtle)">{s.name}</p>
                  </div>
                  <span className="rounded-full bg-(--color-surface-2) px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-(--color-fg-muted)">
                    {s.sector}
                  </span>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <p className="text-[22px] font-semibold tabular tracking-tight">
                    ₹{formatINR(tick?.price ?? s.basePrice, { decimals: 2 })}
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

      <Card padding="md">
        <CardEyebrow>About this page</CardEyebrow>
        <p className="mt-2 text-[13.5px] leading-relaxed text-(--color-fg-muted)">
          Recently Viewed is stored locally in your browser. It does not sync across devices and we never see it.
          Clear it any time from your browser settings.
        </p>
      </Card>
    </div>
  );
}
