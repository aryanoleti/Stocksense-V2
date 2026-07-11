"use client";

// First-visit walkthrough for the Quant Engine. Shows once per account
// (keyed by the signed-in email in localStorage) and steps through what the
// engine is and how to read each part of it.

import { useEffect, useState } from "react";
import { Cpu, Database, LayoutDashboard, LineChart, Gauge, Sparkles, X, ArrowRight, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { cn } from "@/lib/cn";

const KEY_PREFIX = "stocksense.quant.tour.v1.";

const STEPS = [
  {
    icon: Cpu,
    title: "Welcome to the Quant Engine",
    body: "This is StockSense's transparent financial-analysis model. It takes real NSE prices and runs them through the same mathematics professional analysts use — moving averages, momentum oscillators, volatility measures and statistical forecasts. Nothing is a black box: every formula, fitted parameter and calculation is shown on screen so you can check the working yourself.",
  },
  {
    icon: Database,
    title: "The four-stage pipeline",
    body: "Each analysis flows through four stages, shown at the top: Market data (live closes are fetched for your chosen stock and time range), Indicator engine (RSI, MACD, moving averages, Bollinger bands, ATR and support/resistance are computed), Forecast engine (three independent statistical models project the next 7 bars with a confidence interval), and AI analysis (a plain-English read of all the numbers).",
  },
  {
    icon: LayoutDashboard,
    title: "Organised into tabs",
    body: "The analysis is split into five tabs. Overview shows the full annotated chart and the headline signals. Momentum zooms into RSI, MACD and the fitted trend. Volatility covers ATR, return volatility and Bollinger position. Levels maps the support/resistance ladder around the current price. Forecast details the three models and their ensemble. Clicking any indicator card on the Overview jumps straight into its tab.",
  },
  {
    icon: LineChart,
    title: "Reading the main chart",
    body: "The dark green line is the closing price. SMA 20 and SMA 50 are smoothed averages — crossovers between them are classic trend signals. The shaded band is the 2σ Bollinger envelope. The orange dashed line is the 7-bar ensemble forecast with its widening confidence cone, and the blue dashed lines mark computed support and resistance levels. All price labels sit in the right-hand column.",
  },
  {
    icon: Gauge,
    title: "The verdict — and a caveat",
    body: "The bull/bear score adds up transparent, rules-based points across seven signals and scales them to 0–100; every point is itemised so you can see exactly why. The AI summary translates the math into plain English. Both are educational tools built on live data — they are not investment advice, and no model predicts markets reliably. Use them to understand what you're looking at, then do your own research.",
  },
];

export function QuantTour() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const storageKey = KEY_PREFIX + (user?.email ?? "anon");

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(storageKey)) setOpen(true);
    } catch {
      /* noop */
    }
  }, [storageKey]);

  function finish() {
    try {
      window.localStorage.setItem(storageKey, String(Date.now()));
    } catch {
      /* noop */
    }
    setOpen(false);
  }

  if (!open) return null;
  const s = STEPS[step];
  const Icon = s.icon;
  const lastStep = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Quant Engine walkthrough">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-xl)">
        <div className="flex items-center justify-between border-b border-(--color-border) px-6 py-4">
          <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] font-semibold text-(--color-fg-subtle)">
            <Sparkles className="h-3.5 w-3.5 text-(--color-brand-600)" /> Quant Engine · quick tour
          </p>
          <button type="button" onClick={finish} aria-label="Skip tour" className="text-(--color-fg-subtle) hover:text-(--color-fg)">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="px-6 py-6">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-(--color-brand-50) text-(--color-brand-700)">
            <Icon className="h-5.5 w-5.5" />
          </span>
          <h2 className="mt-4 text-[20px] font-semibold tracking-tight">{s.title}</h2>
          <p className="mt-2.5 text-[14px] leading-relaxed text-(--color-fg-muted)">{s.body}</p>
        </div>

        <div className="flex items-center justify-between border-t border-(--color-border) bg-(--color-surface-2)/60 px-6 py-4">
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={cn("h-1.5 rounded-full transition-all", i === step ? "w-5 bg-(--color-brand-600)" : "w-1.5 bg-(--color-border-strong)")}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {step === 0 ? (
              <button type="button" onClick={finish} className="rounded-xl px-3.5 py-2 text-[13px] font-semibold text-(--color-fg-muted) hover:bg-(--color-surface-2)">
                Skip
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep((v) => v - 1)}
                className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-semibold text-(--color-fg-muted) hover:bg-(--color-surface-2)"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
            )}
            <button
              type="button"
              onClick={() => (lastStep ? finish() : setStep((v) => v + 1))}
              className="inline-flex items-center gap-1.5 rounded-xl bg-(--color-brand-700) px-4 py-2 text-[13px] font-semibold text-white hover:bg-(--color-brand-800)"
            >
              {lastStep ? "Start analysing" : "Next"}
              {!lastStep && <ArrowRight className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
