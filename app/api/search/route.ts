import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { searchStocks } from "@/services/stock.service";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const recent = searchParams.get("recent") === "true";

  // Return recent searches (no query needed)
  if (recent) {
    const session = await auth();
    if (!session) return NextResponse.json({ results: [], recent: [] });

    const history = await prisma.searchHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { searchedAt: "desc" },
      take: 5,
      select: { query: true, ticker: true, searchedAt: true },
    });

    return NextResponse.json({ results: [], recent: history });
  }

  if (q.length < 2) return NextResponse.json({ results: [] });

  try {
    const results = await searchStocks(q);
    return NextResponse.json({ results }, {
      headers: { "Cache-Control": "public, s-maxage=60" },
    });
  } catch {
    return NextResponse.json({ results: [] });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ ok: false });

  const { query, ticker } = await req.json();
  if (!query) return NextResponse.json({ ok: false });

  // Save to search history (upsert so same query updates timestamp)
  await prisma.searchHistory.create({
    data: {
      userId: session.user.id,
      query,
      ticker: ticker || null,
      searchedAt: new Date(),
    },
  }).catch(() => {
    // Ignore duplicate errors — we allow multiple entries per query
  });

  return NextResponse.json({ ok: true });
}
