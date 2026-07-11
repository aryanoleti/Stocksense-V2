"use client";

import { useEffect, useState } from "react";
import { Maximize2, X } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Wraps a card with an expand control that opens the same content in a
 * full-screen overlay (Escape or ✕ closes it).
 */
export function Zoomable({
  title,
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { title: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className={cn("group/zoom relative", className)} {...rest}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="absolute right-3 top-3 z-10 grid h-7 w-7 place-items-center rounded-lg border border-(--color-border) bg-(--color-surface)/80 text-(--color-fg-subtle) opacity-0 backdrop-blur transition-opacity hover:text-(--color-fg) group-hover/zoom:opacity-100"
        aria-label={`Expand ${title}`}
        title="Expand"
      >
        <Maximize2 className="h-3.5 w-3.5" />
      </button>
      {children}

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-(--color-bg)/97 p-4 backdrop-blur-md animate-fade-up sm:p-8" role="dialog" aria-modal="true" aria-label={title}>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[15px] font-semibold tracking-tight">{title}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-xl border border-(--color-border) bg-(--color-surface) text-(--color-fg-muted) hover:text-(--color-fg)"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="glass min-h-0 flex-1 overflow-auto rounded-2xl p-5">{children}</div>
        </div>
      )}
    </div>
  );
}
