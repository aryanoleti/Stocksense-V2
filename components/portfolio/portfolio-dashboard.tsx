"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from "recharts";
import { TrendingUp, TrendingDown, Wallet, BarChart2, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4", "#f97316"];

interface Props {
  portfolio: any;
  holdings: any[];
  transactions: any[];
  stats: {
    totalCurrentValue: number;
    totalInvested: number;
    totalPnL: number;
    totalPnLPercent: number;
    cashBalance: number;
    netWorth: number;
  };
}

function fmt(n: number) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)}L`;
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function PortfolioDashboard({ portfolio, holdings, transactions, stats }: Props) {
  const [tab, setTab] = useState<"holdings" | "transactions">("holdings");
  const isProfitable = stats.totalPnL >= 0;

  const pieData = holdings.map((h, i) => ({
    name: h.ticker.replace(".NS", ""),
    value: h.currentValue,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Portfolio</h1>
        <p className="text-muted-foreground text-sm">Virtual portfolio with ₹5,00,000 starting balance</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Net Worth", value: fmt(stats.netWorth), icon: Wallet, highlight: true },
          { label: "Invested", value: fmt(stats.totalInvested), icon: BarChart2 },
          {
            label: "P&L",
            value: `${isProfitable ? "+" : ""}${fmt(stats.totalPnL)}`,
            sub: `${stats.totalPnLPercent.toFixed(2)}%`,
            icon: isProfitable ? TrendingUp : TrendingDown,
            color: isProfitable ? "text-green-400" : "text-red-400",
          },
          { label: "Cash", value: fmt(stats.cashBalance), icon: Wallet },
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
            {s.sub && (
              <p className={cn("text-xs font-mono mt-0.5", s.color)}>{s.sub}</p>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation chart */}
        {holdings.length > 0 && (
          <div className="card-glass p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Allocation</h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                    formatter={(val: any) => [fmt(val), ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-2">
              {pieData.slice(0, 5).map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                    <span className="text-muted-foreground font-mono">{d.name}</span>
                  </div>
                  <span className="text-foreground font-mono">{fmt(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Holdings / Transactions */}
        <div className={cn("card-glass p-5", holdings.length > 0 ? "lg:col-span-2" : "lg:col-span-3")}>
          <div className="flex gap-2 mb-4">
            {(["holdings", "transactions"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all",
                  tab === t ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "holdings" ? (
            holdings.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                No holdings yet. Search for stocks to buy.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground border-b border-border">
                      {["Stock", "Qty", "Avg Price", "LTP", "Current Val", "P&L"].map((h) => (
                        <th key={h} className="text-left pb-2 pr-4 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {holdings.map((h) => (
                      <tr key={h.id} className="hover:bg-muted/50 transition-colors">
                        <td className="py-3 pr-4">
                          <Link href={`/stock/${h.ticker}`} className="hover:text-primary transition-colors">
                            <p className="font-mono text-xs font-semibold">{h.ticker.replace(".NS", "")}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-28">{h.companyName}</p>
                          </Link>
                        </td>
                        <td className="py-3 pr-4 font-mono text-xs">{h.quantity}</td>
                        <td className="py-3 pr-4 font-mono text-xs">₹{h.avgPrice.toFixed(2)}</td>
                        <td className="py-3 pr-4 font-mono text-xs">
                          <span>₹{h.livePrice?.toFixed(2)}</span>
                          <span className={cn("block text-xs", h.changePercent >= 0 ? "text-green-400" : "text-red-400")}>
                            {h.changePercent >= 0 ? "+" : ""}{h.changePercent?.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-3 pr-4 font-mono text-xs">{fmt(h.currentValue)}</td>
                        <td className="py-3">
                          <div className={cn("font-mono text-xs font-semibold", h.pnl >= 0 ? "text-green-400" : "text-red-400")}>
                            {h.pnl >= 0 ? "+" : ""}{fmt(h.pnl)}
                            <span className="block opacity-75">{h.pnlPercent.toFixed(2)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {transactions.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                  No transactions yet.
                </div>
              ) : (
                transactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center",
                        t.type === "BUY" ? "bg-green-400/15" : "bg-red-400/15"
                      )}>
                        {t.type === "BUY"
                          ? <ArrowDownRight className="w-3 h-3 text-green-400" />
                          : <ArrowUpRight className="w-3 h-3 text-red-400" />
                        }
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">
                          {t.type} {t.ticker.replace(".NS", "")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.quantity} × ₹{t.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-xs font-mono font-semibold",
                        t.type === "BUY" ? "text-red-400" : "text-green-400"
                      )}>
                        {t.type === "BUY" ? "-" : "+"}{fmt(t.total)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(t.createdAt), "dd MMM, HH:mm")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
