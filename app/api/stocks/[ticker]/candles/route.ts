import { NextRequest, NextResponse } from "next/server";
import { getCandles } from "@/services/stock.service";

export async function GET(req: NextRequest, { params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  const { searchParams } = new URL(req.url);
  const from = parseInt(searchParams.get("from") || "0");
  const to = parseInt(searchParams.get("to") || "0");
  const resolution = searchParams.get("resolution") || "D";

  try {
    const candles = await getCandles(ticker, resolution, from, to);
    return NextResponse.json(candles, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    });
  } catch (e) {
    return NextResponse.json([], { status: 200 });
  }
}
