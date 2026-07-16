"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  X,
  Home,
  BarChart3,
  Wallet,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCountUp } from "@/lib/use-reveal";
import { useScrollDriver } from "@/lib/use-section-progress";
import { getChart, getQuotes, type Candle, type Quote } from "@/lib/api/yahoo";
import { instrumentHref, lookupInstrument } from "@/lib/universe";
import { LiveLineChart } from "./LiveLineChart";

const UP = "#2fcb80";
const DOWN = "#ff6b52";

const INDEX_CHIPS = [
  { sym: "NIFTY50", label: "NIFTY 50" },
  { sym: "SENSEX", label: "SENSEX" },
  { sym: "BANKNIFTY", label: "BANK NIFTY" },
] as const;

const WATCHLIST = ["RELIANCE", "TCS", "HDFCBANK", "INFY", "NIFTYBEES"] as const;

const inr = (v: number) =>
  v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function pctText(q: Quote) {
  return `${q.changePct >= 0 ? "+" : ""}${q.changePct.toFixed(2)}%`;
}

/** ~0.8s green/red wash when a live value changes. */
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

// HeroScene + InteractionScene: dual live device mocks with a scroll-driven
// "camera" — the desktop grows to centre stage while the phone drifts aside.
export function DeviceShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const desktopRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  const [nifty, setNifty] = useState<{ quote: Quote; candles: Candle[] } | null>(null);
  const [sparks, setSparks] = useState<Record<string, Candle[]>>({});
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [detail, setDetail] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const [monthChart, qs, ...dayCharts] = await Promise.all([
        getChart("NIFTY50", "1mo", "1d"),
        getQuotes([...INDEX_CHIPS.map((c) => c.sym), ...WATCHLIST]),
        ...INDEX_CHIPS.map((c) => getChart(c.sym, "1d", "15m")),
      ]);
      if (!alive) return;
      if (monthChart) setNifty(monthChart);
      setQuotes((prev) => ({ ...prev, ...qs }));
      const s: Record<string, Candle[]> = {};
      INDEX_CHIPS.forEach((c, i) => {
        const ch = dayCharts[i];
        if (ch) s[c.sym] = ch.candles;
      });
      setSparks((prev) => ({ ...prev, ...s }));
    };
    load();
    const id = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  // Scroll cinema: desktop scales toward centre stage, phone drifts out.
  const onFrame = useCallback((p: number) => {
    if (typeof window === "undefined" || window.innerWidth < 1024) {
      if (desktopRef.current) desktopRef.current.style.transform = "";
      if (phoneRef.current) {
        phoneRef.current.style.transform = "";
        phoneRef.current.style.opacity = "1";
      }
      if (copyRef.current) copyRef.current.style.opacity = "1";
      return;
    }
    const t = clamp01(p * 1.4);
    if (desktopRef.current) {
      desktopRef.current.style.transform = `scale(${(1 + 0.09 * t).toFixed(3)}) translate3d(${(3.5 * t).toFixed(2)}%, 0, 0)`;
    }
    if (phoneRef.current) {
      phoneRef.current.style.transform = `translate3d(${(56 * t).toFixed(1)}px, ${(18 * t).toFixed(1)}px, 0) scale(${(1 - 0.05 * t).toFixed(3)})`;
      phoneRef.current.style.opacity = (1 - 0.85 * t).toFixed(3);
    }
    if (copyRef.current) copyRef.current.style.opacity = (1 - 0.6 * t).toFixed(3);
  }, []);
  useScrollDriver(sectionRef, "pin", onFrame);

  // Honest "insight" pills computed from the live quotes.
  const indexQuotes = INDEX_CHIPS.map((c) => ({ ...c, q: quotes[c.sym] })).filter((c) => c.q);
  const leader = indexQuotes.length
    ? indexQuotes.reduce((a, b) => (Math.abs(b.q!.changePct) > Math.abs(a.q!.changePct) ? b : a))
    : null;
  const advancing = WATCHLIST.filter((s) => (quotes[s]?.changePct ?? 0) > 0).length;
  const watchLoaded = WATCHLIST.some((s) => quotes[s]);

  return (
    <section ref={sectionRef} id="showcase" className="relative lg:h-[190vh]">
      <div className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-center">
        <div className="mx-auto w-full max-w-7xl px-5 pt-14 pb-16 lg:py-0">
          {/* Headline */}
          <div ref={copyRef} className="mx-auto max-w-3xl text-center">
            <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-(--color-brand-400)/30 bg-(--color-brand-600)/20 px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.05em] text-(--color-brand-200)">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2fcb80] animate-pulse-dot" />
              Live demo — real market data
            </div>
            <h1 className="mt-5 text-[38px] font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl md:text-[58px]">
              One platform. <span className="text-gradient-emerald">Every screen. All live.</span>
            </h1>
            <p
              className="animate-fade-up mx-auto mt-5 max-w-xl text-[15.5px] leading-relaxed text-white/65"
              style={{ animationDelay: "250ms" }}
            >
              This isn&apos;t a mockup — the charts below are drawing today&apos;s actual market.
              Hover the chart, tap a watchlist stock, drag around. Then open the real thing.
            </p>
            <div
              className="animate-fade-up mt-7 flex flex-wrap items-center justify-center gap-3"
              style={{ animationDelay: "400ms" }}
            >
              <Button href="/dashboard" size="lg" className="bg-white text-(--color-brand-900) hover:bg-white/90 shadow-none">
                Start free <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="/ask-ai" variant="ghost" size="lg" className="text-white hover:bg-white/10">
                <Sparkles className="h-4 w-4" /> Ask the AI
              </Button>
            </div>
          </div>

          {/* Devices */}
          <div className="mt-12 flex flex-col items-center gap-8 lg:flex-row lg:items-end lg:justify-center lg:gap-10">
            {/* Desktop monitor */}
            <div
              ref={desktopRef}
              className="animate-fade-up w-full max-w-[680px] origin-bottom will-change-transform"
              style={{ animationDelay: "350ms" }}
            >
              <div className="rounded-[24px] border border-white/15 bg-white/[0.05] p-2.5 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.8)] backdrop-blur">
                <div className="overflow-hidden rounded-[16px] bg-(--color-brand-950)">
                  {/* Window chrome */}
                  <div className="flex items-center gap-1.5 border-b border-white/8 px-4 py-2.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                    <span className="ml-3 text-[11px] font-medium text-white/40">
                      StockSense — Dashboard
                    </span>
                    <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-white/8 px-2 py-0.5 text-[10px] font-semibold text-white/70">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#2fcb80] animate-pulse-dot" />
                      Live
                    </span>
                  </div>

                  <div className="grid gap-3 p-4 sm:grid-cols-[1.7fr_1fr]">
                    {/* Main chart */}
                    <div className="glass-card p-3.5">
                      <div className="flex items-baseline justify-between">
                        <p className="text-[11.5px] font-semibold text-white/55">NIFTY 50 · 1 month</p>
                        {nifty && (
                          <span
                            className="inline-flex items-center gap-0.5 text-[12px] font-semibold tabular"
                            style={{ color: nifty.quote.changePct >= 0 ? UP : DOWN }}
                          >
                            {nifty.quote.changePct >= 0 ? (
                              <ArrowUpRight className="h-3 w-3" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3" />
                            )}
                            {pctText(nifty.quote)}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[22px] font-semibold tabular tracking-tight text-white">
                        {nifty ? inr(nifty.quote.price) : "—"}
                      </p>
                      <LiveLineChart
                        candles={nifty?.candles ?? []}
                        stroke={(nifty?.quote.changePct ?? 0) >= 0 ? UP : DOWN}
                        gradientId="dsMain"
                        className="mt-2 h-28 cursor-crosshair"
                        tooltip
                      />
                      <p className="mt-1.5 text-[10px] text-white/35">
                        Hover the line — every point is a real session.
                      </p>
                    </div>

                    {/* Metric tiles (real product numbers, counting up) */}
                    <div className="flex flex-col gap-3">
                      <MetricTile label="NSE instruments" to={2678} format={(v) => `${Math.round(v).toLocaleString("en-IN")}`} />
                      <MetricTile label="Virtual capital" to={500000} format={(v) => `₹${Math.round(v).toLocaleString("en-IN")}`} />
                      <MetricTile label="Chart ranges" to={8} format={(v) => `${Math.round(v)}`} />
                      <MetricTile label="Fastest refresh" to={0.5} format={(v) => `${v.toFixed(1)}s`} />
                    </div>
                  </div>

                  {/* Index chips with live sparklines */}
                  <div className="grid grid-cols-3 gap-3 px-4 pb-3">
                    {INDEX_CHIPS.map((c, i) => {
                      const q = quotes[c.sym];
                      return (
                        <div
                          key={c.sym}
                          className="glass-card animate-fade-up p-2.5 transition-transform duration-200 hover:scale-[1.04]"
                          style={{ animationDelay: `${650 + i * 120}ms` }}
                        >
                          <div className="flex items-baseline justify-between">
                            <p className="text-[10.5px] font-semibold text-white/55">{c.label}</p>
                            {q && (
                              <span
                                className="text-[10.5px] font-semibold tabular"
                                style={{ color: q.changePct >= 0 ? UP : DOWN }}
                              >
                                {pctText(q)}
                              </span>
                            )}
                          </div>
                          <p className="text-[13px] font-semibold tabular text-white">
                            {q ? inr(q.price) : "—"}
                          </p>
                          <LiveLineChart
                            candles={sparks[c.sym] ?? []}
                            stroke={(q?.changePct ?? 0) >= 0 ? UP : DOWN}
                            gradientId={`dsSpark${i}`}
                            className="mt-1 h-7"
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Live-data pills (computed, not fabricated) */}
                  <div className="flex flex-wrap gap-2 px-4 pb-4">
                    {leader && (
                      <span
                        className="animate-fade-up inline-flex items-center gap-1.5 rounded-full border border-(--color-brand-400)/35 bg-(--color-brand-600)/25 px-3 py-1.5 text-[11.5px] font-semibold text-(--color-brand-200)"
                        style={{ animationDelay: "900ms" }}
                      >
                        <Sparkles className="h-3 w-3" />
                        Live read: {leader.label} is today&apos;s biggest index mover ({pctText(leader.q!)})
                      </span>
                    )}
                    {watchLoaded && (
                      <span
                        className="animate-fade-up inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-[11.5px] font-semibold text-white/70"
                        style={{ animationDelay: "1050ms" }}
                      >
                        {advancing} of {WATCHLIST.length} watchlist stocks advancing right now
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div
              ref={phoneRef}
              className="animate-fade-up w-[290px] shrink-0 origin-bottom will-change-transform"
              style={{ animationDelay: "500ms" }}
            >
              <div className="rounded-[36px] border border-white/15 bg-white/[0.05] p-2.5 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.8)] backdrop-blur">
                <div className="overflow-hidden rounded-[28px] bg-(--color-brand-950)">
                  {/* Status bar + summary */}
                  <div className="px-4 pt-3">
                    <div className="mx-auto h-1.5 w-16 rounded-full bg-white/12" />
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-[11px] font-semibold text-white/50">Simulator portfolio</p>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/8 px-2 py-0.5 text-[9.5px] font-semibold text-white/60">
                        Virtual money
                      </span>
                    </div>
                    <p className="mt-1 text-[24px] font-semibold tabular tracking-tight text-white">
                      ₹5,00,000
                    </p>
                    <p className="text-[11px] text-white/45">
                      Practice capital — every trade priced live
                      {nifty && (
                        <span
                          className="ml-1.5 font-semibold tabular"
                          style={{ color: nifty.quote.changePct >= 0 ? UP : DOWN }}
                        >
                          NIFTY {pctText(nifty.quote)}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Quick actions */}
                  <div className="mt-3 grid grid-cols-3 gap-2 px-4">
                    {[
                      { label: "Trade", href: "/portfolio" },
                      { label: "Compare", href: "/compare" },
                      { label: "Ask AI", href: "/ask-ai" },
                    ].map((a) => (
                      <Link
                        key={a.label}
                        href={a.href}
                        className="rounded-xl border border-white/12 bg-white/6 py-2 text-center text-[11.5px] font-semibold text-white/85 transition-all duration-150 hover:scale-[1.03] hover:bg-white/10 hover:shadow-lg active:scale-[0.98]"
                      >
                        {a.label}
                      </Link>
                    ))}
                  </div>

                  {/* Watchlist */}
                  <div className="mt-3 px-4 pb-3">
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-white/40">
                      Watchlist — tap a stock
                    </p>
                    <div className="mt-1.5 flex flex-col">
                      {WATCHLIST.map((sym, i) => (
                        <WatchRow
                          key={sym}
                          symbol={sym}
                          quote={quotes[sym]}
                          delay={700 + i * 110}
                          onOpen={() => setDetail(sym)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Bottom nav mock */}
                  <div className="flex items-center justify-around border-t border-white/8 px-4 py-2.5">
                    <Home className="h-4.5 w-4.5 text-(--color-brand-300)" />
                    <BarChart3 className="h-4.5 w-4.5 text-white/35" />
                    <MessageSquare className="h-4.5 w-4.5 text-white/35" />
                    <Wallet className="h-4.5 w-4.5 text-white/35" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {detail && <StockDetailOverlay symbol={detail} onClose={() => setDetail(null)} />}
    </section>
  );
}

function MetricTile({
  label,
  to,
  format,
}: {
  label: string;
  to: number;
  format: (v: number) => string;
}) {
  const val = useCountUp(to, true);
  return (
    <div className="glass-card flex-1 px-3.5 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40">{label}</p>
      <p className="text-[17px] font-semibold tabular tracking-tight text-white">{format(val)}</p>
    </div>
  );
}

function WatchRow({
  symbol,
  quote,
  delay,
  onOpen,
}: {
  symbol: string;
  quote?: Quote;
  delay: number;
  onOpen: () => void;
}) {
  const flash = useFlash(quote?.price);
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`animate-fade-up flex items-center justify-between rounded-lg border-b border-white/6 px-1.5 py-2 text-left transition-all duration-150 last:border-b-0 hover:-translate-y-0.5 hover:bg-white/6 active:scale-[0.98] ${
        flash === "up" ? "flash-up" : flash === "down" ? "flash-down" : ""
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="text-[12.5px] font-semibold text-white">{symbol}</span>
      <span className="text-right">
        <span className="block text-[12.5px] font-semibold tabular text-white/85">
          {quote ? inr(quote.price) : "—"}
        </span>
        <span
          className="block text-[10.5px] font-semibold tabular"
          style={{ color: quote ? (quote.changePct >= 0 ? UP : DOWN) : undefined }}
        >
          {quote ? pctText(quote) : ""}
        </span>
      </span>
    </button>
  );
}

// Click-through detail: live mini chart + real day stats + a door into the app.
function StockDetailOverlay({ symbol, onClose }: { symbol: string; onClose: () => void }) {
  const [chart, setChart] = useState<{ quote: Quote; candles: Candle[] } | null>(null);
  const info = lookupInstrument(symbol);

  useEffect(() => {
    let alive = true;
    getChart(symbol, "1d", "5m").then((c) => {
      if (alive && c) setChart(c);
    });
    return () => {
      alive = false;
    };
  }, [symbol]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const q = chart?.quote;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${symbol} quick view`}
    >
      <div
        className="animate-fade-up w-full max-w-[360px] rounded-[22px] border border-white/15 bg-(--color-brand-950) p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[16px] font-semibold text-white">{symbol}</p>
            <p className="text-[11.5px] text-white/45">{info?.name ?? "NSE"}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex items-baseline gap-2.5">
          <p className="text-[26px] font-semibold tabular tracking-tight text-white">
            {q ? `₹${inr(q.price)}` : "—"}
          </p>
          {q && (
            <span
              className="text-[13px] font-semibold tabular"
              style={{ color: q.changePct >= 0 ? UP : DOWN }}
            >
              {pctText(q)} today
            </span>
          )}
        </div>

        <LiveLineChart
          candles={chart?.candles ?? []}
          stroke={(q?.changePct ?? 0) >= 0 ? UP : DOWN}
          gradientId="ovChart"
          className="mt-3 h-24"
        />

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-center">
          <OverlayStat label="Day high" value={q?.dayHigh !== undefined ? inr(q.dayHigh) : "—"} />
          <OverlayStat label="Day low" value={q?.dayLow !== undefined ? inr(q.dayLow) : "—"} />
          <OverlayStat label="Prev close" value={q ? inr(q.previousClose) : "—"} />
        </div>

        <p className="mt-3 text-[11px] leading-relaxed text-white/40">
          Inside StockSense: AI summary, quant signals, 8 chart ranges, head-to-head compare.
        </p>
        <Button
          href={instrumentHref(symbol)}
          size="md"
          className="mt-3 w-full bg-white text-(--color-brand-900) hover:bg-white/90 shadow-none"
        >
          Open {symbol} in StockSense <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function OverlayStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9.5px] uppercase tracking-[0.1em] text-white/35">{label}</p>
      <p className="mt-0.5 text-[12.5px] font-semibold tabular text-white">{value}</p>
    </div>
  );
}
