"use client";

import { useEffect, useRef } from "react";
import type { Callout } from "./data";
import type { ProjectedCallout } from "./three/world";

/* Technical callout labels pinned to points on the open shard. Positions are
   written straight to style.transform inside the rAF loop — no React state
   per frame, so the labels track the 3D scene without re-rendering. */
export function Callouts({
  callouts,
  accent,
  active,
  read,
}: {
  callouts: Callout[];
  accent: string;
  active: boolean;
  /* returns the current screen-space anchors, or null if the world is down */
  read: () => ProjectedCallout[] | null;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    const host = hostRef.current;
    if (!host) return;
    const items = Array.from(host.querySelectorAll<HTMLElement>("[data-callout]"));
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const anchors = read();
      if (!anchors) return;
      items.forEach((el, i) => {
        const a = anchors[i];
        if (!a || !a.visible) {
          el.style.opacity = "0";
          return;
        }
        el.style.opacity = "1";
        el.style.transform = `translate3d(${a.x}px, ${a.y}px, 0)`;
      });
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, read]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-20 transition-opacity duration-500 ${
        active ? "opacity-100" : "opacity-0"
      }`}
    >
      {callouts.map((c, i) => (
        <div
          key={c.code}
          data-callout
          className="gl-callout absolute left-0 top-0 opacity-0 transition-opacity duration-300"
          style={{ transitionDelay: `${i * 90}ms` }}
        >
          {/* leader line + label, anchored at the projected point */}
          <span
            className="block h-px w-14 origin-left"
            style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
          />
          <span className="mt-1.5 block whitespace-nowrap font-mono text-[9px] leading-relaxed tracking-[0.25em] text-[#d9f2ff]">
            <span style={{ color: accent }}>{c.code}</span>
            <br />
            {c.label}
          </span>
        </div>
      ))}
    </div>
  );
}
