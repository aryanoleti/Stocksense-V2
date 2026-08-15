import { PortfolioTabs } from "@/components/portfolio/PortfolioTabs";
import { FeatureGate } from "@/components/learn/FeatureGate";

export const metadata = { title: "Portfolio Desk — StockSense" };

/* Gated on Level 5: position sizing, spreading risk and rebalancing are
   exactly what the simulator asks the user to do. */
export default function PortfolioPage() {
  return (
    <FeatureGate feature="portfolio">
      <PortfolioTabs />
    </FeatureGate>
  );
}
