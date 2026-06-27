"use client";

import { Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWatchlist } from "@/hooks/use-watchlist";
import { cn } from "@/lib/utils";

interface Props {
  ticker: string;
  size?: "sm" | "md";
}

export function WatchlistButton({ ticker, size = "md" }: Props) {
  const { isWatched, toggle, add, remove } = useWatchlist();
  const watched = isWatched(ticker);
  const pending = add.isPending || remove.isPending;

  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      onClick={() => toggle(ticker)}
      disabled={pending}
      title={watched ? "Remove from watchlist" : "Add to watchlist"}
      className={cn(
        "flex items-center gap-1.5 rounded-lg font-medium transition-all duration-200",
        size === "md"
          ? "px-3 py-2 text-sm border"
          : "px-2 py-1 text-xs border",
        watched
          ? "bg-yellow-400/10 border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/20"
          : "bg-muted border-border text-muted-foreground hover:text-foreground hover:border-border/80",
        pending && "opacity-60 cursor-not-allowed"
      )}
    >
      <motion.div
        animate={{ rotate: watched ? [0, -20, 15, 0] : 0, scale: watched ? [1, 1.3, 1] : 1 }}
        transition={{ duration: 0.35 }}
      >
        <Star
          className={cn(size === "md" ? "w-4 h-4" : "w-3.5 h-3.5", watched && "fill-yellow-400")}
        />
      </motion.div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={watched ? "watching" : "watch"}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15 }}
        >
          {watched ? "Watching" : "Watchlist"}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
