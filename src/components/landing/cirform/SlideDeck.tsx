"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

/*
 * Click-driven full-screen pager: sections are stacked slides moved with
 * a smooth eased translate on click (arrows, dot rail, nav hash links,
 * keyboard). The page itself never scrolls; slides taller than the
 * viewport scroll internally.
 */

export type Slide = {
  hash: string;
  label: string;
  tone: "light" | "dark";
  content: React.ReactNode;
};

export function SlideDeck({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);

  const go = useCallback(
    (i: number) => {
      const next = Math.max(0, Math.min(slides.length - 1, i));
      if (next === indexRef.current) return;
      indexRef.current = next;
      setIndex(next);
      window.history.replaceState(
        null,
        "",
        next === 0
          ? window.location.pathname + window.location.search
          : `#${slides[next].hash}`,
      );
    },
    [slides],
  );

  // Nav links (`/#about` etc.) drive the deck via hashchange; no element
  // carries those ids, so the browser never performs a native jump.
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.replace("#", "");
      if (!h) return;
      const i = slides.findIndex((s) => s.hash === h);
      if (i >= 0) go(i);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [slides, go]);

  // Keyboard: arrows / PageUp / PageDown / Home / End.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        go(indexRef.current + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        go(indexRef.current - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        go(0);
      } else if (e.key === "End") {
        e.preventDefault();
        go(slides.length - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length, go]);

  const tone = slides[index].tone;
  const railText = tone === "dark" ? "text-white" : "text-[#111827]";
  const railDim = tone === "dark" ? "bg-white/30" : "bg-[#111827]/25";
  const railActive = tone === "dark" ? "bg-white" : "bg-[#1A56DB]";
  const btnCls =
    tone === "dark"
      ? "border-white/25 bg-white/10 text-white hover:bg-white/20"
      : "border-[#111827]/15 bg-white text-[#111827] shadow-md hover:bg-[#EFF6FF]";

  return (
    <div className="relative h-dvh overflow-hidden">
      {slides.map((s, i) => (
        <section
          key={s.hash}
          aria-hidden={i !== index}
          inert={i !== index}
          className="cf-slide absolute inset-0 overflow-y-auto overscroll-contain"
          style={{ transform: `translateY(${(i - index) * 100}%)` }}
        >
          {s.content}
        </section>
      ))}

      {/* Dot rail */}
      <nav
        aria-label="Sections"
        className="absolute right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-3 sm:flex"
      >
        {slides.map((s, i) => (
          <button
            key={s.hash}
            type="button"
            onClick={() => go(i)}
            aria-label={s.label}
            aria-current={i === index ? "true" : undefined}
            className="group flex items-center gap-2.5"
          >
            <span
              className={`${railText} text-[11px] font-semibold opacity-0 transition-opacity duration-200 group-hover:opacity-70 ${
                i === index ? "opacity-70" : ""
              }`}
            >
              {s.label}
            </span>
            <span
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === index ? `w-6 ${railActive}` : `w-2.5 ${railDim} group-hover:scale-125`
              }`}
            />
          </button>
        ))}
      </nav>

      {/* Prev / next buttons */}
      <div className="absolute bottom-5 right-4 z-40 flex flex-col gap-2 sm:right-6">
        <button
          type="button"
          onClick={() => go(index - 1)}
          disabled={index === 0}
          aria-label="Previous section"
          className={`grid h-11 w-11 place-items-center rounded-full border backdrop-blur transition-all disabled:pointer-events-none disabled:opacity-30 ${btnCls}`}
        >
          <ChevronUp className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          disabled={index === slides.length - 1}
          aria-label="Next section"
          className={`grid h-11 w-11 place-items-center rounded-full border backdrop-blur transition-all disabled:pointer-events-none disabled:opacity-30 ${btnCls}`}
        >
          <ChevronDown className="h-5 w-5" />
        </button>
      </div>

      {/* Progress */}
      <span
        className={`absolute bottom-7 left-5 z-40 text-[11px] font-semibold tabular tracking-[0.2em] ${railText} opacity-50`}
        aria-hidden="true"
      >
        {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
      </span>
    </div>
  );
}
