"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, BarChart, Bar, ComposedChart,
} from "recharts";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { BarChart2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const RANGES = [
  { label: "1W", days: 7, resolution: "D" },
  { label: "1M", days: 30, resolution: "D" },
  { label: "3M", days: 90, resolution: "D" },
  { label: "6M", days: 180, resolution: "D" },
  { label: "1Y", days: 365, resolution: "D" },
] as const;

type ChartMode = "area" | "candle";

interface CandleData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  time: number;
  // For area chart
  midHigh: [number, number]; // [low, high] for candle body
  bodyColor: string;
}

interface Props {
  ticker: string;
  initialData: any[];
}

function CustomCandleTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  const isUp = d.close >= d.open;
  return (
    <div className="bg-card border border-border rounded-lg p-3 text-xs shadow-xl">
      <p className="text-muted-foreground mb-2">{label}</p>
      <div className="space-y-1">
        {[
          { label: "Open", value: d.open },
          { label: "High", value: d.high },
          { label: "Low", value: d.low },
          { label: "Close", value: d.close },
        ].map(({ label: l, value }) => (
          <div key={l} className="flex justify-between gap-4">
            <span className="text-muted-foreground">{l}</span>
            <span className={cn("font-mono font-semibold", l === "Close" && (isUp ? "text-green-400" : "text-red-400"))}>
              ₹{Number(value).toFixed(2)}
            </span>
          </div>
        ))}
        <div className="flex justify-between gap-4 pt-1 border-t border-border">
          <span className="text-muted-foreground">Volume</span>
          <span className="font-mono">{(d.volume / 1000).toFixed(0)}K</span>
        </div>
      </div>
    </div>
  );
}

function CustomAreaTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 text-xs shadow-xl">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-mono font-semibold text-foreground">
        ₹{Number(payload[0]?.value).toFixed(2)}
      </p>
      {payload[1] && (
        <p className="text-muted-foreground text-xs mt-1">
          Vol: {(payload[1]?.payload?.volume / 1000).toFixed(0)}K
        </p>
      )}
    </div>
  );
}

export function StockChart({ ticker, initialData }: Props) {
  const [range, setRange] = useState(RANGES[4]);
  const [mode, setMode] = useState<ChartMode>("area");

  const { data: candles = initialData } = useQuery({
    queryKey: ["candles", ticker, range.days],
    queryFn: async () => {
      const to = Math.floor(Date.now() / 1000);
      const from = to - range.days * 86400;
      const res = await fetch(
        `/api/stocks/${ticker}/candles?from=${from}&to=${to}&resolution=${range.resolution}`
      );
      return res.json();
    },
    initialData,
    refetchInterval: 60_000,
  });

  const cutoff = Date.now() - range.days * 86400 * 1000;
  const sliced = candles.filter((d: any) => d.time >= cutoff);

  const firstClose = sliced[0]?.close || 0;
  const lastClose = sliced[sliced.length - 1]?.close || 0;
  const isPositive = lastClose >= firstClose;
  const color = isPositive ? "#22c55e" : "#ef4444";

  const dateFormat = range.days <= 7 ? "MMM d HH:mm" : range.days <= 90 ? "MMM d" : "MMM yy";

  const formatted = sliced.map((d: any) => ({
    ...d,
    date: format(new Date(d.time), dateFormat),
    bodyColor: d.close >= d.open ? "#22c55e" : "#ef4444",
    // High-low range for bar
    highLow: [d.low, d.high],
    openClose: [Math.min(d.open, d.close), Math.max(d.open, d.close)],
  }));

  const minY = Math.min(...sliced.map((d: any) => d.low || d.close)) * 0.995;
  const maxY = Math.max(...sliced.map((d: any) => d.high || d.close)) * 1.005;

  const pct = firstClose > 0 ? ((lastClose - firstClose) / firstClose) * 100 : 0;

  return (
    <div className="card-glass p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-foreground">Price Chart</h3>
          {firstClose > 0 && (
            <span className={cn(
              "text-xs font-mono font-semibold px-2 py-0.5 rounded-full",
              isPositive ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"
            )}>
              {isPositive ? "+" : ""}{pct.toFixed(2)}% this period
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Chart mode */}
          <div className="flex bg-muted rounded-lg p-0.5">
            {([
              { mode: "area" as ChartMode, icon: TrendingUp },
              { mode: "candle" as ChartMode, icon: BarChart2 },
            ]).map(({ mode: m, icon: Icon }) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "w-7 h-7 flex items-center justify-center rounded-md transition-all",
                  mode === m ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>

          {/* Time range */}
          <div className="flex gap-0.5">
            {RANGES.map((r) => (
              <button
                key={r.label}
                onClick={() => setRange(r)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                  range.label === r.label
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        key={`${range.label}-${mode}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {mode === "area" ? (
          /* Area chart with volume */
          <div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formatted} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={[minY, maxY]}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v.toFixed(0)}`}
                    width={60}
                  />
                  <Tooltip content={<CustomAreaTooltip />} />
                  <ReferenceLine y={firstClose} stroke="hsl(var(--border))" strokeDasharray="4 4" />
                  <Area
                    type="monotone"
                    dataKey="close"
                    stroke={color}
                    strokeWidth={1.5}
                    fill="url(#chartGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Volume bars */}
            <div className="h-14 mt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formatted} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Bar
                    dataKey="volume"
                    fill="hsl(var(--muted-foreground))"
                    opacity={0.4}
                    radius={[1, 1, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground text-center -mt-1">Volume</p>
            </div>
          </div>
        ) : (
          /* Candlestick-style chart using composed */
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={formatted} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[minY, maxY]}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v.toFixed(0)}`}
                  width={60}
                />
                <Tooltip content={<CustomCandleTooltip />} />
                <ReferenceLine y={firstClose} stroke="hsl(var(--border))" strokeDasharray="4 4" />
                {/* High-low wick */}
                <Bar dataKey="high" fill="transparent" />
                {/* OHLC area approximation */}
                <Area
                  type="monotone"
                  dataKey="high"
                  stroke="transparent"
                  fill="transparent"
                  dot={false}
                  activeDot={false}
                />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={color}
                  strokeWidth={1.5}
                  fill="url(#chartGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
            <p className="text-xs text-center text-muted-foreground mt-1">
              Full candlestick charts available in the detailed view
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
