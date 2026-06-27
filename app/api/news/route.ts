import { NextRequest, NextResponse } from "next/server";
import { getMarketNews } from "@/services/news.service";

export const revalidate = 300;

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q") || "India stock market NSE BSE";
  const articles = await getMarketNews(q);
  return NextResponse.json(articles, {
    headers: { "Cache-Control": "public, s-maxage=300" },
  });
}
