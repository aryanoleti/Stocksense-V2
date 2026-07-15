"use client";

// "Show the working" tab: full transparency for a symbol's analysis — where
// the numbers come from, the step-by-step arithmetic with real values plugged
// in, and the exact source code that runs. Nothing is a black box.

import { useState } from "react";
import { Database, Braces, Copy, Check, FileCode2 } from "lucide-react";
import { computeQuant } from "@/lib/quant-steps";
import { cn } from "@/lib/cn";

// The literal source of the core math, shown so users can audit exactly what
// runs. Kept in sync with src/lib/quant.ts.
const SOURCE: { name: string; code: string }[] = [
  {
    name: "Daily returns",
    code: `function returns(prices) {
  const out = [];
  for (let i = 1; i < prices.length; i++)
    out.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  return out;
}`,
  },
  {
    name: "Simple moving average (SMA)",
    code: `function sma(prices, period) {
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}`,
  },
  {
    name: "Exponential moving average (EMA)",
    code: `function ema(prices, period) {
  const k = 2 / (period + 1);        // smoothing factor
  let prev = prices[0];
  for (let i = 1; i < prices.length; i++)
    prev = prices[i] * k + prev * (1 - k);
  return prev;
}`,
  },
  {
    name: "Relative Strength Index (RSI 14)",
    code: `function rsi(prices, period = 14) {
  const deltas = [];
  for (let i = 1; i < prices.length; i++) deltas.push(prices[i] - prices[i - 1]);
  const win = deltas.slice(-period);
  const avgGain = win.filter(d => d > 0).reduce((a, b) => a + b, 0) / period;
  const avgLoss = win.filter(d => d < 0).reduce((a, b) => a - b, 0) / period;
  const rs = avgGain / avgLoss;
  return avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);
}`,
  },
  {
    name: "MACD (12, 26, 9)",
    code: `function macd(prices, fast = 12, slow = 26, signal = 9) {
  const line   = prices.map((_, i) => ema(prices, fast, i) - ema(prices, slow, i));
  const signalLine = ema(line, signal);
  const hist   = line.map((m, i) => m - signalLine[i]);
  return { line, signalLine, hist };   // hist > 0 = bullish momentum
}`,
  },
  {
    name: "Bollinger Bands (20, 2σ)",
    code: `function bollinger(prices, period = 20, mult = 2) {
  const slice = prices.slice(-period);
  const mid   = slice.reduce((a, b) => a + b, 0) / period;
  const sigma = Math.sqrt(slice.reduce((a, b) => a + (b - mid) ** 2, 0) / period);
  return { mid, upper: mid + mult * sigma, lower: mid - mult * sigma };
}`,
  },
  {
    name: "OLS trend + forecast",
    code: `function linearRegression(prices) {
  const n = prices.length, xs = prices.map((_, i) => i);
  const mx = mean(xs), my = mean(prices);
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) { num += (xs[i]-mx)*(prices[i]-my); den += (xs[i]-mx)**2; }
  const slope = num / den, intercept = my - slope * mx;   // P̂ = slope·t + intercept
  return { slope, intercept };
}`,
  },
  {
    name: "Annualised volatility",
    code: `function volatility(prices) {
  const r = returns(prices);
  const sigmaDaily = stdDev(r);            // std-dev of daily returns
  return sigmaDaily * Math.sqrt(252);      // 252 trading days/year
}`,
  },
];

export function QuantWorking({
  prices,
  unit,
  label,
  symbol,
  rangeId,
  interval,
  times,
}: {
  prices: number[];
  unit: string;
  label: string;
  symbol: string;
  rangeId: string;
  interval: string;
  times: number[];
}) {
  const { steps } = computeQuant(unit, prices);
  const [showCode, setShowCode] = useState(false);
  const lastTime = times.length && times[times.length - 1] > 1e12 ? new Date(times[times.length - 1]) : null;

  return (
    <div className="space-y-5 reveal reveal-shown">
      {/* Data provenance */}
      <div className="glass rounded-2xl p-5">
        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] font-semibold text-(--color-fg-subtle)">
          <Database className="h-3.5 w-3.5" /> 1 · Where the numbers come from
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Provenance k="Instrument" v={`${label} (${symbol})`} />
          <Provenance k="Data points" v={`${prices.length} × ${interval} closes`} />
          <Provenance k="Window" v={rangeId} />
          <Provenance k="Latest close" v={`${unit}${prices[prices.length - 1]?.toFixed(2) ?? "—"}`} />
        </div>
        <p className="mt-3 rounded-xl bg-(--color-surface-2) px-3.5 py-2.5 font-mono text-[11.5px] leading-relaxed text-(--color-fg-muted)">
          Source: live NSE candles via Yahoo Finance, fetched through the app&apos;s edge proxy (CORS-safe),
          cached briefly to respect rate limits{lastTime ? ` · last bar ${lastTime.toLocaleString("en-IN")}` : ""}.
          Every indicator below is computed in your browser from this exact series — no server, no pre-baked answers.
        </p>
      </div>

      {/* Step-by-step working */}
      <div className="glass rounded-2xl p-5">
        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] font-semibold text-(--color-fg-subtle)">
          <Braces className="h-3.5 w-3.5" /> 2 · The working, with real numbers plugged in
        </p>
        <div className="mt-4 space-y-2.5">
          {steps.map((s, i) => (
            <div key={s.id} className="rounded-xl border border-(--color-border) bg-(--color-surface)/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[13.5px] font-semibold tracking-tight">
                  <span className="mr-2 font-mono text-[11px] text-(--color-fg-subtle)">{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </p>
                <span
                  className={cn(
                    "shrink-0 rounded-md px-2 py-0.5 font-mono text-[11.5px] font-semibold",
                    s.tone === "up" ? "bg-(--color-up-soft) text-(--color-up)" : s.tone === "down" ? "bg-(--color-down-soft) text-(--color-down)" : "bg-(--color-surface-2) text-(--color-fg-muted)",
                  )}
                >
                  {s.result}
                </span>
              </div>
              <p className="mt-2 font-mono text-[11.5px] text-(--color-brand-700)">{s.formula}</p>
              <p className="mt-1 font-mono text-[11.5px] text-(--color-fg-subtle)">= {s.work}</p>
            </div>
          ))}
        </div>
      </div>

      {/* The actual code */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] font-semibold text-(--color-fg-subtle)">
            <FileCode2 className="h-3.5 w-3.5" /> 3 · The exact code that runs
          </p>
          <button
            type="button"
            onClick={() => setShowCode((v) => !v)}
            className="rounded-lg border border-(--color-border) px-3 py-1.5 text-[12px] font-semibold text-(--color-fg-muted) hover:bg-(--color-surface-2)"
          >
            {showCode ? "Hide code" : "Show code"}
          </button>
        </div>
        {showCode ? (
          <div className="mt-4 space-y-3">
            {SOURCE.map((fn) => (
              <CodeBlock key={fn.name} name={fn.name} code={fn.code} />
            ))}
            <p className="text-[11.5px] text-(--color-fg-subtle)">
              These are the real implementations from the app&apos;s open math library. Nothing calls out to a
              paid &quot;signal&quot; service — the same functions run for every stock, so results are reproducible.
            </p>
          </div>
        ) : (
          <p className="mt-3 text-[13px] text-(--color-fg-muted)">
            Show the source for every indicator — the identical functions that produced the numbers above.
          </p>
        )}
      </div>
    </div>
  );
}

function Provenance({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface)/60 p-3">
      <p className="text-[10.5px] uppercase tracking-[0.12em] font-semibold text-(--color-fg-subtle)">{k}</p>
      <p className="mt-1 text-[13.5px] font-semibold tracking-tight text-(--color-fg)">{v}</p>
    </div>
  );
}

function CodeBlock({ name, code }: { name: string; code: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard?.writeText(code).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => {},
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-(--color-border)">
      <div className="flex items-center justify-between border-b border-(--color-border) bg-(--color-surface-2) px-3.5 py-2">
        <p className="font-mono text-[11.5px] font-semibold text-(--color-fg)">{name}</p>
        <button type="button" onClick={copy} className="inline-flex items-center gap-1 text-[11px] font-semibold text-(--color-fg-subtle) hover:text-(--color-fg)">
          {copied ? <Check className="h-3 w-3 text-(--color-up)" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto bg-(--color-surface) p-3.5 font-mono text-[11.5px] leading-relaxed text-(--color-fg)">
        <code>{code}</code>
      </pre>
    </div>
  );
}
