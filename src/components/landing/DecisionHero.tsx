"use client";

import { useEffect, useRef, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { ArrowRight, ArrowUpRight, ArrowDownRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { usePrefersReducedMotion } from "@/lib/use-reveal";
import { getChart, getQuotes, type Candle, type Quote } from "@/lib/api/yahoo";

const INDEX_ROWS: { symbol: string; label: string }[] = [
  { symbol: "SENSEX", label: "SENSEX" },
  { symbol: "BANKNIFTY", label: "BANK NIFTY" },
  { symbol: "NIFTYIT", label: "NIFTY IT" },
];

const WATCH_ROWS = ["RELIANCE", "TCS", "HDFCBANK", "NIFTYBEES"];

const UP = "#2fcb80";
const DOWN = "#ff6b52";

/* Deterministic positions so SSR and client render identically. */
const PARTICLES: { left: string; top: string; size: number; duration: string; delay: string }[] = [
  { left: "6%", top: "22%", size: 3, duration: "7s", delay: "0s" },
  { left: "14%", top: "70%", size: 2, duration: "9s", delay: "1.2s" },
  { left: "30%", top: "12%", size: 2, duration: "8s", delay: "0.6s" },
  { left: "46%", top: "82%", size: 3, duration: "10s", delay: "2s" },
  { left: "58%", top: "30%", size: 2, duration: "7.5s", delay: "0.3s" },
  { left: "72%", top: "64%", size: 3, duration: "8.5s", delay: "1.6s" },
  { left: "86%", top: "18%", size: 2, duration: "9.5s", delay: "0.9s" },
  { left: "93%", top: "48%", size: 3, duration: "7s", delay: "2.4s" },
];

const inr = (v: number) =>
  v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Eases a number toward each new value so price updates count smoothly. */
function useTweened(value: number | undefined, duration = 900): number | undefined {
  const reduced = usePrefersReducedMotion();
  const [display, setDisplay] = useState<number | undefined>(undefined);
  const prev = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (value === undefined) return;
    const from = prev.current;
    prev.current = value;
    if (reduced || from === undefined || from === value) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (value - from) * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, reduced]);
  return display;
}

/** Returns "up"/"down" for ~0.8s after a value changes, for the refresh pulse. */
function useFlash(value: number | undefined): "up" | "down" | null {
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const prev = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (value === undefined) return;
    const from = prev.current;
    prev.current = value;
    if (from === undefined || from === value) return;
    setFlash(value > from ? "up" : "down");
    const id = setTimeout(() => setFlash(null), 820);
    return () => clearTimeout(id);
  }, [value]);
  return flash;
}

function PctChip({ pct }: { pct: number }) {
  return (
    <span
      className="inline-flex items-center gap-0.5 text-[13px] font-semibold tabular"
      style={{ color: pct >= 0 ? UP : DOWN }}
    >
      {pct >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
      {pct >= 0 ? "+" : ""}
      {pct.toFixed(2)}%
    </span>
  );
}

export function DecisionHero() {
  const [nifty, setNifty] = useState<{ quote: Quote; candles: Candle[] } | null>(null);
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [chartSettled, setChartSettled] = useState(false);

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

  // Let the line draw itself once, then pin it so 60s refreshes don't re-draw.
  useEffect(() => {
    if (!nifty || chartSettled) return;
    const id = setTimeout(() => setChartSettled(true), 1800);
    return () => clearTimeout(id);
  }, [nifty, chartSettled]);

  const niftyUp = (nifty?.quote.changePct ?? 0) >= 0;
  const niftyPrice = useTweened(nifty?.quote.price);
  const niftyFlash = useFlash(nifty?.quote.price);

  return (
    <section className="relative isolate" id="product">
      {/* Ambient data-stream particles */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="particle"
            style={
              {
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                "--particle-duration": p.duration,
                "--particle-delay": p.delay,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

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
                  <p
                    className={`mt-0.5 inline-block px-1 -mx-1 text-[24px] font-semibold tabular tracking-tight text-white ${
                      niftyFlash === "up" ? "flash-up" : niftyFlash === "down" ? "flash-down" : ""
                    }`}
                  >
                    {niftyPrice !== undefined ? inr(niftyPrice) : "—"}
                    {nifty && (
                      <span className="ml-2">
                        <PctChip pct={nifty.quote.changePct} />
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
                        isAnimationActive={!chartSettled}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="skeleton h-full w-full opacity-30" />
                )}
              </div>
              <span
                className={`mt-3 inline-flex items-center gap-1.5 rounded-full border border-(--color-brand-400)/35 bg-(--color-brand-600)/25 px-3 py-1.5 text-[12px] font-semibold text-(--color-brand-200) ${
                  nifty ? "animate-fade-up" : "opacity-0"
                }`}
                style={nifty ? { animationDelay: "900ms" } : undefined}
              >
                <Sparkles className="h-3 w-3" />
                AI insight on every stock — ask anything
              </span>
            </article>

            {/* Index metrics card */}
            <article className="glass-card lg:absolute lg:right-0 lg:top-10 lg:w-[230px] lg:animate-float-y-slow">
              <p className="text-[12px] font-semibold text-white/60">Markets now</p>
              <div className="mt-1">
                {INDEX_ROWS.map((row, i) => (
                  <IndexRow key={row.symbol} label={row.label} quote={quotes[row.symbol]} index={i} />
                ))}
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
                  {WATCH_ROWS.map((sym, i) => (
                    <WatchRow key={sym} symbol={sym} quote={quotes[sym]} index={i} />
                  ))}
                </tbody>
              </table>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

function IndexRow({ label, quote, index }: { label: string; quote?: Quote; index: number }) {
  const price = useTweened(quote?.price);
  const flash = useFlash(quote?.price);
  return (
    <div
      className={`animate-fade-up flex items-baseline justify-between border-b border-white/8 py-2 last:border-b-0 ${
        flash === "up" ? "flash-up" : flash === "down" ? "flash-down" : ""
      }`}
      style={{ animationDelay: `${450 + index * 120}ms` }}
    >
      <span className="text-[11.5px] text-white/45">{label}</span>
      <span className="text-right">
        <span className="block text-[13px] font-semibold tabular text-white">
          {price !== undefined ? inr(price) : "—"}
        </span>
        {quote && (
          <span
            className="block text-[11px] font-semibold tabular"
            style={{ color: quote.changePct >= 0 ? UP : DOWN }}
          >
            {quote.changePct >= 0 ? "+" : ""}
            {quote.changePct.toFixed(2)}%
          </span>
        )}
      </span>
    </div>
  );
}

function WatchRow({ symbol, quote, index }: { symbol: string; quote?: Quote; index: number }) {
  const price = useTweened(quote?.price);
  const flash = useFlash(quote?.price);
  return (
    <tr
      className={`animate-fade-up border-t border-white/8 ${
        flash === "up" ? "flash-up" : flash === "down" ? "flash-down" : ""
      }`}
      style={{ animationDelay: `${550 + index * 110}ms` }}
    >
      <td className="py-1.5 font-semibold text-white">{symbol}</td>
      <td className="py-1.5 text-right tabular text-white/85">
        {price !== undefined ? inr(price) : "—"}
      </td>
      <td
        className="py-1.5 text-right font-semibold tabular"
        style={{ color: quote ? (quote.changePct >= 0 ? UP : DOWN) : undefined }}
      >
        {quote ? `${quote.changePct >= 0 ? "+" : ""}${quote.changePct.toFixed(2)}%` : "—"}
      </td>
    </tr>
  );
}
