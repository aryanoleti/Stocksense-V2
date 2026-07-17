"use client";

import { useReveal, useCountUp } from "@/lib/use-reveal";

/*
 * "The numbers speak": badge fade, dashed guide line drawing downward,
 * a dashed semicircle arc that draws itself on scroll, a teal dot that
 * travels the arc, and a blur-in count-up of a REAL product number
 * (2,678 NSE instruments statically generated and covered live).
 */

const ARC_PATH = "M 100,250 A 250,250 0 0 1 750,250";

export function NumbersSpeak() {
  const { ref, shown } = useReveal<HTMLDivElement>();
  const count = useCountUp(2678, shown, 2000);

  return (
    <section id="numbers" className="bg-white px-5 py-20 sm:py-24">
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

        {/* Dashed arc + travelling teal dot + number inside */}
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

          {/* Count-up number, blur-in, gradient text */}
          <div className="absolute inset-x-0 bottom-2 flex flex-col items-center">
            <p
              className="cf-blur text-[72px] font-bold leading-none tracking-[-0.03em] sm:text-[96px]"
              style={{
                background: "linear-gradient(180deg, #1A56DB, #60A5FA)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              <span className="tabular">{Math.round(count).toLocaleString("en-IN")}</span>
            </p>
            <p
              className="cf-item mt-2 text-[14px] text-gray-500"
              style={{ "--cf-d": "1.8s" } as React.CSSProperties}
            >
              NSE instruments covered with live prices
            </p>
          </div>
        </div>

        {/* Pagination dots */}
        <div className="mt-10 flex gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`cf-item h-2 w-2 rounded-full ${i === 0 ? "bg-[#1A56DB]" : "bg-gray-300"}`}
              style={{ "--cf-d": `${2 + i * 0.1}s` } as React.CSSProperties}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
