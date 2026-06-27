import Link from "next/link";
import { TrendingUp, TrendingDown, Briefcase, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function PortfolioSummary({ portfolio }: { portfolio: any }) {
  const cash = portfolio?.cashBalance || 500000;
  const invested = portfolio?.totalInvested || 0;

  return (
    <div className="card-glass p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Portfolio</h3>
        </div>
        <Link href="/portfolio" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-3">
        <div className="bg-muted rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Available Cash</p>
          <p className="text-lg font-bold font-mono text-foreground mt-0.5">
            ₹{cash.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-muted rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Invested</p>
          <p className="text-lg font-bold font-mono text-foreground mt-0.5">
            ₹{invested.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <Link
        href="/portfolio"
        className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors"
      >
        Manage Portfolio
      </Link>
    </div>
  );
}
