import { Suspense } from "react";
import { auth } from "@/auth";
import { getTopMovers, getMarketIndices } from "@/services/stock.service";
import { getMarketNews } from "@/services/news.service";
import { MarketIndices } from "@/components/market/market-indices";
import { TopMovers } from "@/components/market/top-movers";
import { NewsPreview } from "@/components/news/news-preview";
import { PortfolioSummary } from "@/components/portfolio/portfolio-summary";
import { MarketOverviewChart } from "@/components/charts/market-overview-chart";
import { WatchlistWidget } from "@/components/market/watchlist-widget";
import { Skeleton } from "@/components/ui/skeleton";
import { prisma } from "@/lib/prisma";

export const revalidate = 30;

export default async function HomePage() {
  const session = await auth();
  const [indices, movers, news, portfolio] = await Promise.allSettled([
    getMarketIndices(),
    getTopMovers(),
    getMarketNews(),
    prisma.portfolio.findUnique({
      where: { userId: session?.user?.id ?? "" },
      include: { holdings: true },
    }),
  ]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Good {getGreeting()},{" "}
          <span className="text-primary">{session?.user?.name?.split(" ")[0]}</span> 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Here's what's happening in the markets today
        </p>
      </div>

      {/* Market Indices */}
      <Suspense fallback={<Skeleton className="h-24 w-full rounded-xl" />}>
        <MarketIndices
          indices={indices.status === "fulfilled" ? indices.value : []}
        />
      </Suspense>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left 2 cols — Chart + Movers */}
        <div className="xl:col-span-2 space-y-6">
          <MarketOverviewChart />
          <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
            <TopMovers
              data={movers.status === "fulfilled" ? movers.value : { gainers: [], losers: [], mostActive: [] }}
            />
          </Suspense>
        </div>

        {/* Right col — Portfolio + Watchlist + News */}
        <div className="space-y-6">
          <Suspense fallback={<Skeleton className="h-40 w-full rounded-xl" />}>
            <PortfolioSummary
              portfolio={portfolio.status === "fulfilled" ? portfolio.value : null}
            />
          </Suspense>

          {/* Watchlist (client component — no Suspense needed) */}
          <WatchlistWidget />

          <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
            <NewsPreview
              articles={news.status === "fulfilled" ? news.value.slice(0, 4) : []}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
