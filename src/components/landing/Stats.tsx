"use client";

import { useEffect, useRef, useState } from "react";

const STATS = [
  { value: 1240, suffix: "+", label: "Companies covered" },
  { value: 4800000, suffix: "+", label: "AI analyses generated", compact: true },
  { value: 320000, suffix: "+", label: "Simulated trades placed", compact: true },
  { value: 86, suffix: "k+", label: "Active investors learning", compact: false, k: true },
];

export function Stats() {
  return (
    <section id="stats" className="border-y border-(--color-border) bg-(--color-surface-2)/60">
      <div className="mx-auto grid max-w-7xl gap-x-12 gap-y-10 px-5 py-16 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>
    </section>
  );
}

function StatCard({
  value,
  suffix,
  label,
  compact,
  k,
}: {
  value: number;
  suffix: string;
  label: string;
  compact?: boolean;
  k?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setShown(true)),
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const display = shown ? value : 0;
  let formatted: string;
  if (k) formatted = `${Math.round(display)}`;
  else if (compact) formatted = new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(display);
  else formatted = new Intl.NumberFormat("en-IN").format(Math.round(display));

  return (
    <div ref={ref} className="border-l border-(--color-border) pl-5 first:border-l-0 first:pl-0">
      <p className="text-3xl font-semibold tracking-tight tabular sm:text-[40px] transition-all duration-[1200ms]">
        <CountUp target={value} shown={shown} compact={compact} k={k} />
        <span className="text-(--color-brand-700)">{suffix}</span>
      </p>
      <p className="mt-2 text-sm text-(--color-fg-muted)">{label}</p>
    </div>
  );
}

function CountUp({
  target,
  shown,
  compact,
  k,
}: {
  target: number;
  shown: boolean;
  compact?: boolean;
  k?: boolean;
}) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!shown) return;
    const duration = 1100;
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(target * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [shown, target]);

  if (k) return <>{Math.round(n)}</>;
  if (compact) return <>{new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(n)}</>;
  return <>{new Intl.NumberFormat("en-IN").format(Math.round(n))}</>;
}
