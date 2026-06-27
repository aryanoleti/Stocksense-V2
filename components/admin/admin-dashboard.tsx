"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Activity, MessageSquare, Newspaper, BookOpen, TrendingUp,
  Shield, BarChart2, Clock, Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Stats {
  users: number;
  transactions: number;
  messages: number;
  news: number;
  glossary: number;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
  role: string;
}

interface Broker {
  id: string;
  name: string;
  category: string;
  rating: number;
  isActive: boolean;
}

interface Props {
  stats: Stats;
  recentUsers: User[];
  brokers: Broker[];
}

const TABS = ["Overview", "Users", "Brokers"] as const;

export function AdminDashboard({ stats, recentUsers, brokers }: Props) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");

  const statCards = [
    { icon: Users, label: "Total users", value: stats.users, color: "text-blue-400" },
    { icon: TrendingUp, label: "Transactions", value: stats.transactions, color: "text-green-400" },
    { icon: MessageSquare, label: "AI messages", value: stats.messages, color: "text-purple-400" },
    { icon: Newspaper, label: "News cached", value: stats.news, color: "text-yellow-400" },
    { icon: BookOpen, label: "Glossary terms", value: stats.glossary, color: "text-pink-400" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Platform management and analytics</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map(({ icon: Icon, label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="stat-card"
          >
            <Icon className={cn("w-4 h-4", color)} />
            <div className="text-xl font-bold text-foreground">{value.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "Overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent activity */}
          <div className="card-glass p-4">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Recent Users
            </h3>
            <div className="space-y-3">
              {recentUsers.slice(0, 5).map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {(u.name || u.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{u.name || "No name"}</div>
                    <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {new Date(u.createdAt).toLocaleDateString("en-IN")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="card-glass p-4">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" />
              Platform Stats
            </h3>
            <div className="space-y-3">
              {[
                { label: "Avg trades per user", value: stats.users > 0 ? (stats.transactions / stats.users).toFixed(1) : "0" },
                { label: "Avg messages per session", value: "~5" },
                { label: "Active brokers", value: brokers.filter((b) => b.isActive).length },
                { label: "Glossary terms", value: stats.glossary },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm font-semibold text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "Users" && (
        <div className="card-glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Name", "Email", "Role", "Joined"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{u.name || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3" />
                        {u.email}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        u.role === "ADMIN" ? "bg-yellow-400/10 text-yellow-400" : "bg-muted text-muted-foreground"
                      )}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Brokers" && (
        <div className="card-glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Name", "Category", "Rating", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {brokers.map((b) => (
                  <tr key={b.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{b.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.category}</td>
                    <td className="px-4 py-3 text-foreground">{b.rating.toFixed(1)}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        b.isActive ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"
                      )}>
                        {b.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
                {brokers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      No brokers found. Add brokers via the API or seed script.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
