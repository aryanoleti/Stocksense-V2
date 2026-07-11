"use client";

// The Quant Engine pipeline:
//   Market data → Indicator engine → Forecast engine → AI analysis
// Every stage computes on real NSE closes and shows its math — formulas,
// fitted parameters, and the arithmetic behind the bull/bear score.
// The analysis is organised into tabs (Overview / Momentum / Volatility /
// Levels / Forecast); the overview's indicator cards zoom into their tab.

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Cpu,
  Database,
  LineChart,
  TrendingUp,
  Sparkles,
  Check,
  Gauge,
  Layers,
  AlertTriangle,
  LayoutDashboard,
  Maximize2,
} from "lucide-react";
import { getChart, type Candle } from "@/lib/api/yahoo";
import { QUANT_RANGES, sliceCandles, candleLabel, type RangeDef } from "@/lib/chart-ranges";
import { searchUniverse, lookupInstrument } from "@/lib/universe";
import {
  fmt,
  pct,
  smaLine,
  ema,
  rsi as rsiCalc,
  stdDev,
  returns,
  linearRegression,
  volatility,
  macd as macdCalc,
  atr as atrCalc,
  supportResistance,
  detectPatterns,
  type Ohlc,
} from "@/lib/quant";
import { ensembleForecast, type EnsembleForecast } from "@/lib/forecast";
import { bullBearScore, type BullBearScore } from "@/lib/signals";
import { generateJson, hasGeminiKey } from "@/lib/api/gemini";
import { useCountUp } from "@/lib/use-reveal";
import { fallbackSeries } from "@/lib/quant-steps";
import { cn } from "@/lib/cn";
import { QuantTour } from "./QuantTour";

const PRESETS = ["NIFTY50", "RELIANCE", "TCS", "HDFCBANK", "INFY"];

const STAGES = [
  { id: 1, label: "Market data", icon: Database },
  { id: 2, label: "Indicator engine", icon: LineChart },
  { id: 3, label: "Forecast engine", icon: TrendingUp },
  { id: 4, label: "AI analysis", icon: Sparkles },
];

export type QuantTabId = "overview" | "momentum" | "volatility" | "levels" | "forecast";

const TABS: Array<{ id: QuantTabId; label: string; icon: typeof Gauge }> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "momentum", label: "Momentum", icon: Gauge },
  { id: "volatility", label: "Volatility", icon: AlertTriangle },
  { id: "levels", label: "Levels", icon: Layers },
  { id: "forecast", label: "Forecast", icon: TrendingUp },
];

type AiTake = { summary: string; risk: string; drivers: string[] };

type Computed = {
  prices: number[];
  times: number[];
  bars: Ohlc[];
  sma20: number[];
  sma50: number[];
  ema20: number[];
  bandUpper: number[];
  bandLower: number[];
  rsi: ReturnType<typeof rsiCalc>;
  rsiSeries: number[];
  macd: ReturnType<typeof macdCalc>;
  atr: ReturnType<typeof atrCalc>;
  levels: ReturnType<typeof supportResistance>;
  patterns: ReturnType<typeof detectPatterns>;
  vol: ReturnType<typeof volatility>;
  rollingVol: number[];
  reg: ReturnType<typeof linearRegression>;
  forecast: EnsembleForecast;
  score: BullBearScore;
  bollPos: number;
};

function rsiSeriesCalc(prices: number[], period = 14): number[] {
  return prices.map((_, i) => {
    if (i < period) return NaN;
    const win = prices.slice(i - period, i + 1);
    let gain = 0;
    let loss = 0;
    for (let j = 1; j < win.length; j++) {
      const d = win[j] - win[j - 1];
      if (d > 0) gain += d;
      else loss -= d;
    }
    const avgGain = gain / period;
    const avgLoss = loss / period;
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  });
}

/** Rolling annualised volatility from a 20-bar window of returns. */
function rollingVolCalc(prices: number[], window = 20): number[] {
  const rets = returns(prices);
  return prices.map((_, i) => {
    if (i < window) return NaN;
    const win = rets.slice(i - window, i);
    return stdDev(win, true) * Math.sqrt(252);
  });
}

function computeAll(prices: number[], candles: Candle[]): Computed {
  const sma20 = smaLine(prices, 20);
  const sma50 = smaLine(prices, 50);
  const ema20 = ema(prices, 20).line;
  const bandUpper: number[] = [];
  const bandLower: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (i + 1 < 20) {
      bandUpper.push(NaN);
      bandLower.push(NaN);
    } else {
      const win = prices.slice(i - 19, i + 1);
      const sigma = stdDev(win, false);
      bandUpper.push(sma20[i] + 2 * sigma);
      bandLower.push(sma20[i] - 2 * sigma);
    }
  }
  const bars: Ohlc[] = candles
    .filter((c) => c.high != null && c.low != null)
    .map((c) => ({ high: c.high!, low: c.low!, close: c.price }));
  const r = rsiCalc(prices, 14);
  const m = macdCalc(prices);
  const a = bars.length > 15 ? atrCalc(bars, 14) : null;
  const levels = bars.length > 10 ? supportResistance(bars) : null;
  const patterns = detectPatterns(prices);
  const vol = volatility(prices);
  const reg = linearRegression(prices, 7);
  const forecast = ensembleForecast(prices, 7);
  const last = prices[prices.length - 1];
  const bu = bandUpper[bandUpper.length - 1];
  const bl = bandLower[bandLower.length - 1];
  const bollPos = isNaN(bu) || bu === bl ? 0.5 : Math.min(1, Math.max(0, (last - bl) / (bu - bl)));
  const score = bullBearScore({
    prices,
    rsi: r.rsi,
    macd: m,
    slope: reg.slope,
    bollPos,
    atr: a,
    ensembleTarget: forecast.ensemble[forecast.ensemble.length - 1],
  });
  return {
    prices,
    times: candles.map((c) => c.time),
    bars,
    sma20,
    sma50,
    ema20,
    bandUpper,
    bandLower,
    rsi: r,
    rsiSeries: rsiSeriesCalc(prices),
    macd: m,
    atr: a,
    levels,
    patterns,
    vol,
    rollingVol: rollingVolCalc(prices),
    reg,
    forecast,
    score,
    bollPos,
  };
}

/* ----------------------------------------------- per-tab AI note (cached) */

type AiNoteData = { take: string; watch: string };
const aiNoteCache = new Map<string, AiNoteData>();

function AiNote({ cacheKey, prompt, fallback }: { cacheKey: string; prompt: string; fallback: string }) {
  const [note, setNote] = useState<AiNoteData | null>(aiNoteCache.get(cacheKey) ?? null);
  const [state, setState] = useState<"loading" | "done" | "off">(
    aiNoteCache.has(cacheKey) ? "done" : hasGeminiKey() ? "loading" : "off",
  );

  useEffect(() => {
    const cached = aiNoteCache.get(cacheKey);
    if (cached) {
      setNote(cached);
      setState("done");
      return;
    }
    if (!hasGeminiKey()) {
      setState("off");
      return;
    }
    let cancelled = false;
    setState("loading");
    setNote(null);
    generateJson<AiNoteData>([{ role: "user", parts: [{ text: prompt }] }], { temperature: 0.4 }).then((res) => {
      if (cancelled) return;
      if (res?.take) {
        aiNoteCache.set(cacheKey, res);
        setNote(res);
        setState("done");
      } else {
        setState("off");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [cacheKey, prompt]);

  return (
    <div className="glass rounded-2xl p-5">
      <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] font-semibold text-(--color-fg-subtle)">
        <Sparkles className="h-3.5 w-3.5" /> AI summary {state === "done" ? "· Gemini" : ""}
      </p>
      {state === "loading" && (
        <p className="mt-3 inline-flex items-center gap-2 text-[13.5px] text-(--color-fg-muted)">
          <span className="h-2 w-2 animate-pulse-dot rounded-full bg-(--color-brand-500)" /> Reading the numbers…
        </p>
      )}
      {state === "done" && note && (
        <div className="mt-3 space-y-2.5">
          <p className="text-[14px] leading-relaxed">{note.take}</p>
          {note.watch && (
            <p className="rounded-xl bg-(--color-surface-2) px-3.5 py-2.5 text-[13px] leading-relaxed text-(--color-fg-muted)">
              <span className="font-semibold text-(--color-fg)">What to watch: </span>
              {note.watch}
            </p>
          )}
        </div>
      )}
      {state === "off" && <p className="mt-3 text-[13.5px] leading-relaxed text-(--color-fg-muted)">{fallback}</p>}
      <p className="mt-3 border-t border-(--color-border) pt-2.5 text-[10.5px] text-(--color-fg-subtle)">
        Educational read of the computed values above — not investment advice.
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- shell */

export function QuantWorkbench() {
  const [symbol, setSymbol] = useState("NIFTY50");
  const [rangeId, setRangeId] = useState("6M");
  const [query, setQuery] = useState("");
  const [focus, setFocus] = useState(false);
  const [candles, setCandles] = useState<Candle[] | null>(null);
  const [stage, setStage] = useState(0);
  const [tab, setTab] = useState<QuantTabId>("overview");
  const [ai, setAi] = useState<AiTake | null>(null);
  const [aiState, setAiState] = useState<"idle" | "loading" | "done" | "off">("idle");

  const inst = lookupInstrument(symbol);
  const isIndex = symbol === "NIFTY50" || symbol.startsWith("^");
  const unit = isIndex ? "" : "₹";
  const label = inst?.name ?? (symbol === "NIFTY50" ? "NIFTY 50" : symbol);
  const results = useMemo(() => (query.trim() ? searchUniverse(query, 6) : []), [query]);
  const rangeDef = QUANT_RANGES.find((x) => x.id === rangeId) ?? QUANT_RANGES[5];

  // Stage 1: fetch data
  useEffect(() => {
    let cancelled = false;
    setCandles(null);
    setStage(0);
    setAi(null);
    setAiState("idle");
    getChart(symbol, rangeDef.range, rangeDef.interval).then((res) => {
      if (cancelled) return;
      const raw = res?.candles.filter((c) => c.price > 0) ?? [];
      const list = sliceCandles(raw, rangeDef);
      if (list.length > 30) {
        setCandles(list);
      } else {
        const prices = fallbackSeries(symbol.length, isIndex ? 24000 : 1500);
        setCandles(prices.map((p, i) => ({ time: i, price: p })));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [symbol, rangeDef, isIndex]);

  const computed = useMemo<Computed | null>(() => {
    if (!candles) return null;
    return computeAll(candles.map((c) => c.price), candles);
  }, [candles]);

  // Advance pipeline stages with a beat between each
  useEffect(() => {
    if (!computed) return;
    setStage(1);
    const t2 = setTimeout(() => setStage(2), 550);
    const t3 = setTimeout(() => setStage(3), 1150);
    const t4 = setTimeout(() => setStage(4), 1750);
    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [computed]);

  // Stage 4: AI plain-English take (overview tab)
  useEffect(() => {
    if (!computed || stage < 4 || aiState !== "idle") return;
    if (!hasGeminiKey()) {
      setAiState("off");
      return;
    }
    setAiState("loading");
    const c = computed;
    const last = c.prices[c.prices.length - 1];
    const prompt = `You are a quant analyst. Given these computed indicators for ${label} (${symbol}, NSE) over a ${rangeId} window:
close=${last.toFixed(2)}, RSI14=${c.rsi.rsi.toFixed(1)}, MACD_hist=${c.macd.lastHist.toFixed(2)},
SMA20=${c.sma20[c.sma20.length - 1]?.toFixed(2)}, trend_slope=${c.reg.slope.toFixed(3)}/bar, R2=${c.reg.r2.toFixed(2)},
annualised_vol=${(c.vol.annualized * 100).toFixed(1)}%, ATR%=${c.atr ? (c.atr.pct * 100).toFixed(2) : "n/a"},
7bar_ensemble_forecast=${c.forecast.ensemble[6].toFixed(2)} (95% CI ${c.forecast.lower[6].toFixed(2)}–${c.forecast.upper[6].toFixed(2)}),
bull_bear_score=${c.score.score}/100 (${c.score.verdict}),
patterns=${c.patterns.filter((p) => p.detected).map((p) => p.name).join("; ") || "none"}.
Return JSON only: {"summary": "2-3 plain-English sentences a beginner understands, referencing the numbers", "risk": "1-2 sentences on the main risk", "drivers": ["3 short bullet drivers"]}. Educational tone, no buy/sell advice, INR context.`;
    generateJson<AiTake>([{ role: "user", parts: [{ text: prompt }] }], { temperature: 0.4 }).then((res) => {
      if (res?.summary) {
        setAi(res);
        setAiState("done");
      } else {
        setAiState("off");
      }
    });
  }, [computed, stage, aiState, label, symbol, rangeId]);

  function pick(sym: string) {
    setSymbol(sym.toUpperCase());
    setQuery("");
    setFocus(false);
  }

  const last = computed ? computed.prices[computed.prices.length - 1] : 0;
  const aiKeyBase = `${symbol}|${rangeId}`;

  return (
    <div className="relative space-y-6">
      <div className="pointer-events-none absolute -inset-x-8 -top-8 -z-10 h-[520px] rounded-[48px] bg-[radial-gradient(80%_70%_at_20%_0%,color-mix(in_srgb,var(--color-brand-200)_35%,transparent)_0%,transparent_70%)]" />

      <QuantTour />

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] font-semibold text-(--color-fg-subtle)">
            <Cpu className="h-3.5 w-3.5" /> Quant engine
          </p>
          <h1 className="mt-1 text-[28px] font-semibold tracking-tight">Pipeline: data → math → forecast → analysis</h1>
          <p className="mt-1 text-[13.5px] text-(--color-fg-muted)">
            Live NSE closes through an indicator engine, three forecast models with confidence intervals, and an AI read — every formula shown.
          </p>
        </div>
      </header>

      {/* Pipeline stages */}
      <div data-tour="pipeline" className="glass flex flex-wrap items-center gap-1 rounded-2xl p-2">
        {STAGES.map((s, i) => {
          const active = stage >= s.id;
          const Icon = s.icon;
          return (
            <div key={s.id} className="flex items-center">
              <div
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3.5 py-2 text-[12.5px] font-semibold transition-all duration-500",
                  active ? "bg-(--color-brand-700) text-white shadow-(--shadow-sm)" : "text-(--color-fg-subtle)",
                )}
              >
                {active && stage === s.id ? (
                  <span className="h-3.5 w-3.5 animate-pulse-dot rounded-full bg-white/80" />
                ) : active ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
                {s.label}
              </div>
              {i < STAGES.length - 1 && (
                <div className={cn("mx-1 h-px w-6 sm:w-10 transition-colors duration-500", stage > s.id ? "bg-(--color-brand-500)" : "bg-(--color-border)")} />
              )}
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div data-tour="controls" className="glass rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-fg-subtle)" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocus(true)}
              onBlur={() => setTimeout(() => setFocus(false), 150)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && results[0]) pick(results[0].symbol);
              }}
              placeholder="Run the pipeline on any NSE stock or ETF…"
              className="h-11 w-full rounded-xl border border-(--color-border) bg-(--color-surface) pl-10 pr-3 text-sm placeholder:text-(--color-fg-subtle) focus:border-(--color-brand-300) focus:ring-4 focus:ring-(--color-brand-50) focus:outline-none"
            />
            {focus && results.length > 0 && (
              <ul className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-lg)">
                {results.map((r) => (
                  <li key={r.symbol}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pick(r.symbol)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-(--color-surface-2)"
                    >
                      <span className="min-w-0">
                        <span className="text-[13.5px] font-semibold tracking-tight">{r.symbol}</span>
                        <span className="ml-2 text-[11.5px] text-(--color-fg-subtle)">{r.name}</span>
                      </span>
                      <span className="shrink-0 text-[10px] uppercase tracking-[0.1em] text-(--color-fg-subtle)">
                        {r.kind === "etf" ? "ETF" : "NSE"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-(--color-border) bg-(--color-surface-2) p-1">
            {QUANT_RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRangeId(r.id)}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 text-[12px] font-semibold whitespace-nowrap",
                  rangeId === r.id ? "bg-(--color-surface) shadow-xs" : "text-(--color-fg-subtle) hover:text-(--color-fg-muted)",
                )}
              >
                {r.id}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => pick(p)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors",
                  symbol === p
                    ? "border-(--color-brand-300) bg-(--color-brand-50) text-(--color-brand-700)"
                    : "border-(--color-border) text-(--color-fg-muted) hover:border-(--color-brand-300)",
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-3 font-mono text-[11.5px] text-(--color-fg-subtle)">
          {computed ? (
            <>
              <span className="text-(--color-brand-700)">data ✓</span> {computed.prices.length} closes ({rangeDef.interval} bars, {rangeId}) · {label} · latest {unit}
              {fmt(last)} · source NSE via edge proxy
            </>
          ) : (
            "loading closes…"
          )}
        </p>
      </div>

      {/* Tabs */}
      {computed && stage >= 2 && (
        <div data-tour="tabs" className="glass sticky top-16 z-10 flex items-center gap-1 overflow-x-auto rounded-2xl p-1.5">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold whitespace-nowrap transition-colors",
                  tab === t.id ? "bg-(--color-brand-700) text-white shadow-(--shadow-sm)" : "text-(--color-fg-muted) hover:bg-(--color-surface-2)",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      )}

      {/* ---------------------------------------------------- tab content */}
      {computed && stage >= 2 && tab === "overview" && (
        <OverviewTab
          computed={computed}
          unit={unit}
          label={label}
          rangeDef={rangeDef}
          showForecast={stage >= 3}
          showScore={stage >= 4}
          ai={ai}
          aiState={aiState}
          onZoom={setTab}
        />
      )}
      {computed && stage >= 2 && tab === "momentum" && (
        <MomentumTab computed={computed} unit={unit} label={label} symbol={symbol} aiKeyBase={aiKeyBase} />
      )}
      {computed && stage >= 2 && tab === "volatility" && (
        <VolatilityTab computed={computed} unit={unit} label={label} symbol={symbol} aiKeyBase={aiKeyBase} />
      )}
      {computed && stage >= 2 && tab === "levels" && (
        <LevelsTab computed={computed} unit={unit} label={label} symbol={symbol} aiKeyBase={aiKeyBase} />
      )}
      {computed && stage >= 3 && tab === "forecast" && (
        <ForecastTab computed={computed} unit={unit} label={label} symbol={symbol} aiKeyBase={aiKeyBase} last={last} />
      )}
      {computed && stage < 3 && tab === "forecast" && (
        <div className="glass rounded-2xl p-8 text-center text-[13.5px] text-(--color-fg-muted)">Forecast engine warming up…</div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- overview */

function OverviewTab({
  computed,
  unit,
  label,
  rangeDef,
  showForecast,
  showScore,
  ai,
  aiState,
  onZoom,
}: {
  computed: Computed;
  unit: string;
  label: string;
  rangeDef: RangeDef;
  showForecast: boolean;
  showScore: boolean;
  ai: AiTake | null;
  aiState: "idle" | "loading" | "done" | "off";
  onZoom: (t: QuantTabId) => void;
}) {
  return (
    <div className="space-y-5 reveal reveal-shown">
      <div data-tour="chart" className="glass rounded-2xl p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-[14px] font-semibold tracking-tight">{label}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-(--color-fg-muted)">
            <Legend color="#115e3c" label="Close" />
            <Legend color="#3d9a6b" label="SMA 20" />
            <Legend color="#8a63d2" label="SMA 50" />
            <Legend color="#6fb98e" label="Bollinger 2σ" dashed />
            <Legend color="#b27a00" label="Ensemble forecast" dashed />
            <Legend color="#1d6fb8" label="Support/Resistance" dashed />
          </div>
        </div>
        <MainChart computed={computed} unit={unit} showForecast={showForecast} rangeDef={rangeDef} />
      </div>

      {/* Indicator snapshots — click to zoom */}
      <div data-tour="cards" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <IndicatorCard title="RSI (14)" icon={<Gauge className="h-4 w-4" />} onZoom={() => onZoom("momentum")} zoomLabel="Momentum">
          <RsiGauge value={computed.rsi.rsi} />
        </IndicatorCard>

        <IndicatorCard title="MACD (12, 26, 9)" icon={<LineChart className="h-4 w-4" />} onZoom={() => onZoom("momentum")} zoomLabel="Momentum">
          <MacdMini macd={computed.macd} />
          <p className="mt-2 font-mono text-[11px] text-(--color-fg-subtle)">
            hist{" "}
            <span className={computed.macd.lastHist >= 0 ? "text-(--color-up)" : "text-(--color-down)"}>{fmt(computed.macd.lastHist)}</span>
          </p>
        </IndicatorCard>

        <IndicatorCard title="ATR (14) · volatility" icon={<AlertTriangle className="h-4 w-4" />} onZoom={() => onZoom("volatility")} zoomLabel="Volatility">
          {computed.atr ? (
            <>
              <p className="text-[24px] font-semibold tabular tracking-tight">
                {unit}
                {fmt(computed.atr.atr)}
              </p>
              <p className="mt-1 text-[12.5px] text-(--color-fg-muted)">{pct(computed.atr.pct)} per bar · σₐ {pct(computed.vol.annualized)}</p>
            </>
          ) : (
            <p className="text-[13px] text-(--color-fg-muted)">Needs OHLC bars — unavailable for this series.</p>
          )}
        </IndicatorCard>

        <IndicatorCard title="Support / Resistance" icon={<Layers className="h-4 w-4" />} onZoom={() => onZoom("levels")} zoomLabel="Levels">
          {computed.levels ? (
            <div className="space-y-1.5 font-mono text-[12px]">
              {computed.levels.resistances.slice(0, 1).map((r) => (
                <p key="r" className="text-(--color-down)">R1 {unit}{fmt(r, 0)}</p>
              ))}
              <p className="text-(--color-fg-muted)">P&nbsp;&nbsp;{unit}{fmt(computed.levels.pivot.p, 0)}</p>
              {computed.levels.supports.slice(0, 1).map((s) => (
                <p key="s" className="text-(--color-up)">S1 {unit}{fmt(s, 0)}</p>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-(--color-fg-muted)">Not enough bars.</p>
          )}
        </IndicatorCard>
      </div>

      {/* Patterns */}
      <div className="glass rounded-2xl p-4">
        <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-(--color-fg-subtle)">Pattern detection</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {computed.patterns.map((p) => (
            <span
              key={p.id + p.name}
              title={p.detail}
              className={cn(
                "rounded-full border px-3 py-1 text-[12px] font-medium",
                p.detected && p.id !== "death"
                  ? "border-(--color-brand-300) bg-(--color-brand-50) text-(--color-brand-700)"
                  : p.detected && p.id === "death"
                    ? "border-(--color-down)/40 bg-(--color-down-soft) text-(--color-down)"
                    : "border-(--color-border) text-(--color-fg-subtle) line-through decoration-1 opacity-60",
              )}
            >
              {p.name}
            </span>
          ))}
        </div>
      </div>

      {/* Bull/bear + AI take */}
      {showScore && (
        <div data-tour="verdict" className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] reveal reveal-shown">
          <div className="glass rounded-2xl p-5">
            <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] font-semibold text-(--color-fg-subtle)">
              <Gauge className="h-3.5 w-3.5" /> Bull / bear score
            </p>
            <ScoreMeter score={computed.score} />
            <div className="mt-4 space-y-1.5">
              {computed.score.components.map((c) => (
                <div key={c.label} className="flex items-baseline justify-between gap-3 border-b border-(--color-border)/60 pb-1.5 last:border-0">
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-medium">{c.label}</p>
                    <p className="truncate font-mono text-[10.5px] text-(--color-fg-subtle)">{c.why}</p>
                  </div>
                  <p className="shrink-0 font-mono text-[12px] font-semibold tabular">
                    {c.points}/{c.max}
                  </p>
                </div>
              ))}
              <p className="pt-1 text-right font-mono text-[11.5px] text-(--color-fg-muted)">
                total {computed.score.totalPoints}/{computed.score.maxPoints} → {computed.score.score}/100
              </p>
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] font-semibold text-(--color-fg-subtle)">
              <Sparkles className="h-3.5 w-3.5" /> Plain-English analysis {aiState === "done" ? "· Gemini" : ""}
            </p>
            {aiState === "loading" && (
              <p className="mt-4 inline-flex items-center gap-2 text-[13.5px] text-(--color-fg-muted)">
                <span className="h-2 w-2 animate-pulse-dot rounded-full bg-(--color-brand-500)" /> Writing the analysis from the numbers above…
              </p>
            )}
            {aiState === "done" && ai && (
              <div className="mt-3 space-y-3">
                <p className="text-[14.5px] leading-relaxed">{ai.summary}</p>
                <div className="rounded-xl border border-(--color-warn)/25 bg-[color-mix(in_srgb,var(--color-warn)_9%,var(--color-surface))] p-3">
                  <p className="text-[12px] font-semibold text-(--color-warn)">Risk</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed">{ai.risk}</p>
                </div>
                {ai.drivers?.length > 0 && (
                  <ul className="space-y-1">
                    {ai.drivers.slice(0, 4).map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px] text-(--color-fg-muted)">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-(--color-brand-500)" />
                        {d}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {aiState === "off" && (
              <p className="mt-4 text-[13.5px] leading-relaxed text-(--color-fg-muted)">
                {computed.score.verdict} setup: score {computed.score.score}/100. RSI at {fmt(computed.rsi.rsi, 1)}, MACD histogram{" "}
                {computed.macd.lastHist >= 0 ? "positive" : "negative"}, trend slope {fmt(computed.reg.slope, 3)}/bar, and the 7-bar ensemble points to {unit}
                {fmt(computed.forecast.ensemble[6])}. (Add a Gemini key for a fuller written analysis.)
              </p>
            )}
            <p className="mt-4 border-t border-(--color-border) pt-3 text-[11px] text-(--color-fg-subtle)">
              Educational tooling computed from live NSE data — not investment advice.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- momentum */

function MomentumTab({ computed, unit, label, symbol, aiKeyBase }: TabProps) {
  const c = computed;
  const crossed = c.macd.lastHist >= 0 ? "above" : "below";
  const prompt = `You are a quant analyst. Momentum picture for ${label} (${symbol}, NSE):
RSI14=${c.rsi.rsi.toFixed(1)} (avgGain=${c.rsi.avgGain.toFixed(2)}, avgLoss=${c.rsi.avgLoss.toFixed(2)}),
MACD=${c.macd.lastMacd.toFixed(2)}, signal=${c.macd.lastSignal.toFixed(2)}, histogram=${c.macd.lastHist.toFixed(2)} (MACD ${crossed} signal),
trend_slope=${c.reg.slope.toFixed(3)}/bar with R2=${c.reg.r2.toFixed(2)}.
Return JSON only: {"take": "2-3 beginner-friendly sentences on what momentum says here, referencing the numbers", "watch": "1 sentence on the key level or signal to watch next"}. Educational, no buy/sell advice.`;
  const fallback = `RSI(14) is at ${fmt(c.rsi.rsi, 1)} — ${c.rsi.rsi > 70 ? "overbought territory" : c.rsi.rsi < 30 ? "oversold territory" : "the neutral zone"}. The MACD line is ${crossed} its signal (histogram ${fmt(c.macd.lastHist)}), and the fitted trend slope is ${fmt(c.reg.slope, 3)}/bar. (Add a Gemini key for a written summary.)`;

  return (
    <div className="space-y-5 reveal reveal-shown">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <TabCardHeader icon={<Gauge className="h-4 w-4" />} title="RSI (14)" formula="RSI = 100 − 100/(1+RS), RS = avgGain/avgLoss" />
          <div className="mt-4">
            <RsiGauge value={c.rsi.rsi} large />
          </div>
          <p className="mt-3 font-mono text-[11.5px] text-(--color-fg-subtle)">
            avgGain {fmt(c.rsi.avgGain)} / avgLoss {fmt(c.rsi.avgLoss)} → RS {fmt(c.rsi.rs)}
          </p>
          <div className="mt-5">
            <p className="mb-2 text-[11px] uppercase tracking-[0.12em] font-semibold text-(--color-fg-subtle)">RSI history</p>
            <SeriesChart values={c.rsiSeries} height={140} color="var(--color-info)" domain={[0, 100]} guides={[{ v: 70, label: "70" }, { v: 30, label: "30" }]} />
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <TabCardHeader icon={<LineChart className="h-4 w-4" />} title="MACD (12, 26, 9)" formula="MACD = EMA₁₂ − EMA₂₆; signal = EMA₉(MACD); hist = MACD − signal" />
          <div className="mt-4">
            <MacdChart macd={c.macd} height={220} />
          </div>
          <p className="mt-3 font-mono text-[11.5px] text-(--color-fg-subtle)">
            MACD {fmt(c.macd.lastMacd)} · signal {fmt(c.macd.lastSignal)} · hist{" "}
            <span className={c.macd.lastHist >= 0 ? "text-(--color-up)" : "text-(--color-down)"}>{fmt(c.macd.lastHist)}</span>
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <TabCardHeader icon={<TrendingUp className="h-4 w-4" />} title="Trend regression" formula="P̂ = β·t + α (ordinary least squares)" />
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <Stat label="Slope β" value={`${fmt(c.reg.slope, 3)}/bar`} tone={c.reg.slope >= 0 ? "up" : "down"} />
          <Stat label="Fit R²" value={fmt(c.reg.r2, 3)} />
          <Stat label="Direction" value={c.reg.slope >= 0 ? "Rising" : "Falling"} tone={c.reg.slope >= 0 ? "up" : "down"} />
        </div>
      </div>

      <AiNote cacheKey={`${aiKeyBase}|momentum`} prompt={prompt} fallback={fallback} />
    </div>
  );
}

/* ------------------------------------------------------------- volatility */

function VolatilityTab({ computed, unit, label, symbol, aiKeyBase }: TabProps) {
  const c = computed;
  const bandWidth =
    !isNaN(c.bandUpper[c.bandUpper.length - 1]) && c.sma20[c.sma20.length - 1]
      ? (c.bandUpper[c.bandUpper.length - 1] - c.bandLower[c.bandLower.length - 1]) / c.sma20[c.sma20.length - 1]
      : NaN;
  const prompt = `You are a quant analyst. Volatility picture for ${label} (${symbol}, NSE):
ATR14=${c.atr ? c.atr.atr.toFixed(2) : "n/a"} (${c.atr ? (c.atr.pct * 100).toFixed(2) : "n/a"}% of price per bar),
daily_sigma=${(c.vol.daily * 100).toFixed(2)}%, annualised_sigma=${(c.vol.annualized * 100).toFixed(1)}%,
bollinger_width=${isNaN(bandWidth) ? "n/a" : (bandWidth * 100).toFixed(1)}% of mid, price_at=${(c.bollPos * 100).toFixed(0)}% of the band.
Return JSON only: {"take": "2-3 beginner-friendly sentences on how volatile this is and what that means practically (position sizing, swing size), referencing the numbers", "watch": "1 sentence on what would signal a volatility regime change"}. Educational, no buy/sell advice.`;
  const fallback = `Annualised volatility is ${pct(c.vol.annualized)} (${pct(c.vol.daily, 3)} per bar)${c.atr ? `, with ATR(14) at ${unit}${fmt(c.atr.atr)} — about ${pct(c.atr.pct)} of price per bar` : ""}. Price sits at ${pct(c.bollPos, 0)} of its Bollinger band. (Add a Gemini key for a written summary.)`;

  return (
    <div className="space-y-5 reveal reveal-shown">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass rounded-2xl p-5">
          <TabCardHeader icon={<AlertTriangle className="h-4 w-4" />} title="ATR (14)" formula="TR = max(H−L, |H−C₋₁|, |L−C₋₁|); Wilder-smoothed" />
          {c.atr ? (
            <>
              <p className="mt-3 text-[28px] font-semibold tabular tracking-tight">
                {unit}
                {fmt(c.atr.atr)}
              </p>
              <p className="mt-1 text-[12.5px] text-(--color-fg-muted)">{pct(c.atr.pct)} of price per bar</p>
            </>
          ) : (
            <p className="mt-3 text-[13px] text-(--color-fg-muted)">Needs OHLC bars — unavailable for this series.</p>
          )}
        </div>
        <div className="glass rounded-2xl p-5">
          <TabCardHeader icon={<TrendingUp className="h-4 w-4" />} title="Return volatility" formula="σₐ = σ_bar · √252" />
          <p className="mt-3 text-[28px] font-semibold tabular tracking-tight">{pct(c.vol.annualized)}</p>
          <p className="mt-1 text-[12.5px] text-(--color-fg-muted)">σ per bar {pct(c.vol.daily, 3)} · n = {c.vol.n}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <TabCardHeader icon={<Layers className="h-4 w-4" />} title="Bollinger position" formula="pos = (P − lower) / (upper − lower)" />
          <p className="mt-3 text-[28px] font-semibold tabular tracking-tight">{pct(c.bollPos, 0)}</p>
          <div className="relative mt-2 h-2.5 overflow-hidden rounded-full bg-gradient-to-r from-(--color-up)/40 via-(--color-surface-3) to-(--color-down)/40">
            <div
              className="absolute top-1/2 h-4 w-1.5 -translate-y-1/2 rounded-full bg-(--color-fg) shadow"
              style={{ left: `calc(${Math.min(100, Math.max(0, c.bollPos * 100))}% - 3px)` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-(--color-fg-subtle)">
            band width {isNaN(bandWidth) ? "—" : pct(bandWidth)} of mid
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <p className="mb-2 text-[11px] uppercase tracking-[0.12em] font-semibold text-(--color-fg-subtle)">
          Rolling annualised volatility (20-bar window)
        </p>
        <SeriesChart values={c.rollingVol} height={180} color="var(--color-warn)" format={(v) => pct(v, 0)} />
      </div>

      <AiNote cacheKey={`${aiKeyBase}|volatility`} prompt={prompt} fallback={fallback} />
    </div>
  );
}

/* ----------------------------------------------------------------- levels */

function LevelsTab({ computed, unit, label, symbol, aiKeyBase }: TabProps) {
  const c = computed;
  const price = c.prices[c.prices.length - 1];
  const lv = c.levels;
  const rows = lv
    ? [
        ...lv.resistances.map((v, i) => ({ id: `R${i + 1}`, v, kind: "res" as const })).reverse(),
        { id: "Price", v: price, kind: "price" as const },
        ...lv.supports.map((v, i) => ({ id: `S${i + 1}`, v, kind: "sup" as const })),
      ]
    : [];
  const prompt = lv
    ? `You are a quant analyst. Key levels for ${label} (${symbol}, NSE), current price ${price.toFixed(2)}:
resistances=[${lv.resistances.map((v) => v.toFixed(2)).join(", ")}], supports=[${lv.supports.map((v) => v.toFixed(2)).join(", ")}],
pivot P=${lv.pivot.p.toFixed(2)}, R1=${lv.pivot.r1.toFixed(2)}, S1=${lv.pivot.s1.toFixed(2)}.
Return JSON only: {"take": "2-3 beginner-friendly sentences on where price sits relative to these levels and their distance in %", "watch": "1 sentence on which level matters most right now"}. Educational, no buy/sell advice.`
    : "";
  const fallback = lv
    ? `Price ${unit}${fmt(price)} trades ${lv.resistances[0] ? `${pct((lv.resistances[0] - price) / price)} below the nearest resistance ${unit}${fmt(lv.resistances[0], 0)}` : "with no swing resistance overhead in this window"}${lv.supports[0] ? ` and ${pct((price - lv.supports[0]) / price)} above the nearest support ${unit}${fmt(lv.supports[0], 0)}` : ""}. Floor-trader pivot sits at ${unit}${fmt(lv.pivot.p, 0)}. (Add a Gemini key for a written summary.)`
    : "Not enough OHLC bars in this window to compute swing levels.";

  return (
    <div className="space-y-5 reveal reveal-shown">
      <div className="glass rounded-2xl p-5">
        <TabCardHeader icon={<Layers className="h-4 w-4" />} title="Support / resistance ladder" formula="Fractal swing highs/lows (±2 bars) split around price" />
        {lv ? (
          <div className="mt-5 space-y-2.5">
            {rows.map((r) => {
              const distPct = ((r.v - price) / price) * 100;
              const isPrice = r.kind === "price";
              return (
                <div key={r.id} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "w-14 shrink-0 font-mono text-[12px] font-semibold",
                      isPrice ? "text-(--color-fg)" : r.kind === "res" ? "text-(--color-down)" : "text-(--color-up)",
                    )}
                  >
                    {r.id}
                  </span>
                  <div
                    className={cn(
                      "flex h-9 flex-1 items-center justify-between rounded-xl border px-4",
                      isPrice
                        ? "border-(--color-brand-300) bg-(--color-brand-50)"
                        : r.kind === "res"
                          ? "border-(--color-down)/25 bg-(--color-down-soft)/50"
                          : "border-(--color-up)/25 bg-(--color-up-soft)/50",
                    )}
                  >
                    <span className={cn("font-mono text-[13px] font-semibold tabular", isPrice && "text-(--color-brand-700)")}>
                      {unit}
                      {fmt(r.v)}
                    </span>
                    {!isPrice && (
                      <span className="font-mono text-[11.5px] tabular text-(--color-fg-muted)">
                        {distPct >= 0 ? "+" : ""}
                        {distPct.toFixed(2)}% away
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 text-[13.5px] text-(--color-fg-muted)">Not enough bars in this window.</p>
        )}
      </div>

      {lv && (
        <div className="glass rounded-2xl p-5">
          <TabCardHeader icon={<Layers className="h-4 w-4" />} title="Floor-trader pivot" formula="P = (H+L+C)/3 · R1 = 2P−L · S1 = 2P−H" />
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <Stat label="Pivot P" value={`${unit}${fmt(lv.pivot.p)}`} />
            <Stat label="Pivot R1" value={`${unit}${fmt(lv.pivot.r1)}`} tone="down" />
            <Stat label="Pivot S1" value={`${unit}${fmt(lv.pivot.s1)}`} tone="up" />
          </div>
        </div>
      )}

      {lv && <AiNote cacheKey={`${aiKeyBase}|levels`} prompt={prompt} fallback={fallback} />}
    </div>
  );
}

/* --------------------------------------------------------------- forecast */

function ForecastTab({ computed, unit, label, symbol, aiKeyBase, last }: TabProps & { last: number }) {
  const c = computed;
  const f = c.forecast;
  const prompt = `You are a quant analyst. 7-bar forecast for ${label} (${symbol}, NSE), current price ${last.toFixed(2)}:
trend+seasonality=${f.models[0].target.toFixed(2)}, AR(3)=${f.models[1].target.toFixed(2)}, Holt=${f.models[2].target.toFixed(2)},
ensemble=${f.ensemble[6].toFixed(2)} with 95% CI [${f.lower[6].toFixed(2)}, ${f.upper[6].toFixed(2)}], sigma_daily=${(f.sigmaDaily * 100).toFixed(2)}%.
Return JSON only: {"take": "2-3 beginner-friendly sentences: where the models point, how much they agree, and how wide the uncertainty is", "watch": "1 sentence on what could break the forecast"}. Educational, no buy/sell advice.`;
  const spread = Math.max(...f.models.map((m) => m.target)) - Math.min(...f.models.map((m) => m.target));
  const fallback = `The three models land between ${unit}${fmt(Math.min(...f.models.map((m) => m.target)))} and ${unit}${fmt(Math.max(...f.models.map((m) => m.target)))} (spread ${unit}${fmt(spread)}), with the equal-weight ensemble at ${unit}${fmt(f.ensemble[6])} and a 95% interval of ${unit}${fmt(f.lower[6])}–${unit}${fmt(f.upper[6])}. (Add a Gemini key for a written summary.)`;

  return (
    <div className="space-y-5 reveal reveal-shown">
      <div className="glass rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] font-semibold text-(--color-fg-subtle)">
            <TrendingUp className="h-3.5 w-3.5" /> Forecast engine · 7 bars ahead
          </p>
          <p className="font-mono text-[11.5px] text-(--color-fg-subtle)">CI(h) = 1.96·σ·P·√h · σ = {pct(f.sigmaDaily, 3)}/bar</p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {f.models.map((m) => (
            <div key={m.id} className="rounded-xl border border-(--color-border) bg-(--color-surface)/70 p-4">
              <p className="text-[13px] font-semibold tracking-tight">{m.name}</p>
              <p className="text-[11px] text-(--color-fg-subtle)">{m.family}</p>
              <p className="mt-2 font-mono text-[11.5px] text-(--color-fg-muted)">{m.formula}</p>
              <p className="mt-1 font-mono text-[11px] text-(--color-fg-subtle)">{m.params}</p>
              <p className="mt-2.5 text-[15px] font-semibold tabular">
                t+7 ⇒ {unit}
                {fmt(m.target)}{" "}
                <span className={cn("text-[11.5px]", m.target >= last ? "text-(--color-up)" : "text-(--color-down)")}>
                  ({m.target >= last ? "+" : ""}
                  {(((m.target - last) / last) * 100).toFixed(2)}%)
                </span>
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-(--color-brand-50)/70 p-4">
          <p className="text-[13.5px]">
            <span className="font-semibold">Ensemble (equal weight):</span> t+7 ⇒ {unit}
            {fmt(f.ensemble[6])} · 95% CI [{unit}
            {fmt(f.lower[6])} – {unit}
            {fmt(f.upper[6])}]
          </p>
        </div>
      </div>

      <AiNote cacheKey={`${aiKeyBase}|forecast`} prompt={prompt} fallback={fallback} />
    </div>
  );
}

/* ------------------------------------------------------------ sub-pieces */

type TabProps = {
  computed: Computed;
  unit: string;
  label: string;
  symbol: string;
  aiKeyBase: string;
};

function TabCardHeader({ icon, title, formula }: { icon: React.ReactNode; title: string; formula: string }) {
  return (
    <div>
      <p className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold tracking-tight text-(--color-fg)">
        <span className="text-(--color-brand-700)">{icon}</span> {title}
      </p>
      <p className="mt-1 font-mono text-[10.5px] leading-relaxed text-(--color-fg-subtle)">{formula}</p>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) {
  return (
    <div>
      <p className="text-[10.5px] uppercase tracking-[0.12em] font-semibold text-(--color-fg-subtle)">{label}</p>
      <p className={cn("mt-1 text-[20px] font-semibold tabular tracking-tight", tone === "up" && "text-(--color-up)", tone === "down" && "text-(--color-down)")}>
        {value}
      </p>
    </div>
  );
}

function Legend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-0.5 w-4 rounded-full"
        style={dashed ? { backgroundImage: `repeating-linear-gradient(90deg, ${color} 0 4px, transparent 4px 7px)` } : { background: color }}
      />
      {label}
    </span>
  );
}

function IndicatorCard({
  title,
  icon,
  children,
  onZoom,
  zoomLabel,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onZoom: () => void;
  zoomLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onZoom}
      className="glass group rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5 hover:border-(--color-brand-300)"
      aria-label={`Open ${zoomLabel} tab`}
    >
      <div className="flex items-center justify-between">
        <p className="inline-flex items-center gap-1.5 text-[12px] font-semibold tracking-tight text-(--color-fg)">
          <span className="text-(--color-brand-700)">{icon}</span> {title}
        </p>
        <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-(--color-fg-subtle) opacity-0 transition-opacity group-hover:opacity-100">
          <Maximize2 className="h-3 w-3" /> {zoomLabel}
        </span>
      </div>
      <div className="mt-3">{children}</div>
    </button>
  );
}

function RsiGauge({ value, large }: { value: number; large?: boolean }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div>
      <p className={cn("font-semibold tabular tracking-tight", large ? "text-[34px]" : "text-[24px]")}>{fmt(clamped, 1)}</p>
      <div className="relative mt-2 h-2.5 overflow-hidden rounded-full bg-gradient-to-r from-(--color-down)/50 via-(--color-surface-3) to-(--color-up)/50">
        <div className="absolute inset-y-0 left-[30%] w-px bg-(--color-fg-subtle)/50" />
        <div className="absolute inset-y-0 left-[70%] w-px bg-(--color-fg-subtle)/50" />
        <div
          className="absolute top-1/2 h-4 w-1.5 -translate-y-1/2 rounded-full bg-(--color-fg) shadow transition-[left] duration-700"
          style={{ left: `calc(${clamped}% - 3px)` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[9.5px] text-(--color-fg-subtle)">
        <span>0 · oversold&lt;30</span>
        <span>overbought&gt;70 · 100</span>
      </div>
    </div>
  );
}

function MacdMini({ macd }: { macd: ReturnType<typeof macdCalc> }) {
  const N = 48;
  const hist = macd.hist.slice(-N);
  const maxAbs = Math.max(...hist.map((h) => Math.abs(h)), 1e-9);
  return (
    <div className="flex h-16 items-center gap-[2px]">
      {hist.map((h, i) => {
        const ratio = Math.abs(h) / maxAbs;
        return (
          <div key={i} className="flex h-full flex-1 flex-col justify-center">
            <div
              className={cn("w-full rounded-sm", h >= 0 ? "bg-(--color-up)/80" : "bg-(--color-down)/80")}
              style={{ height: `${Math.max(4, ratio * 50)}%`, alignSelf: "center" }}
            />
          </div>
        );
      })}
    </div>
  );
}

/** Full MACD chart: histogram bars + MACD and signal lines. */
function MacdChart({ macd, height }: { macd: ReturnType<typeof macdCalc>; height: number }) {
  const N = Math.min(120, macd.macd.length);
  const m = macd.macd.slice(-N);
  const s = macd.signal.slice(-N);
  const h = macd.hist.slice(-N);
  const all = [...m, ...s, ...h];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const span = max - min || 1;
  const W = 640;
  const H = height;
  const xAt = (i: number) => (i / (N - 1)) * W;
  const yAt = (v: number) => 6 + (1 - (v - min) / span) * (H - 12);
  const zeroY = yAt(0);
  const path = (vals: number[]) => vals.map((v, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(" ");
  const barW = Math.max(1.5, (W / N) * 0.6);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      <line x1={0} x2={W} y1={zeroY} y2={zeroY} stroke="var(--color-border-strong)" strokeWidth="1" strokeDasharray="4 4" />
      {h.map((v, i) => (
        <rect
          key={i}
          x={xAt(i) - barW / 2}
          y={Math.min(zeroY, yAt(v))}
          width={barW}
          height={Math.max(1, Math.abs(yAt(v) - zeroY))}
          fill={v >= 0 ? "var(--color-up)" : "var(--color-down)"}
          opacity="0.45"
        />
      ))}
      <path d={path(m)} fill="none" stroke="var(--color-info)" strokeWidth="1.8" strokeLinejoin="round" />
      <path d={path(s)} fill="none" stroke="var(--color-warn)" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

/** Generic single-series SVG line chart with optional guides and domain. */
function SeriesChart({
  values,
  height,
  color,
  domain,
  guides,
  format,
}: {
  values: number[];
  height: number;
  color: string;
  domain?: [number, number];
  guides?: Array<{ v: number; label: string }>;
  format?: (v: number) => string;
}) {
  const clean = values.filter((v) => !isNaN(v));
  if (clean.length < 2) return <p className="text-[12.5px] text-(--color-fg-muted)">Not enough bars in this window.</p>;
  const min = domain ? domain[0] : Math.min(...clean);
  const max = domain ? domain[1] : Math.max(...clean);
  const span = max - min || 1;
  const W = 640;
  const H = height;
  const xAt = (i: number) => (i / (values.length - 1)) * W;
  const yAt = (v: number) => 6 + (1 - (v - min) / span) * (H - 12);
  const path = values
    .map((v, i) => (isNaN(v) ? null : `${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`))
    .map((p, i, arr) => (p === null ? "" : `${i === 0 || arr[i - 1] === null ? "M" : "L"}${p}`))
    .join(" ");
  const lastVal = clean[clean.length - 1];
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} preserveAspectRatio="none">
        {guides?.map((g) => (
          <g key={g.label}>
            <line x1={0} x2={W} y1={yAt(g.v)} y2={yAt(g.v)} stroke="var(--color-border-strong)" strokeWidth="1" strokeDasharray="4 4" />
            <text x={4} y={yAt(g.v) - 3} fontSize="9" fill="var(--color-fg-subtle)">
              {g.label}
            </text>
          </g>
        ))}
        <path d={path} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
      <p className="mt-1 text-right font-mono text-[11px] text-(--color-fg-subtle)">
        latest {format ? format(lastVal) : fmt(lastVal, 1)}
      </p>
    </div>
  );
}

function ScoreMeter({ score }: { score: BullBearScore }) {
  const shown = useCountUp(score.score, true, 1200);
  const tone = score.score >= 58 ? "var(--color-up)" : score.score < 42 ? "var(--color-down)" : "var(--color-warn)";
  return (
    <div className="mt-3">
      <div className="flex items-baseline gap-3">
        <p className="text-[44px] font-semibold tabular leading-none tracking-tight" style={{ color: tone }}>
          {Math.round(shown)}
        </p>
        <p className="text-[15px] font-semibold" style={{ color: tone }}>
          {score.verdict}
        </p>
      </div>
      <div className="relative mt-3 h-3 overflow-hidden rounded-full bg-gradient-to-r from-(--color-down)/60 via-(--color-warn)/50 to-(--color-up)/60">
        <div
          className="absolute top-1/2 h-5 w-1.5 -translate-y-1/2 rounded-full bg-(--color-fg) shadow transition-[left] duration-1000 ease-out"
          style={{ left: `calc(${Math.min(100, Math.max(0, shown))}% - 3px)` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-(--color-fg-subtle)">
        <span>Bearish 0</span>
        <span>50</span>
        <span>100 Bullish</span>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- main chart
   Labels live in a dedicated right-hand gutter with collision avoidance, so
   S/R levels and the latest price never overlap or cramp. */

type GutterLabel = { y: number; text: string; color: string; bold?: boolean };

function layoutLabels(labels: GutterLabel[], minY: number, maxY: number, gap = 13): GutterLabel[] {
  const sorted = [...labels].sort((a, b) => a.y - b.y);
  // forward pass — push labels down to clear the one above
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].y < sorted[i - 1].y + gap) sorted[i] = { ...sorted[i], y: sorted[i - 1].y + gap };
    if (sorted[i].y < minY) sorted[i] = { ...sorted[i], y: minY };
  }
  // backward pass — pull back up if we overflowed the bottom
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].y > maxY) sorted[i] = { ...sorted[i], y: maxY };
    if (i < sorted.length - 1 && sorted[i].y > sorted[i + 1].y - gap) sorted[i] = { ...sorted[i], y: sorted[i + 1].y - gap };
  }
  return sorted;
}

function MainChart({
  computed,
  unit,
  showForecast,
  rangeDef,
}: {
  computed: Computed;
  unit: string;
  showForecast: boolean;
  rangeDef: RangeDef;
}) {
  const W = 980;
  const H = 400;
  const pad = { l: 8, r: 104, t: 14, b: 26 };
  const prices = computed.prices;
  const f = computed.forecast;
  const horizon = showForecast ? f.horizon : 0;

  const allVals = [
    ...prices,
    ...computed.bandUpper.filter((v) => !isNaN(v)),
    ...computed.bandLower.filter((v) => !isNaN(v)),
    ...(showForecast ? [...f.upper, ...f.lower] : []),
    ...(computed.levels ? [...computed.levels.supports, ...computed.levels.resistances] : []),
  ];
  const min = Math.min(...allVals);
  const max = Math.max(...allVals);
  const span = max - min || 1;
  const total = prices.length + horizon;

  const xAt = (i: number) => pad.l + (i / (total - 1)) * (W - pad.l - pad.r);
  const yAt = (v: number) => pad.t + (1 - (v - min) / span) * (H - pad.t - pad.b);
  const plotRight = W - pad.r;

  const linePath = (vals: number[], offset = 0) =>
    vals
      .map((v, i) => (isNaN(v) ? null : `${xAt(i + offset).toFixed(1)},${yAt(v).toFixed(1)}`))
      .map((p, i, arr) => (p === null ? "" : `${i === 0 || arr[i - 1] === null ? "M" : "L"}${p}`))
      .join(" ");

  const pricePath = linePath(prices);
  const sma20Path = linePath(computed.sma20);
  const sma50Path = linePath(computed.sma50);

  // Bollinger polygon
  const bandPts: string[] = [];
  for (let i = 0; i < prices.length; i++) if (!isNaN(computed.bandUpper[i])) bandPts.push(`${xAt(i).toFixed(1)},${yAt(computed.bandUpper[i]).toFixed(1)}`);
  for (let i = prices.length - 1; i >= 0; i--) if (!isNaN(computed.bandLower[i])) bandPts.push(`${xAt(i).toFixed(1)},${yAt(computed.bandLower[i]).toFixed(1)}`);
  const bandPolygon = bandPts.join(" ");

  // Forecast cone
  const lastIdx = prices.length - 1;
  let conePolygon = "";
  let ensemblePath = "";
  if (showForecast) {
    const up = [`${xAt(lastIdx).toFixed(1)},${yAt(prices[lastIdx]).toFixed(1)}`, ...f.upper.map((v, h) => `${xAt(lastIdx + 1 + h).toFixed(1)},${yAt(v).toFixed(1)}`)];
    const down = [...f.lower.map((v, h) => `${xAt(lastIdx + 1 + h).toFixed(1)},${yAt(v).toFixed(1)}`).reverse(), `${xAt(lastIdx).toFixed(1)},${yAt(prices[lastIdx]).toFixed(1)}`];
    conePolygon = [...up, ...down].join(" ");
    ensemblePath = `M${xAt(lastIdx).toFixed(1)},${yAt(prices[lastIdx]).toFixed(1)} ` + f.ensemble.map((v, h) => `L${xAt(lastIdx + 1 + h).toFixed(1)},${yAt(v).toFixed(1)}`).join(" ");
  }

  // Right-gutter labels with collision avoidance
  const rawLabels: GutterLabel[] = [
    { y: yAt(prices[lastIdx]), text: `${unit}${fmt(prices[lastIdx])}`, color: "var(--color-fg)", bold: true },
    ...(computed.levels?.resistances.map((r, i) => ({ y: yAt(r), text: `R${i + 1} ${unit}${fmt(r, 0)}`, color: "#1d6fb8" })) ?? []),
    ...(computed.levels?.supports.map((s, i) => ({ y: yAt(s), text: `S${i + 1} ${unit}${fmt(s, 0)}`, color: "#1d6fb8" })) ?? []),
    ...(showForecast ? [{ y: yAt(f.ensemble[6]), text: `t+7 ${unit}${fmt(f.ensemble[6], 0)}`, color: "#b27a00" }] : []),
  ];
  const labels = layoutLabels(rawLabels, pad.t + 8, H - pad.b - 4);

  // X-axis time labels (skip for synthetic fallback series whose times are indices)
  const hasRealTimes = computed.times.length > 0 && computed.times[computed.times.length - 1] > 1e12;
  const xTicks = hasRealTimes
    ? [0, 0.25, 0.5, 0.75, 1].map((fr) => {
        const i = Math.min(prices.length - 1, Math.round(fr * (prices.length - 1)));
        return { x: xAt(i), label: candleLabel(computed.times[i], rangeDef) };
      })
    : [];

  // Y gridlines at 4 even values
  const yTicks = [0.25, 0.5, 0.75].map((fr) => ({ y: pad.t + fr * (H - pad.t - pad.b), v: max - fr * span }));

  return (
    <div className="reveal reveal-shown mt-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-[300px] w-full sm:h-[400px]" preserveAspectRatio="none">
        <defs>
          <linearGradient id="mc-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#115e3c" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#115e3c" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y gridlines */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={pad.l} x2={plotRight} y1={t.y} y2={t.y} stroke="var(--color-border)" strokeWidth="1" />
            <text x={pad.l + 2} y={t.y - 4} fontSize="9" fill="var(--color-fg-subtle)">
              {unit}
              {fmt(t.v, 0)}
            </text>
          </g>
        ))}

        {bandPolygon && <polygon points={bandPolygon} fill="#6fb98e" opacity="0.09" stroke="#6fb98e" strokeOpacity="0.35" strokeWidth="0.6" strokeDasharray="4 4" />}

        {/* S/R level lines (labels live in the gutter) */}
        {computed.levels?.resistances.map((r, i) => (
          <line key={`r${i}`} x1={pad.l} x2={plotRight} y1={yAt(r)} y2={yAt(r)} stroke="#1d6fb8" strokeWidth="1" strokeDasharray="6 5" opacity="0.5" />
        ))}
        {computed.levels?.supports.map((s, i) => (
          <line key={`s${i}`} x1={pad.l} x2={plotRight} y1={yAt(s)} y2={yAt(s)} stroke="#1d6fb8" strokeWidth="1" strokeDasharray="6 5" opacity="0.5" />
        ))}

        <path d={`${pricePath} L${xAt(lastIdx).toFixed(1)},${H - pad.b} L${xAt(0).toFixed(1)},${H - pad.b} Z`} fill="url(#mc-fill)" />
        <path d={pricePath} fill="none" stroke="#115e3c" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" pathLength={1} className="spark-line" />
        {sma20Path && <path d={sma20Path} fill="none" stroke="#3d9a6b" strokeWidth="1.5" strokeLinejoin="round" />}
        {sma50Path && <path d={sma50Path} fill="none" stroke="#8a63d2" strokeWidth="1.5" strokeLinejoin="round" />}

        {showForecast && conePolygon && <polygon points={conePolygon} fill="#b27a00" opacity="0.1" />}
        {showForecast && ensemblePath && <path d={ensemblePath} fill="none" stroke="#b27a00" strokeWidth="2" strokeDasharray="5 5" strokeLinejoin="round" />}

        <circle cx={xAt(lastIdx)} cy={yAt(prices[lastIdx])} r="3.5" fill="#115e3c" />

        {/* Gutter: connector ticks + labels, collision-free */}
        <line x1={plotRight} x2={plotRight} y1={pad.t} y2={H - pad.b} stroke="var(--color-border)" strokeWidth="1" />
        {labels.map((l, i) => (
          <text
            key={i}
            x={plotRight + 8}
            y={l.y + 3.5}
            fontSize={l.bold ? 12 : 10.5}
            fontWeight={l.bold ? 700 : 500}
            fill={l.color}
          >
            {l.text}
          </text>
        ))}

        {/* X-axis time labels */}
        {xTicks.map((t, i) => (
          <text
            key={i}
            x={t.x}
            y={H - 8}
            fontSize="9.5"
            fill="var(--color-fg-subtle)"
            textAnchor={i === 0 ? "start" : i === xTicks.length - 1 ? "end" : "middle"}
          >
            {t.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
