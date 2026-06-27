"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StockQuote } from "@/services/stock.service";

interface Props {
  quote: StockQuote;
  portfolio: any;
  userId?: string;
}

export function TradePanel({ quote, portfolio, userId }: Props) {
  const router = useRouter();
  const [type, setType] = useState<"BUY" | "SELL">("BUY");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const qty = parseFloat(quantity) || 0;
  const total = qty * quote.price;
  const cashBalance = portfolio?.cashBalance || 0;
  const holding = portfolio?.holdings?.[0];
  const canAfford = type === "BUY" ? total <= cashBalance : qty <= (holding?.quantity || 0);

  async function executeTrade() {
    if (!userId || qty <= 0 || !canAfford) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/portfolio/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: quote.ticker,
          quantity: qty,
          type,
          price: quote.price,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Trade failed");

      setResult({ success: true, message: `${type === "BUY" ? "Bought" : "Sold"} ${qty} shares successfully!` });
      setQuantity("");
      router.refresh();
    } catch (e: any) {
      setResult({ success: false, message: e.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card-glass p-5 sticky top-4">
      <h3 className="text-sm font-semibold text-foreground mb-4">Trade</h3>

      {/* Buy/Sell toggle */}
      <div className="flex rounded-lg bg-muted p-1 mb-4">
        {(["BUY", "SELL"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setType(t); setResult(null); }}
            className={cn(
              "flex-1 py-1.5 rounded-md text-xs font-semibold transition-all",
              type === t
                ? t === "BUY"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Stock info */}
      <div className="bg-muted rounded-lg p-3 mb-4">
        <p className="text-xs text-muted-foreground mb-1">Market Price</p>
        <p className="text-xl font-bold font-mono text-foreground">
          ₹{quote.price?.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
        </p>
        <p className={cn("text-xs font-mono mt-0.5",
          quote.changePercent >= 0 ? "text-green-400" : "text-red-400"
        )}>
          {quote.changePercent >= 0 ? "+" : ""}{quote.changePercent?.toFixed(2)}% today
        </p>
      </div>

      {/* Quantity input */}
      <div className="mb-4">
        <label className="text-xs text-muted-foreground mb-1.5 block">Quantity</label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => { setQuantity(e.target.value); setResult(null); }}
          placeholder="Enter shares"
          className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 font-mono"
        />
        {/* Quick amounts */}
        <div className="flex gap-1.5 mt-2">
          {[1, 5, 10, 25].map((n) => (
            <button
              key={n}
              onClick={() => setQuantity(n.toString())}
              className="flex-1 py-1 text-xs rounded-md bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Order summary */}
      {qty > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-muted rounded-lg p-3 mb-4 space-y-1.5"
        >
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Price × Qty</span>
            <span className="font-mono text-foreground">
              ₹{quote.price.toFixed(2)} × {qty}
            </span>
          </div>
          <div className="flex justify-between text-xs border-t border-border pt-1.5">
            <span className="text-muted-foreground font-semibold">Total</span>
            <span className="font-mono font-bold text-foreground">
              ₹{total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </span>
          </div>
          {type === "BUY" && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Available</span>
              <span className={cn("font-mono", total > cashBalance ? "text-red-400" : "text-green-400")}>
                ₹{cashBalance.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </motion.div>
      )}

      {/* Current holding */}
      {holding && (
        <div className="text-xs text-muted-foreground mb-3 flex justify-between">
          <span>You hold</span>
          <span className="font-mono text-foreground">{holding.quantity} shares @ ₹{holding.avgPrice.toFixed(2)}</span>
        </div>
      )}

      {/* Result message */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              "flex items-center gap-2 text-xs p-2.5 rounded-lg mb-3",
              result.success ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
            )}
          >
            {result.success
              ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
              : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            }
            {result.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trade button */}
      {!userId ? (
        <p className="text-xs text-center text-muted-foreground">Sign in to trade</p>
      ) : (
        <button
          onClick={executeTrade}
          disabled={qty <= 0 || !canAfford || loading}
          className={cn(
            "w-full py-2.5 rounded-lg text-sm font-semibold transition-all",
            type === "BUY"
              ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 disabled:opacity-40"
              : "bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-40",
            "disabled:cursor-not-allowed"
          )}
        >
          {loading ? "Processing..." : `${type === "BUY" ? "Buy" : "Sell"} ${qty > 0 ? qty : ""} Shares`}
        </button>
      )}

      <p className="text-xs text-center text-muted-foreground mt-3">
        Virtual trading — no real money involved
      </p>
    </div>
  );
}
