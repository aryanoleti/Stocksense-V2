import { Suspense } from "react";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getQuote, getCandles, getCompanyNews, getAIPrediction } from "@/services/stock.service";
import { prisma } from "@/lib/prisma";
import { StockHeader } from "@/components/stocks/stock-header";
import { StockChart } from "@/components/charts/stock-chart";
import { AIPredictionChart } from "@/components/charts/ai-prediction-chart";
import { StockStats } from "@/components/stocks/stock-stats";
import { AIReviewCard } from "@/components/stocks/ai-review-card";
import { StockNews } from "@/components/stocks/stock-news";
import { TradePanel } from "@/components/portfolio/trade-panel";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  params: Promise<{ ticker: string }>;
}

export async function generateMetadata({ params }: Props) {
  try {
    const { ticker } = await params;
    const quote = await getQuote(ticker);
    return {
      title: `${quote.name} (${quote.ticker.replace(".NS", "")}) — StockSense`,
      description: `Live stock price, chart, and AI analysis for ${quote.name}`,
    };
  } catch {
    return { title: "Stock Details" };
  }
}

export default async function StockPage({ params }: Props) {
  const { ticker } = await params;
  const session = await auth();

  try {
    const now = Math.floor(Date.now() / 1000);
    const oneYear = now - 365 * 86400;

    const [quote, candles, news] = await Promise.all([
      getQuote(ticker),
      getCandles(ticker, "D", oneYear, now),
      getCompanyNews(
        ticker,
        new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0],
        new Date().toISOString().split("T")[0]
      ),
    ]);

    const aiPrediction = await getAIPrediction(ticker, candles);

    // Record recently viewed (fire-and-forget)
    if (session?.user?.id) {
      prisma.recentlyViewed.upsert({
        where: { userId_ticker: { userId: session.user.id, ticker } },
        update: { viewedAt: new Date() },
        create: { userId: session.user.id, ticker },
      }).catch(() => {});
    }

    const portfolio = session?.user?.id
      ? await prisma.portfolio.findUnique({
          where: { userId: session.user.id },
          include: { holdings: { where: { ticker } } },
        })
      : null;

    return (
      <div className="space-y-6 animate-fade-in">
        <StockHeader quote={quote} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <Suspense fallback={<Skeleton className="h-80 w-full rounded-xl" />}>
              <StockChart ticker={ticker} initialData={candles} />
            </Suspense>

            {aiPrediction && (
              <AIPredictionChart
                ticker={ticker}
                historicalData={candles.slice(-30)}
                prediction={aiPrediction}
              />
            )}

            <StockStats quote={quote} />

            <AIReviewCard ticker={ticker} />

            {news.length > 0 && (
              <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
                <StockNews articles={news} />
              </Suspense>
            )}
          </div>

          <div>
            <TradePanel
              quote={quote}
              portfolio={portfolio}
              userId={session?.user?.id}
            />
          </div>
        </div>
      </div>
    );
  } catch {
    notFound();
  }
}
