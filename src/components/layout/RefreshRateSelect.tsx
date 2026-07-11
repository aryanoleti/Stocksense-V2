"use client";

import { Timer } from "lucide-react";
import { REFRESH_OPTIONS, setRefreshMs, useRefreshMs } from "@/lib/refresh-rate";

/** Topbar control: how often displayed prices update. */
export function RefreshRateSelect() {
  const ms = useRefreshMs();
  return (
    <label
      className="hidden sm:inline-flex h-10 items-center gap-1.5 rounded-xl border border-(--color-border) bg-(--color-surface) px-2.5 text-(--color-fg-muted)"
      title="Price refresh rate"
    >
      <Timer className="h-[16px] w-[16px] text-(--color-fg-subtle)" />
      <select
        value={ms}
        onChange={(e) => setRefreshMs(Number(e.target.value))}
        className="bg-transparent text-[12.5px] font-semibold text-(--color-fg-muted) focus:outline-none"
        aria-label="Price refresh rate"
      >
        {REFRESH_OPTIONS.map((o) => (
          <option key={o.ms} value={o.ms}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
