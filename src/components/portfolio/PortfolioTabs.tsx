"use client";

import { useState } from "react";
import { Briefcase, Gamepad2 } from "lucide-react";
import { PortfolioApp } from "./PortfolioApp";
import { PortfolioSimulator } from "./PortfolioSimulator";
import { cn } from "@/lib/cn";

type Tab = "holdings" | "simulator";

export function PortfolioTabs() {
  const [tab, setTab] = useState<Tab>("holdings");
  return (
    <div className="space-y-6">
      <div className="inline-flex items-center gap-1 rounded-2xl border border-(--color-border) bg-(--color-surface-2) p-1">
        <TabButton active={tab === "holdings"} onClick={() => setTab("holdings")} icon={<Briefcase className="h-4 w-4" />}>
          My Holdings
        </TabButton>
        <TabButton active={tab === "simulator"} onClick={() => setTab("simulator")} icon={<Gamepad2 className="h-4 w-4" />}>
          Simulator
        </TabButton>
      </div>
      {tab === "holdings" ? <PortfolioApp /> : <PortfolioSimulator />}
    </div>
  );
}

function TabButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13.5px] font-semibold transition-colors",
        active ? "bg-(--color-surface) text-(--color-fg) shadow-xs" : "text-(--color-fg-muted) hover:text-(--color-fg)",
      )}
    >
      {icon}
      {children}
    </button>
  );
}
