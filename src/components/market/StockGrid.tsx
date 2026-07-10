"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Filter } from "lucide-react";
import { NIFTY_50, SECTORS } from "@/lib/mock-data";
import { useLivePrices } from "@/lib/use-live-prices";
import { formatINR } from "@/lib/format";
import { Delta } from "@/components/ui/Delta";

const SORTS = [
  { id: "symbol", label: "A → Z" },
  { id: "gainers", label: "Top gainers" },
  { id: "losers", label: "Top losers" },
  { id: "mcap", label: "Market cap" },
  { id: "pe", label: "P/E" },
];

export function StockGrid() {
  const [sector, setSector] = useState<string>("All");
  const [sort, setSort] = useState<string>("symbol");
  const [q, setQ] = useState("");

  const prices = useLivePrices(NIFTY_50.map((s) => ({ symbol: s.symbol, basePrice: s.basePrice })));

  const filtered = useMemo(() => {
    const lower = q.trim().toLowerCase();
    return NIFTY_50.filter((s) => {
      if (sector !== "All" && s.sector !== sector) return false;
      if (!lower) return true;
      return (
        s.symbol.toLowerCase().includes(lower) ||
        s.name.toLowerCase().includes(lower) ||
        s.sector.toLowerCase().includes(lower)
      );
    });
  }, [q, sector]);

  const ranked = useMemo(() => {
    const arr = [...filtered];
    switch (sort) {
      case "gainers":
        return arr.sort((a, b) => (prices[b.symbol]?.changePct ?? 0) - (prices[a.symbol]?.changePct ?? 0));
      case "losers":
        return arr.sort((a, b) => (prices[a.symbol]?.changePct ?? 0) - (prices[b.symbol]?.changePct ?? 0));
      case "mcap":
        return arr.sort((a, b) => b.marketCap - a.marketCap);
      case "pe":
        return arr.sort((a, b) => a.peRatio - b.peRatio);
      default:
        return arr.sort((a, b) => a.symbol.localeCompare(b.symbol));
    }
  }, [filtered, sort, prices]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[1.6fr_1fr_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-fg-subtle)" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search symbol, name or sector…"
              className="h-11 w-full rounded-xl border border-(--color-border) bg-(--color-surface) pl-10 pr-3 text-sm placeholder:text-(--color-fg-subtle) focus:border-(--color-brand-300) focus:ring-4 focus:ring-(--color-brand-50) focus:outline-none"
            />
          </div>
          <Select value={sector} onChange={setSector} options={["All", ...SECTORS]} icon={<Filter className="h-4 w-4 text-(--color-fg-subtle)" />} />
          <Select value={sort} onChange={setSort} options={SORTS.map((s) => s.id)} labels={SORTS.reduce((acc, s) => ({ ...acc, [s.id]: s.label }), {} as Record<string, string>)} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ranked.map((s) => {
          const tick = prices[s.symbol];
          return (
            <Link
              key={s.symbol}
              href={`/stocks/${s.symbol}`}
              className="group rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 transition-all hover:-translate-y-0.5 hover:border-(--color-brand-300) hover:shadow-[0_18px_38px_-22px_rgba(13,31,23,0.14)]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[13.5px] font-semibold tracking-tight text-(--color-fg)">{s.symbol}</p>
                  <p className="mt-0.5 text-[11.5px] text-(--color-fg-subtle)">{s.name}</p>
                </div>
                <span className="rounded-full bg-(--color-surface-2) px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-(--color-fg-muted)">
                  {s.sector}
                </span>
              </div>
              <p className="mt-3 text-[20px] font-semibold tabular tracking-tight text-(--color-fg)">
                ₹{formatINR(tick?.price ?? s.basePrice, { decimals: 2 })}
              </p>
              <div className="mt-1">
                <Delta value={tick?.changePct ?? 0} />
              </div>
            </Link>
          );
        })}
      </div>

      {ranked.length === 0 && (
        <div className="rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface) p-12 text-center">
          <p className="text-sm text-(--color-fg-muted)">No stocks match those filters.</p>
        </div>
      )}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  labels,
  icon,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labels?: Record<string, string>;
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative">
      {icon && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2">{icon}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-11 w-full appearance-none rounded-xl border border-(--color-border) bg-(--color-surface) ${
          icon ? "pl-10" : "pl-3.5"
        } pr-9 text-sm focus:border-(--color-brand-300) focus:ring-4 focus:ring-(--color-brand-50) focus:outline-none`}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {labels?.[o] ?? o}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--color-fg-subtle)">▾</span>
    </div>
  );
}
