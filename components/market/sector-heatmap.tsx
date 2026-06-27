"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

const SECTORS = [
  { name: "Banking", change: 1.24 },
  { name: "IT", change: -0.87 },
  { name: "FMCG", change: 0.45 },
  { name: "Auto", change: 2.13 },
  { name: "Pharma", change: -1.52 },
  { name: "Energy", change: 0.78 },
  { name: "Metals", change: -0.33 },
  { name: "Realty", change: 1.89 },
  { name: "Telecom", change: 0.12 },
  { name: "Infra", change: -0.64 },
  { name: "Capital Goods", change: 1.47 },
  { name: "Media", change: -2.01 },
];

export function SectorHeatmap() {
  return (
    <div className="card-glass p-4">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" />
        Sector Performance
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {SECTORS.map((s) => {
          const isUp = s.change >= 0;
          const intensity = Math.min(Math.abs(s.change) / 3, 1);
          return (
            <div
              key={s.name}
              className="rounded-lg px-3 py-2 border transition-all hover:scale-105"
              style={{
                backgroundColor: isUp
                  ? `rgba(34, 197, 94, ${0.06 + intensity * 0.14})`
                  : `rgba(239, 68, 68, ${0.06 + intensity * 0.14})`,
                borderColor: isUp
                  ? `rgba(34, 197, 94, ${0.2 + intensity * 0.2})`
                  : `rgba(239, 68, 68, ${0.2 + intensity * 0.2})`,
              }}
            >
              <div className="text-xs font-medium text-foreground truncate">{s.name}</div>
              <div className={`text-xs font-semibold flex items-center gap-0.5 mt-0.5 ${isUp ? "text-green-400" : "text-red-400"}`}>
                {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isUp ? "+" : ""}{s.change.toFixed(2)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
