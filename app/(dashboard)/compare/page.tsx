import { CompareApp } from "@/components/compare/compare-app";

export const metadata = { title: "Compare Stocks" };

export default function ComparePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Compare Stocks</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pick 2–4 stocks to compare price history, key metrics, and get an AI verdict
        </p>
      </div>

      <CompareApp />
    </div>
  );
}
