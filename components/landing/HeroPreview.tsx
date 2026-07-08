"use client";

import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { ArrowUpRight, ArrowDownRight, Sparkles } from "lucide-react";
import { useLivePrice } from "@/lib/use-live-prices";
import { NIFTY_50 } from "@/lib/mock-data";

const SERIES = Array.from({ length: 36 }).map((_, i) => ({
  x: i,
  y:
    2200 +
    Math.sin(i / 3.2) * 24 +
    Math.cos(i / 5) * 18 +
    (i / 36) * 60 +
    (i % 4 === 0 ? 8 : 0),
}));

const STOCK = NIFTY_50.find((s) => s.symbol === "ADANIENT")!;

export function HeroPreview() {
  const live = useLivePrice(STOCK.symbol, STOCK.basePrice);

  // Fall back gracefully to the static snapshot until a real quote resolves.
  const price = live.price > 0 ? live.price : STOCK.basePrice;
  const changePct = live.price > 0 ? live.changePct : 0;
  const isUp = changePct >= 0;

  return (
    <div className="relative">
      <div className="absolute -inset-6 -z-10 rounded-[36px] bg-white/5 blur-2xl" />
      <div className="rounded-[28px] border border-white/12 bg-white/[0.03] p-3 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] backdrop-blur">
        <div className="rounded-[22px] bg-white p-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--color-brand-50)] text-[var(--color-brand-700)] text-[13px] font-semibold">
                  AE
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-[var(--color-fg)] leading-tight">Adani Enterprises</p>
                  <p className="text-[11.5px] text-[var(--color-fg-subtle)] leading-tight">ADANIENT • NSE</p>
                </div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-up-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-up)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-up)] animate-pulse-dot" />
              Live
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <p className="text-[34px] font-semibold tabular tracking-tight text-[var(--color-fg)]">
              ₹{price.toFixed(2)}
            </p>
            <span
              className={`inline-flex items-center gap-0.5 text-[13px] font-semibold tabular ${
                isUp ? "text-[var(--color-up)]" : "text-[var(--color-down)]"
              }`}
            >
              {isUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {isUp ? "+" : ""}
              {changePct.toFixed(2)}%
            </span>
          </div>

          {/* Chart (stylised / illustrative, not a literal price trace) */}
          <div className="mt-3 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SERIES} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="hpFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#115e3c" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#115e3c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis domain={["dataMin - 10", "dataMax + 10"]} hide />
                <Area
                  type="monotone"
                  dataKey="y"
                  stroke="#115e3c"
                  strokeWidth={2}
                  fill="url(#hpFill)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bottom info */}
          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[var(--color-border)] pt-3 text-center">
            <Mini label="Market cap" value={`₹${(STOCK.marketCap / 100000).toFixed(2)}L Cr`} />
            <Mini label="P/E" value={STOCK.peRatio.toFixed(1)} />
            <Mini label="52W high" value={`₹${STOCK.week52High.toLocaleString("en-IN")}`} />
          </div>

          {/* AI strip */}
          <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-[var(--color-brand-50)] p-3">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand-700)]" />
            <div>
              <p className="text-[12px] font-semibold text-[var(--color-brand-800)]">AI snapshot</p>
              <p className="mt-0.5 text-[11.5px] leading-snug text-[var(--color-brand-800)]/85">
                Momentum positive in last 7 sessions. Watch ₹2,210 as immediate support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-subtle)]">{label}</p>
      <p className="mt-0.5 text-[12.5px] font-semibold tabular text-[var(--color-fg)]">{value}</p>
    </div>
  );
}
