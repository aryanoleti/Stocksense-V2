"use client";

import { History } from "lucide-react";
import { RecentGrid } from "@/components/market/RecentGrid";
import { useRecent } from "@/lib/persist";
import { Card, CardEyebrow } from "@/components/ui/Card";

export default function RecentlyViewedPage() {
  const recent = useRecent();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-(--color-fg-subtle)">
            Recently viewed
          </p>
          <h1 className="mt-1 text-[28px] font-semibold tracking-tight">Pick up where you left off</h1>
          <p className="mt-1 text-[13.5px] text-(--color-fg-muted)">
            Every stock and ETF you open is remembered here — newest first.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-[12px] font-medium text-(--color-fg-muted)">
          <History className="h-3.5 w-3.5" /> {recent.length} recent
        </span>
      </header>

      <RecentGrid />

      <Card padding="md">
        <CardEyebrow>About this page</CardEyebrow>
        <p className="mt-2 text-[13.5px] leading-relaxed text-(--color-fg-muted)">
          Recently Viewed is stored locally in your browser. It does not sync across devices and we never see it.
          Clear it any time from your browser settings.
        </p>
      </Card>
    </div>
  );
}
