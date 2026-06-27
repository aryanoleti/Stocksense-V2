import { NextResponse } from "next/server";
import { getTopMovers } from "@/services/stock.service";

export const revalidate = 30;

export async function GET() {
  const movers = await getTopMovers();
  return NextResponse.json(movers, {
    headers: { "Cache-Control": "public, s-maxage=30" },
  });
}
