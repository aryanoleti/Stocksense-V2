"use client";

import { useEffect, useState } from "react";
import { useReveal, useCountUp } from "@/lib/use-reveal";

/*
 * "The numbers speak": badge fade, dashed guide line, self-drawing
 * dashed arc with a travelling teal dot, a slow-rotating dashed ring,
 * and a THREE-PANEL horizontal carousel behind the pagination dots —
 * each panel is a real product number that counts up when it arrives.
 * Panels auto-advance and are clickable.
 */

const ARC_PATH = "M 100,250 A 250,250 0 0 1 750,250";

const PANELS: { to: number; format: (v: number) => string; label: string }[] = [
  {
    to: 2678,
    format: (v) => Math.round(v).toLocaleString("en-IN"),
    label: "NSE instruments covered with live prices",
  },
  {
    to: 500000,
    format: (v) => `₹${Math.round(v).toLocaleString("en-IN")}`,
    label: "virtual capital in the risk-free simulator",
  },
  {
    to: 8,
    format: (v) => `${Math.round(v)}`,
    label: "chart ranges on every instrument — 1D to MAX",
  },
];

export function NumbersSpeak() {
  const { ref, shown } = useReveal<HTMLDivElement>();
  const [panel, setPanel] = useState(0);

  // Auto-advance sideways every 6s once visible; clicking a dot resets
  // the timer (effect re-runs on every panel change).
  useEffect(() => {
    if (!shown) return;
    const id = setInterval(() => setPanel((p) => (p + 1) % PANELS.length), 6000);
    return () => clearInterval(id);
  }, [shown, panel]);

  return (
    <section className="px-5 py-20 sm:py-24">
      <div
        ref={ref}
        className={`mx-auto flex max-w-4xl flex-col items-center text-center ${
          shown ? "reveal-shown" : ""
        }`}
      >
        {/* Pill badge */}
        <span className="cf-item rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">
          The numbers speak
        </span>

        {/* Dashed vertical guide line */}
        <svg width="2" height="56" viewBox="0 0 2 56" className="mt-4" aria-hidden="true">
          <line
            x1="1"
            y1="0"
            x2="1"
            y2="56"
            stroke="#9CA3AF"
            strokeWidth="1.5"
            strokeDasharray="4 5"
            pathLength={1}
            className="cf-draw"
          />
        </svg>

        {/* Dashed arc + travelling teal dot + carousel inside */}
        <div className="relative mt-2 w-full max-w-[850px]">
          <svg viewBox="0 0 850 270" className="w-full" aria-hidden="true">
            <defs>
              <mask id="nsArcMask">
                <path
                  d={ARC_PATH}
                  fill="none"
                  stroke="#fff"
                  strokeWidth="12"
                  pathLength={1}
                  className="cf-draw"
                />
              </mask>
            </defs>
            <path
              d={ARC_PATH}
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1.5"
              strokeDasharray="6 8"
              mask="url(#nsArcMask)"
            />
          </svg>
          {/* Teal dot follows the same arc geometry */}
          <span
            className="cf-dot absolute left-0 top-0 h-4 w-4 rounded-full bg-[#06B6D4] shadow-[0_0_14px_2px_rgba(6,182,212,0.55)]"
            style={{ offsetPath: `path("${ARC_PATH}")` } as React.CSSProperties}
            aria-hidden="true"
          />

          {/* Slow-rotating dashed ring behind the number */}
          <svg
            viewBox="0 0 300 300"
            className="cf-spin-slow pointer-events-none absolute bottom-[-70px] left-1/2 h-[280px] w-[280px] -translate-x-1/2 opacity-40"
            aria-hidden="true"
          >
            <circle
              cx="150"
              cy="150"
              r="140"
              fill="none"
              stroke="#93C5FD"
              strokeWidth="1.5"
              strokeDasharray="3 10"
            />
          </svg>

          {/* Horizontal panel carousel */}
          <div className="absolute inset-x-0 bottom-2">
            <div className="overflow-hidden">
              <div
                className="cf-hslide flex"
                style={{ transform: `translateX(-${panel * 100}%)` }}
              >
                {PANELS.map((p, i) => (
                  <StatPanel key={p.label} panel={p} active={shown && panel === i} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pagination dots — clickable, drive the sideways slides */}
        <div className="mt-10 flex gap-1">
          {PANELS.map((p, i) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setPanel(i)}
              aria-label={`Show stat ${i + 1}: ${p.label}`}
              aria-current={panel === i ? "true" : undefined}
              className="cf-item group p-1.5"
              style={{ "--cf-d": `${2 + i * 0.1}s` } as React.CSSProperties}
            >
              <span
                className={`block h-2 rounded-full transition-all duration-300 ${
                  panel === i
                    ? "w-5 bg-[#1A56DB]"
                    : "w-2 bg-gray-300 group-hover:bg-gray-400"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatPanel({
  panel,
  active,
}: {
  panel: { to: number; format: (v: number) => string; label: string };
  active: boolean;
}) {
  const count = useCountUp(panel.to, active, 1600);
  return (
    <div className="flex w-full shrink-0 flex-col items-center px-4">
      <p
        className="cf-blur text-[64px] font-bold leading-none tracking-[-0.03em] sm:text-[88px]"
        style={{
          background: "linear-gradient(180deg, #1A56DB, #60A5FA)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        <span className="tabular">{panel.format(count)}</span>
      </p>
      <p
        className="cf-item mt-2 text-[14px] text-gray-500"
        style={{ "--cf-d": "1.2s" } as React.CSSProperties}
      >
        {panel.label}
      </p>
    </div>
  );
}
