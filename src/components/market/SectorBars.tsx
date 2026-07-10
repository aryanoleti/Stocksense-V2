"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SECTOR_PERFORMANCE } from "@/lib/mock-data";

export function SectorBars() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={SECTOR_PERFORMANCE} margin={{ top: 12, right: 8, left: 4, bottom: 0 }}>
          <XAxis dataKey="sector" stroke="#7c8a82" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
          <YAxis stroke="#7c8a82" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} unit="%" width={36} />
          <Tooltip
            cursor={{ fill: "rgba(17, 94, 60, 0.06)" }}
            contentStyle={{
              border: "1px solid var(--color-border)",
              borderRadius: 12,
              boxShadow: "0 12px 30px -16px rgba(13,31,23,0.18)",
              fontSize: 12,
              padding: "8px 10px",
            }}
            formatter={(v) => {
              const n = Number(v);
              return [`${n >= 0 ? "+" : ""}${n.toFixed(2)}%`, "Change"];
            }}
            labelStyle={{ color: "var(--color-fg-subtle)", fontSize: 11 }}
          />
          <Bar dataKey="change" radius={[6, 6, 0, 0]}>
            {SECTOR_PERFORMANCE.map((s) => (
              <Cell key={s.sector} fill={s.change >= 0 ? "#1f7a4f" : "#c4361c"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
