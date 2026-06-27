"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface WatchlistItem {
  id: string;
  ticker: string;
  addedAt: string;
}

async function fetchWatchlist(): Promise<WatchlistItem[]> {
  const res = await fetch("/api/watchlist");
  if (!res.ok) return [];
  return res.json();
}

async function addToWatchlist(ticker: string) {
  const res = await fetch("/api/watchlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticker }),
  });
  if (!res.ok) throw new Error("Failed to add to watchlist");
  return res.json();
}

async function removeFromWatchlist(ticker: string) {
  const res = await fetch(`/api/watchlist?ticker=${encodeURIComponent(ticker)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to remove from watchlist");
}

export function useWatchlist() {
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["watchlist"],
    queryFn: fetchWatchlist,
    staleTime: 30_000,
  });

  const isWatched = (ticker: string) => items.some((i) => i.ticker === ticker);

  const add = useMutation({
    mutationFn: addToWatchlist,
    onMutate: async (ticker) => {
      await queryClient.cancelQueries({ queryKey: ["watchlist"] });
      const prev = queryClient.getQueryData<WatchlistItem[]>(["watchlist"]) || [];
      queryClient.setQueryData<WatchlistItem[]>(["watchlist"], [
        ...prev,
        { id: ticker, ticker, addedAt: new Date().toISOString() },
      ]);
      return { prev };
    },
    onError: (_err, _ticker, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["watchlist"], ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["watchlist"] }),
  });

  const remove = useMutation({
    mutationFn: removeFromWatchlist,
    onMutate: async (ticker) => {
      await queryClient.cancelQueries({ queryKey: ["watchlist"] });
      const prev = queryClient.getQueryData<WatchlistItem[]>(["watchlist"]) || [];
      queryClient.setQueryData<WatchlistItem[]>(
        ["watchlist"],
        prev.filter((i) => i.ticker !== ticker)
      );
      return { prev };
    },
    onError: (_err, _ticker, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["watchlist"], ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["watchlist"] }),
  });

  function toggle(ticker: string) {
    if (isWatched(ticker)) remove.mutate(ticker);
    else add.mutate(ticker);
  }

  return { items, isLoading, isWatched, toggle, add, remove };
}
