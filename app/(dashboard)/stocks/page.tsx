import { Suspense } from "react";
import { POPULAR_STOCKS, getQuote } from "@/services/stock.service";
import { StockBrowser } from "@/components/stocks/stock-browser";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = { title: "Stocks" };
export const revalidate = 30;

export default async function StocksPage() {
  const quotes = await Promise.allSettled(POPULAR_STOCKS.map((t) => getQuote(t)));
  const stocks = quotes
    .filter((q): q is PromiseFulfilledResult<Awaited<ReturnType<typeof getQuote>>> => q.status === "fulfilled")
    .map((q) => q.value)
    .filter((q) => q.price > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Stocks</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse and discover Indian stocks with live prices
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <StockBrowser initialStocks={stocks} />
      </Suspense>
    </div>
  );
}
