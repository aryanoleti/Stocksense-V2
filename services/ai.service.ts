// services/ai.service.ts
import Groq from "groq-sdk";

const getGroq = () => new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

const SYSTEM_PROMPT = `You are StockSense AI, an expert financial assistant specializing in Indian and global stock markets. You help users understand:

- Stock analysis and valuations
- Market trends and indices (Nifty, Sensex, Bank Nifty)
- Portfolio strategies
- Financial ratios (P/E, EPS, ROE, etc.)
- Technical and fundamental analysis
- Investment concepts and glossary
- Risk management
- Tax implications (LTCG/STCG for India)
- IPO analysis
- Mutual funds and ETFs

Always be helpful, accurate, and educational. Format responses with markdown when useful.
Never provide specific investment advice as financial advice. Always remind users to do their own research.
Keep responses concise but informative. Use bullet points for clarity.
If asked about specific stock prices, mention you can't provide real-time data but explain the analysis.`;

export async function createChatCompletion(
  messages: { role: "user" | "assistant"; content: string }[],
  stream: boolean = true
) {
  return getGroq().chat.completions.create({
    model: "llama-3.1-70b-versatile",
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    max_tokens: 1024,
    temperature: 0.7,
    stream,
  });
}

export async function generateStockInsight(stockData: {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
  pe?: number;
  week52High?: number;
  week52Low?: number;
}) {
  const prompt = `Give a brief 2-3 sentence market insight for ${stockData.name} (${stockData.ticker}):
- Current price: ₹${stockData.price}
- Day change: ${stockData.changePercent?.toFixed(2)}%
- P/E ratio: ${stockData.pe || "N/A"}
- 52W High: ₹${stockData.week52High || "N/A"}
- 52W Low: ₹${stockData.week52Low || "N/A"}

Be factual and brief. Mention if it's trading near 52W high/low. Don't give direct buy/sell advice.`;

  const response = await getGroq().chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 150,
    stream: false,
  });

  return response.choices[0]?.message?.content || "";
}

export interface ComparisonStockSummary {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
  marketCap?: number;
  pe?: number;
  dividendYield?: number;
  eps?: number;
  beta?: number;
  week52High?: number;
  week52Low?: number;
  sector?: string;
}

export interface ComparisonInsight {
  verdict: string;
  reasoning: string;
  stocks: {
    ticker: string;
    strengths: string[];
    risks: string[];
    suitedFor: string;
  }[];
}

function stripJsonFences(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch) return fenceMatch[1].trim();
  return trimmed;
}

export async function generateComparisonInsight(
  stocks: ComparisonStockSummary[]
): Promise<ComparisonInsight> {
  const stockLines = stocks
    .map(
      (s) =>
        `- ${s.name} (${s.ticker})${s.sector ? `, sector: ${s.sector}` : ""}: price ₹${s.price}, day change ${
          typeof s.changePercent === "number" ? s.changePercent.toFixed(2) : s.changePercent
        }%, market cap ₹${s.marketCap ?? "N/A"}, P/E ${s.pe ?? "N/A"}, dividend yield ${s.dividendYield ?? "N/A"}%, EPS ₹${s.eps ?? "N/A"}, beta ${s.beta ?? "N/A"}, 52W high ₹${s.week52High ?? "N/A"}, 52W low ₹${s.week52Low ?? "N/A"}`
    )
    .join("\n");

  const prompt = `Compare the following stocks for an investor doing their own research:
${stockLines}

Respond with ONLY a JSON object (no prose, no markdown fences) in exactly this shape:
{
  "verdict": "one or two sentence overall educational takeaway comparing these stocks",
  "reasoning": "a short paragraph explaining the comparison across valuation, growth, risk, and stability",
  "stocks": [
    { "ticker": "string", "strengths": ["string", "string"], "risks": ["string", "string"], "suitedFor": "one sentence describing what kind of investor/goal this stock may suit" }
  ]
}

Include one entry in "stocks" for every stock listed above, in the same order. Be factual, educational, and balanced. Do not give direct buy/sell advice — this is for research/education only. The reply must be a JSON object.`;

  const response = await getGroq().chat.completions.create({
    model: "llama-3.1-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    max_tokens: 1024,
    temperature: 0.5,
    stream: false,
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content || "{}";

  try {
    return JSON.parse(raw) as ComparisonInsight;
  } catch {
    try {
      return JSON.parse(stripJsonFences(raw)) as ComparisonInsight;
    } catch {
      return {
        verdict: "AI comparison unavailable — could not parse response.",
        reasoning: "",
        stocks: stocks.map((s) => ({
          ticker: s.ticker,
          strengths: [],
          risks: [],
          suitedFor: "",
        })),
      };
    }
  }
}

export interface StockReview {
  verdict: string;
  strengths: string[];
  risks: string[];
  suitedFor: string;
}

export async function generateStockReview(stockData: {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
  pe?: number;
  marketCap?: number;
  dividendYield?: number;
  eps?: number;
  beta?: number;
  week52High?: number;
  week52Low?: number;
  sector?: string;
}): Promise<StockReview> {
  const prompt = `Give a structured educational review of ${stockData.name} (${stockData.ticker}) for an investor doing their own research:
- Sector: ${stockData.sector || "N/A"}
- Current price: ₹${stockData.price}
- Day change: ${typeof stockData.changePercent === "number" ? stockData.changePercent.toFixed(2) : stockData.changePercent}%
- Market cap: ₹${stockData.marketCap ?? "N/A"}
- P/E ratio: ${stockData.pe ?? "N/A"}
- Dividend yield: ${stockData.dividendYield ?? "N/A"}%
- EPS: ₹${stockData.eps ?? "N/A"}
- Beta: ${stockData.beta ?? "N/A"}
- 52W High: ₹${stockData.week52High ?? "N/A"}
- 52W Low: ₹${stockData.week52Low ?? "N/A"}

Respond with ONLY a JSON object (no prose, no markdown fences) in exactly this shape:
{
  "verdict": "one or two sentence factual, balanced summary — do not give direct buy/sell advice",
  "strengths": ["string", "string", "string"],
  "risks": ["string", "string", "string"],
  "suitedFor": "one sentence describing what kind of investor or goal this stock may suit"
}

Be factual and educational. The reply must be a JSON object.`;

  const response = await getGroq().chat.completions.create({
    model: "llama-3.1-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    max_tokens: 500,
    temperature: 0.5,
    stream: false,
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content || "{}";

  try {
    return JSON.parse(raw) as StockReview;
  } catch {
    try {
      return JSON.parse(stripJsonFences(raw)) as StockReview;
    } catch {
      return {
        verdict: "AI review unavailable — could not parse response.",
        strengths: [],
        risks: [],
        suitedFor: "",
      };
    }
  }
}
