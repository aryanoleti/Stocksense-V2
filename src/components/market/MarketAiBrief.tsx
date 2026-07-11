"use client";

// AI brief of today's market, grounded in the live index quotes. Cached in
// sessionStorage for 10 minutes so it doesn't re-bill Gemini on every visit.

import { useEffect, useState } from "react";
import { Sparkles, Activity } from "lucide-react";
import { getSparkQuotes } from "@/lib/api/yahoo";
import { generateJson, hasGeminiKey } from "@/lib/api/gemini";
import { Card, CardEyebrow } from "@/components/ui/Card";

const CACHE_KEY = "stocksense.marketBrief.v1";
const CACHE_TTL = 10 * 60 * 1000;
const INDEX_SYMBOLS = ["NIFTY50", "SENSEX", "BANKNIFTY", "NIFTYIT", "NIFTYAUTO", "NIFTYPHARMA"];
const NAMES: Record<string, string> = {
  NIFTY50: "Nifty 50",
  SENSEX: "Sensex",
  BANKNIFTY: "Bank Nifty",
  NIFTYIT: "Nifty IT",
  NIFTYAUTO: "Nifty Auto",
  NIFTYPHARMA: "Nifty Pharma",
};

type Brief = { brief: string; tone: "up" | "down" | "mixed" };

export function MarketAiBrief() {
  const [brief, setBrief] = useState<Brief | null>(null);
  const [fallback, setFallback] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    try {
      const raw = window.sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { at: number; brief: Brief };
        if (Date.now() - parsed.at < CACHE_TTL) {
          setBrief(parsed.brief);
          return;
        }
      }
    } catch {
      /* noop */
    }

    getSparkQuotes(INDEX_SYMBOLS).then(async (quotes) => {
      if (cancelled) return;
      const moves = INDEX_SYMBOLS.filter((s) => quotes[s]).map((s) => ({
        name: NAMES[s],
        pct: quotes[s].changePct,
        price: quotes[s].price,
      }));
      if (moves.length === 0) return;

      // Deterministic line from real data — used when Gemini is off/unreachable.
      const leaders = [...moves].sort((a, b) => b.pct - a.pct);
      setFallback(
        `${leaders[0].name} leads (${leaders[0].pct >= 0 ? "+" : ""}${leaders[0].pct.toFixed(2)}%), ` +
          `${leaders[leaders.length - 1].name} trails (${leaders[leaders.length - 1].pct >= 0 ? "+" : ""}${leaders[leaders.length - 1].pct.toFixed(2)}%). ` +
          moves.map((m) => `${m.name} ${m.pct >= 0 ? "+" : ""}${m.pct.toFixed(2)}%`).join(" · "),
      );

      if (!hasGeminiKey()) return;
      const prompt = `You are a markets editor. Live Indian index moves right now: ${moves
        .map((m) => `${m.name} ${m.pct >= 0 ? "+" : ""}${m.pct.toFixed(2)}% at ${m.price.toFixed(0)}`)
        .join(", ")}.
Return JSON only: {"brief": "3-4 plain-English sentences summarising today's Indian market session so far — what's leading, what's lagging, and the overall mood, referencing the numbers", "tone": "up"|"down"|"mixed"}. Educational tone, no advice.`;
      const res = await generateJson<Brief>([{ role: "user", parts: [{ text: prompt }] }], { temperature: 0.4 });
      if (cancelled || !res?.brief) return;
      setBrief(res);
      try {
        window.sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), brief: res }));
      } catch {
        /* noop */
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!brief && !fallback) return null;
  const tone = brief?.tone ?? "mixed";
  const toneColor = tone === "up" ? "var(--color-up)" : tone === "down" ? "var(--color-down)" : "var(--color-warn)";

  return (
    <Card padding="md" className="border-(--color-brand-100)">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-(--color-brand-700) text-white">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardEyebrow className="text-(--color-brand-700)">Today&apos;s market · AI brief</CardEyebrow>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color: toneColor }}>
              <Activity className="h-3 w-3" /> {tone === "up" ? "Risk-on" : tone === "down" ? "Risk-off" : "Mixed"}
            </span>
          </div>
          <p className="mt-1.5 text-[14px] leading-relaxed text-(--color-fg)">{brief?.brief ?? fallback}</p>
          <p className="mt-2 text-[10.5px] text-(--color-fg-subtle)">
            Generated from live index data{brief ? " by Gemini" : ""} · educational, not advice
          </p>
        </div>
      </div>
    </Card>
  );
}
