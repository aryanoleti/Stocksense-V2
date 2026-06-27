"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen, Tag, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Term {
  id: string;
  term: string;
  definition: string;
  category: string;
  example: string | null;
}

interface Props {
  terms: Term[];
  categories: string[];
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function GlossaryGrid({ terms, categories }: Props) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLetter, setSelectedLetter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return terms.filter((t) => {
      if (q && !t.term.toLowerCase().includes(q) && !t.definition.toLowerCase().includes(q)) return false;
      if (selectedCategory !== "All" && t.category !== selectedCategory) return false;
      if (selectedLetter && !t.term.toUpperCase().startsWith(selectedLetter)) return false;
      return true;
    });
  }, [terms, search, selectedCategory, selectedLetter]);

  const activeLetter = selectedLetter;

  if (terms.length === 0) {
    return (
      <div className="card-glass p-12 text-center">
        <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground font-medium">Glossary is empty</p>
        <p className="text-sm text-muted-foreground/60 mt-1">
          Run <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">npm run db:seed</code> to populate financial terms
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="card-glass p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search terms or definitions..."
            className="w-full bg-muted border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          {["All", ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all",
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Alphabet nav */}
        <div className="flex flex-wrap gap-1">
          {ALPHABET.map((letter) => {
            const hasTerms = terms.some((t) => t.term.toUpperCase().startsWith(letter));
            return (
              <button
                key={letter}
                disabled={!hasTerms}
                onClick={() => setSelectedLetter(activeLetter === letter ? "" : letter)}
                className={cn(
                  "w-7 h-7 rounded text-xs font-mono font-medium transition-all",
                  !hasTerms && "opacity-20 cursor-not-allowed",
                  activeLetter === letter
                    ? "bg-primary text-primary-foreground"
                    : hasTerms && "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground px-1">
        {filtered.length} {filtered.length === 1 ? "term" : "terms"} found
      </p>

      {/* Terms grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((term, i) => (
            <motion.div
              key={term.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: Math.min(i * 0.02, 0.3) }}
              layout
            >
              <div
                className={cn(
                  "card-glass p-4 cursor-pointer hover:border-primary/30 transition-all",
                  expandedId === term.id && "border-primary/40"
                )}
                onClick={() => setExpandedId(expandedId === term.id ? null : term.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground text-sm">{term.term}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Tag className="w-2.5 h-2.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{term.category}</span>
                    </div>
                  </div>
                  {expandedId === term.id ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                </div>

                <AnimatePresence>
                  {expandedId === term.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                        {term.definition}
                      </p>
                      {term.example && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-border">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">Example: </span>
                            {term.example}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && search && (
        <div className="card-glass p-12 text-center">
          <p className="text-muted-foreground">No terms found for "{search}"</p>
        </div>
      )}
    </div>
  );
}
