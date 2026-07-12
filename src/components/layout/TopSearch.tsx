"use client";

// Functional topbar search: live results across the full NSE universe,
// ⌘K / Ctrl+K to focus, and a "/ai" command that jumps straight into an AI
// conversation (e.g. "/ai why is Reliance up today").

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Bot, CornerDownLeft } from "lucide-react";
import { searchUniverse } from "@/lib/universe";

export function TopSearch() {
  const [query, setQuery] = useState("");
  const [focus, setFocus] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const isAiCommand = query.trimStart().startsWith("/ai");
  const aiPrompt = isAiCommand ? query.trimStart().slice(3).trim() : "";
  const results = useMemo(
    () => (!isAiCommand && query.trim() ? searchUniverse(query, 6) : []),
    [query, isAiCommand],
  );

  // ⌘K / Ctrl+K focuses the search from anywhere in the app
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function go(href: string) {
    setQuery("");
    setFocus(false);
    inputRef.current?.blur();
    router.push(href);
  }

  function onEnter() {
    if (isAiCommand) {
      go(aiPrompt ? `/ask-ai/?q=${encodeURIComponent(aiPrompt)}` : "/ask-ai");
    } else if (results[0]) {
      go(`/stocks/${results[0].symbol}`);
    }
  }

  return (
    <div className="relative hidden md:block">
      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-fg-subtle)" />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setTimeout(() => setFocus(false), 150)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onEnter();
          }
          if (e.key === "Escape") inputRef.current?.blur();
        }}
        placeholder="Search stocks, or type /ai to ask the AI…"
        className="h-10 w-full rounded-xl border border-(--color-border) bg-(--color-surface) pl-10 pr-3 text-sm placeholder:text-(--color-fg-subtle) focus:border-(--color-brand-300) focus:ring-4 focus:ring-(--color-brand-50) focus:outline-none"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-(--color-border) bg-(--color-surface-2) px-1.5 py-0.5 text-[10.5px] font-semibold text-(--color-fg-subtle)">
        ⌘K
      </span>

      {focus && (isAiCommand || results.length > 0) && (
        <ul className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-lg)">
          {isAiCommand ? (
            <li>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={onEnter}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-(--color-surface-2)"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-(--color-brand-700) text-white">
                  <Bot className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-semibold tracking-tight">
                    {aiPrompt ? `Ask AI: “${aiPrompt}”` : "Open AI chat"}
                  </span>
                  <span className="text-[11.5px] text-(--color-fg-subtle)">Starts a conversation with Sense</span>
                </span>
                <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-(--color-fg-subtle)" />
              </button>
            </li>
          ) : (
            results.map((r) => (
              <li key={r.symbol}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => go(`/stocks/${r.symbol}`)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-(--color-surface-2)"
                >
                  <span className="min-w-0">
                    <span className="text-[13.5px] font-semibold tracking-tight">{r.symbol}</span>
                    <span className="ml-2 text-[11.5px] text-(--color-fg-subtle)">{r.name}</span>
                  </span>
                  <span className="shrink-0 text-[10px] uppercase tracking-[0.1em] text-(--color-fg-subtle)">
                    {r.kind === "etf" ? "ETF" : "NSE"}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
