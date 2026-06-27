"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, TrendingUp, BarChart2, Clock, Briefcase,
  BookOpen, Newspaper, Bot, ShoppingCart, ChevronLeft, ChevronRight,
  Zap, Shield
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { User } from "next-auth";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Home" },
  { href: "/market", icon: TrendingUp, label: "Market" },
  { href: "/stocks", icon: BarChart2, label: "Stocks" },
  { href: "/recently-viewed", icon: Clock, label: "Recently Viewed" },
  { href: "/portfolio", icon: Briefcase, label: "Portfolio" },
  { href: "/glossary", icon: BookOpen, label: "Glossary" },
  { href: "/news", icon: Newspaper, label: "News" },
  { href: "/ask-ai", icon: Bot, label: "Ask AI" },
  { href: "/buy", icon: ShoppingCart, label: "Buy Stocks" },
];

const adminItems = [
  { href: "/admin", icon: Shield, label: "Admin" },
];

interface SidebarProps {
  user: User & { role?: string };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative flex flex-col bg-card border-r border-border h-full z-30 hidden md:flex"
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-16 border-b border-border">
        <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-primary-foreground" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="font-bold text-foreground text-base whitespace-nowrap"
            >
              StockSense
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className={cn("w-4 h-4 flex-shrink-0", active && "text-primary")} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {active && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute right-0 w-0.5 h-5 bg-primary rounded-l"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Admin section */}
      {user.role === "ADMIN" && (
        <div className="px-2 pb-2 border-t border-border pt-2 space-y-0.5">
          {adminItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-yellow-400/15 text-yellow-400"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className={cn("w-4 h-4 flex-shrink-0", active && "text-yellow-400")} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
  );
}
