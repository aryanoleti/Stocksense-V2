"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StockReview } from "@/services/ai.service";

type ReviewResponse = StockReview & { quickInsight?: string };

export function AIReviewCard({ ticker }: { ticker: string }) {
  const [review, setReview] = useState<ReviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function getReview() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/stock-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setReview(data);
    } catch {
      setError("Couldn't generate an AI review right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glass p-5"
    >
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">AI Review</h3>
            <p className="text-xs text-muted-foreground">Educational analysis powered by Groq</p>
          </div>
        </div>
        <button
          onClick={getReview}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/15 text-primary text-xs font-medium hover:bg-primary/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {review ? "Regenerate review" : "Get AI review"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-400/10 rounded-lg p-3 mb-3">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {!review && !loading && !error && (
        <p className="text-sm text-muted-foreground">
          Click "Get AI review" for a quick, educational breakdown of this stock's strengths and risks.
        </p>
      )}

      {review && (
        <div className="space-y-4">
          <div className="bg-muted rounded-lg p-3">
            <p className="text-sm text-foreground font-medium">{review.verdict}</p>
            {review.quickInsight && (
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{review.quickInsight}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {review.strengths?.length > 0 && (
              <div>
                <p className="text-xs text-green-400 font-medium mb-1.5">Strengths</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  {review.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
            {review.risks?.length > 0 && (
              <div>
                <p className="text-xs text-red-400 font-medium mb-1.5">Risks</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  {review.risks.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}
          </div>

          {review.suitedFor && (
            <p className="text-xs text-muted-foreground bg-muted rounded-lg p-3">
              <span className="text-foreground font-medium">Suited for: </span>
              {review.suitedFor}
            </p>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Educational only — not financial advice. Always do your own research.
          </p>
        </div>
      )}
    </motion.div>
  );
}
