"use client";

// User-configurable price refresh rate. Fast settings (0.5s/1s) control how
// often the displayed tick updates (jittered around the latest real quote);
// real API pulls still respect proxy-safe minimums. Slow settings (10s/15s)
// show only real quotes at that cadence, no jitter.

import { useEffect, useState } from "react";

const KEY = "stocksense.refreshRate";
const EVT = "stocksense:refresh-rate";
export const DEFAULT_MS = 1000;

export const REFRESH_OPTIONS = [
  { ms: 500, label: "0.5s" },
  { ms: 1000, label: "1s" },
  { ms: 10000, label: "10s" },
  { ms: 15000, label: "15s" },
];

export function getRefreshMs(): number {
  if (typeof window === "undefined") return DEFAULT_MS;
  try {
    const v = Number(window.localStorage.getItem(KEY));
    return REFRESH_OPTIONS.some((o) => o.ms === v) ? v : DEFAULT_MS;
  } catch {
    return DEFAULT_MS;
  }
}

export function setRefreshMs(ms: number) {
  try {
    window.localStorage.setItem(KEY, String(ms));
  } catch {
    /* noop */
  }
  window.dispatchEvent(new Event(EVT));
}

export function useRefreshMs(): number {
  const [ms, setMs] = useState(DEFAULT_MS);
  useEffect(() => {
    const update = () => setMs(getRefreshMs());
    update();
    window.addEventListener(EVT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(EVT, update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return ms;
}
