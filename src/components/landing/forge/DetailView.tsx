"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Wordmark, SoundToggle } from "./Hud";
import type { PortfolioEntry } from "./data";

/* The destination of a shard click: a near-black case-study page. It mounts
   over the canvas rather than routing away, so returning is a reverse fade
   with the carousel still exactly where it was. */
export function DetailView({
  entry,
  open,
  soundOn,
  onToggleSound,
  onClose,
}: {
  entry: PortfolioEntry | null;
  open: boolean;
  soundOn: boolean;
  onToggleSound: () => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreFocus.current = document.activeElement as HTMLElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = panelRef.current;
    const focusables = () =>
      Array.from(panel?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      restoreFocus.current?.focus?.();
    };
  }, [open, onClose]);

  if (!entry) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${entry.name} summary`}
      aria-hidden={!open}
      className={`fg-detail fixed inset-0 z-[60] bg-[#0a0a0c] text-[#e6e9ec] transition-[opacity,transform] duration-700 ${
        open ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-[1.04] opacity-0"
      }`}
    >
      {/* ambient echo of the shard that was clicked */}
      <div aria-hidden="true" className="fg-detail-echo pointer-events-none absolute inset-0" />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between px-6 py-6 sm:px-10">
          <Wordmark glow />
          <button
            type="button"
            onClick={onClose}
            className="fg-focus flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] opacity-80 transition-opacity hover:opacity-100"
          >
            <span aria-hidden="true" className="opacity-50">
              [
            </span>
            Close
            <span aria-hidden="true" className="opacity-50">
              ]
            </span>
          </button>
        </div>

        <div className="flex flex-1 items-center px-6 sm:px-10">
          <div className="w-full max-w-[46ch] lg:max-w-[44%]">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-55 sm:text-[11px]">
              {"////// Summary"}
            </p>
            <h2 className="mt-5 font-mono text-2xl font-extrabold uppercase tracking-[0.06em] sm:text-3xl">
              {entry.name}
            </h2>
            <div className="mt-6 space-y-5">
              {entry.summary.map((p) => (
                <p
                  key={p.slice(0, 24)}
                  className="font-mono text-[11px] font-light leading-[1.9] tracking-[0.02em] opacity-75 sm:text-[12.5px]"
                >
                  {p}
                </p>
              ))}
            </div>

            <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.3em] opacity-55 sm:text-[11px]">
              {"/// Discover"}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
              {entry.discover.map((d) => (
                <Link
                  key={d.href}
                  href={d.href}
                  className="fg-focus font-mono text-[11px] uppercase tracking-[0.2em] opacity-80 transition-opacity hover:opacity-100 sm:text-[12px]"
                >
                  <span className="opacity-50">[</span>
                  {d.label}
                  <span className="opacity-50">]</span>
                  <span aria-hidden="true" className="ml-1.5 opacity-60">
                    ↑
                  </span>
                </Link>
              ))}
            </div>

            <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.3em] opacity-55 sm:text-[11px]">
              {"/// Visit"}
            </p>
            <div className="mt-3">
              <Link
                href={entry.visit.href}
                className="fg-focus font-mono text-[11px] uppercase tracking-[0.2em] opacity-80 transition-opacity hover:opacity-100 sm:text-[12px]"
              >
                <span className="opacity-50">[</span>
                {entry.visit.label}
                <span className="opacity-50">]</span>
                <span aria-hidden="true" className="ml-1.5 opacity-60">
                  ↑
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 sm:px-10">
          <SoundToggle on={soundOn} onToggle={onToggleSound} tone="light" />
        </div>
      </div>
    </div>
  );
}
