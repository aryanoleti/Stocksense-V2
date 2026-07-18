"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Database, Landmark, Zap, TrendingUp } from "lucide-react";
import { useReveal } from "@/lib/use-reveal";
import { getQuotes, type Quote } from "@/lib/api/yahoo";

/*
 * Bento grid on periwinkle-blue. Card 2's progress bars are REAL market
 * breadth, computed live from a fixed large-cap sample — not decoration.
 */

const BREADTH_SAMPLE = [
  "RELIANCE",
  "TCS",
  "HDFCBANK",
  "INFY",
  "ICICIBANK",
  "SBIN",
  "BHARTIARTL",
  "ITC",
];

const FEATURE_ITEMS = [
  { icon: Database, label: "Live NSE data", cls: "text-[#1F2937]" },
  { icon: Landmark, label: "AI research copilot", cls: "font-bold text-[#3B82F6]" },
  { icon: Zap, label: "0.5s fastest refresh", cls: "text-[#1F2937]" },
];

export function BentoFeatures() {
  const { ref, shown } = useReveal<HTMLDivElement>();
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});

  useEffect(() => {
    let alive = true;
    const load = () =>
      getQuotes(BREADTH_SAMPLE).then((qs) => {
        if (alive) setQuotes((p) => ({ ...p, ...qs }));
      });
    load();
    const id = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const loaded = Object.values(quotes);
  const advancing = loaded.filter((q) => q.changePct >= 0).length;
  const advPct = loaded.length ? Math.round((advancing / loaded.length) * 100) : 0;
  const decPct = loaded.length ? 100 - advPct : 0;

  return (
    <section className="relative overflow-hidden px-5 py-16 pt-24 sm:py-20 sm:pt-24">
      {/* Drifting glow behind the bento container */}
      <div
        className="cf-blob pointer-events-none absolute -right-24 top-16 h-80 w-80 rounded-full bg-white/50 blur-3xl"
        aria-hidden="true"
      />
      <div
        ref={ref}
        className={`relative mx-auto max-w-6xl rounded-3xl bg-white/60 p-4 sm:p-6 ${
          shown ? "reveal-shown" : ""
        }`}
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Card 1 — feature list */}
          <article className="cf-card rounded-2xl bg-white p-7 shadow-sm" style={{ "--cf-d": "0s" } as React.CSSProperties}>
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#DBEAFE] text-[13px] font-bold text-[#1A56DB]">
                You
              </span>
              <span className="text-[12px] font-medium text-gray-400">Your research desk</span>
            </div>
            <h3 className="mt-5 text-[24px] font-bold leading-tight tracking-tight text-[#1F2937]">
              Smarter <span className="cf-serif text-[#1A56DB]">market research</span>
            </h3>
            <ul className="mt-6 flex flex-col gap-4">
              {FEATURE_ITEMS.map((f, i) => (
                <li
                  key={f.label}
                  className="cf-item flex items-center gap-3"
                  style={{ "--cf-d": `${0.3 + i * 0.1}s` } as React.CSSProperties}
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#EFF6FF] text-[#3B82F6]">
                    <f.icon className="h-4 w-4" />
                  </span>
                  <span className={`text-[15px] ${f.cls}`}>{f.label}</span>
                </li>
              ))}
            </ul>
          </article>

          {/* Card 2 — live market breadth bars */}
          <article className="cf-card rounded-2xl bg-white p-7 shadow-sm" style={{ "--cf-d": "0.1s" } as React.CSSProperties}>
            <p className="text-[12px] font-medium text-gray-400">Right now</p>
            <div className="mt-5 flex flex-col gap-4">
              <BreadthBar
                label="Advancing"
                pct={loaded.length ? advPct : null}
                filled
                shown={shown}
              />
              <BreadthBar
                label="Declining"
                pct={loaded.length ? decPct : null}
                filled={false}
                shown={shown}
              />
            </div>
            <p className="mt-2 text-[11px] text-gray-400">
              Live breadth of {BREADTH_SAMPLE.length} NSE large caps
            </p>
            <p
              className="cf-item mt-6 text-[18px] font-semibold text-[#1F2937]"
              style={{ "--cf-d": "0.5s" } as React.CSSProperties}
            >
              Signals over noise
            </p>
            <p
              className="cf-item mt-1.5 text-[13.5px] leading-relaxed text-gray-500"
              style={{ "--cf-d": "0.8s" } as React.CSSProperties}
            >
              Every number on this page is live from the exchange — the same data layer
              that powers the whole platform.
            </p>
          </article>

          {/* Card 3 — two stacked cards */}
          <div className="flex flex-col gap-4">
            <article className="cf-card rounded-2xl bg-white p-7 shadow-sm" style={{ "--cf-d": "0.2s" } as React.CSSProperties}>
              <h3 className="text-[20px] font-bold leading-snug tracking-tight text-[#1F2937]">
                Empower <span className="cf-serif text-[#7C3AED]">smarter</span> investing
                decisions
              </h3>
              {/* Abstract 3D-ish card graphic — rotated wrapper, floating inner */}
              <div className="mt-5" style={{ transform: "rotate(-3deg)" }} aria-hidden="true">
              <div
                className="cf-bob h-32 rounded-xl p-4 shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #1A56DB 0%, #7C3AED 60%, #8B5CF6 100%)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold tracking-tight text-white">
                    StockSense
                  </span>
                  <TrendingUp className="h-4 w-4 text-white/80" />
                </div>
                <div className="mt-6 h-5 w-9 rounded bg-white/25" />
                <p className="mt-2 text-[11px] tracking-[0.2em] text-white/70">
                  RESEARCH · NOT A BROKER
                </p>
              </div>
              </div>
            </article>
            <article
              className="cf-card rounded-2xl bg-[#0A0C14] p-6 shadow-sm"
              style={{ "--cf-d": "0.3s" } as React.CSSProperties}
            >
              <p className="text-[12px] text-white/50">Practice safely</p>
              <p className="mt-1.5 text-[17px] font-semibold leading-snug text-white">
                ₹5,00,000 virtual portfolio, priced by the real market
              </p>
              <Link
                href="/portfolio"
                className="mt-3 inline-block text-[13px] font-semibold text-[#60A5FA] hover:text-white"
              >
                Try the simulator →
              </Link>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

function BreadthBar({
  label,
  pct,
  filled,
  shown,
}: {
  label: string;
  pct: number | null;
  filled: boolean;
  shown: boolean;
}) {
  const width = shown && pct !== null ? pct : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-[#1F2937]">{label}</span>
        <span className="text-[12px] font-semibold tabular text-gray-500">
          {pct !== null ? `${pct}%` : "—"}
        </span>
      </div>
      <div className="mt-1.5 h-3.5 overflow-hidden rounded-full bg-[#EFF6FF]">
        <div
          className={`h-full rounded-full transition-[width] duration-1000 ease-out ${
            filled ? "bg-[#1A56DB]" : "bg-[#93C5FD]"
          }`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
