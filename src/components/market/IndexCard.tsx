"use client";

import Link from "next/link";
import { useLivePrice } from "@/lib/use-live-prices";
import { DeltaValue } from "@/components/ui/Delta";
import { formatINR } from "@/lib/format";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { useMemo } from "react";

type Props = {
  symbol: string;
  name: string;
  base: number;
  volatility?: number;
  highlight?: boolean;
};

function sparkSeries(base: number, seed: number) {
  return Array.from({ length: 28 }).map((_, i) => ({
    x: i,
    y:
      base +
      Math.sin((i + seed) / 2.4) * base * 0.004 +
      Math.cos((i + seed) / 3.8) * base * 0.003 +
      ((seed % 3) - 1) * base * 0.0006 * i,
  }));
}

export function IndexCard({ symbol, name, base, volatility = 0.0018, highlight }: Props) {
  const tick = useLivePrice(symbol, base, volatility);
  const data = useMemo(() => sparkSeries(base, symbol.charCodeAt(0)), [base, symbol]);
  const up = tick.changePct >= 0;
  const color = up ? "#088a52" : "#c4361c";
  return (
    <Link
      href={`/indices/${symbol}`}
      className={`group relative block overflow-hidden rounded-2xl border bg-(--color-surface) p-5 transition-all hover:-translate-y-0.5 hover:border-(--color-brand-300) hover:shadow-[0_18px_38px_-22px_rgba(13,31,23,0.18)] ${
        highlight ? "border-(--color-brand-300) shadow-[0_18px_38px_-22px_rgba(13,31,23,0.18)]" : "border-(--color-border)"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-(--color-fg-subtle)">
            {symbol}
          </p>
          <p className="mt-0.5 text-[12.5px] text-(--color-fg-muted)">{name}</p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-semibold tracking-tight"
          style={{
            background: up ? "var(--color-up-soft)" : "var(--color-down-soft)",
            color,
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full animate-pulse-dot" style={{ background: color }} />
          Live
        </span>
      </div>
      <p className="mt-3 text-[26px] font-semibold tabular tracking-tight text-(--color-fg)">
        {formatINR(tick.price, { decimals: 2 })}
      </p>
      <div className="mt-1">
        <DeltaValue value={tick.change} pct={tick.changePct} />
      </div>
      <div className="-mx-2 mt-2 h-14">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id={`ic-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis domain={["dataMin - 5", "dataMax + 5"]} hide />
            <Area
              type="monotone"
              dataKey="y"
              stroke={color}
              strokeWidth={1.75}
              fill={`url(#ic-${symbol})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Link>
  );
}
