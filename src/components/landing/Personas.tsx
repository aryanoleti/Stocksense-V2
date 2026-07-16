import { Check } from "lucide-react";

const PERSONAS = [
  {
    tag: "For new investors",
    title: "Learn by doing, without the risk",
    body: "Start with a guided tour and a virtual ₹5,00,000 portfolio — build the habit before you commit a rupee.",
    points: [
      "Practice trades on every NSE stock and ETF with live prices",
      "AI explains every term, chart and metric in plain language",
      "Glossary with AI-explained concepts, from P/E to F&O",
    ],
  },
  {
    tag: "For active traders",
    title: "A research terminal, not a toy",
    body: "Quant indicators, multi-stock comparison and configurable refresh — the depth of a terminal with none of the clutter.",
    points: [
      "Live prices refreshing as fast as every half second",
      "Head-to-head compare desk with rebased performance charts",
      "RSI, MACD, volatility, S/R levels and 7-day AI forecasts",
    ],
  },
];

export function Personas() {
  return (
    <section id="traders" className="mx-auto max-w-7xl px-5 py-20">
      <div className="max-w-xl">
        <p className="text-[12.5px] font-bold uppercase tracking-[0.1em] text-(--color-brand-300)">
          Made for your stage
        </p>
        <h2 className="mt-2.5 text-3xl font-semibold tracking-tight text-white sm:text-[36px] sm:leading-[1.12]">
          From first SIP question to full quant workflow
        </h2>
      </div>
      <div className="mt-11 grid gap-4 lg:grid-cols-2">
        {PERSONAS.map((p) => (
          <article
            key={p.tag}
            className="relative overflow-hidden rounded-[28px] border border-white/12 gradient-brand p-8 sm:p-9"
          >
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-(--color-brand-400)/15 blur-3xl" />
            <p className="text-[12px] font-bold uppercase tracking-[0.09em] text-(--color-brand-300)">
              {p.tag}
            </p>
            <h3 className="mt-2.5 text-[22px] font-semibold tracking-tight text-white">{p.title}</h3>
            <p className="mt-2.5 text-[14.5px] leading-relaxed text-white/65">{p.body}</p>
            <ul className="mt-5 flex flex-col gap-2.5">
              {p.points.map((pt) => (
                <li key={pt} className="flex items-start gap-2.5 text-[14px] text-(--color-brand-100)">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2fcb80]" strokeWidth={3} />
                  {pt}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
