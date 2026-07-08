import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { generateComparisonInsight, type ComparisonStockSummary } from "@/services/ai.service";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();
  const stocks: ComparisonStockSummary[] = body?.stocks;

  if (!Array.isArray(stocks) || stocks.length < 2 || stocks.length > 4) {
    return NextResponse.json(
      { error: "Provide between 2 and 4 stocks to compare" },
      { status: 400 }
    );
  }

  try {
    const insight = await generateComparisonInsight(stocks);
    return NextResponse.json(insight);
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to generate comparison insight" },
      { status: 500 }
    );
  }
}
