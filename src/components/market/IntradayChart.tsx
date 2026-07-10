"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getChart } from "@/lib/api/yahoo";
import { generateIntraday } from "@/lib/mock-data";

type Point = { time: string; price: number };

export function IntradayChart({ symbol, base, seed = 1 }: { symbol?: string; base: number; seed?: number }) {
  const fallback = useMemo<Point[]>(() => generateIntraday(base, 78, seed), [base, seed]);
  const [data, setData] = useState<Point[]>(fallback);

  useEffect(() => {
    if (!symbol) {
      setData(fallback);
      return;
    }
    let cancelled = false;
    async function load() {
      const r = await getChart(symbol!, "1d", "5m");
      if (cancelled) return;
      if (!r || r.candles.length === 0) {
        setData(fallback);
        return;
      }
      setData(
        r.candles.map((c) => ({
          time: new Date(c.time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          price: Math.round(c.price * 100) / 100,
        })),
      );
    }
    load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [symbol, fallback]);

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 18, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="intradayFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#115e3c" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#115e3c" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#eef1ee" vertical={false} />
          <XAxis
            dataKey="time"
            stroke="#7c8a82"
            tickLine={false}
            axisLine={false}
            interval={Math.max(1, Math.floor(data.length / 6))}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            stroke="#7c8a82"
            tickLine={false}
            axisLine={false}
            domain={["dataMin - 20", "dataMax + 20"]}
            tick={{ fontSize: 11 }}
            width={56}
            tickFormatter={(v) => Number(v).toLocaleString("en-IN")}
          />
          <Tooltip
            contentStyle={{
              border: "1px solid var(--color-border)",
              borderRadius: 12,
              boxShadow: "0 12px 30px -16px rgba(13,31,23,0.18)",
              fontSize: 12,
              padding: "8px 10px",
            }}
            formatter={(v) => [`₹${Number(v).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "Price"]}
            labelStyle={{ color: "var(--color-fg-subtle)", fontSize: 11 }}
          />
          <Area type="monotone" dataKey="price" stroke="#115e3c" strokeWidth={2} fill="url(#intradayFill)" isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
