// Finnhub REST client. Free tier covers US stocks and general market news.
// Used here primarily for `/news?category=general` since Indian price data
// requires a paid plan — live INR prices come from Yahoo instead.

const KEY = process.env.NEXT_PUBLIC_FINNHUB_KEY;
const BASE = "https://finnhub.io/api/v1";

export type FinnhubArticle = {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  image?: string;
  datetime: number; // unix seconds
  category: string;
  related?: string;
};

export type FinnhubQuote = {
  c: number; // current
  d: number; // change
  dp: number; // change percent
  h: number; // high
  l: number; // low
  o: number; // open
  pc: number; // previous close
  t: number;
};

const newsCache = new Map<string, { at: number; value: FinnhubArticle[] }>();
const NEWS_TTL_MS = 5 * 60_000;

async function call<T>(path: string, params: Record<string, string> = {}): Promise<T | null> {
  if (!KEY) return null;
  const qs = new URLSearchParams({ ...params, token: KEY }).toString();
  try {
    const r = await fetch(`${BASE}${path}?${qs}`, { cache: "no-store" });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

export async function getMarketNews(category: "general" | "forex" | "crypto" | "merger" = "general"): Promise<FinnhubArticle[]> {
  const cached = newsCache.get(category);
  if (cached && Date.now() - cached.at < NEWS_TTL_MS) return cached.value;
  const data = (await call<FinnhubArticle[]>("/news", { category })) ?? [];
  newsCache.set(category, { at: Date.now(), value: data });
  return data;
}

export async function getCompanyNews(
  symbol: string,
  fromDays = 14,
): Promise<FinnhubArticle[]> {
  const to = new Date();
  const from = new Date(to.getTime() - fromDays * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return (await call<FinnhubArticle[]>("/company-news", {
    symbol,
    from: fmt(from),
    to: fmt(to),
  })) ?? [];
}

export async function getUsQuote(symbol: string): Promise<FinnhubQuote | null> {
  return call<FinnhubQuote>("/quote", { symbol });
}

export function hasFinnhubKey() {
  return !!KEY;
}
