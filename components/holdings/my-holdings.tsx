"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient, useQueries } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Plus, Trash2, Pencil, X, Check, Wallet, TrendingUp, TrendingDown, Loader2,
} from "lucide-react";
import { NIFTY_50 } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { StockQuote } from "@/services/stock.service";

interface RealHolding {
  id: string;
  userId: string;
  ticker: string;
  companyName: string;
  quantity: number;
  avgPrice: number;
  buyDate: string;
  createdAt: string;
  updatedAt: string;
}

function toTicker(symbol: string) {
  return symbol.includes(".") ? symbol : `${symbol}.NS`;
}

function fmt(n: number) {
  if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`;
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(2)}L`;
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

async function fetchHoldings(): Promise<RealHolding[]> {
  const res = await fetch("/api/holdings");
  if (!res.ok) return [];
  return res.json();
}

function AddHoldingForm({ onAdded }: { onAdded: () => void }) {
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [avgPrice, setAvgPrice] = useState("");
  const [buyDate, setBuyDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [error, setError] = useState<string | null>(null);

  const addMutation = useMutation({
    mutationFn: async () => {
      const match = NIFTY_50.find(
        (s) => s.symbol.toLowerCase() === symbol.trim().toUpperCase().toLowerCase()
      );
      const ticker = toTicker(symbol.trim().toUpperCase());
      const companyName = match?.name || symbol.trim().toUpperCase();

      const res = await fetch("/api/holdings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker,
          companyName,
          quantity: parseFloat(quantity),
          avgPrice: parseFloat(avgPrice),
          buyDate: new Date(buyDate).toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to add holding");
      }
      return res.json();
    },
    onSuccess: () => {
      setSymbol("");
      setQuantity("");
      setAvgPrice("");
      setBuyDate(new Date().toISOString().split("T")[0]);
      setError(null);
      onAdded();
    },
    onError: (e: Error) => setError(e.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!symbol.trim() || !quantity || !avgPrice || !buyDate) {
      setError("Please fill in all fields");
      return;
    }
    addMutation.mutate();
  }

  return (
    <form onSubmit={handleSubmit} className="card-glass p-5 space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Add a Holding</h3>

      {error && (
        <p className="text-xs text-red-400 bg-red-400/10 rounded-lg p-2.5">{error}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="sm:col-span-1">
          <label className="text-xs text-muted-foreground mb-1 block">Ticker</label>
          <input
            list="holdings-stock-options"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="e.g. TCS"
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <datalist id="holdings-stock-options">
            {NIFTY_50.map((s) => (
              <option key={s.symbol} value={s.symbol}>
                {s.name}
              </option>
            ))}
          </datalist>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Quantity</label>
          <input
            type="number"
            step="any"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="10"
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Buy Price (₹)</label>
          <input
            type="number"
            step="any"
            min="0"
            value={avgPrice}
            onChange={(e) => setAvgPrice(e.target.value)}
            placeholder="1500.00"
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Buy Date</label>
          <input
            type="date"
            value={buyDate}
            onChange={(e) => setBuyDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={addMutation.isPending}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {addMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
        Add Holding
      </button>
    </form>
  );
}

function EditRow({
  holding,
  onCancel,
  onSaved,
}: {
  holding: RealHolding;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [quantity, setQuantity] = useState(String(holding.quantity));
  const [avgPrice, setAvgPrice] = useState(String(holding.avgPrice));
  const [buyDate, setBuyDate] = useState(holding.buyDate.split("T")[0]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/holdings/${holding.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: parseFloat(quantity),
          avgPrice: parseFloat(avgPrice),
          buyDate: new Date(buyDate).toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: onSaved,
  });

  return (
    <tr className="border-b border-border/50 bg-muted/30">
      <td className="py-2 px-2" colSpan={2}>
        <span className="text-sm font-medium text-foreground">{holding.ticker.replace(".NS", "")}</span>
      </td>
      <td className="py-2 px-2">
        <input
          type="number"
          step="any"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-20 bg-muted border border-border rounded px-2 py-1 text-xs text-foreground"
        />
      </td>
      <td className="py-2 px-2">
        <input
          type="number"
          step="any"
          value={avgPrice}
          onChange={(e) => setAvgPrice(e.target.value)}
          className="w-24 bg-muted border border-border rounded px-2 py-1 text-xs text-foreground"
        />
      </td>
      <td className="py-2 px-2">
        <input
          type="date"
          value={buyDate}
          onChange={(e) => setBuyDate(e.target.value)}
          max={new Date().toISOString().split("T")[0]}
          className="w-32 bg-muted border border-border rounded px-2 py-1 text-xs text-foreground"
        />
      </td>
      <td className="py-2 px-2" colSpan={3}>
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-400/15 text-green-400 hover:bg-green-400/25 transition-colors"
          >
            {updateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onCancel}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export function MyHoldings() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: holdings = [], isLoading } = useQuery({
    queryKey: ["real-holdings"],
    queryFn: fetchHoldings,
    staleTime: 15_000,
  });

  const tickers = useMemo(() => [...new Set(holdings.map((h) => h.ticker))], [holdings]);

  const quoteQueries = useQueries({
    queries: tickers.map((ticker) => ({
      queryKey: ["quote", ticker],
      queryFn: () => fetch(`/api/stocks/${ticker}/quote`).then((r) => r.json()) as Promise<StockQuote>,
      refetchInterval: 30_000,
      enabled: tickers.length > 0,
    })),
  });

  const quoteMap = useMemo(() => {
    const map = new Map<string, StockQuote>();
    tickers.forEach((ticker, i) => {
      const data = quoteQueries[i]?.data;
      if (data) map.set(ticker, data);
    });
    return map;
  }, [tickers, quoteQueries]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/holdings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["real-holdings"] }),
  });

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["real-holdings"] });
  }

  const enriched = holdings.map((h) => {
    const q = quoteMap.get(h.ticker);
    const livePrice = q?.price ?? h.avgPrice;
    const currentValue = livePrice * h.quantity;
    const investedValue = h.avgPrice * h.quantity;
    const pnl = currentValue - investedValue;
    const pnlPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0;
    return { ...h, livePrice, currentValue, investedValue, pnl, pnlPercent, name: q?.name || h.companyName };
  });

  const totalCurrentValue = enriched.reduce((sum, h) => sum + h.currentValue, 0);
  const totalInvested = enriched.reduce((sum, h) => sum + h.investedValue, 0);
  const totalPnL = totalCurrentValue - totalInvested;
  const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
  const isProfitable = totalPnL >= 0;

  return (
    <div className="space-y-6">
      {holdings.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Current Value", value: fmt(totalCurrentValue), icon: Wallet, highlight: true },
            { label: "Invested", value: fmt(totalInvested), icon: Wallet },
            {
              label: "P&L",
              value: `${isProfitable ? "+" : ""}${fmt(totalPnL)}`,
              sub: `${totalPnLPercent.toFixed(2)}%`,
              icon: isProfitable ? TrendingUp : TrendingDown,
              color: isProfitable ? "text-green-400" : "text-red-400",
            },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn("card-glass p-4", s.highlight && "border-primary/20 green-glow")}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <s.icon className={cn("w-3.5 h-3.5", s.color || "text-muted-foreground")} />
              </div>
              <p className={cn("text-xl font-bold font-mono", s.color || "text-foreground")}>
                {s.value}
              </p>
              {s.sub && <p className={cn("text-xs font-mono mt-0.5", s.color)}>{s.sub}</p>}
            </motion.div>
          ))}
        </div>
      )}

      <AddHoldingForm onAdded={refresh} />

      <div className="card-glass p-5 overflow-x-auto">
        <h3 className="text-sm font-semibold text-foreground mb-4">Your Holdings</h3>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : holdings.length === 0 ? (
          <div className="py-8 text-center">
            <Wallet className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No holdings added yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Add your real stock purchases above to track their live value here
            </p>
          </div>
        ) : (
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs text-muted-foreground font-medium py-2 px-2">Stock</th>
                <th className="text-left text-xs text-muted-foreground font-medium py-2 px-2">Live Price</th>
                <th className="text-left text-xs text-muted-foreground font-medium py-2 px-2">Qty</th>
                <th className="text-left text-xs text-muted-foreground font-medium py-2 px-2">Buy Price</th>
                <th className="text-left text-xs text-muted-foreground font-medium py-2 px-2">Buy Date</th>
                <th className="text-right text-xs text-muted-foreground font-medium py-2 px-2">Value</th>
                <th className="text-right text-xs text-muted-foreground font-medium py-2 px-2">P&amp;L</th>
                <th className="text-right text-xs text-muted-foreground font-medium py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {enriched.map((h) =>
                  editingId === h.id ? (
                    <EditRow
                      key={h.id}
                      holding={h}
                      onCancel={() => setEditingId(null)}
                      onSaved={() => {
                        setEditingId(null);
                        refresh();
                      }}
                    />
                  ) : (
                    <motion.tr
                      key={h.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-2.5 px-2">
                        <p className="font-medium text-foreground">{h.ticker.replace(".NS", "")}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[140px]">{h.name}</p>
                      </td>
                      <td className="py-2.5 px-2 font-mono text-foreground">
                        ₹{h.livePrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-2 font-mono text-foreground">{h.quantity}</td>
                      <td className="py-2.5 px-2 font-mono text-foreground">
                        ₹{h.avgPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-2 text-muted-foreground">
                        {format(new Date(h.buyDate), "MMM d, yyyy")}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-medium text-foreground">
                        {fmt(h.currentValue)}
                      </td>
                      <td className={cn(
                        "py-2.5 px-2 text-right font-mono font-medium",
                        h.pnl >= 0 ? "text-green-400" : "text-red-400"
                      )}>
                        {h.pnl >= 0 ? "+" : ""}{fmt(h.pnl)}
                        <span className="block text-xs">
                          ({h.pnl >= 0 ? "+" : ""}{h.pnlPercent.toFixed(2)}%)
                        </span>
                      </td>
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => setEditingId(h.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(h.id)}
                            disabled={deleteMutation.isPending}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                )}
              </AnimatePresence>
            </tbody>
            {enriched.length > 0 && (
              <tfoot>
                <tr className="border-t border-border">
                  <td colSpan={5} className="py-2.5 px-2 text-xs text-muted-foreground font-medium">Total</td>
                  <td className="py-2.5 px-2 text-right font-mono font-semibold text-foreground">
                    {fmt(totalCurrentValue)}
                  </td>
                  <td className={cn(
                    "py-2.5 px-2 text-right font-mono font-semibold",
                    isProfitable ? "text-green-400" : "text-red-400"
                  )}>
                    {isProfitable ? "+" : ""}{fmt(totalPnL)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>
    </div>
  );
}
