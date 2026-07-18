"use client";

import { Sparkles } from "lucide-react";
import { useReveal } from "@/lib/use-reveal";

/*
 * About: periwinkle section, white card, and the signature word-by-word
 * "reading sweep" — every word starts muted and resolves to full colour
 * with a small stagger as the section scrolls into view.
 */

type Segment = { text: string; className: string };

const SEGMENTS: Segment[] = [
  {
    text: "We believe stock research should be calm, visual,",
    className: "cf-serif text-[#4B5563] dark:text-[#B4BCCC]",
  },
  { text: "and honest.", className: "text-[#1F2937] dark:text-[#E5E9F0]" },
  {
    text: "StockSense turns live NSE data",
    className: "font-bold text-[#3B82F6]",
  },
  {
    text: "into plain-language understanding — AI summaries, quant signals that show their working, and a simulator where practice costs nothing but time.",
    className: "text-[#1F2937] dark:text-[#E5E9F0]",
  },
];

export function AboutReveal() {
  const { ref, shown } = useReveal<HTMLDivElement>();
  let wordIndex = 0;

  return (
    <section className="relative overflow-hidden px-5 py-20 sm:py-24">
      {/* Drifting gradient blobs behind the card */}
      <div
        className="cf-blob pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-[#93C5FD]/40 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="cf-blob-2 pointer-events-none absolute -right-20 bottom-4 h-80 w-80 rounded-full bg-[#8B5CF6]/25 blur-3xl"
        aria-hidden="true"
      />
      <div
        ref={ref}
        className={`relative mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-md dark:bg-[#111827] dark:shadow-black/40 sm:p-12 ${
          shown ? "reveal-shown" : ""
        }`}
      >
        <p className="flex items-center justify-center gap-1.5 text-center text-[13px] font-medium text-gray-400">
          <Sparkles className="h-3.5 w-3.5" /> About StockSense
        </p>
        <p className="mt-6 text-center text-[22px] leading-[1.5] sm:text-[26px]">
          {SEGMENTS.map((seg, si) => (
            <span key={si} className={seg.className}>
              {seg.text.split(" ").map((w) => {
                const i = wordIndex++;
                return (
                  <span
                    key={i}
                    className="cf-w"
                    style={{ "--cf-i": i } as React.CSSProperties}
                  >
                    {w}&nbsp;
                  </span>
                );
              })}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
