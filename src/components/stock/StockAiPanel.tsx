"use client";

// Auto AI read for a stock (runs on open, before the user asks anything),
// plus built-in prompt chips that deep-link into Ask AI, and an inline compare
// picker so you don't have to switch tabs and re-enter the stock.

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Activity, ArrowRight, Bot, Scale, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardEyebrow } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getQuote } from "@/lib/api/yahoo";
import { generateJson, hasGeminiKey } from "@/lib/api/gemini";
import { NIFTY_50, type Stock } from "@/lib/mock-data";

type Take = { summary: string; bullets: string[]; risks: string[] };
const cache = new Map<string, Take>();

function askHref(prompt: string) {
  return `/ask-ai/?q=${encodeURIComponent(prompt)}`;
}

export function StockAiPanel({
  symbol,
  name,
  curated,
}: {
  symbol: string;
  name: string;
  curated?: Stock;
}) {
  const [take, setTake] = useState<Take | null>(cache.get(symbol) ?? null);
  const [state, setState] = useState<"idle" | "loading" | "done" | "off">(cache.has(symbol) ? "done" : "idle");

  useEffect(() => {
    if (cache.has(symbol)) {
      setTake(cache.get(symbol)!);
      setState("done");
      return;
    }
    if (!hasGeminiKey()) {
      setState("off");
      return;
    }
    let cancelled = false;
    setState("loading");
    (async () => {
      const q = await getQuote(symbol);
      if (cancelled) return;
      const facts = [
        `Stock: ${name} (${symbol}, NSE)`,
        q ? `live price ₹${q.price.toFixed(2)}, day ${q.changePct.toFixed(2)}%` : "",
        curated ? `P/E ${curated.peRatio}, EPS ₹${curated.eps}, div yield ${curated.dividendYield}%, beta ${curated.beta}, mkt cap ₹${curated.marketCap} Cr, sector ${curated.sector}` : "",
      ]
        .filter(Boolean)
        .join("; ");
      const prompt = `You are a markets analyst. Give a concise, balanced read on this stock for an Indian retail investor. Data: ${facts}.
Return JSON only: {"summary": "2-3 plain-English sentences on what this company is and how it looks right now, referencing the numbers", "bullets": ["2-3 short positives"], "risks": ["2-3 short risks"]}. Educational, no explicit buy/sell advice.`;
      const res = await generateJson<Take>([{ role: "user", parts: [{ text: prompt }] }], { temperature: 0.4 });
      if (cancelled) return;
      if (res?.summary) {
        cache.set(symbol, res);
        setTake(res);
        setState("done");
      } else {
        setState("off");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [symbol, name, curated]);

  const prompts = [
    `Is ${symbol} a good buy right now?`,
    `Explain ${name}'s valuation in simple terms`,
    `What are the main risks in ${symbol}?`,
    `How has ${symbol} performed recently and why?`,
  ];

  return (
    <div className="space-y-5">
      <Card padding="md" className="border-(--color-brand-100) bg-(--color-brand-50)/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-(--color-brand-700) text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <CardEyebrow className="text-(--color-brand-700)">AI research</CardEyebrow>
          </div>
          {state === "done" && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-(--color-brand-700)">
              <Activity className="h-3 w-3" /> Gemini
            </span>
          )}
        </div>

        {state === "loading" && (
          <p className="mt-4 inline-flex items-center gap-2 text-[13.5px] text-(--color-fg-muted)">
            <span className="h-2 w-2 animate-pulse-dot rounded-full bg-(--color-brand-500)" /> Reading {symbol} for you…
          </p>
        )}

        {state === "done" && take && (
          <div className="mt-3 space-y-3">
            <p className="text-[14px] leading-relaxed text-(--color-fg)">{take.summary}</p>
            {take.bullets?.length > 0 && (
              <ul className="space-y-1.5">
                {take.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-(--color-fg)">
                    <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-(--color-up)" /> {b}
                  </li>
                ))}
              </ul>
            )}
            {take.risks?.length > 0 && (
              <ul className="space-y-1.5">
                {take.risks.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-(--color-fg)">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-(--color-down)" /> {r}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {state === "off" && (
          <p className="mt-3 text-[13.5px] leading-relaxed text-(--color-fg-muted)">
            Ask Sense for a live read on {name} — recent momentum, peer comparison, and the risks worth knowing.
            {!hasGeminiKey() && " (Add a Gemini key to auto-generate a summary.)"}
          </p>
        )}

        {/* Built-in prompt chips */}
        <div className="mt-4 border-t border-(--color-brand-100) pt-3">
          <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-(--color-fg-subtle)">Ask about {symbol}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {prompts.map((p) => (
              <Link
                key={p}
                href={askHref(p)}
                className="rounded-full border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-[12px] font-medium text-(--color-fg-muted) hover:border-(--color-brand-300) hover:text-(--color-brand-700)"
              >
                {p}
              </Link>
            ))}
          </div>
          <Button href={askHref(`Give me a full analysis of ${name} (${symbol})`)} variant="subtle" size="sm" className="mt-3">
            <Bot className="h-3.5 w-3.5" /> Open in Ask AI <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </Card>

      {curated && <InlineCompare symbol={symbol} />}
    </div>
  );
}

function InlineCompare({ symbol }: { symbol: string }) {
  const others = NIFTY_50.filter((s) => s.symbol !== symbol);
  const [other, setOther] = useState(others[0]?.symbol ?? "");
  return (
    <Card padding="md">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-(--color-brand-50) text-(--color-brand-700)">
          <Scale className="h-4 w-4" />
        </span>
        <CardEyebrow>Compare {symbol} with…</CardEyebrow>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value={other}
          onChange={(e) => setOther(e.target.value)}
          className="h-10 flex-1 min-w-[160px] rounded-xl border border-(--color-border-strong) bg-(--color-surface) px-3 text-[14px] font-medium text-(--color-fg) focus:border-(--color-brand-500) focus:outline-none"
        >
          {others.map((s) => (
            <option key={s.symbol} value={s.symbol}>
              {s.name} ({s.symbol})
            </option>
          ))}
        </select>
        <Link
          href={`/compare/?a=${symbol}&b=${other}`}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-(--color-brand-700) px-4 text-[13.5px] font-semibold text-white hover:bg-(--color-brand-800)"
        >
          Compare <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <p className="mt-2 text-[11.5px] text-(--color-fg-subtle)">Head-to-head chart, fundamentals scorecard and an AI verdict.</p>
    </Card>
  );
}
