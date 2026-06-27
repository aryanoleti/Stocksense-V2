// services/news.service.ts

const NEWS_API_KEY = process.env.NEWS_API_KEY!;

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment: "positive" | "neutral" | "negative";
  ticker?: string;
}

function analyzeSentiment(text: string): "positive" | "neutral" | "negative" {
  const positive = ["surge", "gain", "rise", "profit", "growth", "bullish", "rally", "record", "beat", "strong", "soar", "jump", "up", "high"];
  const negative = ["fall", "drop", "loss", "decline", "bearish", "crash", "plunge", "weak", "miss", "down", "low", "sell-off", "concern", "risk"];

  const lower = text.toLowerCase();
  const posScore = positive.filter((w) => lower.includes(w)).length;
  const negScore = negative.filter((w) => lower.includes(w)).length;

  if (posScore > negScore + 1) return "positive";
  if (negScore > posScore + 1) return "negative";
  return "neutral";
}

export async function getMarketNews(query: string = "India stock market NSE BSE"): Promise<NewsArticle[]> {
  try {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${NEWS_API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    const data = await res.json();

    if (!data.articles) return getFallbackNews();

    return data.articles
      .filter((a: any) => a.title && a.description && a.url)
      .map((a: any) => ({
        id: Buffer.from(a.url).toString("base64").slice(0, 16),
        title: a.title,
        summary: a.description,
        source: a.source.name,
        url: a.url,
        publishedAt: a.publishedAt,
        sentiment: analyzeSentiment(a.title + " " + a.description),
      }));
  } catch {
    return getFallbackNews();
  }
}

function getFallbackNews(): NewsArticle[] {
  return [
    {
      id: "1",
      title: "Nifty 50 trades higher as IT stocks rally",
      summary: "Indian equity markets opened in the green with IT and banking sectors leading gains amid positive global cues.",
      source: "Economic Times",
      url: "https://economictimes.indiatimes.com",
      publishedAt: new Date().toISOString(),
      sentiment: "positive",
    },
    {
      id: "2",
      title: "RBI keeps repo rate unchanged at 6.5%",
      summary: "The Reserve Bank of India's Monetary Policy Committee voted to keep the benchmark rate steady, maintaining an accommodative stance.",
      source: "Business Standard",
      url: "https://www.business-standard.com",
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      sentiment: "neutral",
    },
    {
      id: "3",
      title: "FII outflows continue amid global uncertainty",
      summary: "Foreign institutional investors pulled out funds from Indian markets as dollar strengthened globally.",
      source: "Mint",
      url: "https://www.livemint.com",
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      sentiment: "negative",
    },
  ];
}
