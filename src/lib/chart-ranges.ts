// Shared chart-range definitions. Yahoo has no native "3 days" or "3 years"
// range, so those fetch the next range up and slice client-side.

import type { Candle, ChartInterval, ChartRange } from "@/lib/api/yahoo";

export type RangeDef = {
  id: string;
  range: ChartRange;
  interval: ChartInterval;
  /** Keep only the last N distinct trading days (for intraday slices). */
  sliceDays?: number;
  /** Keep only candles within the last N years. */
  sliceYears?: number;
  /** Rough calendar days covered — used to seed generated fallbacks. */
  approxDays: number;
  intraday: boolean;
};

/** Ranges for the stock viewer chart. */
export const VIEW_RANGES: RangeDef[] = [
  { id: "1D", range: "1d", interval: "5m", approxDays: 1, intraday: true },
  { id: "3D", range: "5d", interval: "15m", sliceDays: 3, approxDays: 3, intraday: true },
  { id: "1W", range: "5d", interval: "30m", approxDays: 7, intraday: true },
  { id: "1M", range: "1mo", interval: "1d", approxDays: 30, intraday: false },
  { id: "3M", range: "3mo", interval: "1d", approxDays: 90, intraday: false },
  { id: "1Y", range: "1y", interval: "1d", approxDays: 365, intraday: false },
  { id: "3Y", range: "5y", interval: "1wk", sliceYears: 3, approxDays: 1095, intraday: false },
  { id: "MAX", range: "max", interval: "1mo", approxDays: 3650, intraday: false },
];

/**
 * Ranges for the quant engine. Short windows use intraday candles so the
 * indicator math still has enough bars to work with.
 */
export const QUANT_RANGES: RangeDef[] = [
  { id: "1D", range: "1d", interval: "5m", approxDays: 1, intraday: true },
  { id: "3D", range: "5d", interval: "15m", sliceDays: 3, approxDays: 3, intraday: true },
  { id: "1W", range: "5d", interval: "30m", approxDays: 7, intraday: true },
  { id: "1M", range: "1mo", interval: "1h", approxDays: 30, intraday: true },
  { id: "3M", range: "3mo", interval: "1d", approxDays: 90, intraday: false },
  { id: "6M", range: "6mo", interval: "1d", approxDays: 180, intraday: false },
  { id: "1Y", range: "1y", interval: "1d", approxDays: 365, intraday: false },
  { id: "3Y", range: "5y", interval: "1wk", sliceYears: 3, approxDays: 1095, intraday: false },
  { id: "MAX", range: "max", interval: "1mo", approxDays: 3650, intraday: false },
];

/** Apply a range's client-side slice to raw candles. */
export function sliceCandles(candles: Candle[], def: RangeDef): Candle[] {
  let out = candles;
  if (def.sliceYears) {
    const cutoff = Date.now() - def.sliceYears * 365.25 * 24 * 3600 * 1000;
    out = out.filter((c) => c.time >= cutoff);
  }
  if (def.sliceDays) {
    const days = new Set<string>();
    for (const c of out) days.add(new Date(c.time).toDateString());
    const keep = new Set(
      Array.from(days)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        .slice(-def.sliceDays),
    );
    out = out.filter((c) => keep.has(new Date(c.time).toDateString()));
  }
  return out;
}

/** Axis/tooltip label for a candle under a given range. */
export function candleLabel(time: number, def: RangeDef): string {
  const d = new Date(time);
  if (def.intraday) {
    return def.id === "1D"
      ? d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  }
  if (def.id === "3Y" || def.id === "MAX") {
    return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
  }
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}
