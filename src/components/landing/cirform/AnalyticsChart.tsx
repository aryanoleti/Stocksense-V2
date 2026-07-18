"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useReveal } from "@/lib/use-reveal";
import { getChart, type Candle } from "@/lib/api/yahoo";

/*
 * Analytics section: tab row with sliding underline, then a monthly bar
 * chart built from the REAL last-12-months NIFTY closes. Bars grow from
 * the baseline with a stagger; the latest month is highlighted.
 */

export function AnalyticsChart() {
  const { ref, shown } = useReveal<HTMLDivElement>();
  const [candles, setCandles] = useState<Candle[]>([]);

  useEffect(() => {
    let alive = true;
    getChart("NIFTY50", "1y", "1mo").then((c) => {
      if (alive && c && c.candles.length > 1) setCandles(c.candles.slice(-12));
    });
    return () => {
      alive = false;
    };
  }, []);

  const bars = useMemo(() => {
    if (candles.length < 2) return [];
    const values = candles.map((c) => c.price);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    return candles.map((c) => ({
      time: c.time,
      price: c.price,
      // Keep every bar visible: map the range onto 22%..100% height.
      h: 22 + ((c.price - min) / span) * 78,
      month: new Date(c.time).toLocaleDateString("en-IN", { month: "short" }),
    }));
  }, [candles]);

  const latest = bars.length - 1;

  return (
    <section className="px-5 py-20 sm:py-24">
      <div ref={ref} className={`mx-auto max-w-4xl ${shown ? "reveal-shown" : ""}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-6">
            <button type="button" className="relative pb-1.5 text-[14.5px] font-semibold text-[#1F2937]">
              Analytics
              <span className="cf-underline absolute inset-x-0 bottom-0 h-[2.5px] rounded-full bg-[#1A56DB]" />
            </button>
            <Link
              href="/quant"
              className="cf-item pb-1.5 text-[14.5px] font-medium text-gray-400 hover:text-[#1F2937]"
              style={{ "--cf-d": "0.1s" } as React.CSSProperties}
            >
              Momentum
            </Link>
            <Link
              href="/quant"
              className="cf-item pb-1.5 text-[14.5px] font-medium text-gray-400 hover:text-[#1F2937]"
              style={{ "--cf-d": "0.18s" } as React.CSSProperties}
            >
              Success rates
            </Link>
          </div>
          {/* Range chip */}
          <span
            className="cf-item inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3.5 py-1.5 text-[12.5px] font-medium text-gray-600"
            style={{ "--cf-d": "0.25s" } as React.CSSProperties}
          >
            NIFTY 50 · Monthly <ChevronDown className="h-3.5 w-3.5" />
          </span>
        </div>

        {/* Bar chart */}
        <div className="mt-10">
          {bars.length ? (
            <div className="flex h-56 items-end gap-2 sm:gap-3">
              {bars.map((b, i) => (
                <div key={b.time} className="group relative flex-1">
                  <div
                    className={`cf-bar w-full rounded-t-lg ${
                      i === latest
                        ? "cf-glow bg-[#3B82F6]"
                        : "bg-[#BFDBFE] group-hover:bg-[#93C5FD]"
                    }`}
                    style={
                      { height: `${(b.h / 100) * 224}px`, "--cf-d": `${i * 0.06}s` } as React.CSSProperties
                    }
                  />
                  <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-[#111827] px-2 py-1 text-[10.5px] font-semibold tabular text-white group-hover:block">
                    {b.price.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="skeleton h-56 w-full opacity-40" />
          )}
          {bars.length > 0 && (
            <div className="mt-2 flex gap-2 sm:gap-3">
              {bars.map((b, i) => (
                <span
                  key={b.time}
                  className={`flex-1 text-center text-[10.5px] ${
                    i === latest ? "font-bold text-[#1A56DB]" : "text-gray-400"
                  }`}
                >
                  {b.month}
                </span>
              ))}
            </div>
          )}
          <p className="mt-4 text-center text-[12px] text-gray-400">
            NIFTY 50 monthly closes, last 12 months — live from the exchange
          </p>
        </div>
      </div>
    </section>
  );
}
