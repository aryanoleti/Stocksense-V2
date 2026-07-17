"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, LineChart, ListChecks, Timer } from "lucide-react";
import { useReveal, useCountUp } from "@/lib/use-reveal";
import { getQuotes, type Quote } from "@/lib/api/yahoo";

/*
 * Dark features grid (#0A0C14): 2×2 staggered cards + a wide banner.
 * Card 2 shows real live quotes; Card 4's slot-machine digits roll to
 * the actual live NIFTY 50 level. Nothing here is made up.
 */

const WATCH = ["RELIANCE", "TCS", "HDFCBANK", "INFY"] as const;

const inr = (v: number) =>
  v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const SIM_STEPS = [
  "Start with ₹5,00,000 in virtual capital",
  "Every buy and sell priced from the live market",
  "Track P&L against your real watchlist",
  "Reset and try a new strategy any time",
];

export function DarkFeatures() {
  const { ref, shown } = useReveal<HTMLDivElement>();
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});

  useEffect(() => {
    let alive = true;
    const load = () =>
      getQuotes(["NIFTY50", ...WATCH]).then((qs) => {
        if (alive) setQuotes((p) => ({ ...p, ...qs }));
      });
    load();
    const id = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const ranges = useCountUp(8, shown, 1500);
  const nifty = quotes["NIFTY50"];
  const movers = WATCH.map((s) => ({ sym: s, q: quotes[s] }))
    .filter((m) => m.q)
    .sort((a, b) => Math.abs(b.q!.changePct) - Math.abs(a.q!.changePct))
    .slice(0, 3);

  return (
    <section className="bg-[#0A0C14] px-5 py-20 sm:py-24">
      <div ref={ref} className={`mx-auto max-w-6xl ${shown ? "reveal-shown" : ""}`}>
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Card 1 — simulator (blue gradient) */}
          <article
            className="cf-card rounded-3xl p-7"
            style={
              {
                "--cf-d": "0s",
                background: "linear-gradient(135deg, #1E40AF, #3B82F6, #60A5FA)",
              } as React.CSSProperties
            }
          >
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-white/70">
              Portfolio simulator
            </p>
            <h3 className="mt-2 text-[24px] font-bold leading-tight text-white">
              Practice like it&apos;s real. Because the prices are.
            </h3>
            <div
              className="cf-item mt-6 rounded-2xl bg-white p-5"
              style={{ "--cf-d": "0.3s" } as React.CSSProperties}
            >
              <ul className="flex flex-col gap-3">
                {SIM_STEPS.map((s, i) => (
                  <li
                    key={s}
                    className="cf-item flex items-center gap-3 text-[13.5px] text-[#1F2937]"
                    style={{ "--cf-d": `${0.45 + i * 0.08}s` } as React.CSSProperties}
                  >
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#DBEAFE] text-[11px] font-bold text-[#1A56DB]">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </article>

          {/* Card 2 — live watchlist (dark) */}
          <article
            className="cf-card relative overflow-hidden rounded-3xl border border-white/10 bg-[#111827] p-7"
            style={{ "--cf-d": "0.1s" } as React.CSSProperties}
          >
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-white/50">
              Watchlists that move
            </p>
            <h3 className="mt-2 text-[24px] font-bold leading-tight text-white">
              Live prices, not snapshots
            </h3>
            <div className="mt-5 flex flex-col">
              {WATCH.map((sym, i) => {
                const q = quotes[sym];
                return (
                  <div
                    key={sym}
                    className="cf-item flex items-center justify-between border-b border-white/8 py-2.5 last:border-b-0"
                    style={{ "--cf-d": `${0.3 + i * 0.06}s` } as React.CSSProperties}
                  >
                    <span className="text-[13.5px] font-semibold text-white">{sym}</span>
                    <span className="text-right">
                      <span className="block text-[13.5px] font-semibold tabular text-white/85">
                        {q ? inr(q.price) : "—"}
                      </span>
                      <span
                        className="block text-[11px] font-semibold tabular"
                        style={{
                          color: q ? (q.changePct >= 0 ? "#34D399" : "#F87171") : undefined,
                        }}
                      >
                        {q ? `${q.changePct >= 0 ? "+" : ""}${q.changePct.toFixed(2)}%` : ""}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Looping slide-in pill */}
            <Link
              href="/watchlist"
              className="cf-pill absolute bottom-6 right-6 inline-flex items-center gap-2 rounded-full bg-white py-2 pl-4 pr-2 text-[13px] font-semibold text-[#111827] shadow-xl"
            >
              Open your watchlist
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#1A56DB] text-white">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </article>

          {/* Card 3 — ranges + live movers (dark) */}
          <article
            className="cf-card rounded-3xl border border-white/10 bg-[#111827] p-7"
            style={{ "--cf-d": "0.2s" } as React.CSSProperties}
          >
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-white/50">
              Every range, every mover
            </p>
            <p
              className="cf-blur mt-3 text-[64px] font-bold leading-none"
              style={{
                background: "linear-gradient(180deg, #60A5FA, #1A56DB)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              <span className="tabular">{Math.round(ranges)}</span>
            </p>
            <p className="mt-1 text-[13px] text-white/50">
              chart ranges on every instrument — 1D to MAX
            </p>
            <div className="mt-5 flex flex-col items-end gap-2">
              {movers.length
                ? movers.map((m, i) => (
                    <span
                      key={m.sym}
                      className="cf-item inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3.5 py-1.5 text-[12px] font-semibold text-white"
                      style={{ "--cf-d": `${0.5 + i * 0.15}s` } as React.CSSProperties}
                    >
                      {m.sym}
                      <span
                        className="tabular"
                        style={{ color: m.q!.changePct >= 0 ? "#34D399" : "#F87171" }}
                      >
                        {m.q!.changePct >= 0 ? "+" : ""}
                        {m.q!.changePct.toFixed(2)}%
                      </span>
                    </span>
                  ))
                : [0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="skeleton h-8 w-36 rounded-full opacity-20"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
            </div>
          </article>

          {/* Card 4 — live NIFTY slot machine (light blue gradient) */}
          <article
            className="cf-card rounded-3xl p-7"
            style={
              {
                "--cf-d": "0.3s",
                background: "linear-gradient(135deg, #BFDBFE, #93C5FD, #3B82F6)",
              } as React.CSSProperties
            }
          >
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#1E3A8A]/70">
              NIFTY 50 · right now
            </p>
            <h3 className="mt-2 text-[22px] font-bold leading-tight text-[#1E3A8A]">
              The benchmark, to the paisa
            </h3>
            <SlotNumber value={nifty ? inr(nifty.price) : null} active={shown} />
            <p className="mt-4 text-[12px] text-[#1E3A8A]/70">
              {nifty
                ? `${nifty.changePct >= 0 ? "Up" : "Down"} ${Math.abs(nifty.changePct).toFixed(2)}% vs previous close — live from the exchange`
                : "Fetching the live level…"}
            </p>
          </article>
        </div>

        {/* Wide bottom card */}
        <article
          className="cf-card mt-4 rounded-3xl border border-white/10 bg-[#111827] px-7 py-10 text-center sm:py-14"
          style={{ "--cf-d": "0.4s" } as React.CSSProperties}
        >
          <span
            className="cf-item inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/6 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/70"
            style={{ "--cf-d": "0.5s" } as React.CSSProperties}
          >
            <LineChart className="h-3.5 w-3.5" /> Built for the whole market
          </span>
          <h3 className="mx-auto mt-5 max-w-2xl text-[28px] font-bold leading-[1.15] text-white sm:text-[40px]">
            <span className="cf-clip block">
              <span className="cf-line" style={{ "--cf-d": "0.6s" } as React.CSSProperties}>
                Thousands of live quotes flow
              </span>
            </span>
            <span className="cf-clip block">
              <span className="cf-line" style={{ "--cf-d": "0.75s" } as React.CSSProperties}>
                through <span className="cf-serif">every session</span>
              </span>
            </span>
          </h3>
          <p
            className="cf-item mx-auto mt-4 max-w-xl text-[14.5px] leading-relaxed text-white/55"
            style={{ "--cf-d": "0.95s" } as React.CSSProperties}
          >
            The full NSE universe polls on a rolling sweep — indices, large caps, small
            caps and ETFs — so whatever you open is already moving.
          </p>
          <div
            className="cf-item mt-7 flex flex-wrap items-center justify-center gap-6 text-[12px] text-white/45"
            style={{ "--cf-d": "1.1s" } as React.CSSProperties}
          >
            <span className="inline-flex items-center gap-1.5">
              <ListChecks className="h-4 w-4" /> 2,678 instruments
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Timer className="h-4 w-4" /> refresh from 0.5s
            </span>
          </div>
        </article>
      </div>
    </section>
  );
}

/* Slot-machine digits: each digit column rolls a 0–9 strip to the live
   target with a small stagger; separators stay static. */
function SlotNumber({ value, active }: { value: string | null; active: boolean }) {
  const chars = (value ?? "--,---.--").split("");
  return (
    <div className="mt-5 flex flex-wrap items-center gap-1.5" aria-label={value ?? "loading"}>
      {chars.map((ch, i) =>
        /\d/.test(ch) ? (
          <span
            key={i}
            className="h-[52px] w-9 overflow-hidden rounded-lg bg-white shadow-md"
            aria-hidden="true"
          >
            <span
              className="block"
              style={{
                transform:
                  active && value ? `translateY(-${Number(ch) * 52}px)` : "translateY(0)",
                transition: `transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${i * 60}ms`,
              }}
            >
              {Array.from({ length: 10 }).map((_, d) => (
                <span
                  key={d}
                  className="grid h-[52px] w-9 place-items-center text-[24px] font-bold tabular text-[#111827]"
                >
                  {d}
                </span>
              ))}
            </span>
          </span>
        ) : (
          <span
            key={i}
            className="grid h-[52px] w-4 place-items-end pb-2 text-[24px] font-bold text-[#1E3A8A]"
            aria-hidden="true"
          >
            {ch}
          </span>
        ),
      )}
    </div>
  );
}
