"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useReveal } from "@/lib/use-reveal";
import { getChart, type Candle, type Quote } from "@/lib/api/yahoo";
import { MiniLineChart } from "./MiniLineChart";

/*
 * Purple→white CTA: clipped line-by-line headline reveal, then a live
 * dashboard card (real NIFTY month, hoverable) slides up into view.
 */

const inr = (v: number) =>
  v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function PerformanceCta() {
  const { ref, shown } = useReveal<HTMLDivElement>();
  const [nifty, setNifty] = useState<{ quote: Quote; candles: Candle[] } | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      getChart("NIFTY50", "1mo", "1d").then((c) => {
        if (alive && c) setNifty(c);
      });
    load();
    const id = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const q = nifty?.quote;
  const up = (q?.changePct ?? 0) >= 0;

  return (
    <section
      className="cf-perf-bg relative min-h-full overflow-hidden px-5 pb-10 pt-24 sm:pt-28"
    >
      {/* Drifting glow orbs in the purple header */}
      <div
        className="cf-blob pointer-events-none absolute -left-16 top-10 h-64 w-64 rounded-full bg-white/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="cf-blob-2 pointer-events-none absolute right-[-60px] top-24 h-72 w-72 rounded-full bg-[#06B6D4]/20 blur-3xl"
        aria-hidden="true"
      />
      <div ref={ref} className={`mx-auto max-w-4xl text-center ${shown ? "reveal-shown" : ""}`}>
        <h2 className="text-[34px] font-bold leading-[1.12] tracking-[-0.02em] text-white sm:text-[52px]">
          <span className="cf-clip block">
            <span className="cf-line" style={{ "--cf-d": "0s" } as React.CSSProperties}>
              Close the performance
            </span>
          </span>
          <span className="cf-clip block">
            <span className="cf-line" style={{ "--cf-d": "0.15s" } as React.CSSProperties}>
              gap in <span className="cf-serif">your research</span>
            </span>
          </span>
        </h2>
        <p
          className="cf-item mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-white/70"
          style={{ "--cf-d": "0.35s" } as React.CSSProperties}
        >
          The same live data and quant signals on every stock you own or watch —
          explained in plain language, refreshed as fast as every half second.
        </p>

        {/* Live dashboard card (entry animation outside, gentle float inside) */}
        <div className="cf-entry mx-auto mt-12 max-w-2xl">
          <div className="cf-bob rounded-3xl border border-black/5 bg-white p-6 text-left shadow-[0_40px_80px_-32px_rgba(23,37,84,0.35)] dark:border-white/10 dark:bg-[#111827] sm:p-8">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500">
                NIFTY 50 · 1 month · live
              </p>
              <p className="mt-1 text-[30px] font-bold tabular tracking-tight text-[#1F2937] dark:text-white">
                {q ? inr(q.price) : "—"}
                {q && (
                  <span
                    className="ml-2.5 inline-flex items-center gap-0.5 align-middle text-[14px] font-semibold tabular"
                    style={{ color: up ? "#059669" : "#E11D48" }}
                  >
                    {up ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {q.changePct >= 0 ? "+" : ""}
                    {q.changePct.toFixed(2)}%
                  </span>
                )}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DBEAFE] px-2.5 py-1 text-[11px] font-semibold text-[#1A56DB] dark:bg-[#1A56DB]/25 dark:text-[#93C5FD]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1A56DB] animate-pulse-dot" />
              Live
            </span>
          </div>
          <MiniLineChart
            candles={nifty?.candles ?? []}
            stroke={up ? "#1A56DB" : "#E11D48"}
            gradientId="cfCta"
            className="mt-4 h-36 cursor-crosshair"
            tooltip
          />
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-4 text-center dark:border-white/10">
            <CardStat label="Day high" value={q?.dayHigh !== undefined ? inr(q.dayHigh) : "—"} />
            <CardStat label="Day low" value={q?.dayLow !== undefined ? inr(q.dayLow) : "—"} />
            <CardStat label="Prev close" value={q ? inr(q.previousClose) : "—"} />
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CardStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">{label}</p>
      <p className="mt-0.5 text-[14px] font-semibold tabular text-[#1F2937] dark:text-white">{value}</p>
    </div>
  );
}
