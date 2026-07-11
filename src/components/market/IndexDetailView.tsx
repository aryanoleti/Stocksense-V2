"use client";

// Full page for a market index: live level, chart with all ranges, an AI
// summary grounded in the live move, and a jump into the quant engine.

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Sigma, ArrowRight, Activity } from "lucide-react";
import { Card, CardEyebrow } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LiveDot } from "@/components/ui/Badge";
import { Delta } from "@/components/ui/Delta";
import { PriceChart } from "@/components/stock/PriceChart";
import { useLivePrice } from "@/lib/use-live-prices";
import { generateJson, hasGeminiKey } from "@/lib/api/gemini";
import { formatINR } from "@/lib/format";

type Take = { summary: string; watch: string };
const cache = new Map<string, Take>();

export function IndexDetailView({ symbol, name, base }: { symbol: string; name: string; base: number }) {
  const tick = useLivePrice(symbol, base, 0.0015);
  const [take, setTake] = useState<Take | null>(cache.get(symbol) ?? null);
  const [loading, setLoading] = useState(false);
  const ready = tick.price !== base || tick.changePct !== 0;

  useEffect(() => {
    if (take || loading || !ready || !hasGeminiKey()) return;
    setLoading(true);
    const prompt = `You are a markets editor. The ${name} index (NSE/BSE, India) is at ${tick.price.toFixed(2)}, ${tick.changePct >= 0 ? "up" : "down"} ${Math.abs(tick.changePct).toFixed(2)}% today (${tick.change >= 0 ? "+" : ""}${tick.change.toFixed(2)} points).
Return JSON only: {"summary": "2-3 plain-English sentences on what this index tracks and how it's moving today, referencing the numbers", "watch": "1 sentence on what typically drives this index"}. Educational, no advice.`;
    generateJson<Take>([{ role: "user", parts: [{ text: prompt }] }], { temperature: 0.4 }).then((res) => {
      if (res?.summary) {
        cache.set(symbol, res);
        setTake(res);
      }
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-(--color-fg-subtle)">
              Index · {symbol}
            </p>
            <h1 className="mt-1 text-[32px] font-semibold tracking-tight">{name}</h1>
          </div>
          <div className="text-right">
            <LiveDot className="justify-end" />
            <p className="mt-1 text-[34px] font-semibold tabular tracking-tight">{formatINR(tick.price, { decimals: 2 })}</p>
            <div className="flex justify-end">
              <Delta value={tick.changePct} size="md" />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Card padding="md">
          <CardEyebrow className="mb-4">Index chart</CardEyebrow>
          <PriceChart symbol={symbol} basePrice={base} />
        </Card>

        <div className="space-y-5">
          <Card padding="md" className="border-(--color-brand-100) bg-(--color-brand-50)/40">
            <div className="flex items-center gap-2">
              <CardEyebrow className="text-(--color-brand-700)">AI summary</CardEyebrow>
              {take && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-(--color-brand-700)">
                  <Activity className="h-3 w-3" /> Gemini
                </span>
              )}
            </div>
            {take ? (
              <div className="mt-2.5 space-y-2.5">
                <p className="text-[14px] leading-relaxed text-(--color-fg)">{take.summary}</p>
                <p className="rounded-xl bg-(--color-surface) px-3.5 py-2.5 text-[13px] leading-relaxed text-(--color-fg-muted)">
                  <span className="font-semibold text-(--color-fg)">What moves it: </span>
                  {take.watch}
                </p>
              </div>
            ) : loading ? (
              <p className="mt-3 inline-flex items-center gap-2 text-[13.5px] text-(--color-fg-muted)">
                <span className="h-2 w-2 animate-pulse-dot rounded-full bg-(--color-brand-500)" /> Reading today&apos;s move…
              </p>
            ) : (
              <p className="mt-3 text-[13.5px] leading-relaxed text-(--color-fg-muted)">
                {name} is {tick.changePct >= 0 ? "up" : "down"} {Math.abs(tick.changePct).toFixed(2)}% today at{" "}
                {formatINR(tick.price, { decimals: 2 })}.{!hasGeminiKey() && " (Add a Gemini key for a written summary.)"}
              </p>
            )}
          </Card>

          <Card padding="md">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-(--color-brand-50) text-(--color-brand-700)">
                <Sigma className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[14px] font-semibold tracking-tight">Run the quant pipeline</p>
                <p className="mt-1 text-[13px] text-(--color-fg-muted)">
                  Indicators, three forecast models and a bull/bear score for {name}.
                </p>
                <Button href="/quant" variant="subtle" size="sm" className="mt-3">
                  <Sparkles className="h-3.5 w-3.5" /> Open Quant Engine <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <CardEyebrow>More</CardEyebrow>
            <div className="mt-3 flex flex-col gap-2 text-[13.5px]">
              <Link href="/market" className="font-semibold text-(--color-brand-700) hover:underline">
                Market overview →
              </Link>
              <Link href="/stocks" className="font-semibold text-(--color-brand-700) hover:underline">
                Browse all stocks →
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
