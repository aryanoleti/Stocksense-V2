import { ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { LiveDot } from "@/components/ui/Badge";
import { IndexCard } from "@/components/market/IndexCard";
import { IntradayChart } from "@/components/market/IntradayChart";
import { SectorBars } from "@/components/market/SectorBars";
import { MoversTable } from "@/components/market/MoversTable";
import { FearGreed } from "@/components/market/FearGreed";
import { INDICES } from "@/lib/mock-data";
import Link from "next/link";

export default function MarketPage() {
  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-(--color-fg-subtle)">
            Markets
          </p>
          <h1 className="mt-1 text-[28px] font-semibold tracking-tight text-(--color-fg)">
            Market overview
          </h1>
          <p className="mt-1 text-[13.5px] text-(--color-fg-muted)">
            Live NSE & BSE indices, sector pulse, and today&apos;s movers — refreshed every 5 seconds.
          </p>
        </div>
        <LiveDot />
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {INDICES.slice(0, 4).map((i) => (
          <IndexCard key={i.symbol} symbol={i.symbol} name={i.name} base={i.base} />
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <Card padding="md">
          <CardHeader>
            <div>
              <CardTitle>Nifty 50 · Intraday</CardTitle>
              <p className="mt-1 text-[13.5px] text-(--color-fg)">5-minute candles · NSE</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface-2) p-0.5">
              {["1D", "1W", "1M", "1Y", "5Y"].map((r, i) => (
                <button
                  key={r}
                  type="button"
                  className={`rounded-md px-2.5 py-1 text-[11.5px] font-semibold ${
                    i === 0 ? "bg-(--color-surface) text-(--color-fg) shadow-xs" : "text-(--color-fg-subtle)"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </CardHeader>
          <IntradayChart symbol={INDICES[0].symbol} base={INDICES[0].base} />
        </Card>

        <Card padding="md">
          <CardHeader>
            <div>
              <CardTitle>Sector performance</CardTitle>
              <p className="mt-1 text-[13.5px] text-(--color-fg)">% change today</p>
            </div>
          </CardHeader>
          <SectorBars />
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="grid gap-5 sm:grid-cols-2">
          <MoversTable title="Top gainers" variant="gainers" count={6} />
          <MoversTable title="Top losers" variant="losers" count={6} />
        </div>
        <Card padding="md">
          <CardHeader>
            <CardTitle>Fear &amp; Greed Index</CardTitle>
          </CardHeader>
          <FearGreed value={62} />
          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-(--color-border) pt-4 text-center">
            <div>
              <p className="text-[10.5px] uppercase tracking-[0.12em] text-(--color-fg-subtle)">Yesterday</p>
              <p className="mt-1 text-[15px] font-semibold tabular">58</p>
            </div>
            <div>
              <p className="text-[10.5px] uppercase tracking-[0.12em] text-(--color-fg-subtle)">1W ago</p>
              <p className="mt-1 text-[15px] font-semibold tabular">52</p>
            </div>
            <div>
              <p className="text-[10.5px] uppercase tracking-[0.12em] text-(--color-fg-subtle)">1M ago</p>
              <p className="mt-1 text-[15px] font-semibold tabular">41</p>
            </div>
          </div>
        </Card>
      </section>

      <section>
        <Card padding="md" className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Explore all Nifty 50 stocks</CardTitle>
            <p className="mt-1 text-[13.5px] text-(--color-fg-muted)">
              Filter by sector, sort by value or momentum, and open AI insights on any company.
            </p>
          </div>
          <Link
            href="/stocks"
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-(--color-brand-700) hover:underline"
          >
            Open stocks list <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Card>
      </section>
    </div>
  );
}
