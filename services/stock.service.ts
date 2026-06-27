// services/stock.service.ts
// Real-time stock data via Finnhub API with server-side caching

const FINNHUB_KEY = process.env.FINNHUB_API_KEY!;
const BASE_URL = "https://finnhub.io/api/v1";

// Simple in-memory cache for server
const cache = new Map<string, { data: any; ts: number }>();
const TTL = 15_000; // 15 seconds for prices

function cached<T>(key: string, ttl: number, fn: () => Promise<T>): Promise<T> {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < ttl) return Promise.resolve(entry.data);
  return fn().then((data) => {
    cache.set(key, { data, ts: Date.now() });
    return data;
  });
}

async function finnhub(path: string, params: Record<string, string> = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("token", FINNHUB_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { next: { revalidate: 15 } });
  if (!res.ok) throw new Error(`Finnhub error: ${res.status}`);
  return res.json();
}

export interface StockQuote {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  volume: number;
  marketCap?: number;
  pe?: number;
  eps?: number;
  week52High?: number;
  week52Low?: number;
  logo?: string;
  sector?: string;
  description?: string;
  exchange?: string;
}

export async function getQuote(ticker: string): Promise<StockQuote> {
  return cached(`quote:${ticker}`, TTL, async () => {
    const [quote, profile, metric] = await Promise.all([
      finnhub("/quote", { symbol: ticker }),
      finnhub("/stock/profile2", { symbol: ticker }).catch(() => ({})),
      finnhub("/stock/metric", { symbol: ticker, metric: "all" }).catch(() => ({ metric: {} })),
    ]);

    return {
      ticker,
      name: profile.name || ticker,
      price: quote.c,
      change: quote.d,
      changePercent: quote.dp,
      high: quote.h,
      low: quote.l,
      open: quote.o,
      prevClose: quote.pc,
      volume: quote.v || 0,
      marketCap: profile.marketCapitalization
        ? profile.marketCapitalization * 1e6
        : undefined,
      pe: metric?.metric?.peNormalizedAnnual,
      eps: metric?.metric?.epsAnnual,
      week52High: metric?.metric?.["52WeekHigh"],
      week52Low: metric?.metric?.["52WeekLow"],
      logo: profile.logo,
      sector: profile.finnhubIndustry,
      description: profile.description?.slice(0, 300),
      exchange: profile.exchange,
    };
  });
}

export async function searchStocks(query: string) {
  return cached(`search:${query}`, 60_000, async () => {
    const data = await finnhub("/search", { q: query });
    return (data.result || [])
      .filter((r: any) => r.type === "Common Stock")
      .slice(0, 10)
      .map((r: any) => ({
        ticker: r.symbol,
        name: r.description,
        type: r.type,
      }));
  });
}

export async function getCandles(
  ticker: string,
  resolution: string = "D",
  from: number,
  to: number
) {
  const key = `candles:${ticker}:${resolution}:${from}:${to}`;
  return cached(key, 60_000, async () => {
    const data = await finnhub("/stock/candle", {
      symbol: ticker,
      resolution,
      from: from.toString(),
      to: to.toString(),
    });

    if (data.s !== "ok") return [];

    return data.t.map((ts: number, i: number) => ({
      time: ts * 1000,
      open: data.o[i],
      high: data.h[i],
      low: data.l[i],
      close: data.c[i],
      volume: data.v[i],
    }));
  });
}

export async function getMarketIndices() {
  const tickers = ["^NSEI", "^BSESN", "^NSEBANK"];
  const names = ["Nifty 50", "Sensex", "Bank Nifty"];

  try {
    const quotes = await Promise.allSettled(tickers.map((t) => getQuote(t)));
    return quotes.map((q, i) => ({
      name: names[i],
      ticker: tickers[i],
      ...(q.status === "fulfilled"
        ? {
            price: q.value.price,
            change: q.value.change,
            changePercent: q.value.changePercent,
          }
        : { price: 0, change: 0, changePercent: 0 }),
    }));
  } catch {
    return [];
  }
}

// Popular Indian stocks
export const POPULAR_STOCKS = [
  "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS",
  "HINDUNILVR.NS", "SBIN.NS", "BHARTIARTL.NS", "ITC.NS", "KOTAKBANK.NS",
  "LT.NS", "AXISBANK.NS", "ASIANPAINT.NS", "MARUTI.NS", "WIPRO.NS",
];

export async function getTopMovers() {
  return cached("top-movers", 60_000, async () => {
    const quotes = await Promise.allSettled(
      POPULAR_STOCKS.map((t) => getQuote(t))
    );

    const valid = quotes
      .filter((q): q is PromiseFulfilledResult<StockQuote> => q.status === "fulfilled")
      .map((q) => q.value)
      .filter((q) => q.price > 0);

    const sorted = [...valid].sort((a, b) => b.changePercent - a.changePercent);
    return {
      gainers: sorted.slice(0, 5),
      losers: sorted.slice(-5).reverse(),
      mostActive: [...valid].sort((a, b) => b.volume - a.volume).slice(0, 5),
    };
  });
}

export async function getCompanyNews(ticker: string, from: string, to: string) {
  return cached(`news:${ticker}:${from}`, 300_000, async () => {
    const data = await finnhub("/company-news", { symbol: ticker, from, to });
    return (data || []).slice(0, 10).map((n: any) => ({
      id: n.id,
      headline: n.headline,
      summary: n.summary?.slice(0, 200),
      source: n.source,
      url: n.url,
      datetime: n.datetime * 1000,
      image: n.image,
    }));
  });
}

export async function getAIPrediction(ticker: string, historicalData: any[]) {
  // Uses technical analysis to generate simple AI prediction signals
  if (historicalData.length < 20) return null;

  const closes = historicalData.map((d) => d.close);
  const latest = closes[closes.length - 1];

  // Simple Moving Averages
  const sma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const sma50 = closes.length >= 50
    ? closes.slice(-50).reduce((a, b) => a + b, 0) / 50
    : sma20;

  // RSI calculation
  const changes = closes.slice(-15).map((c, i) => (i > 0 ? c - closes[closes.length - 15 + i - 1] : 0));
  const gains = changes.filter((c) => c > 0).reduce((a, b) => a + b, 0) / 14;
  const losses = Math.abs(changes.filter((c) => c < 0).reduce((a, b) => a + b, 0) / 14);
  const rsi = losses === 0 ? 100 : 100 - 100 / (1 + gains / losses);

  // Signal
  let signal: "BUY" | "SELL" | "HOLD" = "HOLD";
  let confidence = 50;

  if (latest > sma20 && sma20 > sma50 && rsi < 70) {
    signal = "BUY";
    confidence = Math.min(85, 55 + (latest - sma20) / sma20 * 1000);
  } else if (latest < sma20 && sma20 < sma50 && rsi > 30) {
    signal = "SELL";
    confidence = Math.min(85, 55 + (sma20 - latest) / sma20 * 1000);
  }

  // Generate prediction points (next 7 days)
  const trend = (sma20 - sma50) / sma50;
  const predictions = Array.from({ length: 7 }, (_, i) => {
    const noise = (Math.random() - 0.5) * 0.01;
    return {
      date: new Date(Date.now() + (i + 1) * 86400000).toISOString().split("T")[0],
      predicted: latest * (1 + trend * 0.1 * (i + 1) + noise),
      lower: latest * (1 + trend * 0.1 * (i + 1) + noise - 0.02),
      upper: latest * (1 + trend * 0.1 * (i + 1) + noise + 0.02),
    };
  });

  return {
    signal,
    confidence: Math.round(confidence),
    sma20: Math.round(sma20 * 100) / 100,
    sma50: Math.round(sma50 * 100) / 100,
    rsi: Math.round(rsi * 100) / 100,
    predictions,
    summary: signal === "BUY"
      ? `Bullish signal: Price above SMA20 (${sma20.toFixed(2)}) with RSI at ${rsi.toFixed(1)}`
      : signal === "SELL"
      ? `Bearish signal: Price below SMA20 with RSI at ${rsi.toFixed(1)}`
      : `Neutral: Price consolidating near SMA20 (${sma20.toFixed(2)})`,
  };
}
