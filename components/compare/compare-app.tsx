"use client";

import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Bot, Loader2, Plus, X, Sparkles, AlertCircle } from "lucide-react";
import { NIFTY_50 } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { StockQuote } from "@/services/stock.service";
import type { ComparisonInsight } from "@/services/ai.service";

const MAX_STOCKS = 4;
const MIN_STOCKS = 2;

const LINE_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

function toTicker(symbol: string) {
  return `${symbol}.NS`;
}

function fmtCap(n?: number) {
  if (!n) return "—";
  if (n >= 1e12) return `₹${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `₹${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function StockPicker({
  selected,
  onAdd,
}: {
  selected: string[];
  onAdd: (symbol: string) => void;
}) {
  const [query, setQuery] = useState("");

  const options = useMemo(
    () =>
      NIFTY_50.filter(
        (s) =>
          !selected.includes(s.symbol) &&
          (s.symbol.toLowerCase().includes(query.toLowerCase()) ||
            s.name.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 8),
    [query, selected]
  );

  return (
    <div className="relative">
      <input
        list="compare-stock-options"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const match = NIFTY_50.find(
              (s) => s.symbol.toLowerCase() === query.toLowerCase()
            );
            if (match && !selected.includes(match.symbol)) {
              onAdd(match.symbol);
              setQuery("");
            }
          }
        }}
        placeholder="Search a stock to add (e.g. TCS, Reliance)..."
        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <datalist id="compare-stock-options">
        {options.map((s) => (
          <option key={s.symbol} value={s.symbol}>
            {s.name}
          </option>
        ))}
      </datalist>

      {query && options.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-lg shadow-xl overflow-hidden">
          {options.map((s) => (
            <button
              key={s.symbol}
              onClick={() => {
                onAdd(s.symbol);
                setQuery("");
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
            >
              <span className="text-foreground font-medium">{s.symbol}</span>
              <span className="text-muted-foreground text-xs truncate ml-2">{s.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MetricsTable({ quotes, symbols }: { quotes: (StockQuote | undefined)[]; symbols: string[] }) {
  const rows: { label: string; render: (q?: StockQuote) => string }[] = [
    { label: "Price", render: (q) => (q ? `₹${q.price?.toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : "—") },
    {
      label: "Day Change",
      render: (q) => (q ? `${q.changePercent >= 0 ? "+" : ""}${q.changePercent?.toFixed(2)}%` : "—"),
    },
    { label: "Market Cap", render: (q) => fmtCap(q?.marketCap) },
    { label: "P/E Ratio", render: (q) => (q?.pe ? q.pe.toFixed(2) : "—") },
    { label: "EPS", render: (q) => (q?.eps ? `₹${q.eps.toFixed(2)}` : "—") },
    { label: "52W High", render: (q) => (q?.week52High ? `₹${q.week52High.toFixed(2)}` : "—") },
    { label: "52W Low", render: (q) => (q?.week52Low ? `₹${q.week52Low.toFixed(2)}` : "—") },
  ];

  return (
    <div className="card-glass p-5 overflow-x-auto">
      <h3 className="text-sm font-semibold text-foreground mb-4">Metrics Comparison</h3>
      <table className="w-full text-sm min-w-[500px]">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left text-xs text-muted-foreground font-medium py-2">Metric</th>
            {symbols.map((sym) => (
              <th key={sym} className="text-right text-xs text-muted-foreground font-medium py-2">
                {sym}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-border/50 last:border-0">
              <td className="py-2.5 text-muted-foreground">{row.label}</td>
              {quotes.map((q, i) => (
                <td key={symbols[i]} className="py-2.5 text-right font-mono font-medium text-foreground">
                  {row.render(q)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AIVerdictCard({ symbols, quotes }: { symbols: string[]; quotes: (StockQuote | undefined)[] }) {
  const [insight, setInsight] = useState<ComparisonInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canRequest = quotes.every((q) => !!q) && symbols.length >= MIN_STOCKS;

  async function getVerdict() {
    if (!canRequest) return;
    setLoading(true);
    setError(null);
    try {
      const stocks = quotes.map((q, i) => {
        const nifty = NIFTY_50.find((s) => s.symbol === symbols[i]);
        return {
          ticker: q!.ticker,
          name: q!.name,
          price: q!.price,
          changePercent: q!.changePercent,
          marketCap: q!.marketCap,
          pe: q!.pe,
          dividendYield: nifty?.dividendYield,
          eps: q!.eps,
          beta: nifty?.beta,
          week52High: q!.week52High,
          week52Low: q!.week52Low,
          sector: q!.sector,
        };
      });

      const res = await fetch("/api/ai/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stocks }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setInsight(data);
    } catch {
      setError("Couldn't generate AI verdict. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card-glass p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">AI Verdict</h3>
        </div>
        <button
          onClick={getVerdict}
          disabled={!canRequest || loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/15 text-primary text-xs font-medium hover:bg-primary/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {insight ? "Regenerate" : "Get AI Verdict"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-400/10 rounded-lg p-3 mb-3">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {!insight && !loading && !error && (
        <p className="text-sm text-muted-foreground">
          Click "Get AI Verdict" for an educational comparison of the selected stocks.
        </p>
      )}

      {insight && (
        <div className="space-y-4">
          <div className="bg-muted rounded-lg p-3">
            <p className="text-sm text-foreground font-medium">{insight.verdict}</p>
            {insight.reasoning && (
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{insight.reasoning}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {insight.stocks?.map((s) => (
              <div key={s.ticker} className="border border-border rounded-lg p-3">
                <p className="text-sm font-semibold text-foreground mb-2">{s.ticker.replace(".NS", "")}</p>
                {s.strengths?.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-green-400 font-medium mb-1">Strengths</p>
                    <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
                      {s.strengths.map((str, i) => <li key={i}>{str}</li>)}
                    </ul>
                  </div>
                )}
                {s.risks?.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-red-400 font-medium mb-1">Risks</p>
                    <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
                      {s.risks.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                )}
                {s.suitedFor && (
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-foreground font-medium">Suited for: </span>
                    {s.suitedFor}
                  </p>
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Educational only — not financial advice. Always do your own research.
          </p>
        </div>
      )}
    </div>
  );
}

export function CompareApp() {
  const [symbols, setSymbols] = useState<string[]>([]);

  const tickers = symbols.map(toTicker);

  const quoteQueries = useQueries({
    queries: tickers.map((ticker) => ({
      queryKey: ["quote", ticker],
      queryFn: () => fetch(`/api/stocks/${ticker}/quote`).then((r) => r.json()) as Promise<StockQuote>,
      refetchInterval: 30_000,
    })),
  });

  const candleQueries = useQueries({
    queries: tickers.map((ticker) => ({
      queryKey: ["candles-compare", ticker],
      queryFn: async () => {
        const to = Math.floor(Date.now() / 1000);
        const from = to - 90 * 86400;
        const res = await fetch(`/api/stocks/${ticker}/candles?from=${from}&to=${to}&resolution=D`);
        return res.json();
      },
    })),
  });

  const quotes = quoteQueries.map((q) => q.data as StockQuote | undefined);

  // Build merged chart data keyed by date
  const chartData = useMemo(() => {
    const allDates = new Map<string, any>();
    candleQueries.forEach((cq, i) => {
      const candles = (cq.data as any[]) || [];
      candles.forEach((c) => {
        const dateKey = format(new Date(c.time), "MMM d");
        if (!allDates.has(dateKey)) allDates.set(dateKey, { date: dateKey });
        allDates.get(dateKey)[symbols[i]] = c.close;
      });
    });
    return Array.from(allDates.values());
  }, [candleQueries, symbols]);

  function addSymbol(symbol: string) {
    if (symbols.length >= MAX_STOCKS) return;
    setSymbols((prev) => [...prev, symbol]);
  }

  function removeSymbol(symbol: string) {
    setSymbols((prev) => prev.filter((s) => s !== symbol));
  }

  return (
    <div className="space-y-6">
      {/* Picker */}
      <div className="card-glass p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Select Stocks (2–4)</h3>
          <span className="text-xs text-muted-foreground">{symbols.length}/{MAX_STOCKS}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <AnimatePresence>
            {symbols.map((symbol, i) => (
              <motion.span
                key={symbol}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                style={{
                  borderColor: LINE_COLORS[i % LINE_COLORS.length],
                  color: LINE_COLORS[i % LINE_COLORS.length],
                }}
              >
                {symbol}
                <button onClick={() => removeSymbol(symbol)} className="hover:opacity-70">
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        {symbols.length < MAX_STOCKS ? (
          <StockPicker selected={symbols} onAdd={addSymbol} />
        ) : (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Plus className="w-3 h-3" /> Maximum of {MAX_STOCKS} stocks reached — remove one to add another.
          </p>
        )}
      </div>

      {symbols.length >= MIN_STOCKS && (
        <>
          {/* Chart */}
          <div className="card-glass p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Price History (90 days)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v.toFixed(0)}`}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                    formatter={(val: any) => (val ? `₹${Number(val).toFixed(2)}` : "—")}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {symbols.map((symbol, i) => (
                    <Line
                      key={symbol}
                      type="monotone"
                      dataKey={symbol}
                      stroke={LINE_COLORS[i % LINE_COLORS.length]}
                      strokeWidth={1.75}
                      dot={false}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Metrics table */}
          <MetricsTable quotes={quotes} symbols={symbols} />

          {/* AI Verdict */}
          <AIVerdictCard symbols={symbols} quotes={quotes} />
        </>
      )}

      {symbols.length < MIN_STOCKS && (
        <div className="card-glass p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Select at least {MIN_STOCKS} stocks above to see the comparison.
          </p>
        </div>
      )}
    </div>
  );
}
