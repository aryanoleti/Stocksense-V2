import { NextResponse } from "next/server";
import { getMarketIndices } from "@/services/stock.service";

export const revalidate = 15;

export async function GET() {
  const indices = await getMarketIndices();
  return NextResponse.json(indices, {
    headers: { "Cache-Control": "public, s-maxage=15" },
  });
}
