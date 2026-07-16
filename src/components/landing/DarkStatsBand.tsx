"use client";

import { useReveal, useCountUp } from "@/lib/use-reveal";

const STATS: {
  to: number | null;
  value?: string;
  format?: (v: number) => string;
  label: string;
}[] = [
  {
    to: 2354,
    format: (v) => `${Math.round(v).toLocaleString("en-IN")}+`,
    label: "NSE instruments covered live",
  },
  { to: null, value: "₹5L", label: "virtual capital to practice with" },
  { to: 8, format: (v) => `${Math.round(v)}`, label: "chart ranges, 1D to MAX" },
  { to: null, value: "AI", label: "insights on every single stock" },
];

export function DarkStatsBand() {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <section id="stats" className="border-y border-white/10 bg-white/[0.03]">
      <div
        ref={ref}
        className="mx-auto grid max-w-7xl grid-cols-2 gap-y-10 px-5 py-14 md:grid-cols-4"
      >
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-[30px] font-semibold tabular tracking-[-0.02em] text-white sm:text-[34px]">
              {s.to !== null && s.format ? (
                <Counter to={s.to} format={s.format} start={shown} />
              ) : (
                <span>{s.value}</span>
              )}
            </p>
            <p className="mt-1 text-[13px] text-white/45">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Counter({ to, format, start }: { to: number; format: (v: number) => string; start: boolean }) {
  const val = useCountUp(to, start);
  return <span>{format(val)}</span>;
}
