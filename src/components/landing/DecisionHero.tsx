"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { ArrowRight, ArrowUpRight, ArrowDownRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getChart, getQuotes, type Candle, type Quote } from "@/lib/api/yahoo";

const INDEX_ROWS: { symbol: string; label: string }[] = [
  { symbol: "SENSEX", label: "SENSEX" },
  { symbol: "BANKNIFTY", label: "BANK NIFTY" },
  { symbol: "NIFTYIT", label: "NIFTY IT" },
];

const WATCH_ROWS = ["RELIANCE", "TCS", "HDFCBANK", "NIFTYBEES"];

const UP = "#2fcb80";
const DOWN = "#ff6b52";

const inr = (v: number) =>
  v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function DecisionHero() {
  const [nifty, setNifty] = useState<{ quote: Quote; candles: Candle[] } | null>(null);
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const [chart, qs] = await Promise.all([
        getChart("NIFTY50", "1mo", "1d"),
        getQuotes([...INDEX_ROWS.map((r) => r.symbol), ...WATCH_ROWS]),
      ]);
      if (!alive) return;
      if (chart) setNifty(chart);
      setQuotes((prev) => ({ ...prev, ...qs }));
    };
    load();
    const id = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const niftyUp = (nifty?.quote.changePct ?? 0) >= 0;

  return (
    <section className="relative isolate" id="product">
      <div className="mx-auto max-w-7xl px-5 pt-16 pb-20 sm:pt-20 md:pt-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          {/* Copy column */}
          <div>
            <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-(--color-brand-400)/30 bg-(--color-brand-600)/20 px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.05em] text-(--color-brand-200)">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2fcb80] animate-pulse-dot" />
              AI-powered investing research for India
            </div>

            <h1 className="mt-6 text-[42px] font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-6xl md:text-[64px]">
              Turn every market move into a{" "}
              <span className="text-gradient-emerald">clear decision.</span>
            </h1>

            <p
              className="animate-fade-up mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-[17px]"
              style={{ animationDelay: "250ms" }}
            >
              StockSense watches 2,350+ NSE stocks, ETFs and indices live, then explains
              what&apos;s happening in plain language — AI research summaries, a quant engine
              you can actually read, head-to-head comparisons, and a ₹5,00,000 virtual
              portfolio to practice risk-free.
            </p>

            <div
              className="animate-fade-up mt-8 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "400ms" }}
            >
              <Button
                href="/dashboard"
                size="lg"
                className="bg-white text-(--color-brand-900) hover:bg-white/90 shadow-none"
              >
                Start researching free <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="/#features" variant="ghost" size="lg" className="text-white hover:bg-white/10">
                Explore the platform
              </Button>
            </div>

            <div className="animate-fade-up mt-11" style={{ animationDelay: "550ms" }}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
                Built on live data &amp; real AI
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-7 gap-y-2">
                {["Google Gemini", "Yahoo Finance data", "NSE universe", "Finnhub news"].map((s) => (
                  <span key={s} className="text-[14px] font-semibold text-white/45">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Dashboard visual — all numbers live */}
          <div
            className="animate-fade-up relative flex flex-col gap-3 lg:block lg:min-h-[500px]"
            style={{ animationDelay: "300ms" }}
          >
            <div className="pointer-events-none absolute inset-[10%] -z-10 hidden rounded-full bg-(--color-brand-400)/20 blur-3xl lg:block" />

            {/* NIFTY chart card */}
            <article className="glass-card lg:absolute lg:left-0 lg:right-[14%] lg:top-0 lg:animate-float-y">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12.5px] font-semibold text-white/60">NIFTY 50 · 1M</p>
                  <p className="mt-0.5 text-[24px] font-semibold tabular tracking-tight text-white">
                    {nifty ? inr(nifty.quote.price) : "—"}
                    {nifty && (
                      <span
                        className="ml-2 inline-flex items-center gap-0.5 text-[13px] font-semibold tabular"
                        style={{ color: niftyUp ? UP : DOWN }}
                      >
                        {niftyUp ? (
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5" />
                        )}
                        {nifty.quote.changePct >= 0 ? "+" : ""}
                        {nifty.quote.changePct.toFixed(2)}%
                      </span>
                    )}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2fcb80] animate-pulse-dot" />
                  Live
                </span>
              </div>
              <div className="mt-2 h-24">
                {nifty && nifty.candles.length > 1 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={nifty.candles.map((c) => ({ x: c.time, y: c.price }))}
                      margin={{ top: 4, right: 2, left: 2, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="dhFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={niftyUp ? UP : DOWN} stopOpacity={0.25} />
                          <stop offset="100%" stopColor={niftyUp ? UP : DOWN} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <YAxis domain={["dataMin", "dataMax"]} hide />
                      <Area
                        type="monotone"
                        dataKey="y"
                        stroke={niftyUp ? UP : DOWN}
                        strokeWidth={2}
                        fill="url(#dhFill)"
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="skeleton h-full w-full opacity-30" />
                )}
              </div>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-(--color-brand-400)/35 bg-(--color-brand-600)/25 px-3 py-1.5 text-[12px] font-semibold text-(--color-brand-200)">
                <Sparkles className="h-3 w-3" />
                AI insight on every stock — ask anything
              </span>
            </article>

            {/* Index metrics card */}
            <article className="glass-card lg:absolute lg:right-0 lg:top-10 lg:w-[230px] lg:animate-float-y-slow">
              <p className="text-[12px] font-semibold text-white/60">Markets now</p>
              <div className="mt-1">
                {INDEX_ROWS.map((row) => {
                  const q = quotes[row.symbol];
                  return (
                    <div
                      key={row.symbol}
                      className="flex items-baseline justify-between border-b border-white/8 py-2 last:border-b-0"
                    >
                      <span className="text-[11.5px] text-white/45">{row.label}</span>
                      <span className="text-right">
                        <span className="block text-[13px] font-semibold tabular text-white">
                          {q ? inr(q.price) : "—"}
                        </span>
                        {q && (
                          <span
                            className="block text-[11px] font-semibold tabular"
                            style={{ color: q.changePct >= 0 ? UP : DOWN }}
                          >
                            {q.changePct >= 0 ? "+" : ""}
                            {q.changePct.toFixed(2)}%
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </article>

            {/* Watchlist card */}
            <article className="glass-card lg:absolute lg:bottom-0 lg:left-[10%] lg:right-[8%] lg:animate-float-y-slow">
              <p className="text-[12px] font-semibold text-white/60">Watchlist</p>
              <table className="mt-1 w-full border-collapse text-[13px]">
                <thead>
                  <tr className="text-[10.5px] uppercase tracking-[0.08em] text-white/35">
                    <th className="py-1 text-left font-semibold">Symbol</th>
                    <th className="py-1 text-right font-semibold">LTP</th>
                    <th className="py-1 text-right font-semibold">1D</th>
                  </tr>
                </thead>
                <tbody>
                  {WATCH_ROWS.map((sym) => {
                    const q = quotes[sym];
                    return (
                      <tr key={sym} className="border-t border-white/8">
                        <td className="py-1.5 font-semibold text-white">{sym}</td>
                        <td className="py-1.5 text-right tabular text-white/85">
                          {q ? inr(q.price) : "—"}
                        </td>
                        <td
                          className="py-1.5 text-right font-semibold tabular"
                          style={{ color: q ? (q.changePct >= 0 ? UP : DOWN) : undefined }}
                        >
                          {q ? `${q.changePct >= 0 ? "+" : ""}${q.changePct.toFixed(2)}%` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
