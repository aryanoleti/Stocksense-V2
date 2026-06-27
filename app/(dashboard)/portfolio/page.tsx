import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PortfolioDashboard } from "@/components/portfolio/portfolio-dashboard";
import { getQuote } from "@/services/stock.service";

export const metadata = { title: "Portfolio" };

export default async function PortfolioPage() {
  const session = await auth();

  const portfolio = await prisma.portfolio.findUnique({
    where: { userId: session?.user?.id ?? "" },
    include: { holdings: true },
  });

  const transactions = await prisma.transaction.findMany({
    where: { userId: session?.user?.id ?? "" },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Fetch live prices for holdings
  let enrichedHoldings: any[] = [];
  if (portfolio?.holdings.length) {
    const quotes = await Promise.allSettled(
      portfolio.holdings.map((h) => getQuote(h.ticker))
    );

    enrichedHoldings = portfolio.holdings.map((holding, i) => {
      const q = quotes[i];
      const livePrice = q.status === "fulfilled" ? q.value.price : holding.avgPrice;
      const currentValue = livePrice * holding.quantity;
      const investedValue = holding.avgPrice * holding.quantity;
      const pnl = currentValue - investedValue;
      const pnlPercent = (pnl / investedValue) * 100;

      return {
        ...holding,
        livePrice,
        currentValue,
        investedValue,
        pnl,
        pnlPercent,
        name: q.status === "fulfilled" ? q.value.name : holding.companyName,
        changePercent: q.status === "fulfilled" ? q.value.changePercent : 0,
      };
    });
  }

  const totalCurrentValue = enrichedHoldings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalInvested = enrichedHoldings.reduce((sum, h) => sum + h.investedValue, 0);
  const totalPnL = totalCurrentValue - totalInvested;
  const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
  const cashBalance = portfolio?.cashBalance || 500000;
  const netWorth = cashBalance + totalCurrentValue;

  return (
    <PortfolioDashboard
      portfolio={portfolio}
      holdings={enrichedHoldings}
      transactions={transactions}
      stats={{ totalCurrentValue, totalInvested, totalPnL, totalPnLPercent, cashBalance, netWorth }}
    />
  );
}
