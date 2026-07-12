"use client";

// Small persistence helpers so the workspace remembers what you were doing:
// UI state (selected symbols, ranges, tabs) survives navigation and reloads,
// and every stock you open is recorded for the Recently Viewed surfaces.

import { useEffect, useState } from "react";

/** useState that hydrates from and writes through to localStorage. */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) setValue(JSON.parse(raw) as T);
    } catch {
      /* corrupt entry — keep the default */
    }
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota — state stays in memory */
    }
  }, [key, value, loaded]);

  return [value, setValue] as const;
}

/* ------------------------------------------------------- recently viewed */

const RECENT_KEY = "stocksense.recent.v1";

export function recordRecent(symbol: string) {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    const next = [symbol, ...(Array.isArray(list) ? list : []).filter((s) => s !== symbol)].slice(0, 24);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* noop */
  }
}

export function useRecent(limit = 24): string[] {
  const [list, setList] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(RECENT_KEY);
      const parsed = raw ? (JSON.parse(raw) as string[]) : [];
      setList(Array.isArray(parsed) ? parsed.slice(0, limit) : []);
    } catch {
      /* noop */
    }
  }, [limit]);
  return list;
}
