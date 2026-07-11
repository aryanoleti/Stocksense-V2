"use client";

// First-visit tour of the whole workspace. Shows once per account (keyed by
// the signed-in email) and walks through every StockSense feature.

import { useEffect, useState } from "react";
import {
  Sparkles,
  LayoutDashboard,
  CandlestickChart,
  Scale,
  Briefcase,
  Bot,
  Sigma,
  SlidersHorizontal,
  X,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { cn } from "@/lib/cn";

const KEY_PREFIX = "stocksense.app.tour.v1.";

const STEPS = [
  {
    icon: Sparkles,
    title: "Welcome to StockSense",
    body: "Your research workspace for the Indian market: live prices for 2,350+ NSE stocks and 325+ ETFs, institutional-grade charts, an AI copilot, a transparent quant engine and portfolio tracking — all in one place. This quick tour shows you where everything lives.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard & Market",
    body: "The Dashboard is your home base — an AI brief of today's market, the major indices updating live (click any index card for its full chart and analysis), top gainers and losers, and quick search. The Market tab goes deeper with sector performance and index breakdowns.",
  },
  {
    icon: CandlestickChart,
    title: "Stocks & ETFs",
    body: "Browse every NSE-listed equity and ETF with live prices. Open any stock for its price chart (ranges from 1 day to max history), key metrics, 52-week range, an automatic AI read on the stock, and quick compare — everything updates live while you watch.",
  },
  {
    icon: Scale,
    title: "Compare desk",
    body: "Put any two Nifty 50 companies head-to-head: normalized price performance, six fundamentals scored side by side, and an AI verdict on which looks stronger right now — with its reasons and risks itemised.",
  },
  {
    icon: Briefcase,
    title: "Portfolio & Watchlist",
    body: "The Portfolio tab has two modes: My Holdings tracks the stocks you actually own (enter your real average buy price and watch live value and P&L), and the Simulator gives you ₹5,00,000 in virtual cash to practise with — risk-free. The Watchlist keeps stocks you're following one click away.",
  },
  {
    icon: Bot,
    title: "Ask AI & the Quant Engine",
    body: "Sense, the AI copilot, answers questions about any stock in plain English — you can even paste screenshots of charts into the chat. The Quant Engine runs live prices through transparent mathematics (it has its own guided tour the first time you open it).",
  },
  {
    icon: SlidersHorizontal,
    title: "Make it yours",
    body: "In the top bar you can switch between light and dark mode, and choose how often prices refresh (0.5s to 15s). One honest note: StockSense is a research and education tool, not a broker and not financial advice — when you're ready to trade, use a SEBI-registered broker.",
  },
];

export function AppTour() {
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
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="StockSense tour">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-xl)">
        <div className="flex items-center justify-between border-b border-(--color-border) px-6 py-4">
          <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] font-semibold text-(--color-fg-subtle)">
            <Sparkles className="h-3.5 w-3.5 text-(--color-brand-600)" /> Getting started · {step + 1}/{STEPS.length}
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
              {lastStep ? "Start exploring" : "Next"}
              {!lastStep && <ArrowRight className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
