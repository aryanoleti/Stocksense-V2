import { Globe2, Sparkles, GaugeCircle } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

// ScrollScene: features reveal in sequence as the user scrolls.
const FEATURES = [
  {
    icon: Globe2,
    kicker: "Unified market coverage",
    title: "Every NSE stock and ETF. One screen.",
    body: "2,678 instruments — the full NSE equity universe plus ETFs and the major indices — with live prices, real fundamentals, and charts from one day to max history. No tab-hopping between four apps.",
    points: ["Live quotes across the whole universe", "8 chart ranges on every instrument", "Real listing facts, never filler numbers"],
  },
  {
    icon: Sparkles,
    kicker: "AI research copilot",
    title: "Ask anything. It sees what you see.",
    body: "Gemini-powered summaries of momentum, valuation and risk on every stock — plus a chat that answers follow-ups, explains any term, and even reads chart screenshots you paste in.",
    points: ["Auto AI summary on every stock page", "Quant engine that shows its working", "Paste a screenshot, get an explanation"],
  },
  {
    icon: GaugeCircle,
    kicker: "Control the tempo",
    title: "Refresh you choose. Watchlists you own.",
    body: "Set live prices to update as fast as every half second or as calm as fifteen. Build watchlists, put any two stocks head-to-head on a rebased chart, and practice with ₹5,00,000 in virtual capital.",
    points: ["0.5s–15s refresh, your call", "Head-to-head compare desk", "Risk-free simulator with live pricing"],
  },
];

export function FeatureJourney() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-5 py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-[12.5px] font-bold uppercase tracking-[0.1em] text-(--color-brand-300)">
          The journey
        </p>
        <h2 className="mt-2.5 text-3xl font-semibold tracking-tight text-white sm:text-[38px] sm:leading-[1.1]">
          Built for how Indian investors actually research
        </h2>
      </Reveal>

      <div className="mt-16 flex flex-col gap-20">
        {FEATURES.map((f, i) => (
          <div
            key={f.kicker}
            className={`grid items-center gap-10 lg:grid-cols-2 ${i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}
          >
            <Reveal delay={80}>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-(--color-brand-600)/30 text-(--color-brand-300)">
                <f.icon className="h-5.5 w-5.5" />
              </span>
              <p className="mt-5 text-[12px] font-bold uppercase tracking-[0.09em] text-(--color-brand-300)">
                {f.kicker}
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-[28px]">
                {f.title}
              </h3>
              <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-white/60">{f.body}</p>
            </Reveal>
            <div className="flex flex-col gap-3">
              {f.points.map((p, pi) => (
                <Reveal key={p} delay={180 + pi * 130}>
                  <div className="glass-card flex items-center gap-3 px-5 py-4">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-(--color-brand-600)/35 text-[12px] font-bold text-(--color-brand-200)">
                      {pi + 1}
                    </span>
                    <p className="text-[14px] font-medium text-white/80">{p}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
