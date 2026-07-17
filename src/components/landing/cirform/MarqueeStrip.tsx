/*
 * Infinite news-ticker marquee between the bento grid and the dark grid.
 * Track is duplicated so the -50% translate loops seamlessly.
 */

function TickerCopy() {
  return (
    <span className="mx-6 whitespace-nowrap text-[20px] text-[#1F2937] sm:text-[24px]">
      We keep pushing digital market research forward.{" "}
      <span className="cf-serif text-[#1A56DB]">Every screen</span> is live,{" "}
      <span className="cf-serif text-[#1A56DB]">every number</span> real, every
      explanation in plain language.
    </span>
  );
}

export function MarqueeStrip() {
  return (
    <div className="overflow-hidden border-y border-[#DBEAFE] bg-white py-6">
      <div
        className="animate-marquee flex w-max"
        style={{ "--marquee-duration": "24s" } as React.CSSProperties}
      >
        <TickerCopy />
        <TickerCopy />
        <TickerCopy />
        <TickerCopy />
      </div>
    </div>
  );
}
