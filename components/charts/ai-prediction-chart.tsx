"use client";

import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend
} from "recharts";
import { motion } from "framer-motion";
import { Bot, TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Prediction {
  signal: "BUY" | "SELL" | "HOLD";
  confidence: number;
  sma20: number;
  sma50: number;
  rsi: number;
  summary: string;
  predictions: {
    date: string;
    predicted: number;
    lower: number;
    upper: number;
  }[];
}

interface Props {
  ticker: string;
  historicalData: any[];
  prediction: Prediction;
}

const SignalIcon = {
  BUY: TrendingUp,
  SELL: TrendingDown,
  HOLD: Minus,
};

const SignalColors = {
  BUY: "text-green-400",
  SELL: "text-red-400",
  HOLD: "text-yellow-400",
};

const SignalBg = {
  BUY: "bg-green-400/10 border-green-400/20",
  SELL: "bg-red-400/10 border-red-400/20",
  HOLD: "bg-yellow-400/10 border-yellow-400/20",
};

export function AIPredictionChart({ ticker, historicalData, prediction }: Props) {
  const SigIcon = SignalIcon[prediction.signal];

  // Merge historical + prediction data
  const historical = historicalData.slice(-14).map((d) => ({
    date: format(new Date(d.time), "MMM d"),
    actual: d.close,
    predicted: null,
    lower: null,
    upper: null,
  }));

  const futurePoints = prediction.predictions.map((p) => ({
    date: format(new Date(p.date), "MMM d"),
    actual: null,
    predicted: p.predicted,
    lower: p.lower,
    upper: p.upper,
  }));

  // Bridge point
  const lastActual = historical[historical.length - 1];
  if (lastActual && futurePoints.length > 0) {
    futurePoints[0] = {
      ...futurePoints[0],
      actual: lastActual.actual,
    };
  }

  const chartData = [...historical, ...futurePoints];
  const todayLine = historical[historical.length - 1]?.date;

  const allValues = chartData.flatMap((d) => [d.actual, d.predicted, d.lower, d.upper].filter(Boolean) as number[]);
  const minY = Math.min(...allValues) * 0.995;
  const maxY = Math.max(...allValues) * 1.005;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glass p-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">AI Price Prediction</h3>
            <p className="text-xs text-muted-foreground">Based on technical analysis — 7-day forecast</p>
          </div>
        </div>

        {/* Signal badge */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg border",
          SignalBg[prediction.signal]
        )}>
          <SigIcon className={cn("w-4 h-4", SignalColors[prediction.signal])} />
          <span className={cn("text-sm font-bold", SignalColors[prediction.signal])}>
            {prediction.signal}
          </span>
          <span className="text-xs text-muted-foreground">
            {prediction.confidence}% confidence
          </span>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Signal Confidence</span>
          <span className="font-mono">{prediction.confidence}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${prediction.confidence}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={cn("h-full rounded-full", {
              "bg-green-400": prediction.signal === "BUY",
              "bg-red-400": prediction.signal === "SELL",
              "bg-yellow-400": prediction.signal === "HOLD",
            })}
          />
        </div>
      </div>

      {/* Chart */}
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              interval={2}
            />
            <YAxis
              domain={[minY, maxY]}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${v.toFixed(0)}`}
              width={60}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 11,
              }}
              formatter={(val: any, name: string) => {
                if (!val) return [null, null];
                const labels: Record<string, string> = {
                  actual: "Actual Price",
                  predicted: "AI Predicted",
                  upper: "Upper Band",
                  lower: "Lower Band",
                };
                return [`₹${Number(val).toFixed(2)}`, labels[name] || name];
              }}
            />
            {/* Today divider */}
            {todayLine && (
              <ReferenceLine
                x={todayLine}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="4 4"
                label={{ value: "Today", position: "top", fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              />
            )}
            {/* Prediction band */}
            <Area
              type="monotone"
              dataKey="upper"
              stroke="transparent"
              fill="url(#predGrad)"
              legendType="none"
            />
            <Area
              type="monotone"
              dataKey="lower"
              stroke="transparent"
              fill="hsl(var(--background))"
              legendType="none"
            />
            {/* Actual price line */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="hsl(var(--foreground))"
              strokeWidth={1.5}
              dot={false}
              connectNulls={false}
              name="actual"
            />
            {/* AI prediction line */}
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#22c55e"
              strokeWidth={1.5}
              strokeDasharray="5 3"
              dot={{ r: 3, fill: "#22c55e" }}
              connectNulls={false}
              name="predicted"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Technical indicators */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="bg-muted rounded-lg p-2.5">
          <p className="text-xs text-muted-foreground">SMA 20</p>
          <p className="font-mono text-sm font-semibold text-foreground">
            ₹{prediction.sma20.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-muted rounded-lg p-2.5">
          <p className="text-xs text-muted-foreground">SMA 50</p>
          <p className="font-mono text-sm font-semibold text-foreground">
            ₹{prediction.sma50.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-muted rounded-lg p-2.5">
          <p className="text-xs text-muted-foreground">RSI (14)</p>
          <p className={cn("font-mono text-sm font-semibold", {
            "text-green-400": prediction.rsi < 30,
            "text-red-400": prediction.rsi > 70,
            "text-foreground": prediction.rsi >= 30 && prediction.rsi <= 70,
          })}>
            {prediction.rsi}
          </p>
        </div>
      </div>

      {/* AI summary */}
      <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground bg-muted rounded-lg p-3">
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-primary" />
        <p>
          <span className="text-foreground font-medium">AI Analysis: </span>
          {prediction.summary}. This is not financial advice — always do your own research.
        </p>
      </div>
    </motion.div>
  );
}
