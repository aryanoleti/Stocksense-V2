"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/*
 * Full-screen pager: sections are stacked slides moved with a smooth
 * eased translate. A scroll gesture (wheel or touch swipe) glides one
 * slide in that direction — the page never free-scrolls. Clicking the
 * arrows, the dot rail, nav hash links and arrow keys also navigate.
 * Slides taller than the viewport scroll internally; the deck only
 * advances once the inner scroll has reached its end.
 */

export type Slide = {
  hash: string;
  label: string;
  tone: "light" | "dark";
  content: React.ReactNode;
};

const GLIDE_MS = 900;

export function SlideDeck({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [isDark, setIsDark] = useState(false);
  const indexRef = useRef(0);

  // Track the root .dark class so the rail chrome follows theme changes.
  useEffect(() => {
    const el = document.documentElement;
    const update = () => setIsDark(el.classList.contains("dark"));
    update();
    const mo = new MutationObserver(update);
    mo.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  const wrapRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const lockedUntil = useRef(0);
  const wheelAcc = useRef(0);
  const touchStart = useRef<{ y: number; scrollTop: number } | null>(null);

  const go = useCallback(
    (i: number) => {
      const next = Math.max(0, Math.min(slides.length - 1, i));
      if (next === indexRef.current) return;
      indexRef.current = next;
      lockedUntil.current = Date.now() + GLIDE_MS;
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

  /** Can the active slide still scroll internally in this direction? */
  const innerCanScroll = useCallback((dir: 1 | -1) => {
    const el = slideRefs.current[indexRef.current];
    if (!el) return false;
    return dir > 0
      ? el.scrollTop + el.clientHeight < el.scrollHeight - 1
      : el.scrollTop > 0;
  }, []);

  // Wheel: one gesture = one smooth glide. Inner-scrollable slides keep
  // native scrolling until they hit their edge.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const onWheel = (e: WheelEvent) => {
      const dir: 1 | -1 = e.deltaY > 0 ? 1 : -1;
      if (innerCanScroll(dir)) return; // let the slide scroll natively
      e.preventDefault();
      if (Date.now() < lockedUntil.current) return;
      wheelAcc.current += e.deltaY;
      if (Math.abs(wheelAcc.current) < 30) return;
      wheelAcc.current = 0;
      go(indexRef.current + dir);
    };
    wrap.addEventListener("wheel", onWheel, { passive: false });
    return () => wrap.removeEventListener("wheel", onWheel);
  }, [go, innerCanScroll]);

  // Touch swipe: same rules as wheel.
  const onTouchStart = (e: React.TouchEvent) => {
    const el = slideRefs.current[indexRef.current];
    touchStart.current = {
      y: e.touches[0].clientY,
      scrollTop: el?.scrollTop ?? 0,
    };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || Date.now() < lockedUntil.current) return;
    const dy = start.y - e.changedTouches[0].clientY;
    if (Math.abs(dy) < 60) return;
    const dir: 1 | -1 = dy > 0 ? 1 : -1;
    const el = slideRefs.current[indexRef.current];
    // If the inner scroll consumed the gesture (position moved) or can
    // still move further, don't change slides.
    if (el && el.scrollTop !== start.scrollTop) return;
    if (innerCanScroll(dir)) return;
    go(indexRef.current + dir);
  };

  // In dark theme every slide surface is dark, so the rail always needs
  // light chrome; otherwise it follows the active slide's own tone.
  const tone = isDark ? "dark" : slides[index].tone;
  const railText = tone === "dark" ? "text-white" : "text-[#111827]";
  const railDim = tone === "dark" ? "bg-white/30" : "bg-[#111827]/25";
  const railActive = tone === "dark" ? "bg-white" : "bg-[#1A56DB]";

  return (
    <div
      ref={wrapRef}
      className="relative h-dvh overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {slides.map((s, i) => (
        <section
          key={s.hash}
          ref={(el) => {
            slideRefs.current[i] = el;
          }}
          aria-hidden={i !== index}
          inert={i !== index}
          className="cf-slide absolute inset-0 overflow-y-auto overscroll-contain"
          style={{ transform: `translateY(${(i - index) * 100}%)` }}
        >
          {s.content}
        </section>
      ))}

      {/* Dot rail — the primary click navigation on every screen size */}
      <nav
        aria-label="Sections"
        className="absolute right-3 top-1/2 z-40 flex -translate-y-1/2 flex-col items-end gap-3 sm:right-4"
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
