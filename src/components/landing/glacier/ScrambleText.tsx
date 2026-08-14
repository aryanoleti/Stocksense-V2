"use client";

import { useEffect, useRef, useState, type ElementType } from "react";

const GLYPHS = "▚▞▟▙◢◣◤#/\\<>=+*┃━01ΔΞΨ";

/* Decodes text from glitch glyphs, left to right. Falls back to plain text
   for reduced motion (checked live, not just at mount). */
export function ScrambleText({
  text,
  as: Tag = "span",
  className,
  delay = 0,
  duration = 900,
  once = true,
}: {
  text: string;
  as?: "span" | "p" | "h1" | "h2" | "h3";
  className?: string;
  delay?: number;
  duration?: number;
  once?: boolean;
}) {
  const [display, setDisplay] = useState(text);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLElement | null>(null);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStarted(true);
          if (once) io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  useEffect(() => {
    if (!started || (once && done.current)) return;
    // reduced motion: `display` already holds the plain text — nothing to do
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      done.current = true;
      return;
    }
    let raf = 0;
    let start = 0;
    const run = (now: number) => {
      if (!start) start = now + delay;
      const t = (now - start) / duration;
      if (t < 0) {
        raf = requestAnimationFrame(run);
        return;
      }
      if (t >= 1) {
        setDisplay(text);
        done.current = true;
        return;
      }
      const solved = Math.floor(t * text.length);
      let out = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === " " || ch === "\n" || i < solved) out += ch;
        else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      setDisplay(out);
      raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [started, text, delay, duration, once]);

  // aria-label keeps the real text for assistive tech while glyphs cycle
  const Comp = Tag as ElementType;
  return (
    <Comp ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">{display}</span>
    </Comp>
  );
}
