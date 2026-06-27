"use client";

import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

const STOCKS = [
  { ticker: "RELIANCE.NS", label: "RELIANCE" },
  { ticker: "TCS.NS", label: "TCS" },
  { ticker: "INFY.NS", label: "INFY" },
  { ticker: "HDFCBANK.NS", label: "HDFC" },
  { ticker: "ICICIBANK.NS", label: "ICICI" },
];

export function MarketOverviewChart() {
  const [selected, setSelected] = useState(STOCKS[0]);

  const { data: candles = [] } = useQuery({
    queryKey: ["home-chart", selected.ticker],
    queryFn: async () => {
      const to = Math.floor(Date.now() / 1000);
      const from = to - 30 * 86400;
      const res = await fetch(`/api/stocks/${selected.ticker}/candles?from=${from}&to=${to}&resolution=D`);
      return res.json();
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const { data: quote } = useQuery({
    queryKey: ["home-quote", selected.ticker],
    queryFn: () =>
      fetch(`/api/stocks/${selected.ticker}/quote`).then((r) => r.json()),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  const formatted = candles.map((d: any) => ({
    date: new Date(d.time).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    price: d.close,
  }));

  const firstPrice = formatted[0]?.price || 0;
  const lastPrice = formatted[formatted.length - 1]?.price || 0;
  const isUp = lastPrice >= firstPrice;
  const pct = firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;
  const color = isUp ? "#22c55e" : "#ef4444";

  return (
    <div className="card-glass p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">30-Day Chart</h3>
          {quote && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
              (quote.changePercent >= 0) ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"
            )}>
              {(quote.changePercent >= 0)
                ? <TrendingUp className="w-3 h-3" />
                : <TrendingDown className="w-3 h-3" />}
              {(quote.changePercent >= 0) ? "+" : ""}{quote.changePercent?.toFixed(2)}% today
            </div>
          )}
        </div>
        <div className="flex gap-1">
          {STOCKS.map((s) => (
            <button
              key={s.ticker}
              onClick={() => setSelected(s)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-all",
                selected.ticker === s.ticker
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price + change */}
      {quote && (
        <div className="mb-3">
          <span className="text-xl font-bold font-mono text-foreground">
            ₹{quote.price?.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </span>
          <span className={cn(
            "ml-2 text-sm font-mono",
            isUp ? "text-green-400" : "text-red-400"
          )}>
            {pct >= 0 ? "+" : ""}{pct.toFixed(2)}% (30d)
          </span>
        </div>
      )}

      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formatted}>
            <defs>
              <linearGradient id="homeGrad" x1="0" y1="0" x2="0" y2="1">
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
              interval={4}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v.toFixed(0)}`}
              width={55}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 11,
              }}
              formatter={(v: any) => [`₹${Number(v).toFixed(2)}`, "Price"]}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={color}
              strokeWidth={1.5}
              fill="url(#homeGrad)"
              dot={false}
              activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
