"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { ArrowUpRight, Sparkles } from "lucide-react";

const SERIES = Array.from({ length: 36 }).map((_, i) => ({
  x: i,
  y:
    2200 +
    Math.sin(i / 3.2) * 24 +
    Math.cos(i / 5) * 18 +
    (i / 36) * 60 +
    (i % 4 === 0 ? 8 : 0),
}));

export function HeroPreview() {
  const [price, setPrice] = useState(2186.45);
  useEffect(() => {
    const id = setInterval(() => {
      setPrice((p) => Math.round((p + (Math.random() - 0.5) * 2.4) * 100) / 100);
    }, 1200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative">
      <div className="absolute -inset-6 -z-10 rounded-[36px] bg-white/5 blur-2xl" />
      <div className="rounded-[28px] border border-white/12 bg-white/[0.03] p-3 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] backdrop-blur">
        <div className="rounded-[22px] bg-white p-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-(--color-brand-50) text-(--color-brand-700) text-[13px] font-semibold">
                  AE
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-(--color-fg) leading-tight">Adani Enterprises</p>
                  <p className="text-[11.5px] text-(--color-fg-subtle) leading-tight">ADANIENT • NSE</p>
                </div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-(--color-up-soft) px-2 py-0.5 text-[11px] font-semibold text-(--color-up)">
              <span className="h-1.5 w-1.5 rounded-full bg-(--color-up) animate-pulse-dot" />
              Live
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <p className="text-[34px] font-semibold tabular tracking-tight text-(--color-fg)">
              ₹{price.toFixed(2)}
            </p>
            <span className="inline-flex items-center gap-0.5 text-[13px] font-semibold text-(--color-up) tabular">
              <ArrowUpRight className="h-3.5 w-3.5" /> +2.18%
            </span>
          </div>

          {/* Chart */}
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
          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-(--color-border) pt-3 text-center">
            <Mini label="Market cap" value="₹2.52L Cr" />
            <Mini label="P/E" value="71.2" />
            <Mini label="52W high" value="₹3,257" />
          </div>

          {/* AI strip */}
          <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-(--color-brand-50) p-3">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-(--color-brand-700)" />
            <div>
              <p className="text-[12px] font-semibold text-(--color-brand-800)">AI snapshot</p>
              <p className="mt-0.5 text-[11.5px] leading-snug text-(--color-brand-800)/85">
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
      <p className="text-[10px] uppercase tracking-[0.12em] text-(--color-fg-subtle)">{label}</p>
      <p className="mt-0.5 text-[12.5px] font-semibold tabular text-(--color-fg)">{value}</p>
    </div>
  );
}
