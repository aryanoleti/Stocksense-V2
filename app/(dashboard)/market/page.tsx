import { Suspense } from "react";
import { getMarketIndices, getTopMovers } from "@/services/stock.service";
import { MarketIndices } from "@/components/market/market-indices";
import { TopMovers } from "@/components/market/top-movers";
import { MarketOverviewChart } from "@/components/charts/market-overview-chart";
import { SectorHeatmap } from "@/components/market/sector-heatmap";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = { title: "Market Overview" };
export const revalidate = 30;

export default async function MarketPage() {
  const [indices, movers] = await Promise.allSettled([
    getMarketIndices(),
    getTopMovers(),
  ]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Market Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Live market data for NSE, BSE, and major indices
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-24 w-full rounded-xl" />}>
        <MarketIndices indices={indices.status === "fulfilled" ? indices.value : []} />
      </Suspense>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <MarketOverviewChart />
        </div>
        <div>
          <SectorHeatmap />
        </div>
      </div>

      <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
        <TopMovers
          data={movers.status === "fulfilled" ? movers.value : { gainers: [], losers: [], mostActive: [] }}
        />
      </Suspense>
    </div>
  );
}
