import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { generateStockReview, generateStockInsight } from "@/services/ai.service";
import { getQuote } from "@/services/stock.service";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();
  const ticker: string = body?.ticker;

  if (!ticker) {
    return NextResponse.json({ error: "Ticker required" }, { status: 400 });
  }

  try {
    const quote = await getQuote(ticker);
    const insightInput = {
      ticker: quote.ticker,
      name: quote.name,
      price: quote.price,
      changePercent: quote.changePercent,
      pe: quote.pe,
      marketCap: quote.marketCap,
      eps: quote.eps,
      week52High: quote.week52High,
      week52Low: quote.week52Low,
      sector: quote.sector,
    };

    // Structured review (strengths/risks/suitedFor) plus a short freeform
    // one-line insight from generateStockInsight, generated in parallel.
    const [review, quickInsight] = await Promise.all([
      generateStockReview(insightInput),
      generateStockInsight(insightInput).catch(() => ""),
    ]);

    return NextResponse.json({ ...review, quickInsight });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to generate AI review" },
      { status: 500 }
    );
  }
}
