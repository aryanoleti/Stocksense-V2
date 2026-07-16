"use client";

import { useReveal } from "@/lib/use-reveal";
import { cn } from "@/lib/cn";

/** Scroll-triggered entrance: fades/slides children up when they enter the viewport. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={cn("reveal", shown && "reveal-shown", className)}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
