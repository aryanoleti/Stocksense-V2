import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getQuote } from "@/services/stock.service";
import { RecentlyViewedList } from "@/components/stocks/recently-viewed-list";

export const metadata = { title: "Recently Viewed" };

export default async function RecentlyViewedPage() {
  const session = await auth();

  const recentItems = await prisma.recentlyViewed.findMany({
    where: { userId: session!.user.id },
    orderBy: { viewedAt: "desc" },
    take: 20,
  });

  const quotesSettled = await Promise.allSettled(
    recentItems.map((item) => getQuote(item.ticker))
  );

  const stocks = recentItems.map((item, i) => {
    const q = quotesSettled[i];
    return {
      ticker: item.ticker,
      viewedAt: item.viewedAt,
      ...(q.status === "fulfilled" ? q.value : { name: item.ticker, price: 0, changePercent: 0, change: 0 }),
    };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Recently Viewed</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Stocks you've checked out recently
        </p>
      </div>

      <RecentlyViewedList stocks={stocks} />
    </div>
  );
}
