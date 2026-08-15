import type { CompanyId } from "./types";

/* The teaching universe.

   Five invented companies that recur across all seven levels, so a reader who
   meets Kirana Kart in Level 1 can still reason about it in Level 7. Every
   figure here is made up for teaching. None of it describes a real business,
   and nothing in this course is investment advice.

   The numbers are chosen to divide cleanly, so worked examples produce round
   results and the arithmetic stays checkable by hand. Figures are in crore
   (₹1 crore = ₹10 million) except per-share values. */

export type Company = {
  id: CompanyId;
  name: string;
  ticker: string;
  sector: string;
  /** one line a beginner can hold in their head */
  pitch: string;
  figures: {
    revenue: number;
    netProfit: number;
    shares: number;
    price: number;
    debt: number;
    equity: number;
    freeCashFlow: number;
  };
};

export const COMPANIES: Record<CompanyId, Company> = {
  kirana: {
    id: "kirana",
    name: "Kirana Kart",
    ticker: "KRKT",
    sector: "Retail",
    pitch: "A grocery chain: huge sales, thin profit on each item.",
    figures: {
      revenue: 4200,
      netProfit: 168,
      shares: 40,
      price: 105,
      debt: 900,
      equity: 1200,
      freeCashFlow: 120,
    },
  },
  lumen: {
    id: "lumen",
    name: "Lumen Labs",
    ticker: "LMNL",
    sector: "Software",
    pitch: "Sells software subscriptions: smaller sales, much fatter profit.",
    figures: {
      revenue: 1800,
      netProfit: 360,
      shares: 20,
      price: 720,
      debt: 50,
      equity: 1500,
      freeCashFlow: 390,
    },
  },
  ironvale: {
    id: "ironvale",
    name: "Ironvale Works",
    ticker: "IRVW",
    sector: "Manufacturing",
    pitch: "Builds heavy equipment: big factories, big borrowings.",
    figures: {
      revenue: 6500,
      netProfit: 325,
      shares: 50,
      price: 130,
      debt: 2800,
      equity: 2000,
      freeCashFlow: 180,
    },
  },
  coral: {
    id: "coral",
    name: "Coral & Co",
    ticker: "CRLC",
    sector: "Consumer brand",
    pitch: "Sells packaged goods people rebuy every month.",
    figures: {
      revenue: 2400,
      netProfit: 288,
      shares: 30,
      price: 240,
      debt: 300,
      equity: 1100,
      freeCashFlow: 250,
    },
  },
  meridian: {
    id: "meridian",
    name: "Meridian Bank",
    ticker: "MRDB",
    sector: "Banking",
    pitch: "Takes deposits and lends them out; earns the difference.",
    figures: {
      revenue: 3100,
      netProfit: 620,
      shares: 62,
      price: 190,
      debt: 0,
      equity: 5200,
      freeCashFlow: 0,
    },
  },
};

export const COMPANY_LIST = Object.values(COMPANIES);

/* Derived figures. Defined once so every lesson quotes the same numbers —
   if a figure above changes, all 27 lessons stay consistent automatically. */
export function metrics(id: CompanyId) {
  const f = COMPANIES[id].figures;
  return {
    eps: f.netProfit / f.shares,
    pe: f.price / (f.netProfit / f.shares),
    roe: (f.netProfit / f.equity) * 100,
    debtToEquity: f.equity === 0 ? 0 : f.debt / f.equity,
    netMargin: (f.netProfit / f.revenue) * 100,
    marketCap: f.price * f.shares,
  };
}

/** Format a crore figure the way the lessons write it. */
export function cr(value: number): string {
  return `₹${value.toLocaleString("en-IN")} cr`;
}

export function rupees(value: number, decimals = 2): string {
  return `₹${value.toFixed(decimals)}`;
}
