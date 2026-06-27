// services/ai.service.ts
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
  return groq.chat.completions.create({
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

  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 150,
    stream: false,
  });

  return response.choices[0]?.message?.content || "";
}
