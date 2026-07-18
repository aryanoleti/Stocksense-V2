"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Candle } from "@/lib/api/yahoo";

const W = 100;
const H = 40;

const inr = (v: number) =>
  v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Lightweight SVG line chart that draws itself in when data arrives.
 * Optionally shows a hover tooltip with the real date/value/day change.
 */
export function MiniLineChart({
  candles,
  stroke,
  gradientId,
  className,
  tooltip = false,
}: {
  candles: Candle[];
  stroke: string;
  gradientId: string;
  className?: string;
  tooltip?: boolean;
}) {
  const [drawn, setDrawn] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (candles.length > 1 && !drawn) {
      const id = requestAnimationFrame(() => setDrawn(true));
      return () => cancelAnimationFrame(id);
    }
  }, [candles.length, drawn]);

  const { linePath, areaPath, points } = useMemo(() => {
    if (candles.length < 2)
      return { linePath: "", areaPath: "", points: [] as { x: number; y: number }[] };
    const values = candles.map((c) => c.price);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const pts = candles.map((c, i) => ({
      x: (i / (candles.length - 1)) * W,
      y: H - 3 - ((c.price - min) / span) * (H - 6),
    }));
    const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join("");
    return { linePath: d, areaPath: `${d}L${W},${H}L0,${H}Z`, points: pts };
  }, [candles]);

  if (candles.length < 2) {
    return <div className={`skeleton opacity-30 ${className ?? ""}`} />;
  }

  const onMove = (e: React.MouseEvent) => {
    if (!tooltip || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    setHover(Math.round(frac * (candles.length - 1)));
  };

  const h = hover !== null ? candles[hover] : null;
  const hPrev = hover !== null && hover > 0 ? candles[hover - 1] : null;
  const hPct = h && hPrev ? ((h.price - hPrev.price) / hPrev.price) * 100 : null;
  const hPt = hover !== null ? points[hover] : null;

  return (
    <div
      ref={wrapRef}
      className={`relative ${className ?? ""}`}
      onMouseMove={onMove}
      onMouseLeave={() => setHover(null)}
    >
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.25} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <path
          d={areaPath}
          fill={`url(#${gradientId})`}
          style={{ opacity: drawn ? 1 : 0, transition: "opacity 0.9s ease 0.7s" }}
        />
        <path
          d={linePath}
          fill="none"
          stroke={stroke}
          strokeWidth={1.6}
          strokeLinejoin="round"
          strokeLinecap="round"
          pathLength={1}
          vectorEffect="non-scaling-stroke"
          style={{
            strokeDasharray: 1,
            strokeDashoffset: drawn ? 0 : 1,
            transition: "stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1) 0.2s",
          }}
        />
        {hPt && (
          <line x1={hPt.x} y1={0} x2={hPt.x} y2={H} stroke="rgba(0,0,0,0.2)" strokeWidth={0.4} />
        )}
      </svg>
      {hPt && h && (
        <>
          <span
            className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
            style={{ left: `${hPt.x}%`, top: `${(hPt.y / H) * 100}%`, background: stroke }}
          />
          <div
            className="pointer-events-none absolute z-10 rounded-xl border border-black/10 bg-white px-3 py-2 text-left shadow-xl dark:border-white/15 dark:bg-[#111827]"
            style={{
              left: `min(max(${hPt.x}%, 14%), 82%)`,
              top: `${(hPt.y / H) * 100}%`,
              transform: "translate(-50%, -130%)",
            }}
          >
            <p className="whitespace-nowrap text-[10.5px] font-medium text-black/45 dark:text-white/50">
              {new Date(h.time).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
            <p className="whitespace-nowrap text-[13px] font-semibold tabular text-[#1F2937] dark:text-white">
              ₹{inr(h.price)}
            </p>
            {hPct !== null && (
              <p
                className="whitespace-nowrap text-[10.5px] font-semibold tabular"
                style={{ color: hPct >= 0 ? "#059669" : "#E11D48" }}
              >
                {hPct >= 0 ? "+" : ""}
                {hPct.toFixed(2)}% vs prev session
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
