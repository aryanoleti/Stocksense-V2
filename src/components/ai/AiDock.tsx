"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, X, Maximize2 } from "lucide-react";
import { AskAi } from "./AskAi";

const OPEN_KEY = "stocksense.ai-dock.open.v1";

/* The assistant, docked to the right of the dashboard instead of living on
   its own page. On desktop it sits in a column beside the content; on narrow
   screens it collapses to a launcher that opens a full-height sheet, since
   there is no room for two columns.

   The open/closed choice is remembered, because a docked panel that reopens
   itself on every visit is worse than no dock at all. */
export function AiDock() {
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // timer rather than rAF: rAF does not run while the tab is hidden
    const id = window.setTimeout(() => {
      try {
        setOpen(window.localStorage.getItem(OPEN_KEY) !== "false");
      } catch {
        setOpen(true);
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const toggle = (next: boolean) => {
    setOpen(next);
    try {
      window.localStorage.setItem(OPEN_KEY, String(next));
    } catch {
      /* private mode — the panel still works for this session */
    }
  };

  if (!hydrated) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => toggle(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-(--color-brand-500) px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-(--color-brand-600) xl:bottom-8 xl:right-8"
      >
        <MessageSquare className="h-4 w-4" />
        Ask AI
      </button>
    );
  }

  return (
    <>
      {/* Desktop: a real column that sits alongside the dashboard content */}
      <aside
        aria-label="AI assistant"
        className="hidden xl:sticky xl:top-6 xl:block xl:h-[calc(100dvh-3rem)] xl:w-[380px] xl:shrink-0"
      >
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface)">
          <div className="flex items-center justify-between border-b border-(--color-border) px-4 py-2.5">
            <p className="text-sm font-semibold text-(--color-fg)">Ask AI</p>
            <div className="flex items-center gap-1">
              <Link
                href="/ask-ai/"
                title="Open the full assistant"
                className="rounded-md p-1.5 text-(--color-fg-muted) hover:bg-(--color-surface-2) hover:text-(--color-fg)"
              >
                <Maximize2 className="h-4 w-4" />
                <span className="sr-only">Open the full assistant</span>
              </Link>
              <button
                type="button"
                onClick={() => toggle(false)}
                title="Close the panel"
                className="rounded-md p-1.5 text-(--color-fg-muted) hover:bg-(--color-surface-2) hover:text-(--color-fg)"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close the assistant panel</span>
              </button>
            </div>
          </div>
          {/* AskAi manages its own scrolling; the wrapper just bounds it */}
          <div className="ai-dock-body min-h-0 flex-1 overflow-y-auto">
            <AskAi />
          </div>
        </div>
      </aside>

      {/* Below xl there is no room for a column, so the same panel becomes a sheet */}
      <div className="xl:hidden">
        <button
          type="button"
          onClick={() => toggle(false)}
          aria-label="Close the assistant"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        />
        <div
          role="dialog"
          aria-label="AI assistant"
          className="fixed inset-x-0 bottom-0 z-50 flex h-[85dvh] flex-col overflow-hidden rounded-t-2xl border-t border-(--color-border) bg-(--color-surface)"
        >
          <div className="flex items-center justify-between border-b border-(--color-border) px-4 py-3">
            <p className="text-sm font-semibold text-(--color-fg)">Ask AI</p>
            <button
              type="button"
              onClick={() => toggle(false)}
              className="rounded-md p-1.5 text-(--color-fg-muted) hover:bg-(--color-surface-2)"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
          <div className="ai-dock-body min-h-0 flex-1 overflow-y-auto">
            <AskAi />
          </div>
        </div>
      </div>
    </>
  );
}
