"use client";

import { useEffect, useRef, useState } from "react";

/* Desktop-only custom cursor: a dot that sticks to the pointer and a ring
   that trails it. Anything with [data-cursor] grows the ring and can show a
   label. Disabled for touch and reduced motion; the native cursor is never
   hidden until this one is actually live. */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState("");
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || still) return;
    // deferred so the state change isn't synchronous inside the effect body
    const id = requestAnimationFrame(() => setEnabled(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("gl-has-cursor");

    const pos = { x: -100, y: -100 };
    const ring = { x: -100, y: -100 };
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      const target = (e.target as HTMLElement).closest?.("[data-cursor]");
      if (target) {
        setHovering(true);
        setLabel(target.getAttribute("data-cursor") || "");
      } else {
        setHovering(false);
        setLabel("");
      }
    };
    const loop = () => {
      raf = requestAnimationFrame(loop);
      ring.x += (pos.x - ring.x) * 0.16;
      ring.y += (pos.y - ring.y) * 0.16;
      if (dotRef.current) dotRef.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
      if (ringRef.current) ringRef.current.style.transform = `translate(${ring.x}px, ${ring.y}px)`;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("gl-has-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div aria-hidden="true">
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[90] -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-[#a8e9f2] mix-blend-difference"
      />
      <div
        ref={ringRef}
        className={`pointer-events-none fixed left-0 top-0 z-[90] flex items-center justify-center rounded-full border transition-[width,height,background-color,border-color] duration-200 ${
          hovering
            ? "-ml-7 -mt-7 h-14 w-14 border-[#6fd4a8]/70 bg-[#6fd4a8]/10"
            : "-ml-4 -mt-4 h-8 w-8 border-[#a8e9f2]/40"
        }`}
      >
        {label && (
          <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#d9fff0]">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
