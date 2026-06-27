import { NextRequest, NextResponse } from "next/server";
import { getQuote } from "@/services/stock.service";

export const revalidate = 15;

export async function GET(req: NextRequest, { params }: { params: { ticker: string } }) {
  try {
    const quote = await getQuote(params.ticker);
    return NextResponse.json(quote, {
      headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30" },
    });
  } catch (e) {
    return NextResponse.json({ error: "Stock not found" }, { status: 404 });
  }
}
