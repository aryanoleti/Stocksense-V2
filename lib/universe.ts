// The full NSE universe, generated from official NSE archives:
// EQUITY_L.csv (all listed equities), ind_nifty500list.csv (with industry),
// ind_nifty50list.csv, eq_etfseclist.csv. Ported from SOURCE stocksense's
// src/lib/universe.ts. See lib/data/*.json.

import equitiesRaw from "@/lib/data/equities.json";
import nifty500Raw from "@/lib/data/nifty500.json";
import nifty50Raw from "@/lib/data/nifty50.json";
import etfsRaw from "@/lib/data/etfs.json";

export type Instrument = {
  symbol: string;
  name: string;
  kind: "stock" | "etf";
  industry?: string;
  underlying?: string;
  inNifty50: boolean;
  inNifty500: boolean;
};

const equities = equitiesRaw as [string, string][];
const nifty500 = nifty500Raw as [string, string, string][];
const nifty50 = nifty50Raw as string[];
const etfsData = etfsRaw as [string, string, string][];

const NIFTY50_SET = new Set(nifty50);
const N500_BY_SYMBOL = new Map(nifty500.map(([sym, name, industry]) => [sym, { name, industry }]));

function prettifyEtfName(underlying: string, symbol: string): string {
  return underlying ? `${underlying} ETF (${symbol})` : `${symbol} ETF`;
}

export const ALL_STOCKS: Instrument[] = equities.map(([symbol, name]) => {
  const n500 = N500_BY_SYMBOL.get(symbol);
  return {
    symbol,
    name: n500?.name ?? name,
    kind: "stock" as const,
    industry: n500?.industry,
    inNifty50: NIFTY50_SET.has(symbol),
    inNifty500: !!n500,
  };
});

export const ALL_ETFS: Instrument[] = etfsData.map(([symbol, underlying, securityName]) => ({
  symbol,
  name: prettifyEtfName(underlying, symbol),
  kind: "etf" as const,
  underlying: underlying || securityName,
  inNifty50: false,
  inNifty500: false,
}));

export const UNIVERSE: Instrument[] = [...ALL_STOCKS, ...ALL_ETFS];

const BY_SYMBOL = new Map(UNIVERSE.map((i) => [i.symbol.toUpperCase(), i]));

export const NIFTY50_SYMBOLS = nifty50;
export const NIFTY500_STOCKS: Instrument[] = ALL_STOCKS.filter((s) => s.inNifty500);

export const INDUSTRIES: string[] = Array.from(
  new Set(nifty500.map(([, , industry]) => industry).filter(Boolean)),
).sort();

export function lookupInstrument(symbol: string): Instrument | undefined {
  return BY_SYMBOL.get(symbol.toUpperCase());
}

export function industryPeers(symbol: string, limit = 4): Instrument[] {
  const me = lookupInstrument(symbol);
  if (!me?.industry) return [];
  return NIFTY500_STOCKS.filter((s) => s.industry === me.industry && s.symbol !== me.symbol).slice(0, limit);
}

/**
 * DESTINATION note: SOURCE routed Nifty 500 stocks to `/stocks/[symbol]` and
 * everything else to a generic `/quote/?s=` viewer. DESTINATION instead has a
 * single dynamic route `/stock/[ticker]` that resolves any ticker, so every
 * instrument links there directly.
 */
export function instrumentHref(symbol: string): string {
  const inst = lookupInstrument(symbol);
  return `/stock/${(inst?.symbol ?? symbol).toUpperCase()}`;
}

/**
 * Ranked substring search across all ~2,700 instruments.
 * Symbol prefix > symbol substring > name prefix > name substring.
 */
export function searchUniverse(query: string, limit = 8): Instrument[] {
  const q = query.trim().toUpperCase();
  if (!q) return [];
  const scored: Array<{ inst: Instrument; score: number }> = [];
  for (const inst of UNIVERSE) {
    const sym = inst.symbol.toUpperCase();
    const name = inst.name.toUpperCase();
    let score = -1;
    if (sym === q) score = 100;
    else if (sym.startsWith(q)) score = 80;
    else if (sym.includes(q)) score = 60;
    else if (name.startsWith(q)) score = 50;
    else if (name.includes(q)) score = 30;
    else if (inst.industry && inst.industry.toUpperCase().includes(q)) score = 15;
    if (score < 0) continue;
    // favour index members among equal scores
    if (inst.inNifty50) score += 8;
    else if (inst.inNifty500) score += 4;
    scored.push({ inst, score });
  }
  scored.sort((a, b) => b.score - a.score || a.inst.symbol.localeCompare(b.inst.symbol));
  return scored.slice(0, limit).map((s) => s.inst);
}
