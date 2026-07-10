"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

const TERMS: { term: string; definition: string; category: string }[] = [
  { term: "Bull Market", category: "Markets", definition: "A period when stock prices are rising or expected to rise. Investors are optimistic." },
  { term: "Bear Market", category: "Markets", definition: "A period when stock prices fall 20%+ from recent highs. Pessimism dominates." },
  { term: "P/E Ratio", category: "Valuation", definition: "Price-to-Earnings ratio. How much investors pay per ₹1 of earnings. Lower = cheaper, in general." },
  { term: "Market Cap", category: "Valuation", definition: "Total value of a company's shares. Price × shares outstanding." },
  { term: "Dividend", category: "Income", definition: "A portion of a company's profits paid to shareholders, usually quarterly or annually." },
  { term: "EPS", category: "Earnings", definition: "Earnings Per Share. Net profit divided by total shares. Higher = more profitable per share." },
  { term: "Beta", category: "Risk", definition: "Measures stock volatility vs the market. Beta 1 = moves with market. Beta > 1 = more volatile." },
  { term: "52-Week High/Low", category: "Price", definition: "The highest and lowest prices a stock traded at in the past 52 weeks." },
  { term: "Volume", category: "Trading", definition: "Number of shares traded in a day. High volume = strong interest in news or moves." },
  { term: "NSE", category: "Exchange", definition: "National Stock Exchange of India, home of the Nifty 50 index. India's largest exchange by volume." },
  { term: "BSE", category: "Exchange", definition: "Bombay Stock Exchange, oldest in Asia. Home of the Sensex index." },
  { term: "Nifty 50", category: "Index", definition: "Index of 50 largest companies on NSE. Benchmark for Indian stock market performance." },
  { term: "Sensex", category: "Index", definition: "Index of 30 largest companies on BSE. India's most widely tracked stock index." },
  { term: "Demat Account", category: "Account", definition: "Electronic account to hold shares digitally. Required to buy/sell stocks in India." },
  { term: "SIP", category: "Investing", definition: "Systematic Investment Plan. Invest a fixed amount regularly in mutual funds or stocks." },
  { term: "Mutual Fund", category: "Investing", definition: "A pooled investment vehicle, managed by professionals to buy diversified assets." },
  { term: "IPO", category: "Issuance", definition: "Initial Public Offering. When a private company sells shares to the public for the first time." },
  { term: "Stop Loss", category: "Orders", definition: "An order to sell a stock if it falls to a certain price, limiting your loss." },
  { term: "Portfolio", category: "Investing", definition: "Your collection of investments — stocks, bonds, mutual funds, etc." },
  { term: "F&O", category: "Derivatives", definition: "Futures & Options. Contracts derived from underlying assets. High risk, high reward." },
  { term: "Circuit Breaker", category: "Trading", definition: "Automatic halt in trading when a stock moves too much in one direction." },
  { term: "Blue Chip", category: "Quality", definition: "Stock of a large, well-established, financially stable company with reliable performance." },
  { term: "Sector", category: "Categories", definition: "Group of companies in the same industry — IT, Banking, Pharma, Auto, etc." },
  { term: "Liquidity", category: "Trading", definition: "How easily a stock can be bought or sold without affecting its price." },
  { term: "Volatility", category: "Risk", definition: "How much a stock's price fluctuates. Higher volatility = bigger swings up or down." },
  { term: "Dividend Yield", category: "Income", definition: "Annual dividend as a % of stock price. Higher yield = more income per ₹ invested." },
  { term: "Bonds", category: "Fixed Income", definition: "Loans you give to a company or government, which pays you interest until maturity." },
  { term: "SEBI", category: "Regulation", definition: "Securities and Exchange Board of India — the regulator that protects investors." },
];

const CATEGORIES = Array.from(new Set(TERMS.map((t) => t.category)));

export default function GlossaryPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");

  const filtered = useMemo(() => {
    return TERMS.filter((t) => {
      if (cat !== "All" && t.category !== cat) return false;
      if (!q.trim()) return true;
      const l = q.toLowerCase();
      return t.term.toLowerCase().includes(l) || t.definition.toLowerCase().includes(l);
    });
  }, [q, cat]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-(--color-fg-subtle)">
          Glossary
        </p>
        <h1 className="mt-1 text-[28px] font-semibold tracking-tight">Investing, in plain English</h1>
        <p className="mt-1 max-w-2xl text-[13.5px] text-(--color-fg-muted)">
          Plain-English definitions of the terms you&apos;ll encounter as you start investing. Search or filter by category.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-[1.6fr_1fr]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-fg-subtle)" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search terms — e.g. 'beta', 'P/E', 'dividend'"
            className="h-11 w-full rounded-xl border border-(--color-border) bg-(--color-surface) pl-10 pr-3 text-sm placeholder:text-(--color-fg-subtle) focus:border-(--color-brand-300) focus:ring-4 focus:ring-(--color-brand-50) focus:outline-none"
          />
        </div>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="h-11 appearance-none rounded-xl border border-(--color-border) bg-(--color-surface) px-3.5 text-sm focus:border-(--color-brand-300) focus:ring-4 focus:ring-(--color-brand-50) focus:outline-none"
        >
          <option value="All">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => (
          <li key={t.term} className="group rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 transition-all hover:-translate-y-0.5 hover:border-(--color-brand-300) hover:shadow-[0_18px_38px_-22px_rgba(13,31,23,0.14)]">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[15px] font-semibold tracking-tight text-(--color-fg)">{t.term}</h3>
              <span className="rounded-full bg-(--color-surface-2) px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-(--color-fg-muted)">
                {t.category}
              </span>
            </div>
            <p className="mt-2 text-[13.5px] leading-relaxed text-(--color-fg-muted)">{t.definition}</p>
          </li>
        ))}
      </ul>
      {filtered.length === 0 && (
        <p className="py-10 text-center text-[13px] text-(--color-fg-muted)">No terms match those filters.</p>
      )}
    </div>
  );
}
