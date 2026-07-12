"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Card, CardEyebrow } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StockHeader } from "@/components/stock/StockHeader";
import { PriceChart } from "@/components/stock/PriceChart";
import { StockAiPanel } from "@/components/stock/StockAiPanel";
import { getChart, type Quote } from "@/lib/api/yahoo";
import { industryPeers, instrumentHref } from "@/lib/universe";
import { getStock, NIFTY_50 } from "@/lib/mock-data";
import { formatINR } from "@/lib/format";

type Props = {
  symbol: string;
  name: string;
  industry?: string;
  kind: "stock" | "etf";
};

const WATCHLIST_KEY = "stocksense.watchlist.v1";

export function StockDetailView({ symbol, name, industry, kind }: Props) {
  const curated = getStock(symbol);
  const [meta, setMeta] = useState<Quote | null>(null);
  const [watched, setWatched] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getChart(symbol, "1d", "5m").then((r) => {
      if (!cancelled && r) setMeta(r.quote);
    });
    return () => {
      cancelled = true;
    };
  }, [symbol]);

  // Same storage the Watchlist page reads, so additions show up there.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(WATCHLIST_KEY);
      const list: string[] = raw ? JSON.parse(raw) : [];
      setWatched(Array.isArray(list) && list.includes(symbol));
    } catch {
      /* noop */
    }
  }, [symbol]);

  function toggleWatchlist() {
    try {
      const raw = window.localStorage.getItem(WATCHLIST_KEY);
      const list: string[] = raw ? JSON.parse(raw) : [];
      const next = list.includes(symbol) ? list.filter((s) => s !== symbol) : [...list, symbol];
      window.localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next));
      setWatched(next.includes(symbol));
    } catch {
      /* noop */
    }
  }

  const peers = curated
    ? []
    : industryPeers(symbol, 4);

  const sectorLabel = industry ?? curated?.sector ?? (kind === "etf" ? "Exchange-traded fund" : "NSE Equity");

  return (
    <div className="space-y-6">
      <StockHeader
        symbol={symbol}
        name={name}
        sector={sectorLabel}
        basePrice={curated?.basePrice ?? 0}
      />

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <Card padding="md">
            <div className="mb-4 flex items-center justify-between">
              <CardEyebrow>Price chart</CardEyebrow>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleWatchlist}
                className={watched ? "border-(--color-brand-300) text-(--color-brand-700)" : undefined}
              >
                {watched ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                {watched ? "In watchlist" : "Add to watchlist"}
              </Button>
            </div>
            <PriceChart symbol={symbol} basePrice={curated?.basePrice ?? 0} />
          </Card>

          <Card padding="md">
            <div className="mb-4 flex items-center justify-between">
              <CardEyebrow>Key metrics</CardEyebrow>
              <Badge tone="brand">Live</Badge>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
              <Metric label="Prev close" value={meta ? `₹${formatINR(meta.previousClose, { decimals: 2 })}` : "—"} />
              <Metric label="Day low" value={meta?.dayLow ? `₹${formatINR(meta.dayLow, { decimals: 2 })}` : "—"} />
              <Metric label="Day high" value={meta?.dayHigh ? `₹${formatINR(meta.dayHigh, { decimals: 2 })}` : "—"} />
              <Metric
                label="52W range"
                value={
                  meta?.fiftyTwoWeekLow && meta?.fiftyTwoWeekHigh
                    ? `₹${formatINR(meta.fiftyTwoWeekLow, { decimals: 0 })}–${formatINR(meta.fiftyTwoWeekHigh, { decimals: 0 })}`
                    : "—"
                }
              />
              {curated && (
                <>
                  <Metric label="Market cap" value={`₹${formatINR(curated.marketCap, { decimals: 0 })} Cr`} />
                  <Metric label="P/E ratio" value={curated.peRatio.toFixed(2)} />
                  <Metric label="EPS" value={`₹${curated.eps.toFixed(2)}`} />
                  <Metric label="Dividend yield" value={`${curated.dividendYield.toFixed(2)}%`} />
                </>
              )}
            </div>
          </Card>

          <Card padding="md">
            <CardEyebrow>About</CardEyebrow>
            <p className="mt-3 text-[15px] leading-relaxed text-(--color-fg)">
              {curated?.about ??
                (kind === "etf"
                  ? `${name} is an exchange-traded fund listed on the NSE. ETFs trade like stocks but track an underlying index or asset, offering low-cost diversified exposure.`
                  : `${name} is listed on the National Stock Exchange of India${industry ? ` in the ${industry} industry` : ""}. Live pricing and charts above are streamed from the exchange.`)}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge tone="outline">{sectorLabel}</Badge>
              <Badge tone="outline">NSE</Badge>
              <Badge tone="outline">{kind === "etf" ? "ETF" : "Equity"}</Badge>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <StockAiPanel symbol={symbol} name={name} curated={curated} />

          <Card padding="md">
            <CardEyebrow>Trading snapshot</CardEyebrow>
            <div className="mt-3 space-y-2.5 text-[13.5px]">
              <Row label="Exchange" value="NSE" />
              <Row label="Currency" value="INR" />
              <Row label="Type" value={kind === "etf" ? "ETF" : "Equity"} />
              {industry && <Row label="Industry" value={industry} />}
            </div>
          </Card>
        </div>
      </div>

      {(curated || peers.length > 0) && (
        <Card padding="md">
          <div className="mb-4 flex items-center justify-between">
            <CardEyebrow>Peers{industry ? ` in ${industry}` : curated ? ` in ${curated.sector}` : ""}</CardEyebrow>
            <Link href="/stocks" className="text-[12px] font-semibold text-(--color-brand-700) hover:underline">
              See all →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(curated ? curatedPeers(symbol) : peers).map((p) => (
              <Link
                key={p.symbol}
                href={instrumentHref(p.symbol)}
                className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 transition-all hover:-translate-y-0.5 hover:border-(--color-brand-300) hover:shadow-[0_18px_38px_-22px_rgba(13,31,23,0.14)]"
              >
                <p className="text-[13.5px] font-semibold tracking-tight">{p.symbol}</p>
                <p className="mt-0.5 truncate text-[11.5px] text-(--color-fg-subtle)">{p.name}</p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.1em] text-(--color-fg-subtle)">
                  {"industry" in p ? (p.industry ?? "NSE") : "NSE"}
                </p>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function curatedPeers(symbol: string) {
  const me = getStock(symbol);
  if (!me) return [];
  return NIFTY_50.filter((s) => s.sector === me.sector && s.symbol !== me.symbol).slice(0, 4);
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10.5px] uppercase tracking-[0.12em] font-semibold text-(--color-fg-subtle)">{label}</p>
      <p className="mt-1.5 text-[17px] font-semibold tabular tracking-tight text-(--color-fg)">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-(--color-border) pb-2 last:border-b-0 last:pb-0">
      <span className="text-(--color-fg-muted)">{label}</span>
      <span className="font-semibold text-(--color-fg)">{value}</span>
    </div>
  );
}
