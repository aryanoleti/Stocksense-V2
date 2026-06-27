"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, ExternalLink, Shield, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Broker {
  id: string;
  name: string;
  logo: string | null;
  description: string;
  features: string[];
  affiliateUrl: string;
  rating: number;
  category: string;
}

interface Props {
  brokers: Broker[];
  categories: string[];
}

export function BrokersGrid({ brokers, categories }: Props) {
  const [selected, setSelected] = useState("All");

  const filtered = selected === "All" ? brokers : brokers.filter((b) => b.category === selected);

  return (
    <div className="space-y-4">
      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {["All", ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelected(cat)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
              selected === cat
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Brokers grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((broker, i) => (
          <motion.div
            key={broker.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="card-glass p-5 flex flex-col h-full hover:border-primary/30 hover:shadow-lg transition-all">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-lg font-bold text-foreground border border-border">
                    {broker.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{broker.name}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-medium text-foreground">{broker.rating.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">/ 5</span>
                    </div>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-full bg-muted text-xs text-muted-foreground font-medium">
                  {broker.category}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                {broker.description}
              </p>

              {/* Features */}
              <ul className="space-y-1.5 mb-5">
                {broker.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href={broker.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Open Account
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Disclaimer footer */}
      <div className="flex items-center gap-2 p-3 card-glass text-xs text-muted-foreground">
        <Shield className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        Broker links may be affiliate links. StockSense may earn a commission at no extra cost to you.
      </div>
    </div>
  );
}
