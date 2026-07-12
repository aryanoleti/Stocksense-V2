"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getChart } from "@/lib/api/yahoo";
import { VIEW_RANGES, sliceCandles, candleLabel } from "@/lib/chart-ranges";
import { useRefreshMs } from "@/lib/refresh-rate";
import { generateForecast, generatePriceHistory } from "@/lib/mock-data";

type HistoryPoint = { date: string; price: number };

export function PriceChart({ symbol, basePrice }: { symbol: string; basePrice: number }) {
  const [range, setRange] = useState(VIEW_RANGES[4]); // 3M default
  const seed = symbol.charCodeAt(0) + symbol.charCodeAt(1);
  const refreshMs = useRefreshMs();

  // Placeholder series until live candles land. The 7-day AI forecast shows
  // on every range so short-window viewers still get the projection.
  const showForecast = true;
  const mockHistory = useMemo<HistoryPoint[]>(
    () =>
      basePrice > 0
        ? generatePriceHistory(basePrice, Math.min(730, Math.max(7, range.approxDays)), seed).map((p) => ({
            date: p.date,
            price: p.price,
          }))
        : [],
    [basePrice, range.approxDays, seed],
  );
  const [history, setHistory] = useState<HistoryPoint[]>(mockHistory);

  useEffect(() => {
    setHistory(mockHistory);
    let cancelled = false;
    async function load() {
      const r = await getChart(symbol, range.range, range.interval);
      if (cancelled || !r || r.candles.length === 0) return;
      const candles = sliceCandles(r.candles, range);
      if (candles.length === 0) return;
      setHistory(
        candles.map((c) => ({
          date: candleLabel(c.time, range),
          price: Math.round(c.price * 100) / 100,
        })),
      );
    }
    load();
    // Keep the chart live: intraday ranges re-pull at the user's refresh rate
    // (min 5s — the cache TTL floors real network calls anyway), daily+ every 60s.
    const pollMs = range.intraday ? Math.max(5000, refreshMs) : 60_000;
    const id = setInterval(load, pollMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [symbol, range, mockHistory, refreshMs]);

  const forecast = useMemo(() => {
    if (!showForecast) return [];
    const last = history[history.length - 1];
    return last ? generateForecast(last.price, 7, seed) : [];
  }, [history, seed, showForecast]);

  const data = useMemo(() => {
    if (history.length === 0) return [];
    const merged: Array<{ date: string; price?: number; forecast?: number }> = history.map((h) => ({
      date: h.date,
      price: h.price,
    }));
    if (forecast.length > 0) {
      const last = history[history.length - 1];
      merged.push({ date: last.date, price: last.price, forecast: last.price });
      forecast.forEach((f) => merged.push({ date: f.date, forecast: f.price }));
    }
    return merged;
  }, [history, forecast]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-(--color-border) bg-(--color-surface-2) p-0.5">
          {VIEW_RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-md px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap ${
                range.id === r.id
                  ? "bg-(--color-surface) text-(--color-fg) shadow-xs"
                  : "text-(--color-fg-subtle) hover:text-(--color-fg-muted)"
              }`}
            >
              {r.id}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 text-[12px]">
          <span className="inline-flex items-center gap-1.5 text-(--color-fg-muted)">
            <span className="h-2 w-4 rounded-full bg-(--color-brand-700)" />
            Historical price
          </span>
          {showForecast && (
            <span className="inline-flex items-center gap-1.5 text-(--color-fg-muted)">
              <span className="inline-block h-2 w-4 rounded-full" style={{ background: "repeating-linear-gradient(90deg, #b27a00 0 4px, transparent 4px 8px)" }} />
              AI forecast (7 days)
            </span>
          )}
        </div>
      </div>

      <div className="h-[360px] w-full">
        {data.length === 0 ? (
          <div className="skeleton h-full w-full rounded-2xl" />
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 12, right: 20, left: 4, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="date" stroke="var(--color-fg-subtle)" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} minTickGap={24} />
            <YAxis
              stroke="var(--color-fg-subtle)"
              tickLine={false}
              axisLine={false}
              domain={["auto", "auto"]}
              tick={{ fontSize: 11 }}
              width={64}
              tickFormatter={(v) => `₹${Number(v).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--color-surface)",
                color: "var(--color-fg)",
                border: "1px solid var(--color-border)",
                borderRadius: 12,
                boxShadow: "0 12px 30px -16px rgba(13,31,23,0.18)",
                fontSize: 12,
                padding: "8px 10px",
              }}
              labelStyle={{ color: "var(--color-fg-subtle)", fontSize: 11 }}
              formatter={(v, n) => [`₹${Number(v).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, n === "price" ? "Historical" : "AI forecast"]}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#115e3c"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            {showForecast && (
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#b27a00"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 2, fill: "#b27a00" }}
                isAnimationActive={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
        )}
      </div>

      {showForecast && (
        <div className="flex items-start gap-2 rounded-xl bg-(--color-surface-2) p-3 text-[12.5px] text-(--color-fg-muted)">
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--color-warn)_18%,var(--color-surface))] text-(--color-warn)">⚠</span>
          <p>
            <span className="font-semibold text-(--color-fg)">AI Forecast:</span> the orange dashed line is a simulated
            7-day price projection generated by an AI based on current momentum and historical patterns. This is for
            educational purposes only and is not financial advice.
          </p>
        </div>
      )}
    </div>
  );
}
